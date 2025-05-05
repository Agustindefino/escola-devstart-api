function calculaSituacao(media) {
    if (media >= 7) return 'aprovado';
    if (media >= 5) return 'recuperação';
    return 'reprovado';
  }
  
  module.exports = { calculaSituacao };
  