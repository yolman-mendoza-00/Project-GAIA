const express = require('express');
const cors = require('cors');
const swaggerUi = require("swagger-ui-express")
const swaggerDocument = require("./swagger-output.json")
require('dotenv').config();

const authRoutes = require('./src/routes/auth.routes');
const retosRoutes = require('./src/routes/retos.routes');


const app = express();

app.use(express.json({ limit: '15mb' }));

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));

// Rutas
app.use('/api', authRoutes);
app.use('/api', retosRoutes);


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

module.exports = app;


