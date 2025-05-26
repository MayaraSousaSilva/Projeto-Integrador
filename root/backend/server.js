const express = require('express');
const multer = require('multer'); // Para lidar com upload de arquivos (histórico)
const nodemailer = require('nodemailer'); // Para envio de e-mails
const bcrypt = require('bcryptjs'); // Para criptografia de senhas
const crypto = require('crypto'); // Para gerar tokens de recuperação de senha (nativo do Node.js)

const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors'); // Para permitir requisições de origens diferentes

// Importa os modelos do MongoDB
const Notificacao = require('./models/Notificacao');
const HistoricoSaude = require('./models/HistoricoSaude');
const User = require('./models/User'); // Model de usuário

require('dotenv').config(); // Carrega as variáveis de ambiente do arquivo .env

const app = express();
const port = process.env.PORT || 3000; // Porta do servidor, padrão 3000

// Configuração do transportador de e-mail (usando Gmail como exemplo)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Seu e-mail Gmail (do .env)
        pass: process.env.EMAIL_PASS, // Sua SENHA DE APLICATIVO DO GMAIL (do .env)
    },
});

// Conexão com MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    // useNewUrlParser: true,  // Removidas: opções depreciadas para versões recentes do driver
    // useUnifiedTopology: true, // Removidas: opções depreciadas para versões recentes do driver
})
.then(() => console.log('✅ Conectado ao MongoDB'))
.catch((err) => console.error('❌ Erro ao conectar ao MongoDB:', err));

// Middlewares
app.use(cors()); // Permite requisições de diferentes origens (frontend)
app.use(express.json()); // Habilita o Express a lidar com JSON no corpo das requisições

// =========================================================
// SERVIR ARQUIVOS ESTÁTICOS E ROTAS DE PÁGINAS DO FRONTEND
// (AJUSTADO PARA A ESTRUTURA: root/frontend/public E root/frontend/src)
// =========================================================

// Caminho para a pasta 'src' do frontend (contém pages, js, css)
const frontendSrcPath = path.resolve(__dirname, '..', '..', 'root', 'frontend', 'src');
app.use(express.static(frontendSrcPath)); // Serve todos os arquivos de 'src'

// Caminho para a pasta 'public' do frontend (contém index.html)
const frontendPublicPath = path.resolve(__dirname, '..', '..', 'root', 'frontend', 'public');
app.use(express.static(frontendPublicPath)); // Serve todos os arquivos de 'public'


// Rotas para as páginas HTML (agora apontando para os caminhos corretos)
// A rota raiz '/' servirá o index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPublicPath, 'index.html'));
});

// Outras rotas GET para páginas (HTMLs dentro de src/pages)
app.get('/cadastro', (req, res) => {
    res.sendFile(path.join(frontendSrcPath, 'pages', 'cadastro.html'));
});

app.get('/login', (req, res) => { // Rota /login para ser acessada diretamente
    res.sendFile(path.join(frontendSrcPath, 'pages', 'login.html'));
});

app.get('/home', (req, res) => {
    res.sendFile(path.join(frontendSrcPath, 'pages', 'home.html'));
});
app.get('/notificacoes', (req, res) => {
    res.sendFile(path.join(frontendSrcPath, 'pages', 'notificacoes.html'));
});
app.get('/historico', (req, res) => {
    res.sendFile(path.join(frontendSrcPath, 'pages', 'historico.html'));
});
app.get('/configuracoes', (req, res) => {
    res.sendFile(path.join(frontendSrcPath, 'pages', 'configuracoes.html'));
});
app.get('/reset-password', (req, res) => {
    res.sendFile(path.join(frontendSrcPath, 'pages', 'reset-password.html'));
});
app.get('/politica-privacidade', (req, res) => {
    res.sendFile(path.join(frontendSrcPath, 'pages', 'politica-privacidade.html'));
});
app.get('/sobre', (req, res) => {
    res.sendFile(path.join(frontendSrcPath, 'pages', 'sobre.html'));
});

// ===========================================
// FIM DAS ROTAS DE SERVIR ARQUIVOS DO FRONTEND
// ===========================================


// ===========================================
// ROTAS DA API (CRUD e Autenticação)
// ===========================================

// Rota de cadastro (POST)
app.post('/api/cadastro', async (req, res) => {
    try {
        const { nome, email, celular, password } = req.body;

        if (!nome || !email || !celular || !password) {
            return res.status(400).json({ message: 'Preencha todos os campos.' });
        }

        const existente = await User.findOne({ email });
        if (existente) {
            return res.status(409).json({ message: 'Email já cadastrado.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const novoUsuario = new User({ nome, email, celular, password: hashedPassword });
        await novoUsuario.save();

        res.status(201).json({ message: 'Cadastro realizado com sucesso!' });
    } catch (error) {
        console.error('❌ Erro no cadastro:', error.message);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

// Rota de login (POST)
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Senha incorreta.' });
        }

        const userSemSenha = {
            _id: user._id,
            nome: user.nome,
            email: user.email,
            celular: user.celular
        };

        res.status(200).json({ message: 'Login realizado com sucesso!', user: userSemSenha });
    } catch (error) {
        console.error('❌ Erro no login:', error.message);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

// Rota para CRIAR uma nova notificação (POST)
app.post('/api/notificacoes', async (req, res) => {
    try {
        const { data, tipo, descricao, horario, usuario, emailUsuario } = req.body;

        if (!usuario) {
            return res.status(400).json({ message: 'ID do usuário é obrigatório para criar notificação.' });
        }

        const novaNotificacao = new Notificacao({
            data,
            tipo,
            descricao,
            horario,
            usuario: usuario
        });

        await novaNotificacao.save();

        if (emailUsuario) {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: emailUsuario,
                subject: `+SAÚDE: Nova Notificação - ${tipo} em ${data}`,
                html: `
                    <p>Olá,</p>
                    <p>Você tem uma nova notificação do +SAÚDE:</p>
                    <ul>
                        <li><strong>Tipo:</strong> ${tipo}</li>
                        <li><strong>Descrição:</strong> ${descricao}</li>
                        <li><strong>Data:</strong> ${data}</li>
                        <li><strong>Horário:</strong> ${horario}</li>
                    </ul>
                    <p>Lembre-se de verificar suas notificações no aplicativo!</p>
                    <p>Atenciosamente,<br>Equipe +SAÚDE</p>
                `,
            };

            try {
                await transporter.sendMail(mailOptions);
                console.log(`📧 E-mail de notificação enviado para: ${emailUsuario}`);
            } catch (emailError) {
                console.error('❌ Erro ao enviar e-mail de notificação:', emailError);
            }
        }

        res.status(201).json({ message: 'Notificação criada com sucesso!' });
    } catch (error) {
        console.error('❌ Erro ao criar notificação:', error);
        res.status(500).json({ message: 'Erro interno ao criar notificação.', error: error.message });
    }
});

// Rota para ATUALIZAR uma notificação existente (PUT)
app.put('/api/notificacoes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data, tipo, descricao, horario, usuario, emailUsuario } = req.body;

        if (!id || !usuario) {
            return res.status(400).json({ message: 'ID da notificação e do usuário são obrigatórios para atualizar.' });
        }

        const notificacaoAtualizada = await Notificacao.findOneAndUpdate(
            { _id: id, usuario: usuario },
            { data, tipo, descricao, horario },
            { new: true }
        );

        if (!notificacaoAtualizada) {
            return res.status(404).json({ message: 'Notificação não encontrada ou não pertence a este usuário.' });
        }

        res.status(200).json({ message: 'Notificação atualizada com sucesso!', notificacao: notificacaoAtualizada });
    } catch (error) {
        console.error('❌ Erro ao atualizar notificação:', error);
        res.status(500).json({ message: 'Erro interno ao atualizar notificação.', error: error.message });
    }
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Rota para salvar histórico de saúde (POST)
app.post('/api/historico', upload.array('arquivos'), async (req, res) => {
    try {
        const { tipoSanguineo, doencas, alergias, medicamentos, emailUsuario, usuarioId } = req.body;

        const usuario = await User.findOne({ email: emailUsuario });

        if (!usuario || String(usuario._id) !== String(usuarioId)) {
            return res.status(404).json({ message: 'Usuário não encontrado ou ID de usuário inválido.' });
        }

        const arquivos = req.files ? req.files.map(file => ({
            nome: file.originalname,
            tipo: file.mimetype,
            dados: file.buffer
        })) : [];

        const historicoExistente = await HistoricoSaude.findOne({ usuario: usuario._id });

        if (historicoExistente) {
            historicoExistente.tipoSanguineo = tipoSanguineo;
            historicoExistente.doencas = doencas;
            historicoExistente.alergias = alergias;
            historicoExistente.medicamentos = medicamentos;
            if (arquivos.length > 0) {
                historicoExistente.arquivos = arquivos;
            }
            await historicoExistente.save();
            res.status(200).json({ message: 'Histórico de saúde atualizado com sucesso!' });
        } else {
            const historico = new HistoricoSaude({
                usuario: usuario._id,
                tipoSanguineo,
                doencas,
                alergias,
                medicamentos,
                arquivos
            });
            await historico.save();
            res.status(201).json({ message: 'Histórico de saúde salvo com sucesso!' });
        }
    } catch (err) {
        console.error('❌ Erro ao salvar histórico:', err);
        res.status(500).json({ message: 'Erro ao salvar histórico.' });
    }
});

app.get('/api/notificacoes', async (req, res) => {
    try {
        const email = req.query.email;
        if (!email) return res.status(400).json({ message: 'Email é obrigatório.' });

        const usuario = await User.findOne({ email });
        if (!usuario) return res.status(404).json({ message: 'Usuário não encontrado.' });

        const notificacoes = await Notificacao.find({ usuario: usuario._id }).sort({ data: -1 });
        res.json(notificacoes);
    } catch (error) {
        console.error('❌ Erro ao buscar notificações:', error);
        res.status(500).json({ message: 'Erro interno ao buscar notificações.' });
    }
});

app.get('/api/historico', async (req, res) => {
    try {
        const email = req.query.email;
        if (!email) return res.status(400).json({ message: 'Email é obrigatório.' });

        const usuario = await User.findOne({ email });
        if (!usuario) return res.status(404).json({ message: 'Usuário não encontrado.' });

        const historico = await HistoricoSaude.findOne({ usuario: usuario._id }).populate('usuario', 'nome email');
        res.json(historico);
    } catch (error) {
        console.error('❌ Erro ao buscar histórico de saúde:', error);
        res.status(500).json({ message: 'Erro interno ao buscar histórico de saúde.' });
    }
});

app.delete('/api/notificacoes/:id', async (req, res) => {
    try {
        const id = req.params.id;
        await Notificacao.findByIdAndDelete(id);
        res.json({ message: 'Notificação excluída com sucesso.' });
    } catch (error) {
        console.error('❌ Erro ao excluir notificação:', error);
        res.status(500).json({ message: 'Erro ao excluir notificação.' });
    }
});

app.delete('/api/historico/:id', async (req, res) => {
    try {
        const id = req.params.id;
        await HistoricoSaude.findByIdAndDelete(id);
        res.json({ message: 'Histórico de saúde excluído com sucesso.' });
    } catch (error) {
        console.error('❌ Erro ao excluir histórico:', error);
        res.status(500).json({ message: 'Erro ao excluir histórico de saúde.' });
    }
});

app.put('/api/usuario/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, email, celular, senhaAtual, password: novaSenha } = req.body;

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        if (senhaAtual) {
            const isMatch = await bcrypt.compare(senhaAtual, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Senha atual incorreta.' });
            }
        } else if (novaSenha) {
            return res.status(400).json({ message: 'Senha atual é obrigatória para alterar a senha.' });
        }

        const updates = {};
        if (nome) updates.nome = nome;
        if (email) updates.email = email;
        if (celular) updates.celular = celular;
        if (novaSenha) {
            updates.password = await bcrypt.hash(novaSenha, 10);
        }

        const usuarioAtualizado = await User.findByIdAndUpdate(id, updates, { new: true });

        const userSemSenha = {
            _id: usuarioAtualizado._id,
            nome: usuarioAtualizado.nome,
            email: usuarioAtualizado.email,
            celular: usuarioAtualizado.celular
        };

        res.json({ message: 'Usuário atualizado com sucesso.', usuario: userSemSenha });
    } catch (error) {
        console.error('❌ Erro ao atualizar usuário:', error);
        res.status(500).json({ message: 'Erro interno ao atualizar usuário.' });
    }
});

app.delete('/api/usuario/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await Notificacao.deleteMany({ usuario: id });
        await HistoricoSaude.deleteMany({ usuario: id });

        const usuarioDeletado = await User.findByIdAndDelete(id);
        if (!usuarioDeletado) return res.status(404).json({ message: 'Usuário não encontrado.' });

        res.json({ message: 'Usuário deletado com sucesso.' });
    } catch (error) {
        console.error('❌ Erro ao deletar usuário:', error);
        res.status(500).json({ message: 'Erro interno ao deletar usuário.' });
    }
});

app.post('/api/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(200).json({ message: 'Se o email estiver cadastrado, um link de recuperação será enviado.' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000;
        await user.save();

        const resetLink = `https://MayaraSousaSilva.github.io/Projeto-Integrador/src/pages/reset-password.html?token=${resetToken}`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: '+SAÚDE: Redefinição de Senha',
            html: `
                <p>Olá,</p>
                <p>Você solicitou a redefinição de senha para sua conta +SAÚDE.</p>
                <p>Por favor, clique no link abaixo para redefinir sua senha:</p>
                <p><a href="${resetLink}">Redefinir Senha</a></p>
                <p>Este link é válido por 1 hora.</p>
                <p>Se você não solicitou isso, por favor, ignore este e-mail.</p>
                <p>Atenciosamente,<br>Equipe +SAÚDE</p>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`📧 E-mail de recuperação enviado para: ${user.email}`);
        res.status(200).json({ message: 'Se o email estiver cadastrado, um link de recuperação será enviado.' });

    } catch (error) {
        console.error('❌ Erro ao solicitar recuperação de senha:', error);
        res.status(500).json({ message: 'Erro interno ao solicitar recuperação de senha.' });
    }
});

app.post('/api/reset-password/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ message: 'A nova senha deve ter pelo menos 6 caracteres e não pode ser vazia.' });
        }

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Token de redefinição de senha inválido ou expirado.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Senha redefinida com sucesso! Você já pode fazer login.' });

    } catch (error) {
        console.error('❌ Erro ao redefinir senha:', error);
        res.status(500).json({ message: 'Erro interno ao redefinir senha.' });
    }
});


app.listen(port, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${port}`);
});