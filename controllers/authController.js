const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

function tokenFor(user) {
  return jwt.sign(
    { sub: user._id.toString(), email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
}

exports.register = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'nome, email e senha são obrigatórios' });
    }
    if (senha.length < 8) {
      return res.status(400).json({ error: 'A senha deve ter pelo menos 8 caracteres' });
    }
    const normalizedEmail = email.trim().toLowerCase();
    const exists = await User.exists({ email: normalizedEmail });
    if (exists) return res.status(409).json({ error: 'E-mail já cadastrado' });

    if (await User.exists({})) {
      return res.status(403).json({ error: 'O cadastro público está desativado. Solicite ao administrador a criação do usuário.' });
    }

    const role = 'admin';
    const user = await User.create({
      nome: nome.trim(),
      email: normalizedEmail,
      senhaHash: await bcrypt.hash(senha, 12),
      role
    });

    res.status(201).json({
      token: tokenFor(user),
      user: { id: user._id, nome: user.nome, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.listarUsuarios = async (req, res) => {
  const users = await User.find({}, { senhaHash: 0 }).sort({ nome: 1 });
  res.json(users);
};

exports.criarUsuario = async (req, res) => {
  try {
    const { nome, email, senha, role = 'fiscal' } = req.body;
    if (!nome || !email || !senha) return res.status(400).json({ error: 'nome, email e senha são obrigatórios' });
    if (!['admin', 'fiscal'].includes(role)) return res.status(400).json({ error: 'Papel de usuário inválido' });
    if (senha.length < 8) return res.status(400).json({ error: 'A senha deve ter pelo menos 8 caracteres' });
    const normalizedEmail = email.trim().toLowerCase();
    if (await User.exists({ email: normalizedEmail })) return res.status(409).json({ error: 'E-mail já cadastrado' });
    const user = await User.create({ nome: nome.trim(), email: normalizedEmail, senhaHash: await bcrypt.hash(senha, 12), role });
    res.status(201).json({ id: user._id, nome: user.nome, email: user.email, role: user.role });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.atualizarPapel = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['admin', 'fiscal'].includes(role)) return res.status(400).json({ error: 'Papel de usuário inválido' });
    if (req.params.id === req.user.sub && role !== 'admin') return res.status(400).json({ error: 'O administrador não pode remover o próprio acesso' });
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true, projection: { senhaHash: 0 } });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json({ error: 'email e senha são obrigatórios' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    const valid = user && await bcrypt.compare(senha, user.senhaHash);
    if (!valid) return res.status(401).json({ error: 'E-mail ou senha inválidos' });

    res.json({
      token: tokenFor(user),
      user: { id: user._id, nome: user.nome, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
