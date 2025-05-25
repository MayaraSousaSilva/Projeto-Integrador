// backend/models/User.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nome: String,
  email: { type: String, unique: true },
  celular: String,
  password: String
});

module.exports = mongoose.model('User', userSchema);
