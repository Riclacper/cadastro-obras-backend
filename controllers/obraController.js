const Obra = require('../models/Obra');
const Fiscalizacao = require('../models/Fiscalizacao');
const { enviarEmail } = require('../services/emailService');
const { gerarRelatorio } = require('../services/reportService');

function formatarData(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value || '');
  const iso = date.toISOString().slice(0, 10);
  const [year, month, day] = iso.split('-');
  return `${day}/${month}/${year}`;
}

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
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: 'Informe um e-mail válido.' });
    }
    const obra = await Obra.findById(req.params.id);
    const fiscalizacoes = await Fiscalizacao.find({ obra: req.params.id });

    if (!obra) return res.status(404).json({ error: "Obra não encontrada" });

    // Personalize o corpo do e-mail conforme necessidade
    const relatorio = await gerarRelatorio(obra, fiscalizacoes);
    await enviarEmail(email, `Relatório da obra: ${obra.nome}`, relatorio.html, [
      { content: relatorio.pdfBase64, filename: `relatorio-${obra._id}.pdf` }
    ]);

    res.json({ message: 'Relatório enviado por e-mail com sucesso.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
