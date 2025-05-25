document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      // Salva o usuário logado (opcional)
      localStorage.setItem('usuarioLogado', JSON.stringify(data.user));

      // Redireciona para a página inicial
      window.location.href = 'home.html';
    } else {
      // Exibe erro do servidor (mensagem vinda da API)
      alert(data.message);
    }
  } catch (error) {
    console.error('Erro na requisição de login:', error);
    alert('Erro ao tentar fazer login. Tente novamente.');
  }
});
