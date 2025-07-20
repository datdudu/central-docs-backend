const express = require('express');
const cors = require('cors');
const app = express();
const authRoutes = require('./modules/auth/auth.routes');
const datasetsRoutes = require('./modules/datasets/datasets.routes');
const queriesRoutes = require('./modules/queries/queries.routes');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger/swagger.yml');


app.use(cors());
app.use(express.json());

// Rotas
app.use('/auth', authRoutes);
app.use('/datasets', datasetsRoutes);
app.use('/queries', queriesRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (req, res) => {
  res.json({ message: 'API Central Docs Backend' });
});

module.exports = app;