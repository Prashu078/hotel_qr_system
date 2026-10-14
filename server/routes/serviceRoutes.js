const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');

router.post('/', serviceController.createRequest);
router.get('/', serviceController.getAllRequests);
router.put('/:id/status', serviceController.updateRequestStatus);

module.exports = router;