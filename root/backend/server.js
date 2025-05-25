const express = require('express');
const multer = require('multer');

const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const Notificacao = require('./models/Notificacao');
const HistoricoSaude = require('./models/HistoricoSaude');


require('dotenv').config();

// Model de usuário
const User = require('./models/User');

const app = express();
const port = process.env.PORT || 3000;

// Conexão com MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Conectado ao MongoDB'))
.catch((err) => console.error('❌ Erro ao conectar ao MongoDB:', err));

// Middlewares
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, '../frontend')));

// Rotas de páginas
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

app.get('/cadastro', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/pages/cadastro.html'));
});

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

    const novoUsuario = new User({ nome, email, celular, password});
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

    if (user.password !== password) {
      return res.status(401).json({ message: 'Senha incorreta.' });
    }

    res.status(200).json({ message: 'Login realizado com sucesso!', user });
  } catch (error) {
    console.error('❌ Erro no login:', error.message);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
});

// Rota para salvar uma notificação e enviar e-mail
app.post('/api/notificacoes', async (req, res) => {
  try {
    const { data, tipo, descricao, horario, emailUsuario } = req.body;

    const usuario = await User.findOne({ email: emailUsuario });
    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    const novaNotificacao = new Notificacao({
      data,
      tipo,
      descricao,
      horario,
      usuario: usuario._id
    });

    await novaNotificacao.save();

    console.log(`📧 E-mail enviado para ${emailUsuario} sobre ${tipo}`);

    res.status(201).json({ message: 'Notificação salva e e-mail enviado com sucesso!' });
  } catch (error) {
    console.error('Erro ao salvar notificação:', error);
    res.status(500).json({ message: 'Erro ao salvar notificação.' });
  }
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post('/api/historico', upload.array('arquivos'), async (req, res) => {
  try {
    const { tipoSanguineo, doencas, alergias, medicamentos, emailUsuario } = req.body;
    const usuario = await User.findOne({ email: emailUsuario });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    const arquivos = req.files.map(file => ({
      nome: file.originalname,
      tipo: file.mimetype,
      dados: file.buffer
    }));

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
  } catch (err) {
    console.error('Erro ao salvar histórico:', err);
    res.status(500).json({ message: 'Erro ao salvar histórico.' });
  }
});

// Buscar notificações do usuário
app.get('/api/notificacoes', async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) return res.status(400).json({ message: 'Email é obrigatório.' });

    const usuario = await User.findOne({ email });
    if (!usuario) return res.status(404).json({ message: 'Usuário não encontrado.' });

    const notificacoes = await Notificacao.find({ usuario: usuario._id }).sort({ data: -1 });
    res.json(notificacoes);
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    res.status(500).json({ message: 'Erro interno ao buscar notificações.' });
  }
});

// Buscar histórico de saúde do usuário
app.get('/api/historico', async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) return res.status(400).json({ message: 'Email é obrigatório.' });

    const usuario = await User.findOne({ email });
    if (!usuario) return res.status(404).json({ message: 'Usuário não encontrado.' });

    const historico = await HistoricoSaude.findOne({ usuario: usuario._id });
    res.json(historico);
  } catch (error) {
    console.error('Erro ao buscar histórico de saúde:', error);
    res.status(500).json({ message: 'Erro interno ao buscar histórico de saúde.' });
  }
});

// Excluir notificação pelo id
app.delete('/api/notificacoes/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await Notificacao.findByIdAndDelete(id);
    res.json({ message: 'Notificação excluída com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir notificação:', error);
    res.status(500).json({ message: 'Erro ao excluir notificação.' });
  }
});

// Excluir histórico de saúde pelo id
app.delete('/api/historico/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await HistoricoSaude.findByIdAndDelete(id);
    res.json({ message: 'Histórico de saúde excluído com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir histórico:', error);
    res.status(500).json({ message: 'Erro ao excluir histórico de saúde.' });
  }
});

app.put('/api/usuario/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const usuarioAtualizado = await User.findByIdAndUpdate(id, updates, { new: true });
    if (!usuarioAtualizado) return res.status(404).json({ message: 'Usuário não encontrado.' });

    res.json({ message: 'Usuário atualizado com sucesso.', usuario: usuarioAtualizado });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ message: 'Erro interno ao atualizar usuário.' });
  }
});

app.delete('/api/usuario/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const usuarioDeletado = await User.findByIdAndDelete(id);
    if (!usuarioDeletado) return res.status(404).json({ message: 'Usuário não encontrado.' });

    res.json({ message: 'Usuário deletado com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({ message: 'Erro interno ao deletar usuário.' });
  }
});


// Inicia o servidor
app.listen(port, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${port}`);
});
