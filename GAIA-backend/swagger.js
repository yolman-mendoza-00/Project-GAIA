const swaggerAutogen = require("swagger-autogen");

const doc = {
    info: {
        title: 'My Aplicacion API',
        description: 'Descripcion que quieras ingresar'
    },
    host: "localhost:5000",
    shemes: ['http']
};

const outputFile = './swagger-output.json'
const endpointsFile = ['./src/routes/auth.routes', './src/routes/retos.routes']

swaggerAutogen(outputFile, endpointsFile, doc)
    .then(() => {
        require('./index.js');
    })