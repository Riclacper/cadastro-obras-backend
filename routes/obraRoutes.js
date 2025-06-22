const express = require('express');
const router = express.Router();
const controller = require('../controllers/obraController');

router.post('/', controller.criarObra);
router.get('/', controller.listarObras);
router.get('/:id', controller.buscarObra);
router.put('/:id', controller.atualizarObra);
router.delete('/:id', controller.deletarObra);

router.get('/:id/fiscalizacoes', controller.listarFiscalizacoesPorObra);
router.post('/:id/email', controller.enviarDetalhesPorEmail);

module.exports = router;
