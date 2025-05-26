document.addEventListener('DOMContentLoaded', async () => { // Adicionado 'async' aqui
  const form = document.getElementById('historicoForm');
  const mensagem = document.getElementById('mensagem');

  const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado')); // Pega o usuário logado

  if (!usuarioLogado || !usuarioLogado.email || !usuarioLogado._id) {
    mensagem.textContent = 'Por favor, faça login para gerenciar seu histórico.';
    mensagem.style.color = 'red';
    // Opcional: Redirecionar para login
    // setTimeout(() => { window.location.href = '../pages/login.html'; }, 1500);
    return; // Para não tentar carregar ou salvar sem usuário logado
  }

  // --- Lógica para CARREGAR dados do backend ---
  try {
    const responseLoad = await fetch(`https://projeto-integrador-o5fj.onrender.com/api/historico?email=${usuarioLogado.email}`);
    const dados = await responseLoad.json();

    if (responseLoad.ok && dados) { // Se a resposta for OK e houver dados de histórico
      document.getElementById('tipoSanguineo').value = dados.tipoSanguineo || "";
      document.getElementById('doencas').value = dados.doencas || "";
      document.getElementById('alergias').value = dados.alergias || "";
      document.getElementById('medicamentos').value = dados.medicamentos || "";
      // Lógica para carregar arquivos (se houver, é mais complexa e depende de como você os armazena e recupera)
      // Por exemplo, exibir links para download dos arquivos.
    } else if (responseLoad.status === 404) {
      // Usuário encontrado, mas sem histórico ainda (mensagem pode ser mais suave)
      mensagem.textContent = 'Você ainda não possui histórico de saúde salvo. Preencha e salve!';
      mensagem.style.color = 'blue';
    } else {
      mensagem.textContent = 'Erro ao carregar histórico: ' + (dados.message || 'Tente novamente.');
      mensagem.style.color = 'red';
    }
  } catch (error) {
    console.error('Erro na requisição de carregamento do histórico:', error);
    mensagem.textContent = 'Erro de conexão ao carregar histórico.';
    mensagem.style.color = 'red';
  }
  // --- Fim da lógica para CARREGAR dados ---


  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Cria o FormData a partir do formulário
    const formData = new FormData(form);

    // Adiciona o email do usuário logado ao FormData
    formData.append('emailUsuario', usuarioLogado.email);

    // Adiciona o _id do usuário logado ao FormData para o backend
    formData.append('usuarioId', usuarioLogado._id);

    try {
      // A rota POST /api/historico no backend já está configurada para criar OU atualizar
      const response = await fetch('https://projeto-integrador-o5fj.onrender.com/api/historico', {
        method: 'POST',
        body: formData // FormData é usado para enviar dados do formulário, incluindo arquivos
      });

      const result = await response.json();

      if (response.ok) {
        mensagem.textContent = result.message || 'Histórico salvo com sucesso no servidor!';
        mensagem.style.color = 'green';
      } else {
        mensagem.textContent = 'Erro ao salvar histórico: ' + (result.message || 'Tente novamente.');
        mensagem.style.color = 'red';
      }
    } catch (error) {
      console.error(error);
      mensagem.textContent = 'Erro de conexão ao salvar histórico.';
      mensagem.style.color = 'red';
    }


  });
});