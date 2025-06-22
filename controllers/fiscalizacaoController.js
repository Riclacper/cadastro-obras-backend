const Fiscalizacao = require('../models/Fiscalizacao');

// Criar fiscalização
exports.criarFiscalizacao = async (req, res) => {
  try {
    const fiscalizacao = await Fiscalizacao.create(req.body);
    res.status(201).json(fiscalizacao);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Listar todas fiscalizações
exports.listarFiscalizacoes = async (req, res) => {
  try {
    const fiscalizacoes = await Fiscalizacao.find().populate('obra');
    res.json(fiscalizacoes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Buscar fiscalização por ID
exports.buscarFiscalizacao = async (req, res) => {
  try {
    const fiscalizacao = await Fiscalizacao.findById(req.params.id).populate('obra');
    if (!fiscalizacao) return res.status(404).json({ error: "Fiscalização não encontrada" });
    res.json(fiscalizacao);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Atualizar fiscalização
exports.atualizarFiscalizacao = async (req, res) => {
  try {
    const fiscalizacao = await Fiscalizacao.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!fiscalizacao) return res.status(404).json({ error: "Fiscalização não encontrada" });
    res.json(fiscalizacao);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Deletar fiscalização
exports.deletarFiscalizacao = async (req, res) => {
  try {
    const fiscalizacao = await Fiscalizacao.findByIdAndDelete(req.params.id);
    if (!fiscalizacao) return res.status(404).json({ error: "Fiscalização não encontrada" });
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
