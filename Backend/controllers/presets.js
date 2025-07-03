const fs = require('fs');
const path = require('path');
const colorPalettes = require('./data/colorPalettes.json');
const fontStyles = require('./data/fontStyles.json');
const industries = require('./data/industries.json');
const stylePresets = require('./data/stylePresets.json');

exports.getColorPalettes = (req, res) => {
    // only return id and names
    const palettes = Object.entries(colorPalettes).map(([id, palette]) => ({
        id,
        name: palette.name,
        colors: palette.colors
    }));
    res.json(palettes);
};

exports.getFontStyles = (req, res) => {
    const styles = Object.entries(fontStyles).map(([id, style]) => ({
        id,
        name: style.name
    }));
    res.json(styles);
};

exports.getIndustries = (req, res) => {
    const industry = Object.entries(industries).map(([id, industry]) => ({
        id,
        name: industry.industry
    }));
    res.json(industry);
};

// exports.getStylePresets = (req, res) => {
//     const presets = Object.entries(stylePresets).map(([id, preset]) => ({
//         id,
//         name: preset.name,
//         image: preset.image,
//     }));
//     res.json(presets);
// };

exports.getStylePresets = (req, res) => {
    const mode = req.query.mode;

    let imagesDir;
    if (mode === "ai_logo") {
        imagesDir = path.join(__dirname, 'data', 'ai_logo_style_images');
    } else if (mode === "ai_graphics") {
        imagesDir = path.join(__dirname, 'data', 'ai_graphics_style_images');
    } else {
        return res.status(400).json({ error: 'Invalid mode specified. Specify either "ai_logo" or "ai_graphics"' });
    }

    const presets = Object.entries(stylePresets).map(([id, preset]) => {
        let imageBase64 = null;
        if (preset.image) {
            const imagePath = path.join(imagesDir, preset.image);
            try {
                if (fs.existsSync(imagePath)) {
                    const imageBuffer = fs.readFileSync(imagePath);
                    imageBase64 = imageBuffer.toString('base64');
                }
            } catch (err) {
                console.error(`Error reading image for style preset ${id}:`, err);
            }
        }
        return {
            id,
            name: preset.name,
            image: imageBase64
        };
    });
    res.json(presets);
};

// // Add a new style preset
// exports.setStylePreset = (req, res) => {
//     const { name, description } = req.body;
//     if (!name) {
//         return res.status(400).json({ error: 'Name is required' });
//     }
//     const filePath = path.join(__dirname, 'data', 'stylePresets.json');
//     console.log('File path:', filePath);

//     // Read and parse the JSON file
//     const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
//     console.log('Current data:', data);

//     // Add new style preset
//     const newId = (Math.max(...Object.keys(data).map(Number)) + 1).toString();
//     data[newId] = {
//         name: name,
//         description: description || '',
//     };

//     // Write back to the file
//     fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf-8');

//     console.log('New style preset added!');
//     res.status(200).json({
//         message: 'Style preset added successfully',
//         preset: {
//             id: newId,
//             name: name
//         }
//     });
// };
