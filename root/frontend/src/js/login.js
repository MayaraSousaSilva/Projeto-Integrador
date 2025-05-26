document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    // FAZENDO A REQUISIÇÃO PARA O BACKEND
    const response = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      // O backend retorna o objeto 'user' no sucesso
      localStorage.setItem('usuarioLogado', JSON.stringify(data.user));

      // Redireciona para a página inicial
      window.location.href = 'home.html';
    } else {
      // O backend retorna um 'message' em caso de erro
      alert(data.message);
    }
  } catch (error) {
    console.error('Erro na requisição de login:', error);
    alert('Erro ao tentar fazer login. Verifique sua conexão ou tente novamente mais tarde.');
  }
});