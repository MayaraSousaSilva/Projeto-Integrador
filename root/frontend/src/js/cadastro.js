document.getElementById('cadastroForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const nome = document.getElementById('nome').value;
  const email = document.getElementById('email').value;
  const celular = document.getElementById('celular').value.replace(/\D/g, '');
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (password !== confirmPassword) {
    alert('As senhas não coincidem.');
    return;
  }

  if (celular.length < 10 || celular.length > 11) {
    alert('Por favor, digite um número de celular válido (10 ou 11 dígitos, incluindo o DDD).');
    return;
  }

  try {
    const resposta = await fetch('/api/cadastro', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nome, email, celular, password }),
    });

    const dados = await resposta.json();

    if (resposta.status === 201) {
      alert('Cadastro realizado com sucesso!');
      window.location.href = 'login.html';
    } else {
      alert(dados.message || 'Erro no cadastro');
    }
  } catch (error) {
    console.error('Erro na requisição:', error);
    alert('Erro ao cadastrar. Tente novamente mais tarde.');
  }
});
