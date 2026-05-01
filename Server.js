const express = require('express');
const path = require('path'); 

const app = express();

// ¡ESTA ES LA LÍNEA NUEVA! 
// Le decimos a Express que la carpeta 'public' contiene archivos estáticos (como el CSS)
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(3000, () => {
    console.log('Servidor encendido. Visita http://localhost:3000 en tu navegador');
});