const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const UserGame = require('../models/UserGame');

// Todas as rotas aqui são protegidas
router.use(authMiddleware);

// ==========================================
// 1. CREATE (Criar) - Adicionar um jogo VIMDO DA BUSCA RAWG
// Rota: POST /api/games
// ==========================================
router.post('/', async (req, res) => {
  // Agora esperamos receber os dados que vieram da busca, mais o status inicial
  // Note que 'platforms' (plural) é como vem da nossa rota de busca
  const { rawgId, gameTitle, platforms, backgroundImage, status } = req.body;

  // Validação básica dos dados obrigatórios que vêm da busca
  if (!rawgId || !gameTitle || !platforms) {
    return res.status(400).json({ msg: 'Dados do jogo da RAWG incompletos.' });
  }

  try {
    // 1. Verifica se o usuário já tem esse jogo na lista
    // Procura um jogo que tenha O MESMO user ID E O MESMO rawgId
    let existingGame = await UserGame.findOne({ user: req.user.id, rawgId });

    if (existingGame) {
      return res.status(400).json({ msg: 'Este jogo já está na sua lista.' });
    }

    // 2. Se não existe, cria o novo objeto
    const newGame = new UserGame({
      user: req.user.id,
      rawgId,
      gameTitle,
      platform: platforms, // Mapeando 'platforms' da busca para 'platform' do modelo
      backgroundImage,
      status: status || 'Backlog', // Se o frontend não mandar status, usa Backlog
      rating: null // Começa sem nota
    });

    // 3. Salva no banco
    const game = await newGame.save();
    res.status(201).json(game);

  } catch (err) {
    console.error(err.message);
    // Verifica erro de duplicidade (caso o índice falhe)
    if (err.code === 11000) {
       return res.status(400).json({ msg: 'Este jogo já está na sua lista.' });
    }
    res.status(500).send('Erro no Servidor ao tentar salvar o jogo');
  }
});

// @rota    GET api/games
// @desc    READ: Listar todos os jogos do usuário logado
router.get('/', async (req, res) => {
  try {
    // Busca jogos onde o campo 'user' é igual ao ID do usuário logado
    const games = await UserGame.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(games);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no Servidor');
  }
});

// @rota    PUT api/games/:id
// @desc    UPDATE: Atualizar um jogo (ex: mudar status ou nota)
router.put('/:id', async (req, res) => {
  const { gameTitle, platform, status, rating } = req.body;
  // Constroi objeto com campos a serem atualizados
  const gameFields = {};
  if (gameTitle) gameFields.gameTitle = gameTitle;
  if (platform) gameFields.platform = platform;
  if (status) gameFields.status = status;
  if (rating) gameFields.rating = rating;

  try {
    let game = await UserGame.findById(req.params.id);

    if (!game) return res.status(404).json({ msg: 'Jogo não encontrado' });

    // Verifica se o jogo pertence ao usuário logado
    if (game.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Não autorizado' });
    }

    game = await UserGame.findByIdAndUpdate(
      req.params.id,
      { $set: gameFields },
      { new: true } // Retorna o objeto atualizado
    );
    res.json(game);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no Servidor');
  }
});

// @rota    DELETE api/games/:id
// @desc    DELETE: Remover um jogo da lista
router.delete('/:id', async (req, res) => {
  try {
    let game = await UserGame.findById(req.params.id);

    if (!game) return res.status(404).json({ msg: 'Jogo não encontrado' });

    // Verifica se o jogo pertence ao usuário logado
    if (game.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Não autorizado' });
    }

    await UserGame.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Jogo removido' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no Servidor');
  }
});

module.exports = router;