const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');

router.get('/', menuController.getAllItems);
router.get('/category/:catId', menuController.getItemsByCategory);
router.post('/', menuController.addItem);
router.put('/:id', menuController.updateItem);
router.delete('/:id', menuController.deleteItem);

module.exports = router;