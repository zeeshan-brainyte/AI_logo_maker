const express = require('express');
const router = express.Router();
const logoMakerController = require('../controllers/logoMaker');


router.post('/template', logoMakerController.withTemplate);
router.post('/only-prompt', logoMakerController.onlyPrompt);

module.exports = router;