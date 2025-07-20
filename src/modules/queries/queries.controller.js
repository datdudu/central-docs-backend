const prisma = require('../../config/prisma');
const axios = require('axios');

async function gerarRespostaIA(pergunta, datasetId) {
  const HF_API_TOKEN = process.env.HF_API_TOKEN;
  // Modelo para question-answering
  const model = "deepset/roberta-base-squad2";
  const url = `https://api-inference.huggingface.co/models/${model}`;

  try {
    // Buscar dados do dataset para usar como contexto
    let contexto = "";
    if (datasetId) {
      const records = await prisma.record.findMany({
        where: { dataset_id: parseInt(datasetId) },
        take: 10 // Limitar para não exceder o limite da API
      });
      
      // Converter os dados JSON em texto para contexto
      contexto = records.map(record => {
        const dados = typeof record.dados_json === 'string' 
          ? JSON.parse(record.dados_json) 
          : record.dados_json;
        return Object.entries(dados).map(([key, value]) => `${key}: ${value}`).join(', ');
      }).join('. ');
    }

    // Se não há contexto específico, usar um contexto genérico
    if (!contexto) {
      contexto = "Este é um sistema de consulta de dados. Os dados disponíveis podem incluir informações sobre pessoas, produtos, ou outros registros conforme o dataset carregado.";
    }

    const response = await axios.post(
      url,
      {
        inputs: {
          question: pergunta,
          context: contexto
        }
      },
      {
        headers: { Authorization: `Bearer ${HF_API_TOKEN}` },
        timeout: 20000
      }
    );

    // O modelo de QA retorna um objeto com 'answer'
    if (response.data && response.data.answer) {
      return response.data.answer;
    }
    
    return "Não foi possível gerar resposta com base no contexto disponível.";
  } catch (err) {
    console.error('Erro na API da Hugging Face:', err.response?.data || err.message);
    return "Erro ao gerar resposta com IA.";
  }
}

exports.create = async (req, res) => {
  try {
    const userId = req.user.id;
    const { pergunta, datasetId } = req.body;

    if (!pergunta) {
      return res.status(400).json({ error: 'Pergunta é obrigatória' });
    }

    // Gera resposta usando IA com contexto do dataset
    const resposta = await gerarRespostaIA(pergunta, datasetId);

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
    console.error('Erro ao registrar query:', err);
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