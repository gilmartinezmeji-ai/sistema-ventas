const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static('public'));

// 🔥 prueba
app.get('/ping', (req, res) => {
  res.send("pong 🔥");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log("Servidor corriendo en puerto", PORT);
});