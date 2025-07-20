const express = require('express');
const router = express.Router();
const datasetsController = require('./datasets.controller');
const authenticateToken = require('../../middlewares/auth');
const upload = require('../../utils/multerConfig');

router.post('/upload', authenticateToken, upload.single('file'), datasetsController.upload);
router.get('/', authenticateToken, datasetsController.list);
router.get('/:id/records', authenticateToken, datasetsController.listRecords);
router.get('/:id/records/search', authenticateToken, datasetsController.searchRecords);
module.exports = router;