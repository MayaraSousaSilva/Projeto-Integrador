document.addEventListener('DOMContentLoaded', () => { // Certifica que o DOM está carregado
    const celularInput = document.getElementById('celular'); // Pega a referência do input de celular

    // Adiciona o event listener para formatar o celular ENQUANTO o usuário digita
    celularInput.addEventListener('input', function (e) {
        let value = e.target.value.replace(/\D/g, ''); // Remove TUDO que não é dígito imediatamente

        // Limita o número de dígitos para no máximo 11 (para DDD + 9 dígitos)
        if (value.length > 11) {
            value = value.substring(0, 11);
        }

        let formattedValue = '';
        if (value.length > 0) {
            formattedValue += '(' + value.substring(0, 2);
        }
        if (value.length >= 3) { // Se já digitou 3 dígitos (DDD completo)
            formattedValue += ') ' + value.substring(2, 7); // Primeiros 5 dígitos do número
        }
        if (value.length >= 8) { // Se já digitou 8 dígitos (DDD + 5 primeiros + 3 do final)
            formattedValue += '-' + value.substring(7, 11); // Últimos 4 dígitos do número
        }
        e.target.value = formattedValue;
    });

    // Código existente do formulário de cadastro
    document.getElementById('cadastroForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const nome = document.getElementById('nome').value;
        const email = document.getElementById('email').value;
        // Pega o valor do celular e REMOVE QUALQUER MÁSCARA antes de enviar para o backend
        const celular = celularInput.value.replace(/\D/g, '');
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            alert('As senhas não coincidem.');
            return;
        }

        // Validação mais robusta do celular (número de dígitos sem máscara)
        if (celular.length < 10 || celular.length > 11) {
            alert('Por favor, digite um número de celular válido (10 ou 11 dígitos, incluindo o DDD).');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/cadastro', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nome, email, celular, password })
            });

            const result = await response.json();

            if (response.ok) {
                alert(result.message);
                window.location.href = 'login.html';
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('Erro na requisição de cadastro:', error);
            alert('Erro ao cadastrar. Verifique sua conexão ou tente novamente mais tarde.');
        }
    });
});