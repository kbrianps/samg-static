import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url
).toString();

export async function extractTextFromPdf(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    const lines = [];

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();

        let currentLine = '';
        let lastY = null;

        for (const item of textContent.items) {
            const y = Math.round(item.transform[5]);

            if (lastY !== null && Math.abs(y - lastY) > 5) {
                if (currentLine.trim()) {
                    lines.push(currentLine.trim());
                }
                currentLine = '';
            }

            currentLine += item.str;
            lastY = y;
        }

        if (currentLine.trim()) {
            lines.push(currentLine.trim());
        }
    }

    return lines;
}
