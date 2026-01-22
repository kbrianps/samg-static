<template>
    <v-card class="pa-2" :color="corFundoCartao">
        <v-card-title>{{ disciplina.Nome }}</v-card-title>
        <v-card-subtitle>{{ disciplina.codigo }}</v-card-subtitle>
        <v-card-text class="pt-0 text-body-2">
            <span><strong>CH:</strong> {{ disciplina.CargaHoraria }}h</span> •
            <span><strong>Créditos:</strong> {{ disciplina.Creditos }}</span> •
            <span><strong>Período:</strong> {{ disciplina.PeriodoRecomendado }}º</span>
            <div v-if="disciplina.PreRequisitos" class="mt-1 text-caption"><strong>Pré-req:</strong> {{ disciplina.PreRequisitos }}</div>
        </v-card-text>
    </v-card>
</template>
<script>
export default {
    name: 'DetalhesDisciplina',
    props: {
        disciplina: {
            type: Object,
            required: true,
            default: () => { }
        },
        status: { type: String, default: () => '' }
    },
    computed: {
        corFundoCartao() {
            if (this.status === 'REP') return 'error'; // Vermelho do tema
            else if (this.status === 'APV') return 'success'; // Verde do tema
            else return 'surface'; // Cor de superfície do tema dark
        }
    }
}
</script>
<style>
    .largura-caixa{
        width: 120px;
    }
</style>