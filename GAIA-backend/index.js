const app = require('./app');
const port = process.env.PORT;

app.listen(port, () => {
    console.log(`Servidor backend corriendo en http://localhost:${port}`);
});
