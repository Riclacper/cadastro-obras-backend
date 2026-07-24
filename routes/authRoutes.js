const express = require('express');
const controller = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();
router.post('/register', controller.register);
router.post('/login', controller.login);
router.get('/users', auth, auth.requireRole('admin'), controller.listarUsuarios);
router.post('/users', auth, auth.requireRole('admin'), controller.criarUsuario);
router.patch('/users/:id/role', auth, auth.requireRole('admin'), controller.atualizarPapel);

module.exports = router;
