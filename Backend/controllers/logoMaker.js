const { OpenAI, toFile } = require("openai");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// prompt ={
//     companyName: "",
//     slogan: "",
//     industry: "",
//     colorScheme: "",
//     fontStyle: "",
//     variantCount: 8,
// }
const fontStyles = {
    Roboto: "modern sans-serif font",
    Montserrat: "rounded modern font",
    "Bebas Neue": "bold uppercase display font",
    Orbitron: "futuristic techno font",
    Anton: "heavy bold font",
    "Playfair Display": "elegant serif font",
    Cinzel: "ancient roman serif font",
    Inter: "minimal clean sans-serif font",
    "Courier New": "monospaced font",
    Lobster: "handwritten cursive font",
};

const colorPalettes = {
    "Tech Blue": ["#0F172A", "#1E293B", "#3B82F6", "#93C5FD"],
    "Industrial Gray": ["#1C1C1C", "#434343", "#B0B0B0", "#F5F5F5"],
    "Vibrant Orange": ["#1E1E1E", "#FF6B00", "#FFA559", "#F2E8CF"],
    "Electric Green": ["#0D1B2A", "#1B998B", "#38B000", "#C1FBA4"],
    "Elegant Gold": ["#222222", "#C0A060", "#FFF8DC", "#8C7853"],
    "Minimal Black & White": ["#000000", "#FFFFFF", "#888888"],
    "Pastel Gradient": ["#E0BBE4", "#957DAD", "#D291BC", "#FEC8D8"],
};

const stylePresets = [
    {
        name: "Esports Emblem",
        description:
            "Bold, aggressive, often featuring a mascot or shield. Great for gaming or youth brands.",
    },
    {
        name: "Futuristic Tech",
        description:
            "Sleek, angular lines, neon accents, and cyber-inspired forms. Ideal for AI, robotics, SaaS.",
    },
    {
        name: "Industrial Vector",
        description:
            "Gear elements, strong outlines, dark tones. For engineering, construction, manufacturing.",
    },
    {
        name: "Minimal Geometric",
        description:
            "Clean lines, simple shapes, modern symmetry. Perfect for startups and digital brands.",
    },
    {
        name: "Modern Flat Design",
        description:
            "No gradients, simple icons, two-tone palette. Works well for apps and digital tools.",
    },
    {
        name: "Luxury Serif Branding",
        description:
            "Elegant serif fonts, gold/black tones. Suitable for fashion, jewelry, upscale brands.",
    },
    {
        name: "Cyberpunk Aesthetic",
        description:
            "Neon lights, tech armor, high contrast. Perfect for futuristic, gaming, or AI products.",
    },
    {
        name: "Nature Organic",
        description:
            "Soft, curved forms, earthy colors. Ideal for wellness, environmental, health products.",
    },
    {
        name: "Badge / Stamp Style",
        description:
            "Circular or shield layouts with text wraps. Ideal for heritage, outdoor, food & beverage.",
    },
    {
        name: "Mascot-Based Logo",
        description:
            "Central illustrated character (e.g., hawk, robot, wolf). Works well for esports, schools.",
    },
    {
        name: "Lettermark Monogram",
        description:
            "Initial-based logo (e.g., ‘TE’ for Titan Engineering). Ideal for corporate or minimalist brands.",
    },
    {
        name: "Wordmark Bold",
        description:
            "Pure typographic logo with customized bold lettering. Useful for clean professional branding.",
    },
    {
        name: "Abstract Symbolic",
        description:
            "Unique symbol not directly tied to a real object. Great for SaaS, fintech, or AI companies.",
    },
    {
        name: "Gradient Tech Theme",
        description:
            "Color transitions with layered depth and light glows. For web3, crypto, and fintech.",
    },
    {
        name: "Retro-Futuristic",
        description:
            "80s inspired lines, grids, and neon. Works for vintage tech or entertainment brands.",
    },
    {
        name: "Slab Serif Industrial",
        description:
            "Heavy serif fonts and structured layouts. For hardware, tools, engineering.",
    },
    {
        name: "Hand-Drawn Artisan",
        description:
            "Sketchy, personal style. Good for handmade, creative, or local business vibes.",
    },
    {
        name: "Gothic/Mechanical",
        description:
            "Dark, heavy typography, ornate patterns. For heavy industries, tattoos, or niche fashion.",
    },
    {
        name: "Corporate Tech Stack",
        description:
            "Clean icon next to name, often in blue/gray. Good for B2B, consulting, SaaS companies.",
    },
    {
        name: "Dynamic Motion Style",
        description:
            "Lines or arcs showing speed, motion, or transformation. For delivery, automotive, or sports.",
    },
];

const generateUniqueRandomNumbers = (count, max) => {
    const numbers = new Set();
    while (numbers.size < count && numbers.size < max) {
        const num = Math.floor(Math.random() * max) + 1; // 1 to max (inclusive)
        numbers.add(num);
    }
    return Array.from(numbers);
};



const createPromptTemplate = (prompt, stylePreset, stylePresetDescription) => {
    return `Create a high-quality logo for a company named **"${
        prompt.companyName
    }"**${
        prompt.slogan ? ` with the slogan "${prompt.slogan}"` : ""
    }. The company operates in the **${prompt.industry}** sector.

    The logo should feature:
    - A **${fontStyles[prompt.fontStyle]}** typeface
    - A **centered layout**
    - A **${prompt.colorScheme}** color scheme using tones like ${colorPalettes[prompt.colorScheme]}
    - Designed in **vector-style**, suitable for printing and digital use
    - Stylized as a **${stylePreset}** (e.g., ${stylePresetDescription})
    - The logo size should be 1024X1024

    Make the logo minimalist yet bold, with strong visual impact and clear scalability.
    `;
};

exports.upload = async (req, res) => {
    try {
        let { prompt } = req.body;
        prompt = JSON.parse(prompt);
        // console.log("Received prompt:", prompt);
        if (!prompt) {
            return res.status(400).json({ error: "Prompt is required" });
        }

        const variantCount = prompt.variantCount || 8;
        const uniqueNumbers = generateUniqueRandomNumbers(variantCount, 20);
        console.log("Unique random numbers:", uniqueNumbers);
        // res.status(200);

        // Generate image using OpenAI API
        const promptString = createPromptTemplate(prompt, stylePresets[0].name, stylePresets[0].description);
        console.log("Generated prompt string:", promptString);
        const response = await openai.images.generate({
            // model: "dall-e-3",
            model: "gpt-image-1",
            prompt: promptString,
            n: 1,
            size: "1024x1024",
            background: "opaque",
        });

        // Save the image to a file
        if (!fs.existsSync("output_logos")) {
            fs.mkdirSync("output_logos");
        }

        // for (const image of response.data) {
        //     const image_base64 = image.b64_json;
        //     const image_bytes = Buffer.from(image_base64, "base64");
        //     fs.writeFileSync(`output_logos/logo_${Date.now()}.png`, image_bytes);
        // }

        const image = response.data[0];
        const image_base64 = image.b64_json;
        const image_bytes = Buffer.from(image_base64, "base64");
        fs.writeFileSync(`output_logos/${prompt.companyName}_${Date.now()}.png`, image_bytes);

        res.status(200).json({
            message: "Image generated successfully",
        });
    } catch (err) {
        // console.error("Assistant error:", err);
        res.status(500).json({ error: err.message });
    }
};
