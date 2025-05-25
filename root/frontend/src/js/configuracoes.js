document.addEventListener('DOMContentLoaded', () => {
  const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
  const usuarios = JSON.parse(localStorage.getItem('users')) || [];
  const mensagem = document.getElementById('mensagem');
  const celularInput = document.getElementById('celular');
  const form = document.getElementById('configForm');

  if (!usuarioLogado) {
    window.location.href = "../login.html";
    return;
  }

  // Função para formatar celular para exibição (com máscara)
  function formatarCelularParaExibicao(numero) {
    let value = String(numero).replace(/\D/g, '');
    let formattedValue = '';

    if (value.length > 0) formattedValue += '(' + value.substring(0, 2);
    if (value.length > 2) formattedValue += ') ' + value.substring(2, 7);
    if (value.length > 7) formattedValue += '-' + value.substring(7, 11);

    return formattedValue;
  }

  // Preenche os campos com dados do usuário
  document.getElementById('nome').value = usuarioLogado.nome || '';
  document.getElementById('email').value = usuarioLogado.email || '';
  celularInput.value = usuarioLogado.celular ? formatarCelularParaExibicao(usuarioLogado.celular) : '';

  // Máscara para celular durante a digitação
  celularInput.addEventListener('input', e => {
    let value = e.target.value.replace(/\D/g, '');
    let formattedValue = '';

    if (value.length > 0) formattedValue += '(' + value.substring(0, 2);
    if (value.length > 2) formattedValue += ') ' + value.substring(2, 7);
    if (value.length > 7) formattedValue += '-' + value.substring(7, 11);

    e.target.value = formattedValue;
  });

  // Evento para enviar formulário e atualizar dados
  form.addEventListener('submit', async e => {
    e.preventDefault();

    const senhaAtual = document.getElementById('senhaAtual').value;
    const novaSenha = document.getElementById('novaSenha').value;
    const confirmarSenha = document.getElementById('confirmarSenha').value;
    const novoCelular = celularInput.value.replace(/\D/g, '');

    // Validações
    if (novoCelular && (novoCelular.length < 10 || novoCelular.length > 11)) {
      mensagem.textContent = "❌ Por favor, digite um número de celular válido (10 ou 11 dígitos, incluindo o DDD).";
      mensagem.style.color = "red";
      return;
    }

    if (senhaAtual && senhaAtual !== usuarioLogado.password) {
      mensagem.textContent = "❌ Senha atual incorreta.";
      mensagem.style.color = "red";
      return;
    }

    if (novaSenha && novaSenha !== confirmarSenha) {
      mensagem.textContent = "❌ As novas senhas não coincidem.";
      mensagem.style.color = "red";
      return;
    }

    // Dados para atualizar no backend
    const updates = { celular: novoCelular };
    if (novaSenha) updates.password = novaSenha;

    try {
      const response = await fetch(`/api/usuario/${usuarioLogado._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erro ao atualizar usuário.');
      }

      const data = await response.json();

      // Atualiza localmente os dados do usuário
      Object.assign(usuarioLogado, data.usuario);
      localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));

      // Atualiza o array de usuários local (caso precise manter sincronizado)
      const index = usuarios.findIndex(u => u.email === usuarioLogado.email);
      if (index !== -1) {
        usuarios[index].celular = novoCelular;
        if (novaSenha) usuarios[index].password = novaSenha;
        localStorage.setItem('users', JSON.stringify(usuarios));
      }

      mensagem.textContent = "✅ Informações salvas com sucesso!";
      mensagem.style.color = "green";

      // Limpa campos de senha
      document.getElementById('senhaAtual').value = "";
      document.getElementById('novaSenha').value = "";
      document.getElementById('confirmarSenha').value = "";

    } catch (error) {
      mensagem.textContent = `❌ ${error.message}`;
      mensagem.style.color = "red";
    }
  });

  // Botão logout: limpa usuário logado e redireciona
  document.getElementById('logout').addEventListener('click', () => {
    localStorage.removeItem('usuarioLogado');
    window.location.href = "../pages/login.html";
  });

  // Botão excluir conta
  document.getElementById('excluirConta').addEventListener('click', async () => {
    if (!confirm("Tem certeza que deseja excluir sua conta?")) return;

    try {
      const response = await fetch(`/api/usuario/${usuarioLogado._id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erro ao excluir conta no servidor');
      }

      // Atualiza o localStorage após exclusão
      const novosUsuarios = usuarios.filter(u => u._id !== usuarioLogado._id);
      localStorage.setItem('users', JSON.stringify(novosUsuarios));
      localStorage.removeItem('usuarioLogado');

      window.location.href = "../pages/login.html";
    } catch (error) {
      mensagem.textContent = `❌ ${error.message}`;
      mensagem.style.color = "red";
    }
  });
});
