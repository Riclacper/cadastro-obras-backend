const express = require('express');
const router = express.Router();
const controller = require('../controllers/obraController');
const auth = require('../middleware/auth');

router.post('/', auth.requireRole('admin'), controller.criarObra);
router.get('/', controller.listarObras);
router.get('/:id', controller.buscarObra);
router.put('/:id', auth.requireRole('admin'), controller.atualizarObra);
router.delete('/:id', auth.requireRole('admin'), controller.deletarObra);

router.get('/:id/fiscalizacoes', controller.listarFiscalizacoesPorObra);
router.post('/:id/email', controller.enviarDetalhesPorEmail);

module.exports = router;
