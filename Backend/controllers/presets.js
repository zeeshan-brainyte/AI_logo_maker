const colorPalettes = require('./data/colorPalettes.json');
const fontStyles = require('./data/fontStyles.json');
const industries = require('./data/industries.json');
const stylePresets = require('./data/stylePresets.json');

exports.getColorPalettes = (req, res) => {
    // only return id and names
    const palettes = Object.entries(colorPalettes).map(([id, palette]) => ({
        id,
        name: palette.name
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

exports.getStylePresets = (req, res) => {
    const presets = Object.entries(stylePresets).map(([id, preset]) => ({
        id,
        name: preset.name
    }));
    res.json(presets);
};
