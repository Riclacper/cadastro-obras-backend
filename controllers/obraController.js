const Obra = require('../models/Obra');
const Fiscalizacao = require('../models/Fiscalizacao');
const { enviarEmail } = require('../services/emailService');

// Criar nova obra
exports.criarObra = async (req, res) => {
  try {
    const obra = await Obra.create(req.body);
    res.status(201).json(obra);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Listar todas as obras
exports.listarObras = async (req, res) => {
  try {
    const obras = await Obra.find();
    res.json(obras);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Buscar obra por ID
exports.buscarObra = async (req, res) => {
  try {
    const obra = await Obra.findById(req.params.id);
    if (!obra) return res.status(404).json({ error: "Obra não encontrada" });
    res.json(obra);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Atualizar obra
exports.atualizarObra = async (req, res) => {
  try {
    const obra = await Obra.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!obra) return res.status(404).json({ error: "Obra não encontrada" });
    res.json(obra);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Deletar obra
exports.deletarObra = async (req, res) => {
  try {
    const obra = await Obra.findByIdAndDelete(req.params.id);
    if (!obra) return res.status(404).json({ error: "Obra não encontrada" });
    // Também pode deletar fiscalizações associadas, se desejar
    await Fiscalizacao.deleteMany({ obra: req.params.id });
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Listar fiscalizações de uma obra
exports.listarFiscalizacoesPorObra = async (req, res) => {
  try {
    const fiscalizacoes = await Fiscalizacao.find({ obra: req.params.id });
    res.json(fiscalizacoes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Enviar detalhes da obra por e-mail
exports.enviarDetalhesPorEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const obra = await Obra.findById(req.params.id);
    const fiscalizacoes = await Fiscalizacao.find({ obra: req.params.id });

    if (!obra) return res.status(404).json({ error: "Obra não encontrada" });

    // Personalize o corpo do e-mail conforme necessidade
    await enviarEmail(email, 'Detalhes da Obra', `
      <h2>${obra.nome}</h2>
      <p><b>Responsável:</b> ${obra.responsavel}</p>
      <p><b>Data Início:</b> ${obra.dataInicio}</p>
      <p><b>Data Fim:</b> ${obra.dataFim}</p>
      <p><b>Descrição:</b> ${obra.descricao}</p>
      <hr/>
      <b>Fiscalizações:</b>
      <ul>
        ${fiscalizacoes.map(f => `<li>${f.data} - ${f.status} - ${f.observacoes}</li>`).join('')}
      </ul>
    `);

    res.json({ message: 'E-mail enviado com sucesso (simulado).' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
