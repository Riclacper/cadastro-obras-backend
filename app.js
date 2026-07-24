require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Rotas
const obraRoutes = require('./routes/obraRoutes');
const fiscalizacaoRoutes = require('./routes/fiscalizacaoRoutes');
const authRoutes = require('./routes/authRoutes');
const authMiddleware = require('./middleware/auth');

const app = express();

// Middlewares
const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim()) : '*';
app.use(cors({ origin: allowedOrigins }));
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
app.use('/fiscalizacoes', authMiddleware, fiscalizacaoRoutes);
app.use('/obras', authMiddleware, obraRoutes);
app.use('/auth', authRoutes);

// Rota raiz
app.get('/', (req, res) => {
  res.send('API do Sistema de Cadastro de Obras em execução 🚧');
});

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'cadastro-obras-backend' }));

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
