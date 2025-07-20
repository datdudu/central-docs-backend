const prisma = require('../../config/prisma');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

exports.upload = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Arquivo não enviado' });

    const { originalname, size, filename, mimetype, path: filePath } = req.file;
    const userId = req.user.id;

    // Salva metadados do dataset
    const dataset = await prisma.dataset.create({
      data: {
        nome: originalname,
        usuario_id: userId,
        criado_em: new Date(),
      }
    });

    // Se for CSV, faz a ingestão automática
    if (mimetype === 'text/csv' || originalname.endsWith('.csv')) {
      const records = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => {
          records.push({
            dataset_id: dataset.id,
            dados_json: data,
            criado_em: new Date(),
          });
        })
        .on('end', async () => {
          if (records.length > 0) {
            await prisma.record.createMany({ data: records });
          }
          res.status(201).json({
            id: dataset.id,
            nome: dataset.nome,
            usuario_id: dataset.usuario_id,
            criado_em: dataset.criado_em,
            tamanho: size,
            tipo: mimetype,
            arquivo: filename,
            registros_importados: records.length
          });
        })
        .on('error', (err) => {
          res.status(500).json({ error: 'Erro ao processar o CSV' });
        });
    } else {
      // Para outros tipos de arquivo, só salva o dataset
      res.status(201).json({
        id: dataset.id,
        nome: dataset.nome,
        usuario_id: dataset.usuario_id,
        criado_em: dataset.criado_em,
        tamanho: size,
        tipo: mimetype,
        arquivo: filename
      });
    }
  } catch (err) {
    res.status(500).json({ error: 'Erro ao fazer upload do dataset' });
  }
};

exports.list = async (req, res) => {
  try {
    const userId = req.user.id;
    const datasets = await prisma.dataset.findMany({
      where: { usuario_id: userId },
      orderBy: { criado_em: 'desc' }
    });
    res.json(datasets);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar datasets' });
  }
};

exports.listRecords = async (req, res) => {
  try {
    const userId = req.user.id;
    const datasetId = parseInt(req.params.id);

    // Garante que o dataset pertence ao usuário
    const dataset = await prisma.dataset.findUnique({
      where: { id: datasetId }
    });
    if (!dataset || dataset.usuario_id !== userId) {
      return res.status(404).json({ error: 'Dataset não encontrado' });
    }

    const records = await prisma.record.findMany({
      where: { dataset_id: datasetId },
      orderBy: { criado_em: 'asc' }
    });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar registros' });
  }
};

exports.searchRecords = async (req, res) => {
  try {
    const userId = req.user.id;
    const datasetId = parseInt(req.params.id);
    const { campo, valor } = req.query;

    // Garante que o dataset pertence ao usuário
    const dataset = await prisma.dataset.findUnique({
      where: { id: datasetId }
    });
    if (!dataset || dataset.usuario_id !== userId) {
      return res.status(404).json({ error: 'Dataset não encontrado' });
    }

    if (!campo || !valor) {
      return res.status(400).json({ error: 'Campo e valor são obrigatórios' });
    }

    // Busca registros onde dados_json->>campo = valor
    const records = await prisma.$queryRaw`
      SELECT * FROM "Record"
      WHERE "dataset_id" = ${datasetId}
      AND dados_json->>${campo} = ${valor}
      ORDER BY "criado_em" ASC
    `;
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar registros' });
  }
};