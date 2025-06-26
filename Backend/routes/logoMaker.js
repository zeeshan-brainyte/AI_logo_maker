const express = require('express');
const router = express.Router();
const logoMakerController = require('../controllers/logoMaker');


router.post('/template', logoMakerController.withTemplate); // AI Logo Maker
router.post('/only-prompt', logoMakerController.onlyPrompt); // AI Graphics
router.post('/inspire-me', logoMakerController.inspireMe); // Inspire Me ( Enhance Prompt )

module.exports = router;