const express = require("express");
const cors = require("cors");
const multer = require("multer");

const app = express();
const PORT = 8081;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const upload = multer();

app.get("/", (req, res) => {
    res.send("AI Logo Maker is running...\n");
});

app.use("/get-presets", require("./routes/exportPresets"));
app.use("/logo-maker", upload.none(), require("./routes/logoMaker"));

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
