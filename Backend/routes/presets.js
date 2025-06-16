const express = require('express');
const router = express.Router();
const exportPresetsController = require('../controllers/presets');


router.get('/color-palettes', exportPresetsController.getColorPalettes);
router.get('/font-styles', exportPresetsController.getFontStyles);
router.get('/industries', exportPresetsController.getIndustries);
router.get('/style-presets', exportPresetsController.getStylePresets);
router.post('/style-presets', exportPresetsController.setStylePreset);




module.exports = router;