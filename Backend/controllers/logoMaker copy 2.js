const { OpenAI, toFile } = require("openai");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const fontStyles = require("./data/fontStyles.json");
const colorPalettes = require("./data/colorPalettes.json");
const stylePresets = require("./data/stylePresets.json");
const industries = require("./data/industries.json");



const generateUniqueRandomNumbers = (count, max) => {
    const numbers = new Set();
    while (numbers.size < count && numbers.size < max) {
        const num = Math.floor(Math.random() * max) + 1; // 1 to max (inclusive)
        numbers.add(num);
    }
    return Array.from(numbers);
};



const createPromptTemplate = (prompt) => {
    return `Create a high-quality logo for a company named **"${prompt.companyName
        }"**${prompt.slogan ? ` with the slogan "${prompt.slogan}"` : ""
        }. The company operates in the **${industries[prompt.industry].industry}** sector.

    The logo should feature:
    - A **${fontStyles[prompt.fontStyle].description}** typeface
    - A **centered layout**
    - A **${colorPalettes[prompt.colorScheme].name}** color scheme using tones like ( ${(colorPalettes[prompt.colorScheme].colors || [])} )
    - Designed in **vector-style**, suitable for printing and digital use
    - Stylized as a **${stylePresets[prompt.stylePreset].name}** (e.g., ${stylePresets[prompt.stylePreset].description})
    - The logo size should be 1024X1024

    Make the logo minimalist yet bold, with strong visual impact and clear scalability.
    `;
};

exports.upload = async (req, res) => {
    try {
        let { prompt } = req.body;
        prompt = JSON.parse(prompt);

        if (!prompt) {
            return res.status(400).json({ error: "Prompt is required" });
        }

        console.log("Parsed prompt:", prompt);

        const variantCount = prompt.variantCount || 8;

        // If randomStylePreset is true, generate unique random style presets
        if (prompt.randomStylePreset) {
            const stylePresetIds = Object.keys(stylePresets);
            const uniqueNumbers = generateUniqueRandomNumbers(variantCount, stylePresetIds.length);
            console.log("Unique random numbers (style preset ids):", uniqueNumbers);

            // Prepare prompts with different style presets
            const promptStrings = uniqueNumbers.map((num) => {
                const stylePresetId = stylePresetIds[num - 1]; // since uniqueNumbers are 1-based
                const promptWithRandomPreset = { ...prompt, stylePreset: stylePresetId };
                return createPromptTemplate(promptWithRandomPreset);
            });

            console.log("Generated prompt strings for random style presets:", promptStrings);

            // Run API calls in parallel
            const responses = await Promise.all(
                promptStrings.map((promptString) =>
                    openai.images.generate({
                        model: "gpt-image-1",
                        prompt: promptString,
                        n: 1,
                        size: "1024x1024",
                        background: "opaque",
                    })
                )
            );

            if (!fs.existsSync("output_logos")) {
                fs.mkdirSync("output_logos");
            }

            responses.forEach((response, idx) => {
                const image = response.data[0];
                const image_base64 = image.b64_json;
                const image_bytes = Buffer.from(image_base64, "base64");
                fs.writeFileSync(
                    `output_logos/${prompt.companyName}_${Date.now()}_${idx + 1}.png`,
                    image_bytes
                );
            });

            return res.status(200).json({
                message: "Logos generated successfully with random style presets",
            });
        } else {
            // Use the selected stylePreset as before
            const promptString = createPromptTemplate(prompt);
            console.log("Generated prompt string:", promptString);

            const response = await openai.images.generate({
                model: "gpt-image-1",
                prompt: promptString,
                n: Number(prompt.variantCount),
                size: "1024x1024",
                background: "opaque",
            });

            if (!fs.existsSync("output_logos")) {
                fs.mkdirSync("output_logos");
            }

            response.data.forEach((image, idx) => {
                const image_base64 = image.b64_json;
                const image_bytes = Buffer.from(image_base64, "base64");
                fs.writeFileSync(
                    `output_logos/${prompt.companyName}_${Date.now()}_${idx + 1}.png`,
                    image_bytes
                );
            });

            return res.status(200).json({
                message: "Logo generated successfully",
            });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
