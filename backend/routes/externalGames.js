const express = require('express');
const router = express.Router();
const axios = require('axios');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// @rota    GET api/search/:query
// @desc    Buscar jogos na API externa (RAWG)
router.get('/:query', async (req, res) => {
  try {
    const { query } = req.params; // Pega o termo pesquisado da URL
    const apiKey = process.env.RAWG_API_KEY;

    // 1. Faz a requisição para a RAWG API
    // search_precise=true ajuda a trazer resultados mais exatos
    // page_size=20 limita a 20 resultados para não sobrecarregar
    const response = await axios.get(
      `https://api.rawg.io/api/games?key=${apiKey}&search=${query}&search_precise=true&page_size=20`
    );

    // 2. Filtragem de Dados (Data Shaping)
    // A RAWG retorna muita coisa. Vamos pegar só o que o app precisa.
    const formattedGames = response.data.results.map((game) => ({
      rawgId: game.id, // O ID original da RAWG (importante para o futuro)
      gameTitle: game.name,
      backgroundImage: game.background_image, // URL da imagem de capa
      // As plataformas vêm em um array complexo, vamos simplificar:
      platforms: game.platforms
        ? game.platforms.map((p) => p.platform.name).join(', ') // Ex: "PC, PlayStation 5"
        : 'Plataforma desconhecida',
      releaseDate: game.released ? game.released.substring(0, 4) : 'N/A' // Pega só o ano
    }));

    // 3. Retorna os dados limpos para o frontend
    res.json(formattedGames);

  } catch (err) {
    console.error('Erro na API RAWG:', err.message);
    // Se der erro na RAWG, avisamos o frontend, mas não derrubamos nosso servidor
    res.status(500).json({ msg: 'Erro ao comunicar com o serviço de jogos externo' });
  }
});

module.exports = router;