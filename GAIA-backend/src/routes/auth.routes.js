const express = require('express');
const router = express.Router();
const authController = require('../controller/auth.controller');



router.post('/registro',authController.registrar);
router.post('/login', authController.login);
router.put("/actualizar/usuario/:id", authController.actualizarUsuario);
router.delete('/eliminar/usuario/:id', authController.eliminarUsuario);

module.exports = router;
