const express = require("express");
const cors = require("cors");
const multer = require("multer");
const logoMakerController = require('./controllers/logoMaker');
const exportPresetsController = require('./controllers/presets');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger-output.json');

const app = express();
const PORT = 8081;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const upload = multer();

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/", (req, res) => {
    res.send("AI Logo Maker is running...\n");
});

// app.use("/presets", upload.none(), require("./routes/presets"));
// app.use("/logo-maker", upload.none(), require("./routes/logoMaker"));

// Presets endpoints
app.get('/color-palettes', exportPresetsController.getColorPalettes); // Get color palettes
app.get('/font-styles', exportPresetsController.getFontStyles); // Get font styles
app.get('/industries', exportPresetsController.getIndustries); // Get industries
app.get('/style-presets', exportPresetsController.getStylePresets); // Get style presets

// logo endpoints
app.post('/ai-logo', upload.none(), logoMakerController.withTemplate); // AI Logo Maker
app.post('/ai-graphics', upload.none(), logoMakerController.onlyPrompt); // AI Graphics
app.post('/inspire-me', upload.none(), logoMakerController.inspireMe); // Inspire Me (Enhance Prompt)
app.post('/image-generation', upload.none(), logoMakerController.generateImage); // Generate Images


// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
