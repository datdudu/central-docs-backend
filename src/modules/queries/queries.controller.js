const prisma = require('../../config/prisma');

exports.create = async (req, res) => {
  try {
    const userId = req.user.id;
    const { pergunta, resposta } = req.body;

    if (!pergunta || !resposta) {
      return res.status(400).json({ error: 'Pergunta e resposta são obrigatórias' });
    }

    const query = await prisma.query.create({
      data: {
        usuario_id: userId,
        pergunta,
        resposta,
        criado_em: new Date()
      }
    });

    res.status(201).json(query);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao registrar query' });
  }
};

exports.list = async (req, res) => {
  try {
    const userId = req.user.id;
    const queries = await prisma.query.findMany({
      where: { usuario_id: userId },
      orderBy: { criado_em: 'desc' }
    });
    res.json(queries);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar queries' });
  }
};