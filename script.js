const STORAGE_KEY = 'tarefas'

const estado = {
    tarefas: [],
    editandoId: null,
    filtros: {
        status: 'Todos',
        prioridade: 'Todas'
    }
}

function salvarTarefas() {
    localStorage.setItem(STORAGE_KEY,JSON.stringify(estado.tarefas))
}

function carregarTarefas() {
    const bruto = localStorage.getItem(STORAGE_KEY)
    if (!bruto) return []
    try {
        const lista = (JSON.parse(bruto))
        return Array.isArray(lista) ? lista : []

    } catch {
        return []
    }    
}

function adicionarTarefa (tarefa) {
    estado.tarefas.push(tarefa)
}

function atualizarTarefa (tarefaNova) {
    estado.tarefas = estado.tarefas.map((tarefa) => (tarefa.id === tarefaNova.id ? tarefaNova : tarefa))
}

function removerTarefa (id) {
    estado.tarefas = estado.tarefas.filter((tarefa) => (tarefa.id !== id ))
}

function filtrarTarefas () {
    return estado.tarefas.filter((tarefa) => {
        const statusOk = estado.filtros.status === 'Todos' || tarefa.status === estado.filtros.status
        const prioridadeOk = estado.filtros.prioridade === 'Todas' || tarefa.prioridade === estado.filtros.prioridade
        return statusOk && prioridadeOk
    })
}

function formatarData (dataIso) {
    if(!dataIso) return ('-')
    const [ano ,mes ,dia ] = dataIso.split('-')
    return `${dia}/${mes}/${ano}`
}

function criarId () {
    return `${Date.now()}-${Math.floor(Math.random() *10000 )}`
}

$(function () {
    function criarCampoObservacao (valor = '') {
        if ($('#observacao').length) return
        $('#area-observacao-dinamica').append('<label for="observacao">Observação</label><textarea id="observacao" rows="2"></textarea>')
        $('#observacao').val(valor)
    }

    function removerCampoObservacao () {
        $('area-observacao-dinamica').empty()
    }

    function mostrarErro (mensagem) {
        $('#caixa-erro').addClass('visivel').text(mensagem)
    }

    function limparErro () {
        $('#caixa-erro').removeClass('visivel').text('')
    }

    function limparFormulario () {
        $('#form-tarefa')[0].reset()
        $('#prioridade').val('Média')
        $('#situacao').val('Pendente')
        $('#btn-concluir').text('Concluir')
        limparErro()
        removerCampoObservacao()
        estado.editandoId = null
    }

    function criarEstruturaTabela() {
        if($('#tabela-tarefas').length) return))

        const filtros =('<div class="filtros"></div>')
             filtros.append('<select id="filtro-situacao"></select>')
             filtros.append('<select id="filtro-prioridade"></select>')
             filtros.append('')
    }

})

