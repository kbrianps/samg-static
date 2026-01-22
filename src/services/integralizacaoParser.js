import { extractTextFromPdf } from './pdfParser';

const regexCodigoDisciplina = new RegExp(/[a-zA-Z]{3}[0-9]{4}/i);
const regexSituacao = new RegExp(/(Vencido|Não Vencido|Matricula\/Cursand)/gim);
const regexNomeDisciplina = new RegExp(
    /([A-Za-záãÁÀÃÂÉÈÊéàêÍÌÎÓÒÕÔóí\-ÚÙÛÇç\s]*)[a-zA-Z]{3}[0-9]{4}/i
);

function criaVetorDisciplinas(disciplinas) {
    return disciplinas.map((disciplina) => ({
        codigo:
            disciplina.disciplina.match(regexCodigoDisciplina) &&
            disciplina.disciplina.match(regexCodigoDisciplina).toString(),
        situacao:
            disciplina.disciplina.match(regexSituacao) &&
            disciplina.disciplina.match(regexSituacao).toString(),
        nome: disciplina.disciplina
            .match(regexNomeDisciplina)
            .toString()
            .split(regexCodigoDisciplina)[0],
    }));
}

export async function parseIntegralizacaoPdf(file) {
    const lines = await extractTextFromPdf(file);
    const disciplinas = [];

    for (let i = 0; i < lines.length; i++) {
        if (regexCodigoDisciplina.test(lines[i])) {
            disciplinas.push({ disciplina: lines[i] });
        }
    }

    return criaVetorDisciplinas(disciplinas);
}
