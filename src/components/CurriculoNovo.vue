<template>
    <v-row class="px-2">
        <v-col cols="12" class="d-flex align-center flex-wrap pt-6 pb-2">
            <v-card-title>Currículo Novo</v-card-title>
            <v-spacer></v-spacer>
            <v-btn
                variant="text"
                :icon="ver ? 'mdi-eye' : 'mdi-eye-off'"
                @click="ver = !ver"
                color="primary"
                title="Mostrar/Ocultar"
                class="mr-2"
            ></v-btn>
        </v-col>
        
        <v-col v-show="ver" v-for="i in periodos" :key="i" class="pa-6" :class="{ 'borda-coluna': i < 8 }">
            <div class="mb-8 borda-linha text-center">{{ `${i}° período` }}</div>

            <div class="d-flex flex-wrap justify-center gap-2">
                <template v-if="disciplinasCursadas.length">
                    <template v-for="disciplina in disciplinasCursadas" :key="disciplina.Codigo">
                        <CaixaDisciplina 
                            v-if="disciplina.PeriodoRecomendado === i" 
                            @click="disciplinaSelecionada = disciplina"
                            :disciplina="disciplina" 
                            class="mb-2" 
                            :status="status(disciplina)" 
                            :cor="pegaCorEixo(disciplina?.Eixo)" 
                        />
                    </template>
                </template>
                <template v-else>
                    <template v-for="disciplina in disciplinasObrigatorias" :key="disciplina.Codigo + 'index'">
                         <CaixaDisciplina 
                            v-if="disciplina.PeriodoRecomendado === i" 
                            @click="disciplinaSelecionada = disciplina"
                            :disciplina="disciplina" 
                            class="mb-2" 
                            :cor="pegaCorEixo(disciplina?.Eixo)" 
                        />
                    </template>
                </template>
            </div>
        </v-col>
        
        <v-col v-show="ver" cols="12" class="mt-6">
            <v-divider class="mb-4"></v-divider>
            
            <v-row>
                <v-col cols="12" md="6">
                    <div class="text-caption font-weight-bold mb-2 text-medium-emphasis">EIXOS TEMÁTICOS</div>
                    <div class="d-flex flex-column">
                        <div v-for="legenda in legendas" :key="legenda.eixo" class="d-flex align-center mb-1 legenda-item">
                            <div class="color-box mr-2 rounded-circle border" :style="{ backgroundColor: legenda.cor }"></div>
                            <span class="text-caption">{{ legenda.eixo }}</span>
                        </div>
                    </div>
                </v-col>
                
                <v-col cols="12" md="6" class="mt-4 mt-md-0">
                    <div class="text-caption font-weight-bold mb-2 text-medium-emphasis">SITUAÇÃO</div>
                    <div class="d-flex flex-column">
                        <div class="d-flex align-center mb-1"><v-icon icon="$check" color="success" size="small" class="mr-2"></v-icon><span class="text-caption">Aprovado / Aprovado sem nota</span></div>
                        <div class="d-flex align-center mb-1"><v-icon icon="$check" color="warning" size="small" class="mr-2"></v-icon><span class="text-caption">Dispensa com nota / Dispensa sem nota</span></div>
                        <div class="d-flex align-center mb-1"><v-icon icon="$x" color="orange" size="small" class="mr-2"></v-icon><span class="text-caption">Reprovado sem nota</span></div>
                        <div class="d-flex align-center mb-1"><v-icon icon="$x" color="error" size="small" class="mr-2"></v-icon><span class="text-caption">Reprovado por nota / Reprovado por falta</span></div>
                        <div class="d-flex align-center mb-1"><v-icon icon="$unCheck" color="grey-darken-2" size="small" class="mr-2"></v-icon><span class="text-caption">Disciplina por fazer</span></div>
                        <div class="d-flex align-center"><v-icon icon="$alert" color="deep-orange-darken-3" size="small" class="mr-2"></v-icon><span class="text-caption">Necessário pedir dispensa na secretaria</span></div>
                    </div>
                </v-col>
            </v-row>
        </v-col>

        <v-dialog v-if="disciplinaSelecionada !== null" v-model="disciplinaSelecionada" width="500">
            <DetalhesDisciplina :disciplina="disciplinaSelecionada" />
        </v-dialog>
    </v-row>
</template>
<script>
import curriculoNovoObrigatorias from '../assets/Disciplinas Obrigatórias - Currículo novo.json';
import CaixaDisciplina from './CaixaDisciplina.vue';
import DetalhesDisciplina from './DetalhesDisciplina.vue';

// Cores vibrantes e distintas para o tema dark
const EIXO_COR = [
    { eixo: "Atividades complementares", cor: "#607D8B" },      // Blue Grey
    { eixo: "Atividades de extensão", cor: "#795548" },         // Brown
    { eixo: "Trabalho de conclusão de curso", cor: "#00BCD4" }, // Cyan (Bright)
    { eixo: "Infraestrutura em SI", cor: "#E91E63" },          // Pink
    { eixo: "Engenharia de Dados e Informação", cor: "#4CAF50" }, // Green
    { eixo: "Desenvolvimento de Software para SI (Engenharia de Software)", cor: "#3F51B5" }, // Indigo
    { eixo: "Desenvolvimento de Software para SI (Programação e Algoritmos)", cor: "#2196F3" }, // Blue
    { eixo: "Gestão de SI e TI, Empreendedorismo e Inovação", cor: "#9C27B0" }, // Purple
    { eixo: "Visão Sistêmica (Fundamentos de Matemática)", cor: "#FF5722" },    // Deep Orange
    { eixo: "Visão Sistêmica (Sistemas de Informação)", cor: "#FFC107" },       // Amber
]

const EIXO_COR_STATUS = [
    { status: "Aprovado / Aprovado sem nota", cor: "success", icon: "mdi-check-circle" },
    { status: "Dispensa com nota / Dispensa sem nota", cor: "warning", icon: "mdi-check-circle" },
    { status: "Reprovado sem nota", cor: "orange", icon: "mdi-close-circle" },
    { status: "Reprovado por nota / Reprovado por falta", cor: "error", icon: "mdi-close-circle" },
    { status: "Matricula", cor: "grey", icon: "mdi-circle-outline" },
]


export default {
    name: "curriculo-novo",
    props: {
        disciplinasCursadas: {
            required: true,
            type: Array,
            default: () => []
        }
    },
    data: () => ({
        disciplinasObrigatorias: curriculoNovoObrigatorias.CurriculoNovo,
        disciplinaSelecionada: null,
        periodos: 8,
        ver: true,
        eixoCor: EIXO_COR,
        legendas: EIXO_COR,
        legendasStatus: EIXO_COR_STATUS
    }),
    methods: {
        status(disciplina) {
            if (!disciplina || !disciplina.Situacao) return { ver: "uncheck", cor: "", solicitarDispensa: false };
            switch (disciplina.Situacao.toLowerCase()) {
                case "aprovado": return { ver: "check", cor: "success", solicitarDispensa: false };
                case "reprovado sem nota": return { ver: "x", cor: "orange", solicitarDispensa: false };
                case "reprovado por falta": return { ver: "x", cor: "error", solicitarDispensa: false };
                case "reprovado por nota": return { ver: "x", cor: "error", solicitarDispensa: false };
                case "aprovado sem nota": return { ver: "check", cor: "success", solicitarDispensa: false };
                case "dispensa sem nota": return { ver: "check", cor: "warning", solicitarDispensa: false };
                case "dispensa com nota": return { ver: "check", cor: "warning", solicitarDispensa: false };
                case "solicitar dispensa": return { ver: "check", cor: "warning", solicitarDispensa: true };
                case "matrícula": return { ver: "uncheck", cor: "grey", solicitarDispensa: false };
                default: return { ver: "uncheck", cor: "", solicitarDispensa: false };
            }
        },
        pegaCorEixo(eixo){
            return this.eixoCor.find(arrayEixo => arrayEixo.eixo === eixo)?.cor || '#37474F'  
        }
    },
    components: { DetalhesDisciplina, CaixaDisciplina }
}
</script>
<style scoped>
.borda-coluna {
    border-right: 1px solid rgba(255,255,255,0.1);
}

.color-box {
    width: 12px;
    height: 12px;
    flex-shrink: 0;
}

.legenda-item {
    min-width: 200px;
}

.gap-2 {
    gap: 8px;
}
</style>