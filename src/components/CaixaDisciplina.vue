<template>
    <v-card class="largura-caixa caixa-disciplina d-flex flex-column justify-center align-center text-center ma-1 pa-1 transition-swing" 
            :color="cor" 
            elevation="2" 
            variant="flat"
            v-bind="$attrs">
        <div class="status-icon-container">
            <v-icon v-if="status.ver === 'check'" icon="$check" :color="status.cor || 'success'" size="small" class="icone shadow-sm"></v-icon>
            <v-icon v-else-if="status.ver === 'x'" icon="$x" :color="status.cor || 'error'" size="small" class="icone shadow-sm"></v-icon>
            <v-icon v-else icon="$unCheck" color="grey-darken-2" size="small" class="icone shadow-sm"></v-icon>
        </div>
        
        <v-tooltip :text="textoDispensa" location="top" content-class="caixa-tooltip">
            <template v-slot:activator="{ props }">
                <v-icon v-bind="props" v-show="dispensa" icon="mdi-alert-circle" color="white" class="icone-alerta shadow-sm" size="small"></v-icon>
            </template>
        </v-tooltip>
        
        <div class="font-weight-bold text-white text-caption text-uppercase sigla-text text-truncate w-100 px-1">{{ disciplina.Sigla }}</div>
        <div class="text-caption text-white opacity-80 codigo-text">{{ disciplina.codigo }}</div>
    </v-card>
</template>
<script>
export default {
    name: 'CaixaDisciplina',
    props: {
        disciplina: {
            type: Object,
            required: true,
            default: () => { }
        },
        status: { type: Object, default: () => ({ ver: false, cor: "", solicitarDispensa: false }) },
        cor: { type: String, default: () => 'surface-variant' },
        eixo: { type: String, default: () => '' }
    },
    computed: {
        dispensa() {
            return this.status.solicitarDispensa === true;
        },
        textoDispensa(){
            return "É necessário o pedido de dispensa na secretaria do curso."
        }
    }
}
</script>
<style scoped>
.largura-caixa {
    width: 100px;
    height: 80px;
    border-radius: 8px !important;
    position: relative;
    overflow: hidden;
    cursor: pointer;
}

.sigla-text {
    font-size: 0.85rem !important;
    line-height: 1.2;
}

.codigo-text {
    font-size: 0.65rem !important;
}

.status-icon-container {
    position: absolute;
    top: 2px;
    right: 4px;
    z-index: 2;
}

.icone {
    opacity: 0.9;
}

.icone-alerta {
    position: absolute;
    top: 4px;
    left: 4px;
    z-index: 2;
}

.caixa-disciplina:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.3) !important;
    filter: brightness(110%);
    z-index: 5;
}

.shadow-sm {
    filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5));
}

.opacity-80 {
    opacity: 0.8;
}
</style>
