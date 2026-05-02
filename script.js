const STORAGE_KEY = 'tarefas_avancadas'

const estado = 
{
  tarefas: [],
  editandoId: null,
  filtros: { status: 'Todos', prioridade: 'Todas' }
}



function salvarTarefas() 
{
  localStorage.setItem(STORAGE_KEY, JSON.stringify(estado.tarefas))
}


function carregarTarefas() 
{
  const bruto = localStorage.getItem(STORAGE_KEY)
  if (!bruto) return []
  try { return JSON.parse(bruto) || [] } catch { return [] }
}


function adicionarTarefa(tarefa) 
{
   estado.tarefas.push(tarefa) 
}
function atualizarTarefa(tarefaNova) 
{
  estado.tarefas = estado.tarefas.map(t => t.id === tarefaNova.id ? tarefaNova : t)
}

function excluirTarefa(id) 
{ 
  estado.tarefas = estado.tarefas.filter(t => t.id !== id) 
}


function filtrarTarefas() 
{
  return estado.tarefas.filter 
  (
    t => {
    const okStatus = estado.filtros.status === 'Todos' || t.status === estado.filtros.status
    const okPrioridade = estado.filtros.prioridade === 'Todas' || t.priority === estado.filtros.prioridade
    return okStatus && okPrioridade
   }
  )
}

function criarCampoObservacao(valor = '') 
{
  if ($('#observacao').length) return
  $('#area-observacao-dinamica').append('<label for="observacao">Observação</label><textarea id="observacao" rows="2" placeholder="Escreva uma observação..."></textarea>')
  $('#observacao').val(valor)
}

function removerCampoObservacao() 
{
   $('#area-observacao-dinamica').empty()
}

function limparFormulario() 
{
  $('#form-tarefa')[0].reset()

  $('#prioridade').val('Média')

  $('#situacao').val('Pendente')

  $('#btn-concluir').text('Concluir')

  $('#caixa-erro').removeClass('visible').text('')

  removerCampoObservacao()

  estado.editandoId = null
}

function mostrarErro(msg) 
{ 
  $('#caixa-erro').addClass('visible').text(msg) 
}

function criarEstruturaTabela() 
{
  if ($('#tabela-tarefas').length) return

  const filtros = $('<div class="filtros"></div>')

  filtros.append('<select id="filtro-situacao"><option value="Todos">Todos os status</option><option value="Pendente">Pendente</option><option value="Concluída">Concluída</option></select>')

  filtros.append('<select id="filtro-prioridade"><option value="Todas">Todas as prioridades</option><option value="Baixa">Baixa</option><option value="Média">Média</option><option value="Alta">Alta</option></select>')

  filtros.append('<button type="button" id="btn-filtrar" class="secundario">Filtrar</button>')

  const tabela = $('<table id="tabela-tarefas"><thead><tr><th>Título</th><th>Descrição</th><th>Prioridade</th><th>Data limite</th><th>Status</th><th>Observação</th><th>Ações</th></tr></thead><tbody></tbody></table>')

  $('#area-tabela').empty().append(filtros, tabela)
}

function formatarData(data) 
{
  if (!data) return '-'

  const [ano, mes, dia] = data.split('-')

  return `${dia}/${mes}/${ano}`
}

function renderizarTabela() 
{
  if (!estado.tarefas.length) 
  {
    $('#area-tabela').empty()
    return
  }

  criarEstruturaTabela()
  const lista = filtrarTarefas()
  const $tbody = $('#tabela-tarefas tbody')
  $tbody.empty()

  if (!lista.length) $tbody.append
  ('<tr><td class="vazio" colspan="7">Nenhuma tarefa para os filtros selecionados.</td></tr>')

  lista.forEach(
    t => {
    const classe = t.status === 'Concluída' ? 'tarefa-concluida' : ''
    $tbody.append
    (
    `<tr data-id="${t.id}" class="${classe}"> <td> ${t.title}
    </td><td>

    ${t.description || '-'}
    </td><td>

    ${t.priority}
    </td><td>

    ${formatarData(t.deadline)}
    </td><td>

    ${t.status}
    </td><td>

    ${t.observation || '-'}
    </td><td>

    <button type="button" class="btn-editar">Editar</button>
    <button type="button" class="btn-excluir perigo">Excluir</button>
    </td></tr>`
    )
  }
  )

  $('#filtro-situacao').val(estado.filtros.status)
  $('#filtro-prioridade').val(estado.filtros.prioridade)
}

function abrirEdicao(id) 
{
  const tarefa = estado.tarefas.find(t => t.id === id)
  if (!tarefa) return

  $('#titulo').val(tarefa.title)
  $('#descricao').val(tarefa.description)
  $('#prioridade').val(tarefa.priority)
  $('#data-limite').val(tarefa.deadline)
  $('#situacao').val(tarefa.status)

  tarefa.observation ? criarCampoObservacao(tarefa.observation) : removerCampoObservacao()

  $('#btn-concluir').text('Atualizar')

  estado.editandoId = id
}

$(function () 
{
  estado.tarefas = carregarTarefas()
  renderizarTabela()

  $('#btn-observacao').on('click', function () 
  {
    $('#observacao').length ? removerCampoObservacao() : criarCampoObservacao()
  }
  )

  $('#form-tarefa').on('submit', function (e) 
  {
    e.preventDefault()

    $('#caixa-erro').removeClass('visible').text('')

    const title = $('#titulo').val().trim()
    if (!title) return mostrarErro('O título da tarefa é obrigatório.')

    const tarefa = {

      id: estado.editandoId || ` ${Date.now()}-${Math.floor(Math.random() * 10000)} `,
      title,

      description: $('#descricao').val().trim(),
      priority: $('#prioridade').val(),
      deadline: $('#data-limite').val(),
      status: $('#situacao').val(),
      observation: $('#observacao').length ? $('#observacao').val().trim() : ''

    }

    estado.editandoId ? atualizarTarefa(tarefa) : adicionarTarefa(tarefa)

    salvarTarefas()
    renderizarTabela()
    limparFormulario()

  }
  )




  
  $('#area-tabela').on('click', '.btn-excluir', function () 
  {
    excluirTarefa($(this).closest('tr').data('id'))
    salvarTarefas()
    renderizarTabela()
  }
  )

  $('#area-tabela').on('click', '.btn-editar', function () 
  {
    abrirEdicao($(this).closest('tr').data('id'))
  }
  )

  $('#area-tabela').on('dblclick', 'tr', function () 
  {
    const id = $(this).data('id')
    if (id) abrirEdicao(id)
  }
  )

  $('#area-tabela').on('click', '#btn-filtrar', function () 
  {
    estado.filtros.status = $('#filtro-situacao').val()
    estado.filtros.prioridade = $('#filtro-prioridade').val()

    renderizarTabela()
  }
  )

  $('#area-tabela').on('change', '#filtro-situacao,#filtro-prioridade', function () 
  {
    estado.filtros.status = $('#filtro-situacao').val()
    estado.filtros.prioridade = $('#filtro-prioridade').val()
  }
  )
}
)
