const express = require('express');
const router = express.Router();
const logoMakerController = require('../controllers/logoMaker');


router.post('/upload', logoMakerController.upload);

module.exports = router;