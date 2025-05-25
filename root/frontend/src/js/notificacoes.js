document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formNotificacao');
  const mensagem = document.getElementById('mensagem');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // coleta valores do form
    const data = document.getElementById('data').value;
    const tipo = document.getElementById('tipo').value.trim();
    const descricao = document.getElementById('descricao').value.trim();
    const horario = document.getElementById('horario').value;

    if (!data || !tipo || !descricao || !horario) {
      mensagem.textContent = 'Por favor, preencha todos os campos.';
      mensagem.style.color = 'red';
      return;
    }

    // Pega o usuário logado com o email no localStorage
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

    if (usuarioLogado && usuarioLogado.email) {
      try {
        const response = await fetch('http://localhost:3000/api/notificacoes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            emailUsuario: usuarioLogado.email,
            tipo,
            descricao,
            data,
            horario,
          }),
        });

        const result = await response.json();

        if (response.ok) {
          mensagem.textContent = result.message || 'Notificação salva e e-mail enviado com sucesso!';
          mensagem.style.color = 'green';
          form.reset();
        } else {
          mensagem.textContent = 'Notificação salva, mas erro ao enviar o e-mail: ' + (result.message || '');
          mensagem.style.color = 'orange';
        }
      } catch (error) {
        mensagem.textContent = 'Erro de conexão ao enviar o e-mail.';
        mensagem.style.color = 'red';
      }
    } else {
      mensagem.textContent = 'Usuário não logado ou sem e-mail. Notificação não enviada.';
      mensagem.style.color = 'orange';
    }
  });
});
