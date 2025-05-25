// models/HistoricoSaude.js
const mongoose = require('mongoose');

const historicoSaudeSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tipoSanguineo: String,
  doencas: String,
  alergias: String,
  medicamentos: String,
  arquivos: [{
    nome: String,
    tipo: String,
    dados: Buffer
  }]
});

module.exports = mongoose.model('HistoricoSaude', historicoSaudeSchema);
