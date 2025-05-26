document.addEventListener('DOMContentLoaded', () => {
  const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
  const mensagem = document.getElementById('mensagem');
  const celularInput = document.getElementById('celular');
  const form = document.getElementById('configForm');

  if (!usuarioLogado || !usuarioLogado._id) {
    window.location.href = "../pages/login.html";
    return;
  }

  function formatarCelularParaExibicao(numero) {
    let value = String(numero).replace(/\D/g, '');
    let formattedValue = '';
    if (value.length > 0) formattedValue += '(' + value.substring(0, 2);
    if (value.length > 2) formattedValue += ') ' + value.substring(2, 7);
    if (value.length > 7) formattedValue += '-' + value.substring(7, 11);
    return formattedValue;
  }

  document.getElementById('nome').value = usuarioLogado.nome || '';
  document.getElementById('email').value = usuarioLogado.email || '';
  celularInput.value = usuarioLogado.celular ? formatarCelularParaExibicao(usuarioLogado.celular) : '';

  celularInput.addEventListener('input', e => {
    let value = e.target.value.replace(/\D/g, '');
    let formattedValue = '';
    if (value.length > 0) formattedValue += '(' + value.substring(0, 2);
    if (value.length > 2) formattedValue += ') ' + value.substring(2, 7);
    if (value.length > 7) formattedValue += '-' + value.substring(7, 11);
    e.target.value = formattedValue;
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const senhaAtual = document.getElementById('senhaAtual').value;
    const novaSenha = document.getElementById('novaSenha').value;
    const confirmarSenha = document.getElementById('confirmarSenha').value;
    const novoCelular = celularInput.value.replace(/\D/g, '');

    if (novoCelular && (novoCelular.length < 10 || novoCelular.length > 11)) {
      mensagem.textContent = "❌ Por favor, digite um número de celular válido (10 ou 11 dígitos, incluindo o DDD).";
      mensagem.style.color = "red";
      return;
    }

    // REMOVIDO: A VALIDAÇÃO DA SENHA ATUAL AGORA É NO BACKEND
    // if (senhaAtual && senhaAtual !== usuarioLogado.password) { ... }

    if (novaSenha && novaSenha !== confirmarSenha) {
      mensagem.textContent = "❌ As novas senhas não coincidem.";
      mensagem.style.color = "red";
      return;
    }

    const updates = { celular: novoCelular };
    if (senhaAtual) { // Envie a senha atual APENAS se o usuário preencheu o campo
        updates.senhaAtual = senhaAtual;
    }
    if (novaSenha) { // Envie a nova senha APENAS se o usuário a preencheu
        updates.password = novaSenha;
    }
    // Não envie nome ou email, pois eles são readonly e não devem ser alterados por esta rota

    try {
      const response = await fetch(`http://localhost:3000/api/usuario/${usuarioLogado._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erro ao atualizar usuário no servidor.');
      }

      const data = await response.json();

      localStorage.setItem('usuarioLogado', JSON.stringify(data.usuario));

      mensagem.textContent = "✅ Informações salvas com sucesso!";
      mensagem.style.color = "green";

      document.getElementById('senhaAtual').value = "";
      document.getElementById('novaSenha').value = "";
      document.getElementById('confirmarSenha').value = "";

    } catch (error) {
      mensagem.textContent = `❌ ${error.message}`;
      mensagem.style.color = "red";
    }
  });

  document.getElementById('logout').addEventListener('click', () => {
    localStorage.removeItem('usuarioLogado');
    window.location.href = "../pages/login.html";
  });

  document.getElementById('excluirConta').addEventListener('click', async () => {
    if (!confirm("Tem certeza que deseja excluir sua conta?")) return;

    try {
      const response = await fetch(`http://localhost:3000/api/usuario/${usuarioLogado._id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erro ao excluir conta no servidor');
      }

      localStorage.removeItem('usuarioLogado');
      window.location.href = "../pages/login.html";

    } catch (error) {
      mensagem.textContent = `❌ ${error.message}`;
      mensagem.style.color = "red";
    }
  });
});