const express = require('express');
const router = express.Router();

const progresoRepository = require('../controller/progreso.controller');

router.post('/progreso/actualizar/:id', progresoRepository.actualizarProgreso);
router.get("/progreso/:id", progresoRepository.obtenerProgresoUsuario);

module.exports = router;