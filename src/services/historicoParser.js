import { extractTextFromPdf } from './pdfParser';

const regexDisciplina = new RegExp(/^[a-zA-Z]{3}[0-9]{4}/im);
const regexSituacao = new RegExp(
    /(APV\s*-?\s*Aprovado|Aprovado|REP\s*-?\s*Reprovado|Reprovado|REF\s*-?\s*Reprovado por falta|ADI\s*-?\s*Aprovado|TRA\s*-?\s*Trancamento|Trancamento|Dispensa|matrícula)/gim
);
const regexTrancamento = new RegExp(/(trancamento.*)$/gim);
const regexNomeDisciplina = new RegExp(
    /[a-zA-Z]{3}[0-9]{4}([A-Za-záãÁÀÃÂÉÈÊÍÌÎÓÒÕÔÚÙÛÇç\s]*)/gim
);
const regexPegaPeriodo = new RegExp(/([0-9]°. semestre de [0-9]{4})/gim);
const regexPegaCursoFerias = new RegExp(/(Curso de Férias de [0-9]{4})/gim);
const regexPegaSemestre = new RegExp(/^[0-9]{1}/gim);
const regexPegaAno = new RegExp(/[0-9]{4}/gim);

function normalizaSituacao(situacao) {
    if (!situacao) return null;
    const s = situacao.toLowerCase();
    if (s.includes('apv') || s.includes('aprovado')) {
        if (s.includes('sem nota') || s.includes('adi')) return 'Aprovado sem nota';
        return 'Aprovado';
    }
    if (s.includes('ref') || s.includes('reprovado por falta')) return 'Reprovado por falta';
    if (s.includes('rep') || s.includes('reprovado')) return 'Reprovado';
    if (s.includes('tra') || s.includes('trancamento')) return 'Trancamento';
    if (s.includes('dispensa')) {
        if (s.includes('sem nota')) return 'Dispensa sem nota';
        return 'Dispensa com nota';
    }
    if (s.includes('matrícula')) return 'Matrícula';
    return situacao;
}

function criaVetorDisciplinas(disciplinas) {
    const resultado = disciplinas.map((disciplina) => {
        const situacaoMatch = disciplina.disciplina.match(regexSituacao);
        const trancamentoMatch = disciplina.disciplina.match(regexTrancamento);
        return {
            codigo:
                disciplina.disciplina.match(regexDisciplina) &&
                disciplina.disciplina.match(regexDisciplina).toString(),
            situacao: normalizaSituacao(situacaoMatch ? situacaoMatch[0] : null),
            trancamento: trancamentoMatch ? trancamentoMatch[0] : null,
            nome: disciplina.disciplina
                .match(regexNomeDisciplina)
                ?.toString()
                ?.split(regexDisciplina)[1] || '',
            periodo: disciplina.periodo,
        };
    });
    return resultado;
}

export async function parseHistoricoPdf(file) {
    const lines = await extractTextFromPdf(file);
    let periodo = '';
    const disciplinas = [];

    for (let i = 0; i < lines.length; i++) {
        if (regexTrancamento.test(lines[i])) {
            continue;
        }

        if (regexPegaPeriodo.test(lines[i])) {
            periodo =
                lines[i].match(regexPegaAno).toString() +
                '.' +
                lines[i].match(regexPegaSemestre);
        }

        if (regexPegaCursoFerias.test(lines[i])) {
            periodo = lines[i].match(regexPegaAno).toString() + ' Ferias';
        }

        if (regexDisciplina.test(lines[i]) && regexSituacao.test(lines[i])) {
            disciplinas.push({ disciplina: lines[i], periodo });
            continue;
        }

        if (regexDisciplina.test(lines[i])) {
            let disciplina = '';
            let j = i;
            do {
                disciplina += lines[j];
                j++;
            } while (lines[j] && !regexSituacao.test(lines[j - 1]));
            disciplinas.push({ disciplina, periodo });
        }
    }

    return criaVetorDisciplinas(disciplinas);
}
