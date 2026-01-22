<template>
    <v-container fluid class="historico pa-6">
        <v-row justify="center">
            <v-col cols="12" md="10" lg="8">
                <v-card class="elevation-4 rounded-lg" color="surface">
                    <v-card-text class="pa-6">
                        <v-file-input
                            label="Upload do Histórico Escolar (SIE)"
                            placeholder="Selecione o arquivo PDF..."
                            prepend-icon="mdi-file-pdf-box"
                            variant="outlined"
                            density="comfortable"
                            accept="application/pdf"
                            show-size
                            clearable
                            ref="historico"
                            @change="lerPlanilhaDisciplinas"
                            :error-messages="errorMessage"
                            hide-details="auto"
                        >
                            <template v-slot:selection="{ fileNames }">
                                <span class="text-primary font-weight-medium">{{ fileNames[0] }}</span>
                            </template>
                        </v-file-input>
                        <div class="text-caption text-medium-emphasis mt-2 ml-4">
                            <v-icon size="small" class="mr-1">mdi-information-outline</v-icon>
                            Use o arquivo emitido em 'Relatórios >> Histórico Escolar CR - Aprovados'
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <div class="mt-8">
            <CurriculoAtual :disciplinas-cursadas="progressoAlunoGrade" />
        </div>

        <v-col class="d-flex justify-center my-8">
            <v-badge
                :content="naoEquivalentes.length || '0'"
                :color="naoEquivalentes.length ? 'error' : 'grey'"
                floating
            >
                <v-btn
                    color="primary"
                    variant="outlined"
                    size="large"
                    @click="verDisciplinasNaoAproveitadas = !verDisciplinasNaoAproveitadas"
                >
                    Disciplinas não aproveitadas
                </v-btn>
            </v-badge>
        </v-col>

        <div class="mb-8">
            <CurriculoNovo :disciplinas-cursadas="progressoAlunoGradeNova" />
        </div>

        <v-dialog v-model="verDisciplinasNaoAproveitadas" width="500px">
            <v-card class="rounded-lg">
                <v-card-title class="bg-surface pa-4 border-bottom">
                    Disciplinas sem Equivalência Direta
                </v-card-title>
                <v-list class="bg-background" lines="two">
                    <v-list-item
                        v-for="disciplina in naoEquivalentes"
                        :key="disciplina.Codigo"
                        class="border-bottom"
                    >
                        <template v-slot:prepend>
                            <v-avatar color="surface" variant="flat">
                                <span class="text-caption font-weight-bold">{{ disciplina.Codigo.substring(0,3) }}</span>
                            </v-avatar>
                        </template>
                        <v-list-item-title class="font-weight-medium">{{ disciplina.Nome }}</v-list-item-title>
                        <v-list-item-subtitle>{{ disciplina.Codigo }}</v-list-item-subtitle>
                    </v-list-item>
                </v-list>
                <v-card-text class="bg-warning-lighten-5 pa-4 text-center">
                    <p class="text-caption text-warning-darken-2 font-weight-bold mb-0">
                        Consulte seu tutor ou o arquivo "Reforma: equivalências e dispensas" no Classroom.
                    </p>
                    <a href="https://docs.google.com/spreadsheets/d/1sy8dg5g71ShyxwP7jZld7-yV3u0GTqqfIPGLc33NWTA/edit" target="_blank" class="text-caption text-decoration-underline font-weight-bold text-primary mt-2 d-inline-block">
                        Abrir planilha de equivalências
                    </a>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" variant="text" @click="verDisciplinasNaoAproveitadas = false">Fechar</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-snackbar
            v-model="snackbar.show"
            :color="snackbar.color"
            :timeout="5000"
            location="top"
        >
            <div class="d-flex align-center">
                <v-icon :icon="snackbar.icon" class="mr-2"></v-icon>
                {{ snackbar.message }}
            </div>
            <template v-slot:actions>
                <v-btn variant="text" @click="snackbar.show = false">Fechar</v-btn>
            </template>
        </v-snackbar>
    </v-container>
</template>
<script>
import curriculoAntigoObrigatorias from '../assets/Disciplinas Obrigatórias - Currículo antigo.json';
import curriculoAntigoOptativas from '../assets/Disciplinas Optativas - Curriculo Antigo.json';
import curriculoNovoObrigatorias from '../assets/Disciplinas Obrigatórias - Currículo novo.json';
import curriculoNovoOptativas from '../assets/Disciplinas Optativas - Curriculo Novo.json';
import dePara from '../assets/De - Para.json';
import CaixaDisciplina from '../components/CaixaDisciplina.vue';
import DetalhesDisciplina from '../components/DetalhesDisciplina.vue';

import { parseHistoricoPdf } from '../services/historicoParser';
import CurriculoNovo from '../components/CurriculoNovo.vue';
import CurriculoAtual from '../components/CurriculoAtual.vue';


export default {
    name: "migracao",
    data() {
        return {
            disciplinasObrigatoriasCurriculoAntigo: curriculoAntigoObrigatorias.CurriculoAntigo,
            disciplinasOptativasCurriculoAntigo: curriculoAntigoOptativas.CurriculoAntigoOptativas,
            disciplinasObrigatoriasCurriculoNovo: curriculoNovoObrigatorias.CurriculoNovo,
            disciplinasOptativasCurriculoNovo: curriculoNovoOptativas.CurriculoNovoOptativas,

            disciplinasCursadasCurriculoAntigo: [],
            periodos: 8,
            disciplinaSelecionada: null,
            disciplinasAlunoCurriculoAntigo: [],
            disciplinasAlunoCurriculoNovo: [],

            historico: [],
            progressoAlunoGrade: [],
            grade: curriculoAntigoObrigatorias.CurriculoAntigo,
            gradeNova: curriculoNovoObrigatorias.CurriculoNovo,
            progressoAlunoGradeNova: [],
            equivalencias: dePara.DePara,
            naoEquivalentes: [],

            verDisciplinasNaoAproveitadas: false,
            
            // Controle de Erros e UI
            errorMessage: '',
            snackbar: {
                show: false,
                message: '',
                color: 'error',
                icon: 'mdi-alert-circle'
            }
        }
    },

    methods: {
        showFeedback(message, type = 'error') {
            // Apenas exibe erro, ignorando sucesso conforme solicitado
            if (type !== 'error') return;

            this.snackbar = {
                show: true,
                message,
                color: 'error',
                icon: 'mdi-alert-circle'
            };
        },

        async lerPlanilhaDisciplinas() {
            this.errorMessage = '';
            const fileInput = this.$refs.historico;
            const arquivo = fileInput.files[0];
            
            if (!arquivo) return;

            try {
                const disciplinas = await parseHistoricoPdf(arquivo);
                
                if (!disciplinas || disciplinas.length === 0) {
                    throw new Error("Nenhuma disciplina encontrada. Verifique se o PDF está correto.");
                }

                // Verificação simples se parece um histórico válido (pelo menos algumas propriedades preenchidas)
                const isValid = disciplinas.some(d => d.codigo && d.situacao);
                if (!isValid) {
                     throw new Error("O PDF enviado não parece ser um histórico escolar válido do SIE.");
                }

                this.disciplinasAlunoCurriculoAntigo = disciplinas;
                this.lerHistorico();
                // ChatMessage: removido feedback de sucesso
                
            } catch (error) {
                console.error(error);
                this.showFeedback(error.message || "Erro ao processar o PDF. Certifique-se que é o arquivo correto.", 'error');
                this.errorMessage = "Falha ao ler o arquivo";
                
                // Reset states
                this.disciplinasAlunoCurriculoAntigo = [];
                this.disciplinasCursadasCurriculoAntigo = [];
                this.disciplinasAlunoCurriculoNovo = [];
                fileInput.reset(); // Limpa o input
            }
        },

        lerHistorico() {
            const obrigatorias = this.disciplinasObrigatoriasCurriculoAntigo.map(disciplinaCurriculoAntigo => {
                const disciplina = this.disciplinasAlunoCurriculoAntigo.findLast(discAluno => discAluno.codigo === disciplinaCurriculoAntigo.Codigo)
                if (disciplina) return { ...disciplinaCurriculoAntigo, Situacao: disciplina.situacao || disciplina.trancamento, Periodo: disciplina.periodo }
                
            }).filter(disciplina => disciplina)


            //Pego somente as optativas que o aluno passou
            const optativas = this.preencheOptativas(this.disciplinasOptativasCurriculoAntigo.map(disciplinaOptativaCurriculoAntigo => {

                const disciplina = this.disciplinasAlunoCurriculoAntigo.findLast(discAluno => discAluno.codigo === disciplinaOptativaCurriculoAntigo.Codigo)
                if (disciplina && (disciplina.situacao.toLowerCase().includes("aprovado") || disciplina.situacao.toLowerCase().includes("dispensa"))) return { ...disciplinaOptativaCurriculoAntigo, Situacao: disciplina.situacao, Tipo: "Optativa", Periodo: disciplina.periodo }
               
            }).filter(disciplina => disciplina));

            //Pego somente as eletivas que o aluno passou
            const eletivas = this.preencheEletivas(this.disciplinasAlunoCurriculoAntigo.map(discAluno =>
                !obrigatorias.some(disciplina => disciplina?.Codigo === discAluno.codigo)
                && !optativas.some(disciplina => disciplina?.Codigo === discAluno.codigo)
                && (discAluno.situacao === "Aprovado" || discAluno.situacao.includes("Dispensa")) && {
                    Codigo: discAluno.codigo,
                    Nome: discAluno.nome,
                    CargaHoraria: 60,
                    Creditos: 4,
                    Ementa: null,
                    PreRequisitos: null,
                    Situacao: "Aprovado",
                    Tipo: "Eletiva",
                    Periodo: discAluno.periodo
                }).filter(disciplina => disciplina));


            this.historico = [...obrigatorias, ...optativas, ...eletivas]

            this.fazEquivalencias([...eletivas]);
            this.progressoAlunoGrade = this.grade.map(disciplina => {

                const eletiva = disciplina.Tipo === "Eletiva" && eletivas.length && eletivas.shift();
                const optativa = disciplina.Tipo === "Optativa" && optativas.length && optativas.shift();
                if (eletiva) return eletiva;
                if (optativa) return optativa;


                const disciplinaHistorico = this.historico.find(hist => hist.Codigo === disciplina.Codigo)
                if (disciplinaHistorico) return disciplinaHistorico;

                return disciplina;
            })
        },

        preencheOptativas(disciplinas) {

            const optativas = [];
            this.disciplinasObrigatoriasCurriculoAntigo.forEach(disciplina => {
                if (disciplina?.Tipo === "Optativa") {
                    const optativa = disciplinas.shift();

                    optativa && optativas.push({ ...disciplina, Sigla: optativa.Sigla, ...optativa })
                }
            })

            return optativas;
        },

        preencheEletivas(disciplinas) {
            const eletivas = [];
            this.disciplinasObrigatoriasCurriculoAntigo.forEach(disciplina => {
                if (disciplina?.Tipo === "Eletiva") {
                    const eletiva = disciplinas.shift();
                    eletiva && eletivas.push({ ...disciplina, ...eletiva })
                }
            })

            return eletivas;
        },

        fazEquivalencias(eletivas) {
            const naoAproveitadas = [];
            const materiasDispensadas = this.calculaDispensas();

            const equivalencias = [];
            this.historico.map(disciplina => {
                const codigo = disciplina.Codigo;
                const disciplinasEquivalentes = this.equivalencias.filter(item => item.codigoCurriculoAntigo === codigo);
                

                if (disciplinasEquivalentes.length) {
                    disciplinasEquivalentes.forEach(disciplinaEquivalente => {
                        if (disciplinaEquivalente && (disciplina?.Situacao.toLowerCase().includes("aprovado") || disciplina?.Situacao.toLowerCase().includes("dispensa")) && disciplinaEquivalente?.tipoCorrespondencia?.toLowerCase().includes("equivalencia")) {
                            equivalencias.push({ ...disciplina, Codigo: disciplinaEquivalente.codigoCurriculoNovo, Nome: disciplinaEquivalente.nomeCurriculoNovo })
                        }
                        if (disciplinaEquivalente && (disciplina?.Situacao.toLowerCase().includes("aprovado") || disciplina?.Situacao.toLowerCase().includes("dispensa")) && disciplinaEquivalente?.tipoCorrespondencia?.toLowerCase().includes("dispensa") && disciplina?.Periodo === disciplinaEquivalente?.periodo) {
                            equivalencias.push({ ...disciplina, Codigo: disciplinaEquivalente.codigoCurriculoNovo, Nome: disciplinaEquivalente.nomeCurriculoNovo, Situacao: "Solicitar dispensa" })
                        }
                    })
                } else {
                    if (disciplina.Tipo !== "Eletiva" && (disciplina?.Situacao.toLowerCase().includes("aprovado") || disciplina?.Situacao.toLowerCase().includes("dispensa")) && (!materiasDispensadas[1].some(codigo => codigo === disciplina.Codigo))) {
                        naoAproveitadas.push(disciplina);
                    }
                }
            }).filter(disciplina => disciplina) // esse filter faz retornar apenas valores diferentes de undefined ou null

            const optativasGradeNova = [];
            this.disciplinasOptativasCurriculoNovo.map(optativa => {
                const equivalentes = equivalencias.filter(equivalencia => equivalencia.Codigo === optativa.Codigo);

                if (equivalentes.length) {
                    equivalentes.forEach(equivalente => {
                        optativasGradeNova.push({ ...optativa, Situacao: equivalente.Situacao, Sigla: optativa.Sigla || equivalente.Sigla })
                    })
                }
            }).filter(disciplina => disciplina)
        

            if (eletivas.length) {
                this.gradeNova = this.gradeNova.map(item => {
                    if (item.Tipo === "Optativa/Eletiva" && eletivas.length) {
                        const eletiva = eletivas.shift();
                        return { ...eletiva, PeriodoRecomendado: item.PeriodoRecomendado, Situacao: eletiva.Situacao }
                    }
                    return item;
                })
            }

            if (eletivas.length){
                eletivas.forEach(eletiva => naoAproveitadas.push(eletiva));
            }

            this.progressoAlunoGradeNova = this.gradeNova.map(item => {
                if (materiasDispensadas[0].some(codigo => codigo === item.Codigo)) return { ...item, Situacao: "Solicitar dispensa" }
                
                const disciplinaCursadaDiretamente = this.disciplinasAlunoCurriculoAntigo.find(d => d.codigo === item.Codigo && (d.situacao?.toLowerCase().includes("aprovado") || d.situacao?.toLowerCase().includes("dispensa")))
                if (disciplinaCursadaDiretamente) {
                    return { ...item, Situacao: disciplinaCursadaDiretamente.situacao, Periodo: disciplinaCursadaDiretamente.periodo }
                }
                
                const disciplina = equivalencias.find(equivalencia => equivalencia.Codigo === item.Codigo)

                if (item.Tipo.includes("Optativa") && item.Codigo.includes("OPT") && optativasGradeNova.length) {
                    const optativa = optativasGradeNova.shift();
                    return { ...optativa, PeriodoRecomendado: item.PeriodoRecomendado, Tipo: item.Tipo, Sigla: optativa.Sigla || item.Sigla }
                }

                if (disciplina) return { ...item, Situacao: disciplina.Situacao }
                return { ...item, Situacao: item.Situacao || "Matrícula" }
            })

            if(optativasGradeNova.length){
                optativasGradeNova.map(disciplinaOptativaGradeNova => {
                    const disciplinaOptativaNaoAproveitada = this.equivalencias.find(equivalencia => disciplinaOptativaGradeNova.Codigo == equivalencia.codigoCurriculoNovo)
                    naoAproveitadas.push ({...disciplinaOptativaNaoAproveitada, Codigo: disciplinaOptativaNaoAproveitada.codigoCurriculoAntigo, Nome: disciplinaOptativaNaoAproveitada.nomeCurriculoAntigo})
                })
            }

            this.naoEquivalentes = [...this.naoEquivalentes, ...naoAproveitadas]
        },

        calculaDispensas() {
            const disciplinas = this.historico.filter(item => item.Sigla.toLowerCase().includes("ace"));
            const TPD = this.historico.find(item => item.Codigo === "HTD0058");
            const dispensas = [];
            const utilizadas = [];
            if (disciplinas.length === 4) {
                dispensas.push("TIN0306", "TIN0307", "ATC0060")
                utilizadas.push(disciplinas[0].Codigo, disciplinas[1].Codigo, disciplinas[2].Codigo, disciplinas[3].Codigo)
            } else if (disciplinas.length == 3) {
                dispensas.push("TIN0306", "TIN0307")
                utilizadas.push(disciplinas[0].Codigo, disciplinas[1].Codigo, disciplinas[2].Codigo)
            } else if (disciplinas.length == 2 && disciplinas.some(disciplina => disciplina.Codigo === "TIN0156" || disciplina.Codigo === "TIN0157") && TPD) {
                dispensas.push("TIN0306", "ATC0060")
                utilizadas.push(disciplinas[0].Codigo, disciplinas[1].Codigo, TPD.Codigo)
            } else if (disciplinas.length >= 1 && TPD) {
                dispensas.push("TIN0306")
                utilizadas.push(...disciplinas.map(disciplina => disciplina.Codigo), TPD.Codigo)
            }
            return [dispensas, utilizadas]
        }
    },
    components: { CaixaDisciplina, DetalhesDisciplina, CurriculoNovo, CurriculoAtual }
}
</script>

<style lang="css" scoped>
.historico {
    min-width: 80vw;
    margin-bottom: 24px;
}

.borda-coluna {
    border-right: 1px solid #BDBDBD;
}

.borda-linha {
    border-bottom: 1px solid #BDBDBD;
}

.warning {
    color: #EF5350;
}

.link-equivalencias{
    text-decoration: underline;
}

.link-equivalencias:hover {
    text-decoration: underline;
    background: #1a1a1a;
}

</style>
