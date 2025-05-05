const express = require('express');
const router = express.Router();
let alunos = require('../data/alunos');
const { calculaSituacao } = require('../utils/validacoes');

router.get('/', (req, res) => {
  const { status } = req.query;
  let resultado = alunos;
  if (status) resultado = resultado.filter(a => a.status === status);
  const resp = resultado.map(a => ({
    nome: a.nome,
    matricula: a.matricula,
    status: a.status,
    dataCriacao: a.dataCriacao.toISOString()
  }));
  return res.status(200).json(resp);
});

router.get('/notas', (req, res) => {
  const ativosComNotas = alunos
    .filter(a => a.status === 'ativo' && Array.isArray(a.notas) && a.notas.length === 4)
    .map(a => {
      const media = a.notas.reduce((sum, n) => sum + n, 0) / 4;
      return {
        nome: a.nome,
        matricula: a.matricula,
        notas: a.notas,
        media,
        situacao: calculaSituacao(media)
      };
    });
  return res.status(200).json(ativosComNotas);
});

router.get('/:matricula', (req, res) => {
  const a = alunos.find(x => x.matricula.toLowerCase() === req.params.matricula.toLowerCase());
  if (!a) return res.status(404).json({ erro: 'Aluno não encontrado.' });
  const temNotas = Array.isArray(a.notas) && a.notas.length === 4;
  const media = temNotas ? a.notas.reduce((s, n) => s + n, 0) / 4 : null;
  return res.status(200).json({
    nome: a.nome,
    matricula: a.matricula,
    status: a.status,
    notas: temNotas ? a.notas : null,
    media,
    situacao: media !== null ? calculaSituacao(media) : null,
    dataCriacao: a.dataCriacao.toISOString(),
    dataAlteracao: a.ultimaAtualizacaoNotas ? a.ultimaAtualizacaoNotas.toISOString() : null
  });
});

router.post('/', (req, res) => {
  const { nome, matricula, status } = req.body;
  if (!nome) return res.status(400).json({ erro: "O campo 'nome' é obrigatório." });
  if (!matricula) return res.status(400).json({ erro: "O campo 'matricula' é obrigatório." });
  if (!status) return res.status(400).json({ erro: "O campo 'status' é obrigatório." });
  if (nome.length < 3) return res.status(400).json({ erro: "O nome deve conter pelo menos 3 caracteres." });
  if (!['ativo', 'inativo'].includes(status)) return res.status(400).json({ erro: "O campo 'status' deve ser 'ativo' ou 'inativo'." });
  if (alunos.some(x => x.matricula.toLowerCase() === matricula.toLowerCase()))
    return res.status(409).json({ erro: 'Já existe um aluno com essa matrícula.' });
  alunos.push({ nome, matricula, status, dataCriacao: new Date(), notas: [], ultimaAtualizacaoNotas: null });
  return res.status(201).json({ mensagem: 'Aluno cadastrado com sucesso.' });
});

router.post('/:matricula/notas', (req, res) => {
  const { notas } = req.body;
  const a = alunos.find(x => x.matricula.toLowerCase() === req.params.matricula.toLowerCase());
  if (!a) return res.status(404).json({ erro: 'Aluno não encontrado.' });
  if (a.status !== 'ativo') return res.status(403).json({ erro: 'Não é possível cadastrar notas para alunos inativos.' });
  if (!Array.isArray(notas) || notas.length !== 4) return res.status(400).json({ erro: 'Devem ser fornecidas exatamente 4 notas.' });
  if (notas.some(n => typeof n !== 'number' || n < 0 || n > 10)) return res.status(400).json({ erro: 'As notas devem estar entre 0 e 10.' });
  a.notas = notas;
  a.ultimaAtualizacaoNotas = new Date();
  return res.status(200).json({ mensagem: 'Notas cadastradas com sucesso.' });
});

router.delete('/:matricula', (req, res) => {
  const idx = alunos.findIndex(x => x.matricula.toLowerCase() === req.params.matricula.toLowerCase());
  if (idx === -1) return res.status(404).json({ erro: 'Aluno não encontrado.' });
  alunos.splice(idx, 1);
  return res.status(200).json({ mensagem: 'Aluno removido com sucesso.' });
});

module.exports = router;
