const express = require('express');
const router = express.Router();
const controller = require('../controllers/fiscalizacaoController');
const auth = require('../middleware/auth');

router.post('/', auth.requireRole('admin', 'fiscal'), controller.criarFiscalizacao);
router.get('/', controller.listarFiscalizacoes);
router.get('/:id', controller.buscarFiscalizacao);
router.put('/:id', auth.requireRole('admin', 'fiscal'), controller.atualizarFiscalizacao);
router.delete('/:id', auth.requireRole('admin'), controller.deletarFiscalizacao);

module.exports = router;
