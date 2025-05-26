document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formNotificacao');
  const mensagem = document.getElementById('mensagem');

  // A notificação em edição agora será buscada do backend na tela home,
  // e o ID será passado via localStorage ou URL, ou um mecanismo de estado mais robusto.
  // Por enquanto, vamos manter a estrutura, mas a lógica de populamento viria de uma requisição GET.
  const notificacaoEmEdicao = JSON.parse(localStorage.getItem('notificacaoEmEdicao'));

  if (notificacaoEmEdicao) {
    document.getElementById('data').value = notificacaoEmEdicao.data;
    document.getElementById('tipo').value = notificacaoEmEdicao.tipo;
    document.getElementById('descricao').value = notificacaoEmEdicao.descricao;
    document.getElementById('horario').value = notificacaoEmEdicao.horario;
    localStorage.removeItem('notificacaoEmEdicao'); // Limpa após carregar para edição
  }


  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Coleta valores do formulário
    const data = document.getElementById('data').value;
    const tipo = document.getElementById('tipo').value.trim();
    const descricao = document.getElementById('descricao').value.trim();
    const horario = document.getElementById('horario').value;

    if (!data || !tipo || !descricao || !horario) {
      mensagem.textContent = 'Por favor, preencha todos os campos.';
      mensagem.style.color = 'red';
      return;
    }

    // Pega o usuário logado com o email e ID do localStorage
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

    if (!usuarioLogado || !usuarioLogado.email || !usuarioLogado._id) {
        mensagem.textContent = 'Usuário não logado ou informações incompletas. Faça login novamente.';
        mensagem.style.color = 'red';
        return;
    }

    try {
        // Define a URL e o método com base se é uma edição (PUT) ou nova criação (POST)
        const url = notificacaoEmEdicao && notificacaoEmEdicao.id
            ? `http://localhost:3000/api/notificacoes/${notificacaoEmEdicao.id}`
            : 'http://localhost:3000/api/notificacoes';

        const method = notificacaoEmEdicao && notificacaoEmEdicao.id ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                // O backend agora espera o usuarioId diretamente
                usuario: usuarioLogado._id, // Envia o ID do usuário para vincular a notificação
                emailUsuario: usuarioLogado.email, // Mantido para o envio de e-mail no backend
                tipo,
                descricao,
                data,
                horario,
            }),
        });

        const result = await response.json();

        if (response.ok) {
            mensagem.textContent = result.message || 'Notificação salva com sucesso!';
            mensagem.style.color = 'green';
            form.reset(); // Limpa o formulário
            // Redireciona para home após um breve atraso para exibir a mensagem
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 1500);
        } else {
            mensagem.textContent = 'Erro ao salvar/atualizar notificação: ' + (result.message || 'Tente novamente.');
            mensagem.style.color = 'red';
        }
    } catch (error) {
        console.error('Erro de conexão ao salvar/atualizar notificação:', error);
        mensagem.textContent = 'Erro de conexão com o servidor. Tente novamente.';
        mensagem.style.color = 'red';
    }
  });
});