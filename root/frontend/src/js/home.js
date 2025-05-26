document.addEventListener('DOMContentLoaded', async () => {
  const container = document.querySelector('#notificacoesContainer');
  const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

  if (!usuarioLogado || !usuarioLogado.email || !usuarioLogado._id) {
    container.innerHTML = '<p style="color: red; text-align: center;">Por favor, faça login para ver suas notificações.</p>';
    // Opcional: Redirecionar para login
    // setTimeout(() => { window.location.href = 'pages/login.html'; }, 1500);
    return;
  }

  const email = usuarioLogado.email;
  // const usuarioId = usuarioLogado._id; // ID do usuário, mantido se precisar para outras funções aqui

  // Função para formatar a data como "dia de mês de ano"
  const formatarDataExtenso = (dataString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    const date = new Date(dataString + 'T00:00:00'); // Adiciona T00:00:00 para evitar problemas de fuso horário
    return date.toLocaleDateString('pt-BR', options);
  };

  // --- BUSCAR E EXIBIR NOTIFICAÇÕES ---
  try {
    const notifRes = await fetch(`http://localhost:3000/api/notificacoes?email=${email}`);
    if (!notifRes.ok) {
        throw new Error('Falha ao buscar notificações.');
    }
    const notificacoes = await notifRes.json();

    if (notificacoes.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: gray;">Nenhuma notificação encontrada. Crie uma!</p>';
    } else {
        notificacoes.forEach((n, index) => { // 'index' é para o localStorage, pode ser removido se a edição for totalmente via ID
            const dataFormatada = formatarDataExtenso(n.data); // Usando a nova função de formatação

            const card = document.createElement('div');
            card.className = 'notificacao-card'; // Adicionando classe CSS para estilização geral do card
            card.style.background = n.tipo.toLowerCase() === 'medicamento' ? '#6dd3e8' : '#f27474';

            card.innerHTML = `
                <div class="card-header" style="margin-bottom: 0.5rem;">
                    <strong>${n.tipo}</strong><br>
                    Data: ${dataFormatada}<br>
                    Horário: ${n.horario} ⏰
                    <span class="toggle-icon">🔽</span> </div>
                <div class="card-description hidden"> <p><strong>Descrição:</strong> ${n.descricao}</p>
                </div>
                <div class="botoes-notificacao">
                    <button class="editar-btn">✏️ Editar</button>
                    <button class="excluir-btn">🗑️ Excluir</button>
                </div>
            `;

            container.appendChild(card);

            // Seleciona os elementos recém-criados no card
            const toggleIcon = card.querySelector('.toggle-icon');
            const cardDescription = card.querySelector('.card-description');
            const editarBtn = card.querySelector('.editar-btn');
            const excluirBtn = card.querySelector('.excluir-btn');

            // Adiciona o evento de clique para a seta
            toggleIcon.addEventListener('click', () => {
                cardDescription.classList.toggle('hidden'); // Alterna a classe 'hidden'
                toggleIcon.textContent = cardDescription.classList.contains('hidden') ? '🔽' : '🔼'; // Altera a seta
            });

            editarBtn.addEventListener('click', () => {
                // Passa o ID da notificação para a tela de edição
                localStorage.setItem('notificacaoEmEdicao', JSON.stringify({ ...n, id: n._id })); // Passando o _id do MongoDB como 'id'
                window.location.href = 'notificacoes.html';
            });

            excluirBtn.addEventListener('click', async () => {
                if (confirm('Deseja excluir esta notificação?')) {
                    try {
                        const deleteRes = await fetch(`http://localhost:3000/api/notificacoes/${n._id}`, {
                            method: 'DELETE'
                        });
                        if (!deleteRes.ok) {
                            throw new Error('Falha ao excluir notificação.');
                        }
                        location.reload(); // Recarrega a página para atualizar a lista
                    } catch (deleteError) {
                        alert('Erro ao excluir notificação: ' + deleteError.message);
                        console.error('Erro ao excluir notificação:', deleteError);
                    }
                }
            });
        });
    }
  } catch (err) {
    console.error('Erro ao carregar notificações:', err);
    container.innerHTML += '<p style="color: red; text-align: center;">Erro ao carregar notificações.</p>';
  }

  // --- SEÇÃO REMOVIDA: BUSCAR E EXIBIR HISTÓRICO DE SAÚDE ---
  // O código abaixo foi removido para que o histórico não apareça na tela home.
  /*
  const historicoContainer = document.createElement('div');
  historicoContainer.className = 'historico-card-container';
  container.appendChild(historicoContainer);

  try {
    const histRes = await fetch(`http://localhost:3000/api/historico?email=${email}`);
    if (!histRes.ok && histRes.status !== 404) {
        throw new Error('Falha ao buscar histórico.');
    }
    const historico = await histRes.json();

    if (historico && historico._id) {
      const card = document.createElement('div');
      card.className = 'historico-card';
      card.style.background = '#c5e1a5';

      card.innerHTML = `
        <div>
          <h3>Histórico de Saúde</h3>
          <p>Tipo Sanguíneo: <strong>${historico.tipoSanguineo || 'Não informado'}</strong></p>
          <p>Doenças: <strong>${historico.doencas || 'Nenhuma'}</strong></p>
          <p>Alergias: <strong>${historico.alergias || 'Nenhuma'}</strong></p>
          <p>Medicamentos: <strong>${historico.medicamentos || 'Nenhum'}</strong></p>
        </div>
        <div class="botoes-notificacao">
          <button class="editar-historico">✏️ Editar</button>
          <button class="excluir-historico">🗑️ Excluir</button>
        </div>
      `;

      historicoContainer.appendChild(card);

      card.querySelector('.editar-historico').addEventListener('click', () => {
        localStorage.setItem('historicoEmEdicao', JSON.stringify({ ...historico, id: historico._id }));
        window.location.href = 'historico.html';
      });

      card.querySelector('.excluir-historico').addEventListener('click', async () => {
        if (confirm('Deseja excluir seu histórico de saúde?')) {
          try {
            const deleteRes = await fetch(`http://localhost:3000/api/historico/${historico._id}`, {
              method: 'DELETE'
            });
            if (!deleteRes.ok) {
                throw new Error('Falha ao excluir histórico.');
            }
            location.reload();
          } catch (deleteError) {
            alert('Erro ao excluir histórico: ' + deleteError.message);
            console.error('Erro ao excluir histórico:', deleteError);
          }
        }
      });
    } else {
        historicoContainer.innerHTML = '<p style="text-align: center; color: gray;">Nenhum histórico de saúde salvo. Adicione um!</p>';
    }
  } catch (err) {
    console.error('Erro ao carregar histórico de saúde:', err);
    historicoContainer.innerHTML += '<p style="color: red; text-align: center;">Erro ao carregar histórico de saúde.</p>';
  }
  */
});