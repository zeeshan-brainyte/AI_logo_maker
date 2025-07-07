const express = require("express");
const cors = require("cors");
const multer = require("multer");
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

app.use("/presets", upload.none(), require("./routes/presets"));
app.use("/logo-maker", upload.none(), require("./routes/logoMaker"));

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
