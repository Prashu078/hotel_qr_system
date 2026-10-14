const express = require('express');
const router = express.Router();
const tableController = require('../controllers/tableController');

router.post('/', tableController.addTable);
router.get('/', tableController.getAllTables);
router.get('/:id/qr', tableController.generateQR);
router.get('/verify/:token', tableController.getTableByToken);

module.exports = router;