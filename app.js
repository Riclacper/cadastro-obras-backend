require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Rotas
const obraRoutes = require('./routes/obraRoutes');
const fiscalizacaoRoutes = require('./routes/fiscalizacaoRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Aceita imagens base64 grandes
app.use(express.urlencoded({ extended: true }));

// Conexão MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Conectado ao MongoDB'))
.catch((err) => console.error('Erro ao conectar ao MongoDB:', err));

// Rotas
app.use('/obras', obraRoutes);
app.use('/fiscalizacoes', fiscalizacaoRoutes);

// Rota raiz
app.get('/', (req, res) => {
  res.send('API do Sistema de Cadastro de Obras em execução 🚧');
});

// Tratamento de erro genérico
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo deu errado!' });
});

// Inicialização do servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend rodando em http://localhost:${PORT}`);
});
