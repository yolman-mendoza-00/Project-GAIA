const express = require('express');
const router = express.Router();

const retosController = require('../controller/retos.controller');


router.get('/retos-diarios', retosController.obtenerRetosDiarios);
router.post('/retos-diarios', retosController.asignarRetos);
router.put('/guardar-retos', retosController.guardarRetos);
router.get('/retos-realizados', retosController.retosRealizados);
router.post('/retos/personalizado', retosController.crearRetoPersonalizado);
router.post('/progreso/actualizar/:id', retosController.actualizarProgreso);
router.get("/progreso/:id", retosController.obtenerProgresoUsuario);


module.exports = router;
