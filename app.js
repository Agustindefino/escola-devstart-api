import express from 'express';

const app = express();
const port = 3000;

let alunos = [];

app.use(express.json());

const calcularMedia = (notas) => {
  if (!notas || notas.length !== 4) {
    return null;
  }
  const soma = notas.reduce((acc, nota) => acc + parseFloat(nota), 0); // Garante que as notas sejam números
  return soma / notas.length;
};


app.post('/alunos', (req, res) => {
  const { nome, matricula, status } = req.body;

  if (!nome || !matricula || !status) {
    return res.status(400).json({ mensagem: 'Nome, matrícula e status são obrigatórios.' });
  }

  if (status !== 'ativo' && status !== 'inativo') {
    return res.status(400).json({ mensagem: 'O status deve ser "ativo" ou "inativo".' });
  }

  const alunoExistente = alunos.find(aluno => aluno.matricula === matricula);
  if (alunoExistente) {
    return res.status(409).json({ mensagem: 'Matrícula já existente.' });
  }

  const novoAluno = { nome, matricula, status };
  alunos.push(novoAluno);
  res.status(201).json(novoAluno);
});


app.post('/alunos/:matricula/notas', (req, res) => {
  const { matricula } = req.params;
  const { notas } = req.body;

  const alunoIndex = alunos.findIndex(aluno => aluno.matricula === matricula);

  if (alunoIndex === -1) {
    return res.status(404).json({ mensagem: 'Aluno não encontrado.' });
  }

  if (!notas || !Array.isArray(notas) || notas.length !== 4 || !notas.every(nota => typeof nota === 'number')) {
    return res.status(400).json({ mensagem: 'O array de notas deve conter exatamente 4 números.' });
  }

  alunos[alunoIndex].notas = notas;
  alunos[alunoIndex].media = calcularMedia(notas);

  res.json(alunos[alunoIndex]);
});


app.delete('/alunos/:matricula', (req, res) => {
  const { matricula } = req.params;
  const initialLength = alunos.length;
  alunos = alunos.filter(aluno => aluno.matricula !== matricula);

  if (alunos.length === initialLength) {
    return res.status(404).json({ mensagem: 'Aluno não encontrado.' });
  }

  res.status(204).send();
});


app.get('/alunos', (req, res) => {
  const alunosAtivos = alunos.filter(aluno => aluno.status === 'ativo').map(aluno => ({
    nome: aluno.nome,
    matricula: aluno.matricula,
  }));
  res.json(alunosAtivos);
});


app.get('/alunos/notas', (req, res) => {
  console.log("Array de alunos:", alunos); // Adicione esta linha
  const alunosComNotas = alunos.filter(aluno => aluno.notas).map(aluno => ({
    nome: aluno.nome,
    notas: aluno.notas,
    media: aluno.media,
  }));
  res.json(alunosComNotas);
});

app.get('/alunos/:matricula', (req, res) => {
  const { matricula } = req.params;
  const aluno = alunos.find(aluno => aluno.matricula === matricula);

  if (!aluno) {
    return res.status(404).json({ mensagem: 'Aluno não encontrado.' });
  }

  res.json({
    nome: aluno.nome,
    matricula: aluno.matricula,
    status: aluno.status,
    media: aluno.media,
  });
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});






