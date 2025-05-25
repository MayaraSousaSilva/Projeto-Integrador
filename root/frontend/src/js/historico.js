document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('historicoForm');
  const mensagem = document.getElementById('mensagem');

  // Carrega dados do localStorage para preencher inicialmente
  const dados = JSON.parse(localStorage.getItem('historicoSaude')) || {};
  if (dados) {
    document.getElementById('tipoSanguineo').value = dados.tipoSanguineo || "";
    document.getElementById('doencas').value = dados.doencas || "";
    document.getElementById('alergias').value = dados.alergias || "";
    document.getElementById('medicamentos').value = dados.medicamentos || "";
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Cria o FormData a partir do formulário
    const formData = new FormData(form);

    // Pega o usuário logado
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

    if (usuarioLogado && usuarioLogado.email) {
      // Adiciona o email ao FormData
      formData.append('emailUsuario', usuarioLogado.email);

      try {
        const response = await fetch('http://localhost:3000/api/historico', {
          method: 'POST',
          body: formData
        });

        const result = await response.json();

        if (response.ok) {
          mensagem.textContent = 'Histórico salvo com sucesso no servidor!';
          mensagem.style.color = 'green';
        } else {
          mensagem.textContent = 'Erro ao salvar histórico: ' + result.message;
          mensagem.style.color = 'red';
        }
      } catch (error) {
        console.error(error);
        mensagem.textContent = 'Erro de conexão ao salvar histórico.';
        mensagem.style.color = 'red';
      }
    } else {
      mensagem.textContent = 'Usuário não logado. Histórico salvo localmente.';
      mensagem.style.color = 'orange';
    }

    // Salva localmente também (somente texto)
    const historico = {
      tipoSanguineo: document.getElementById('tipoSanguineo').value.trim(),
      doencas: document.getElementById('doencas').value.trim(),
      alergias: document.getElementById('alergias').value.trim(),
      medicamentos: document.getElementById('medicamentos').value.trim()
    };
    localStorage.setItem('historicoSaude', JSON.stringify(historico));
  });
});
