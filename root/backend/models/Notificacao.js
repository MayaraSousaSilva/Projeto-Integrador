const mongoose = require('mongoose');

const notificacaoSchema = new mongoose.Schema({
  data: { type: String, required: true },
  tipo: { type: String, required: true },
  descricao: { type: String, required: true },
  horario: { type: String, required: true },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Notificacao', notificacaoSchema);
