const mongoose = require('mongoose');

const UserGameSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // --- NOVOS CAMPOS ---
  rawgId: {
    type: Number, // O ID original lá na base da RAWG
    required: true
  },
  backgroundImage: {
    type: String, // A URL da imagem da capa
    default: ''
  },
  // --------------------
  gameTitle: {
    type: String,
    required: [true, 'O título do jogo é obrigatório'],
    trim: true
  },
  platform: {
    type: String,
    // Como a RAWG retorna uma string com várias plataformas (ex: "PC, Xbox"),
    // vamos apenas salvar essa string.
    required: [true, 'A plataforma é obrigatória'],
    trim: true
  },
  status: {
    type: String,
    enum: ['Backlog', 'Jogando', 'Zerado', 'Abandonado'],
    default: 'Backlog'
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  }
}, {
  timestamps: true
});

// --- REGRA DE UNICIDADE COMPOSTA ---
// Isto garante que a combinação de 'user' + 'rawgId' seja única.
// Ou seja, o usuário X não pode ter dois jogos com o mesmo RAWG ID na sua lista.
UserGameSchema.index({ user: 1, rawgId: 1 }, { unique: true });

module.exports = mongoose.model('UserGame', UserGameSchema);