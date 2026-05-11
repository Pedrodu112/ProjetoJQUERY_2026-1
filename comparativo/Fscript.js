const STORAGE_KEY = 'tarefas_avancadas'

const estado = {
  tarefas: [],
  editandoId: null,
  filtros: { status: 'Todos', prioridade: 'Todas' }
}

function salvarTarefas() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(estado.tarefas))
}

function carregarTarefas() {
  const bruto = localStorage.getItem(STORAGE_KEY)
  if (!bruto) return []
  try {
    const lista = JSON.parse(bruto)
    return Array.isArray(lista) ? lista : []
  } catch {
    return []
  }
}

function adicionarTarefa(tarefa) {
  estado.tarefas.push(tarefa)
}

function atualizarTarefa(tarefaNova) {
  estado.tarefas = estado.tarefas.map((tarefa) => (tarefa.id === tarefaNova.id ? tarefaNova : tarefa))
}

function removerTarefa(id) {
  estado.tarefas = estado.tarefas.filter((tarefa) => tarefa.id !== id)
}

function filtrarTarefas() {
  return estado.tarefas.filter((tarefa) => {
    const statusOk = estado.filtros.status === 'Todos' || tarefa.status === estado.filtros.status
    const prioridadeOk = estado.filtros.prioridade === 'Todas' || tarefa.prioridade === estado.filtros.prioridade
    return statusOk && prioridadeOk
  })
}

function formatarData(dataIso) {
  if (!dataIso) return '-'
  const [ano, mes, dia] = dataIso.split('-')
  return `${dia}/${mes}/${ano}`
}

function criarId() {
  return `${Date.now()}-${Math.floor(Math.random() * 10000)}`
}

$(function () {
  function criarCampoObservacao(valor = '') {
    if ($('#observacao').length) return
    $('#area-observacao-dinamica').append('<label for="observacao">Observação</label><textarea id="observacao" rows="2" placeholder="Escreva uma observação..."></textarea>')
    $('#observacao').val(valor)
  }

  function removerCampoObservacao() {
    $('#area-observacao-dinamica').empty()
  }

  function mostrarErro(mensagem) {
    $('#caixa-erro').addClass('visivel').text(mensagem)
  }

  function limparErro() {
    $('#caixa-erro').removeClass('visivel').text('')
  }

  function limparFormulario() {
    $('#form-tarefa')[0].reset()
    $('#prioridade').val('Média')
    $('#situacao').val('Pendente')
    $('#btn-concluir').text('Concluir')
    limparErro()
    removerCampoObservacao()
    estado.editandoId = null
  }

  function criarEstruturaTabela() {
    if ($('#tabela-tarefas').length) return

    const filtros = $('<div class="filtros"></div>')
    filtros.append('<select id="filtro-situacao"><option value="Todos">Todos os status</option><option value="Pendente">Pendente</option><option value="Concluída">Concluída</option></select>')
    filtros.append('<select id="filtro-prioridade"><option value="Todas">Todas as prioridades</option><option value="Baixa">Baixa</option><option value="Média">Média</option><option value="Alta">Alta</option></select>')
    filtros.append('<button type="button" id="btn-filtrar" class="secundario">Filtrar</button>')

    const tabela = $(
      '<table id="tabela-tarefas">' +
      '<thead><tr><th>Título</th><th>Descrição</th><th>Prioridade</th><th>Data limite</th><th>Status</th><th>Observação</th><th>Ações</th></tr></thead>' +
      '<tbody></tbody></table>'
    )
    $('#area-tabela').empty().append(filtros, tabela)
  }

  function renderizarTabela() {
    if (!estado.tarefas.length) {
      $('#area-tabela').empty()
      return
    }

    criarEstruturaTabela()
    const tarefasFiltradas = filtrarTarefas()
    const corpoTabela = $('#tabela-tarefas tbody')
    corpoTabela.empty()

    if (!tarefasFiltradas.length) {
      corpoTabela.append('<tr><td class="vazio" colspan="7">Nenhuma tarefa para os filtros selecionados.</td></tr>')
    }

    tarefasFiltradas.forEach((tarefa) => {
      const classeLinha = tarefa.status === 'Concluída' ? 'tarefa-concluida' : ''
      corpoTabela.append(`<tr data-id="${tarefa.id}" class="${classeLinha}"><td>${tarefa.titulo}</td><td>${tarefa.descricao || '-'}</td><td>${tarefa.prioridade}</td><td>${formatarData(tarefa.dataLimite)}</td><td>${tarefa.status}</td><td>${tarefa.observacao || '-'}</td><td><button type="button" class="btn-editar">Editar</button><button type="button" class="btn-excluir perigo">Excluir</button></td></tr>`)
    })

    $('#filtro-situacao').val(estado.filtros.status)
    $('#filtro-prioridade').val(estado.filtros.prioridade)
  }

  function abrirEdicao(id) {
    const tarefa = estado.tarefas.find((item) => item.id === id)
    if (!tarefa) return

    $('#titulo').val(tarefa.titulo)
    $('#descricao').val(tarefa.descricao)
    $('#prioridade').val(tarefa.prioridade)
    $('#data-limite').val(tarefa.dataLimite)
    $('#situacao').val(tarefa.status)

    if (tarefa.observacao) {
      criarCampoObservacao(tarefa.observacao)
    } else {
      removerCampoObservacao()
    }

    $('#btn-concluir').text('Atualizar')
    estado.editandoId = id
  }

  estado.tarefas = carregarTarefas()
  renderizarTabela()

  $('#btn-observacao').on('click', function () {
    if ($('#observacao').length) {
      removerCampoObservacao()
    } else {
      criarCampoObservacao()
    }
  })

  $('#form-tarefa').on('submit', function (evento) {
    evento.preventDefault()
    limparErro()

    const titulo = $('#titulo').val().trim()
    if (!titulo) {
      mostrarErro('O título da tarefa é obrigatório.')
      return
    }

    const tarefa = {
      id: estado.editandoId || criarId(),
      titulo,
      descricao: $('#descricao').val().trim(),
      prioridade: $('#prioridade').val(),
      dataLimite: $('#data-limite').val(),
      status: $('#situacao').val(),
      observacao: $('#observacao').length ? $('#observacao').val().trim() : ''
    }

    if (estado.editandoId) {
      atualizarTarefa(tarefa)
    } else {
      adicionarTarefa(tarefa)
    }

    salvarTarefas()
    renderizarTabela()
    limparFormulario()
  })

  $('#area-tabela').on('click', '.btn-excluir', function () {
    const id = $(this).closest('tr').data('id')
    removerTarefa(id)
    salvarTarefas()
    renderizarTabela()
  })

  $('#area-tabela').on('click', '.btn-editar', function () {
    const id = $(this).closest('tr').data('id')
    abrirEdicao(id)
  })

  $('#area-tabela').on('dblclick', 'tr', function () {
    const id = $(this).data('id')
    if (id) abrirEdicao(id)
  })

  $('#area-tabela').on('click', '#btn-filtrar', function () {
    estado.filtros.status = $('#filtro-situacao').val()
    estado.filtros.prioridade = $('#filtro-prioridade').val()
    renderizarTabela()
  })

  $('#area-tabela').on('change', '#filtro-situacao, #filtro-prioridade', function () {
    estado.filtros.status = $('#filtro-situacao').val()
    estado.filtros.prioridade = $('#filtro-prioridade').val()
  })
})
