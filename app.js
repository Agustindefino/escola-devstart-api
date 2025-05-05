const express = require('express');
const app = express();
const alunosRouter = require('./routes/alunos');

app.use(express.json());
app.use('/alunos', alunosRouter);

app.listen(3000, () => {
  console.log('Servidor na porta 3000');
});



