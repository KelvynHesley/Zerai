const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');

const app = express();

// Conectar ao Banco de Dados
connectDB();

// Habilitar CORS para permitir requisições do frontend
app.use(cors());

// Middleware para o Express aceitar JSON no corpo da requisição
app.use(express.json({ extended: false }));

// Rota de teste
app.get('/', (req, res) => res.send('API do Zeraí está rodando!'));

// Definir as rotas da aplicação
app.use('/api/auth', require('./routes/auth'));
// Aqui adicionaremos outras rotas no futuro (ex: /api/games, /api/reviews)

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Servidor iniciado na porta ${PORT}`));