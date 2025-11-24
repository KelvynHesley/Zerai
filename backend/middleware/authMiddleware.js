const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {

  const authHeader = req.header('Authorization');

  if (!authHeader) {
    // Se não tem token, retorna erro 401 (Não autorizado) e barra a entrada
    return res.status(401).json({ msg: 'Acesso negado. Token não fornecido.' });
  }


  try {
    // Divide a string no espaço e pega a segunda parte (índice 1)
    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ msg: 'Formato de token inválido. Use: Bearer <token>' });
    }


    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded.user;

    // O comando 'next()' é crucial: ele diz ao Express para passar para a próxima etapa.
    next();

  } catch (err) {
    // Se o token estiver expirado, adulterado ou inválido, cai aqui.
    console.error('Erro na validação do token:', err.message);
    res.status(401).json({ msg: 'Token inválido.' });
  }
};