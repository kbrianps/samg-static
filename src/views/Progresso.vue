<template>
    <v-container fluid class="historico pa-6">
        <v-row justify="center" class="mb-6">
            <v-col cols="12" md="10" lg="8">
                <v-card class="elevation-4 rounded-lg" color="surface">
                    <v-card-text class="pa-6">
                        <v-file-input
                            label="Upload do Histórico de Integralização (SIE)"
                            placeholder="Selecione o arquivo PDF..."
                            prepend-icon="mdi-file-chart"
                            variant="outlined"
                            density="comfortable"
                            accept="application/pdf"
                            show-size
                            clearable
                            ref="historicoIntegralizacao"
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
                            Use o arquivo emitido em 'Relatórios >> Histórico Integralização'
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <v-row justify="center">
            <v-col cols="12">
                 <CurriculoNovo :disciplinas-cursadas="progressoAluno" />
            </v-col>
        </v-row>

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
import curriculoNovoObrigatorias from '../assets/Disciplinas Obrigatórias - Currículo novo.json';
import curriculoNovoOptativas from '../assets/Disciplinas Optativas - Curriculo Novo.json';
import CaixaDisciplina from '../components/CaixaDisciplina.vue';
import DetalhesDisciplina from '../components/DetalhesDisciplina.vue';

import { parseIntegralizacaoPdf } from '../services/integralizacaoParser';
import CurriculoNovo from '../components/CurriculoNovoIntegralizacao.vue';


export default {
    name: "progresso",
    data() {
        return {
            disciplinasObrigatorias: curriculoNovoObrigatorias.CurriculoNovo,
            disciplinasOptativas: curriculoNovoOptativas.CurriculoNovoOptativas,
            grade: curriculoNovoObrigatorias.CurriculoNovo,
            disciplinasAlunoCurriculoNovo: [],
            historico: [],
            progressoAluno: [],
            periodos: 8,
            
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
            const fileInput = this.$refs.historicoIntegralizacao;
            const arquivo = fileInput.files[0];
            
            if (!arquivo) return;

            try {
                const disciplinas = await parseIntegralizacaoPdf(arquivo);
                
                 if (!disciplinas || disciplinas.length === 0) {
                    throw new Error("Nenhuma disciplina encontrada. Verifique se o PDF está correto.");
                }

                // Validação básica
                const isValid = disciplinas.some(d => d.codigo && d.situacao);
                 if (!isValid) {
                     throw new Error("O PDF enviado não parece ser um histórico de integralização válido.");
                }

                this.historico = disciplinas;
                this.lerHistorico();
                // ChatMessage: removido feedback de sucesso

            } catch (error) {
                console.error(error);
                this.historico = [];
                this.progressoAluno = []; // Limpa visualização anterior
                this.errorMessage = "Falha ao ler o arquivo";
                this.showFeedback(error.message || "Erro ao processar o PDF.", 'error');
                fileInput.reset();
            }
        },

        lerHistorico() {
            //Preenche as disciplinas obrigatórias cursadas pelo aluno
            let disciplinasCursadas = this.disciplinasObrigatorias.map(disciplinaObrigatoria => {
                const disciplina = this.historico.findLast(disciplinaHistorico => disciplinaHistorico.codigo === disciplinaObrigatoria.Codigo);
                if (disciplina) return { ...disciplinaObrigatoria, Situacao: disciplina.situacao, Periodo: disciplinaObrigatoria.PeriodoRecomendado }
                else return disciplinaObrigatoria;
            });

           
            //Preenche as opções de disciplinas optativas cursadas
            disciplinasCursadas = this.preencheOptativas(this.disciplinasOptativas.map(disciplinaOptativa => {
                const disciplina = this.historico.findLast(disciplinaHistoricoAluno => disciplinaHistoricoAluno.codigo === disciplinaOptativa.Codigo)
                if (disciplina) return { ...disciplinaOptativa, Situacao: disciplina.situacao, Tipo: "Optativa", Periodo: 0 }
            }).filter(disciplina => disciplina), disciplinasCursadas)

            //Preenche as opções de disciplinas eletivas cursadas
            disciplinasCursadas = this.preencheEletivas(this.historico.map(disciplinaHistoricoAluno =>
                !disciplinasCursadas.some(disciplina => disciplina.Codigo === disciplinaHistoricoAluno.codigo)
                && {
                    Codigo: disciplinaHistoricoAluno.codigo,
                    Nome: disciplinaHistoricoAluno.nome,
                    CargaHoraria: 60,
                    Creditos: 4,
                    Ementa: null,
                    PreRequisitos: null,
                    Situacao: disciplinaHistoricoAluno.situacao,
                    Tipo: "Eletiva/Optativa",
                    PeriodoRecomendado: 0,
                }
            ).filter(disciplina => disciplina), disciplinasCursadas)
            
            this.progressoAluno = disciplinasCursadas;

        },

        preencheOptativas(optativas, disciplinasCursadas) {
            return disciplinasCursadas.map(disciplina => {
                if (disciplina.Tipo?.includes("Optativa")) {
                    const optativa = optativas.shift();
                    return { ...optativa, PeriodoRecomendado: disciplina.PeriodoRecomendado, Sigla: optativa?.Sigla || disciplina.Sigla }
                } else return disciplina;
            });
        },

        preencheEletivas(eletivas, disciplinasCursadas) {
            return disciplinasCursadas.map(disciplina => {
                if (disciplina.Tipo?.includes("Eletiva")) {
                    const eletiva = eletivas.shift();
                    return { ...eletiva, PeriodoRecomendado: disciplina.PeriodoRecomendado, Sigla: disciplina.Sigla }
                } else return disciplina;
            })
        }
    },
    components: { CaixaDisciplina, DetalhesDisciplina, CurriculoNovo }
}
</script>
