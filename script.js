const STORAGE_KEY = 'tarefas_avancadas';
const estado = {
  tarefas: [],
  editandoId: null,
  filtros: { status: 'Todos', prioridade: 'Todas' }
};

// ===== JS PURO (regra da atividade) =====
function salvarTarefas() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(estado.tarefas));
}

function carregarTarefas() {
  const bruto = localStorage.getItem(STORAGE_KEY);
  if (!bruto) return [];
  try {
    const lista = JSON.parse(bruto);
    return Array.isArray(lista) ? lista : [];
  } catch {
    return [];
  }
}

function adicionarTarefa(tarefa) {
  estado.tarefas.push(tarefa);
}

function atualizarTarefa(tarefaAtualizada) {
  estado.tarefas = estado.tarefas.map((t) => (t.id === tarefaAtualizada.id ? tarefaAtualizada : t));
}

function excluirTarefa(id) {
  estado.tarefas = estado.tarefas.filter((t) => t.id !== id);
}

function filtrarTarefas() {
  return estado.tarefas.filter((t) => {
    const okStatus = estado.filtros.status === 'Todos' || t.status === estado.filtros.status;
    const okPrioridade = estado.filtros.prioridade === 'Todas' || t.priority === estado.filtros.prioridade;
    return okStatus && okPrioridade;
  });
}

// ===== jQuery (interface e eventos) =====
function criarCampoObservacao(texto = '') {
  if ($('#observation').length) return;
  $('#dynamic-observation-area').append(`
    <label for="observation">Observação</label>
    <textarea id="observation" rows="2" placeholder="Escreva uma observação..."></textarea>
  `);
  $('#observation').val(texto);
}

function removerCampoObservacao() {
  $('#dynamic-observation-area').html('');
}

function limparFormulario() {
  $('#task-form')[0].reset();
  $('#priority').val('Média');
  $('#status').val('Pendente');
  $('#btn-submit').text('Concluir');
  removerCampoObservacao();
  $('#error-box').removeClass('visible').text('');
  estado.editandoId = null;
}

function mostrarErro(msg) {
  $('#error-box').addClass('visible').text(msg);
}

function criarTabelaSeNecessario() {
  if ($('#tasks-table').length) return;

  $('#table-area').html(`
    <div class="filters" id="filters">
      <select id="filter-status">
        <option value="Todos">Todos os status</option>
        <option value="Pendente">Pendente</option>
        <option value="Concluída">Concluída</option>
      </select>
      <select id="filter-priority">
        <option value="Todas">Todas as prioridades</option>
        <option value="Baixa">Baixa</option>
        <option value="Média">Média</option>
        <option value="Alta">Alta</option>
      </select>
      <button type="button" id="btn-filter" class="secondary">Filtrar</button>
    </div>

    <table id="tasks-table">
      <thead>
        <tr>
          <th>Título</th><th>Descrição</th><th>Prioridade</th><th>Data limite</th>
          <th>Status</th><th>Observação</th><th>Ações</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
  `);
}

function formatarData(data) {
  if (!data) return '-';
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
}

function renderizarTabela() {
  if (!estado.tarefas.length) {
    $('#table-area').html('');
    return;
  }

  criarTabelaSeNecessario();
  const lista = filtrarTarefas();
  const $tbody = $('#tasks-table tbody');
  $tbody.html('');

  if (!lista.length) {
    $tbody.append('<tr><td class="empty" colspan="7">Nenhuma tarefa para os filtros selecionados.</td></tr>');
  }

  lista.forEach((t) => {
    const doneClass = t.status === 'Concluída' ? 'task-done' : '';
    $tbody.append(`
      <tr data-id="${t.id}" class="${doneClass}">
        <td>${t.title}</td>
        <td>${t.description || '-'}</td>
        <td>${t.priority}</td>
        <td>${formatarData(t.deadline)}</td>
        <td>${t.status}</td>
        <td>${t.observation || '-'}</td>
        <td>
          <button type="button" class="btn-edit">Editar</button>
          <button type="button" class="btn-delete danger">Excluir</button>
        </td>
      </tr>
    `);
  });

  $('#filter-status').val(estado.filtros.status);
  $('#filter-priority').val(estado.filtros.prioridade);
}

function preencherFormulario(id) {
  const tarefa = estado.tarefas.find((t) => t.id === id);
  if (!tarefa) return;

  $('#title').val(tarefa.title);
  $('#description').val(tarefa.description);
  $('#priority').val(tarefa.priority);
  $('#deadline').val(tarefa.deadline);
  $('#status').val(tarefa.status);

  if (tarefa.observation) criarCampoObservacao(tarefa.observation);
  else removerCampoObservacao();

  estado.editandoId = id;
  $('#btn-submit').text('Atualizar');
}

$(function () {
  estado.tarefas = carregarTarefas();
  renderizarTabela();

  $('#btn-observation').on('click', function () {
    if ($('#observation').length) removerCampoObservacao();
    else criarCampoObservacao();
  });

  $('#task-form').on('submit', function (e) {
    e.preventDefault();
    $('#error-box').removeClass('visible').text('');

    const title = $('#title').val().trim();
    if (!title) {
      mostrarErro('O título da tarefa é obrigatório.');
      return;
    }

    const tarefa = {
      id: estado.editandoId || `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      title,
      description: $('#description').val().trim(),
      priority: $('#priority').val(),
      deadline: $('#deadline').val(),
      status: $('#status').val(),
      observation: $('#observation').length ? $('#observation').val().trim() : ''
    };

    if (estado.editandoId) atualizarTarefa(tarefa);
    else adicionarTarefa(tarefa);

    salvarTarefas();
    renderizarTabela();
    limparFormulario();
  });

  $('#table-area').on('click', '.btn-delete', function () {
    const id = $(this).closest('tr').data('id');
    excluirTarefa(id);
    salvarTarefas();
    renderizarTabela();
  });

  $('#table-area').on('click', '.btn-edit', function () {
    const id = $(this).closest('tr').data('id');
    preencherFormulario(id);
  });

  $('#table-area').on('dblclick', 'tr', function () {
    const id = $(this).data('id');
    if (id) preencherFormulario(id);
  });

  $('#table-area').on('click', '#btn-filter', function () {
    estado.filtros.status = $('#filter-status').val();
    estado.filtros.prioridade = $('#filter-priority').val();
    renderizarTabela();
  });

  $('#table-area').on('change', '#filter-status, #filter-priority', function () {
    estado.filtros.status = $('#filter-status').val();
    estado.filtros.prioridade = $('#filter-priority').val();
  });
});
