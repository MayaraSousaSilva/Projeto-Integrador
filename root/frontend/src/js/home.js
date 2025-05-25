document.addEventListener('DOMContentLoaded', async () => {
  const container = document.querySelector('#notificacoesContainer');
  const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

  if (!usuarioLogado || !usuarioLogado.email) {
    container.innerHTML = '<p style="color: red;">Usuário não logado.</p>';
    return;
  }

  const email = usuarioLogado.email;

  // Buscar Notificações
  try {
    const notifRes = await fetch(`http://localhost:3000/api/notificacoes?email=${email}`);
    const notificacoes = await notifRes.json();

    notificacoes.forEach((n, index) => {
      const dataObj = new Date(n.data + 'T00:00:00');
      const dataFormatada = dataObj.toLocaleDateString('pt-BR');

      const card = document.createElement('div');
      card.style.background = n.tipo.toLowerCase() === 'medicamento' ? '#6dd3e8' : '#f27474';
      card.style.padding = '1rem';
      card.style.borderRadius = '10px';
      card.style.marginBottom = '1rem';
      card.style.color = 'black';
      card.style.fontWeight = 'bold';

      card.innerHTML = `
        <div>
          <strong>${n.tipo}</strong><br>
          Data: ${dataFormatada}<br>
          Horário: ${n.horario}<br>
          <strong>Descrição:</strong> ${n.descricao}
        </div>
        <div class="botoes-notificacao">
          <button class="editar-btn">✏️ Editar</button>
          <button class="excluir-btn">🗑️ Excluir</button>
        </div>
      `;

      card.querySelector('.editar-btn').addEventListener('click', () => {
        localStorage.setItem('notificacaoEmEdicao', JSON.stringify({ ...n, index }));
        window.location.href = 'notificacoes.html';
      });

      card.querySelector('.excluir-btn').addEventListener('click', async () => {
        if (confirm('Deseja excluir esta notificação?')) {
          await fetch(`http://localhost:3000/api/notificacoes/${n._id}`, {
            method: 'DELETE'
          });
          location.reload();
        }
      });

      container.appendChild(card);
    });
  } catch (err) {
    container.innerHTML += '<p style="color: red;">Erro ao carregar notificações.</p>';
  }

  // Buscar Histórico de Saúde
  try {
    const histRes = await fetch(`http://localhost:3000/api/historico?email=${email}`);
    const historico = await histRes.json();

    if (historico) {
      const card = document.createElement('div');
      card.style.background = '#c5e1a5';
      card.style.padding = '1rem';
      card.style.borderRadius = '10px';
      card.style.marginBottom = '1rem';
      card.style.color = 'black';

      card.innerHTML = `
        <div>
          <h3>Histórico de Saúde</h3>
          Tipo Sanguíneo: ${historico.tipoSanguineo}<br>
          Doenças: ${historico.doencas}<br>
          Alergias: ${historico.alergias}<br>
          Medicamentos: ${historico.medicamentos}
        </div>
        <div class="botoes-notificacao">
          <button class="editar-historico">✏️ Editar</button>
          <button class="excluir-historico">🗑️ Excluir</button>
        </div>
      `;

      card.querySelector('.editar-historico').addEventListener('click', () => {
        localStorage.setItem('historicoEmEdicao', JSON.stringify(historico));
        window.location.href = 'historico.html';
      });

      card.querySelector('.excluir-historico').addEventListener('click', async () => {
        if (confirm('Deseja excluir seu histórico de saúde?')) {
          await fetch(`http://localhost:3000/api/historico/${historico._id}`, {
            method: 'DELETE'
          });
          location.reload();
        }
      });

      container.appendChild(card);
    }
  } catch (err) {
    container.innerHTML += '<p style="color: red;">Erro ao carregar histórico de saúde.</p>';
  }
});
