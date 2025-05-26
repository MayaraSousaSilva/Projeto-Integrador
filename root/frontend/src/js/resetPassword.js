// frontend/js/reset-password.js

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('resetPasswordForm');
    const mensagem = document.getElementById('mensagem');

    // Pega o token da URL (ex: ?token=abcdef123)
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
        mensagem.textContent = '❌ Token de redefinição de senha inválido ou ausente.';
        mensagem.style.color = 'red';
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const newPassword = document.getElementById('newPassword').value;
        const confirmNewPassword = document.getElementById('confirmNewPassword').value;

        if (newPassword !== confirmNewPassword) {
            mensagem.textContent = '❌ As senhas não coincidem.';
            mensagem.style.color = 'red';
            return;
        }

        if (newPassword.length < 6) { // Exemplo de validação de senha
            mensagem.textContent = '❌ A nova senha deve ter pelo menos 6 caracteres.';
            mensagem.style.color = 'red';
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/api/reset-password/${token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newPassword }),
            });

            const result = await response.json();

            if (response.ok) {
                mensagem.textContent = result.message || '✅ Senha redefinida com sucesso! Redirecionando...';
                mensagem.style.color = 'green';
                setTimeout(() => {
                    window.location.href = 'login.html'; // Redireciona para o login
                }, 2000);
            } else {
                mensagem.textContent = `❌ Erro: ${result.message || 'Não foi possível redefinir a senha.'}`;
                mensagem.style.color = 'red';
            }
        } catch (error) {
            console.error('Erro na requisição de redefinição de senha:', error);
            mensagem.textContent = '❌ Erro de conexão. Tente novamente mais tarde.';
            mensagem.style.color = 'red';
        }
    });
});