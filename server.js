const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static('public'));

// 🔥 esto hace que abra agenda por default
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/agenda.html');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log("Servidor corriendo");
});