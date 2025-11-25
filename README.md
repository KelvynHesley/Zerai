# 🎮 Zerai - Gerenciador de Backlog de Jogos

**Zerai** é uma aplicação full-stack para gerenciamento de backlog de jogos, permitindo que jogadores organizem sua biblioteca pessoal, acompanhem o progresso e descubram novos títulos através da integração com a API RAWG.

## 📋 Sobre o Projeto

O Zerai ajuda gamers a:
- Organizar seus jogos em diferentes status (Backlog, Jogando, Zerado, Abandonado)
- Buscar informações detalhadas sobre jogos através da API RAWG
- Avaliar jogos com sistema de rating (1-5 estrelas) (Ainda não Disponível)
- Manter um histórico personalizado de sua jornada gaming
- Acessar sua biblioteca de qualquer dispositivo

## 🚀 Tecnologias

### Backend
- **Node.js** - Ambiente de execução JavaScript
- **Express** - Framework web minimalista e flexível
- **MongoDB** - Banco de dados NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticação via tokens
- **bcryptjs** - Hash de senhas
- **CORS** - Habilitação de requisições cross-origin
- **Axios** - Cliente HTTP para integração com APIs externas

### Frontend
- **React Native** - Framework para desenvolvimento mobile
- **Expo** - Plataforma para desenvolvimento React Native
- **React Navigation** - Navegação entre telas
- **Axios** - Requisições HTTP
- **AsyncStorage** - Armazenamento local
- **Expo SecureStore** - Armazenamento seguro de credenciais

## 📦 Instalação

### Pré-requisitos
- Node.js (v14 ou superior)
- MongoDB instalado e rodando
- Expo CLI instalado globalmente: `npm install -g expo-cli`
- Chave de API da RAWG ([obter aqui](https://rawg.io/apidocs))

### Backend

1. Clone o repositório:
git clone https://github.com/KelvynHesley/Zerai.git
cd Zerai/backend


2. Instale as dependências:
npm install


3. Configure as variáveis de ambiente:
Crie um arquivo `.env` na pasta `backend/` com:
MONGO_URI=sua_conexao_mongodb
JWT_SECRET=seu_secret_jwt
RAWG_API_KEY=sua_chave_rawg
PORT=5000

4. Inicie o servidor:
node server.js
O servidor estará rodando em `http://localhost:5000`

### Frontend

1. Navegue até a pasta do frontend:
cd ../frontend

2. Instale as dependências:
npm install

3. Configure a URL da API:
Ajuste a URL base da API no arquivo de configuração do frontend para apontar para seu backend.

4. Inicie o Expo:
npx expo start


5. Escolha a plataforma:
- **Android**: Pressione `a` ou escaneie o QR Code com o Expo Go
- **iOS**: Pressione `i` (apenas em macOS)
- **Web**: Pressione `w`

## 🔌 API Endpoints

### Autenticação
- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Login de usuário
- `GET /api/auth/me` - Obter usuário autenticado

### Jogos do Usuário
- `GET /api/games` - Listar todos os jogos do usuário
- `POST /api/games` - Adicionar jogo ao backlog
- `PUT /api/games/:id` - Atualizar status/rating de um jogo
- `DELETE /api/games/:id` - Remover jogo do backlog

### Busca Externa (RAWG)
- `GET /api/search?query=nome_do_jogo` - Buscar jogos na API RAWG

## 📊 Schema do Banco de Dados

### UserGame

{
user: ObjectId, // Referência ao usuário
rawgId: Number, // ID do jogo na base RAWG
backgroundImage: String, // URL da imagem de capa
gameTitle: String, // Título do jogo
platform: String, // Plataformas (PC, Xbox, etc)
status: String, // Backlog | Jogando | Zerado | Abandonado
rating: Number, // Avaliação de 1 a 5
timestamps: true // createdAt e updatedAt
}


**Índice Único**: A combinação `user` + `rawgId` garante que um usuário não possa adicionar o mesmo jogo duas vezes.

## 🎯 Funcionalidades

- ✅ Autenticação segura com JWT
- ✅ Cadastro e login de usuários
- ✅ Busca de jogos integrada com RAWG API
- ✅ Adição de jogos ao backlog pessoal
- ✅ Atualização de status do jogo
- ✅ Sistema de avaliação com rating
- ✅ Proteção contra jogos duplicados
- ✅ Interface mobile responsiva
- ✅ Armazenamento seguro de credenciais

## 🛠️ Desenvolvimento

### Scripts Disponíveis

**Backend:**
npm start # Iniciar servidor
npm test # Executar testes

**Frontend:**

npm start # Iniciar Expo
npx expo start --android # Abrir no Android
npx expo start --web # Abrir no navegador


## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença ISC.

## 👤 Autor

**Kelvyn Hesley Lima de Queiroz**

- GitHub: [@KelvynHesley](https://github.com/KelvynHesley)
- Repositório: [Zerai](https://github.com/KelvynHesley/Zerai)

## 🙏 Agradecimentos

- [RAWG API](https://rawg.io/) - Pelos dados abrangentes de jogos
- [Expo](https://expo.dev/) - Pela excelente plataforma de desenvolvimento
- Comunidade React Native e Node.js

---

⭐ Se este projeto foi útil para você, considere dar uma estrela!

