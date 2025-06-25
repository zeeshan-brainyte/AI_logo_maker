// n number of hits to enhance the prompt with a template and again n hits to generate n logos using OpenAI's GPT-4 model

const { OpenAI } = require("openai");
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

const createPromptTemplate = (companyName, slogan, industry, colorScheme, fontStyle, stylePreset, size) => {
    return `Create a high-quality logo for a company named **"${companyName}"**${slogan ? ` with the slogan "${slogan}"` : ""
        }. The company operates in the **${industries[industry].industry}** sector.

    The logo should feature:
    - A **${fontStyles[fontStyle].description}** typeface
    - A **centered layout**
    - A **${colorPalettes[colorScheme].name}** color scheme using tones like ( ${(colorPalettes[colorScheme].colors || [])} )
    - Designed in **vector-style**, suitable for printing and digital use
    - Stylized as a **${stylePresets[stylePreset].name}** (e.g., ${stylePresets[stylePreset].description})
    - The logo size should be ${size}
    
    Make the logo minimalist yet bold, with strong visual impact and clear scalability.
    `;
};
// - The Logo must be gradient based, with the combination of the color scheme.

// This function enhances the user prompt with a template using OpenAI's GPT-4 model
const enhancePromptWithTemplate = async (userPrompt, template) => {
    console.log("Enhancing prompt with template...");
    const systemPrompt = (
        "You are an AI assistant that enhances image generation prompts. " +
        "Your task is to take a user's prompt (if given) and a template, and generate a detailed and vivid prompt suitable for high-quality image generation." +
        "You will use details from the template to enrich the user's prompt, ensuring it is clear, descriptive, and ready for image generation." +
        "You must include all relevant and correct details from the template in the enhanced prompt like Company Name, slogan, etc."
    );
    const messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: `User Prompt: ${userPrompt ? userPrompt : "No user prompt provided"}\nTemplate: ${template}` },
    ];

    try {
        const response = await openai.responses.create({
            model: "gpt-4.1",
            input: messages,
        });

        const enhancedPrompt = response.output_text.trim();
        return enhancedPrompt;
    } catch (error) {
        console.error("Error enhancing prompt:", error);
        throw error;
    }
}


// AI LOGO GENERATOR
exports.withTemplate = async (req, res) => {
    console.time("Logo generation time");
    try {
        let { customPrompt, companyName, slogan, industry, colorScheme, fontStyle, stylePreset, randomStylePreset, quantity, ratio, background } = req.body;


        if (!companyName || companyName.trim() === "") {
            return res.status(400).json({ error: "Company name is required" });
        }
        if (!industry || industry.trim() === "") {
            //generate a random industry if not provided
            const randomIndex = Math.floor(Math.random() * Object.keys(industries).length);
            industry = Object.keys(industries)[randomIndex];
        }
        if (!colorScheme || colorScheme.trim() === "") {
            //generate a random color scheme if not provided
            const randomIndex = Math.floor(Math.random() * Object.keys(colorPalettes).length);
            colorScheme = Object.keys(colorPalettes)[randomIndex];
        }
        if (!fontStyle || fontStyle.trim() === "") {
            //generate a random font style if not provided
            const randomIndex = Math.floor(Math.random() * Object.keys(fontStyles).length);
            fontStyle = Object.keys(fontStyles)[randomIndex];
        }
        if (!stylePreset || stylePreset.trim() === "") {
            //generate a random style preset if not provided
            const randomIndex = Math.floor(Math.random() * Object.keys(stylePresets).length);
            stylePreset = Object.keys(stylePresets)[randomIndex];
        }


        // return res.status(200).json({
        //     message: "Prompt received successfully",
        //     prompt: prompt,
        // });

        // If quantity is not provided, default to 8
        quantity = Number(quantity) || 8;
        if (quantity < 1 || quantity > 10) {
            return res.status(400).json({ error: "Quantity must be a number between 1 and 10." });
        }

        ratio = ratio || "1:1"; // Default to 1:1 ratio if not provided

        // Determine the size based on the ratio
        let size = "1024x1024"; // Default size for 1:1 ratio
        if (ratio === "1:1") {
            size = "1024x1024"; // Default size for 1:1 ratio
        } else if (ratio === "4:3") {
            size = "1536x1024"; // Size for 4:3 ratio
        } else if (ratio === "9:16") {
            size = "1024x1536"; // Size for 9:16 ratio
        } else {
            return res.status(400).json({ error: "Invalid ratio provided. Use '1:1', '4:3', or '9:16'." });
        }

        // Determine the background option based on the provided background parameter
        let backgroundOption = "opaque"; // Default background option
        if (background && (background === "true" || background === true)) {
            backgroundOption = "opaque";
        } else if (background && (background === "false" || background === false)) {
            backgroundOption = "transparent";
        }

        // If randomStylePreset is true, generate logos with unique random style presets
        if (randomStylePreset && randomStylePreset === true || randomStylePreset === "true") {
            let images = [];
            const stylePresetIds = Object.keys(stylePresets);
            const uniqueNumbers = generateUniqueRandomNumbers(quantity, stylePresetIds.length);
            // console.log("Unique random numbers (style preset ids):", uniqueNumbers);

            // Prepare prompts with different style presets
            const promptPairs = uniqueNumbers.map((num) => {
                const stylePresetId = stylePresetIds[num - 1]; // since uniqueNumbers are 1-based
                const template = createPromptTemplate(companyName, slogan, industry, colorScheme, fontStyle, stylePresetId, size);
                return { userPrompt: customPrompt, template };
            });

            // Enhance all prompts in parallel
            let enhancedPrompts;
            try {
                enhancedPrompts = await Promise.all(
                    promptPairs.map(pair => enhancePromptWithTemplate(pair.userPrompt, pair.template))
                );
            } catch (enhanceError) {
                console.error("Error enhancing prompts:", enhanceError);
                return res.status(500).json({
                    error: "Failed to enhance prompts.",
                    details: enhanceError.message || enhanceError.toString(),
                });
            }

            console.log("Enhanced prompts:", enhancedPrompts);
            console.log("Now using enhanced prompts for logos generation...");

            // Now use enhancedPrompts for image generation
            let results;
            try {
                results = await Promise.allSettled(
                    enhancedPrompts.map((enhancedPrompt) =>
                        openai.images.generate({
                            model: "gpt-image-1",
                            prompt: enhancedPrompt,
                            n: 1,
                            size: size,
                            background: backgroundOption, // "opaque" or "transparent"
                        })
                    )
                );
            } catch (apiError) {
                console.error("Unexpected error during image generation:", apiError);
                console.timeEnd("Logo generation time");
                return res.status(502).json({
                    error: "Unexpected error during logo generation.",
                    details: apiError.message || apiError.toString(),
                });
            }

            // Separate successful and failed results
            const successes = results.filter(r => r.status === "fulfilled").map(r => r.value);
            const failures = results.filter(r => r.status === "rejected");

            if (successes.length === 0) {
                console.timeEnd("Logo generation time");
                return res.status(502).json({
                    error: "All logo generations failed.",
                    details: failures.map(f => f.reason?.message || f.reason?.toString()),
                });
            }

            console.log(`Generated ${successes.length} logos successfully, ${failures.length} failed.`);

            // Save only successful images
            try {
                if (!fs.existsSync("output_logos")) {
                    fs.mkdirSync("output_logos");
                }

                successes.forEach((response, idx) => {
                    const image = response.data[0];
                    images.push(image);
                    const image_base64 = image.b64_json;
                    const image_bytes = Buffer.from(image_base64, "base64");
                    fs.writeFileSync(
                        `output_logos/${companyName}_${Date.now()}_${idx + 1}.png`,
                        image_bytes
                    );
                });
                console.log("All generated images saved successfully.");
            } catch (fsError) {
                console.error("Error saving generated images:", fsError);
                console.timeEnd("Logo generation time");
                return res.status(500).json({
                    error: "Some logos were generated but could not be saved.",
                    details: fsError.message || fsError.toString(),
                });
            }

            console.timeEnd("Logo generation time");
            // console.log(successes);
            return res.status(200).json({
                message: `Logos generated: ${successes.length}. Failed: ${failures.length}.`,
                results: images,
                failedDetails: failures.map(f => f.reason?.message || f.reason?.toString()),
            });
        } else {
            // Use the selected stylePreset
            // console.log("Using selected style preset:", stylePreset);
            const promptString = createPromptTemplate(companyName, slogan, industry, colorScheme, fontStyle, stylePreset, size);
            const enhancedPrompt = await enhancePromptWithTemplate(customPrompt, promptString);
            // console.log("Generated prompt string:", promptString);
            console.log("Enhanced prompt:", enhancedPrompt);
            console.log("Now using enhanced prompt for logo generation...");

            // return res.status(200).json({
            //     message: "Prompt generated successfully",
            //     prompt: enhancedPrompt,
            // });

            const response = await openai.images.generate({
                model: "gpt-image-1",
                prompt: enhancedPrompt,
                n: Number(quantity),
                size: size,
                background: backgroundOption, // "opaque" or "transparent"
            });

            if (!response || !response.data || response.data.length === 0) {
                console.timeEnd("Logo generation time");
                return res.status(502).json({
                    error: "No logos generated. Please try again.",
                });
            }
            console.log(`Generated ${response.data.length} logos successfully.`);

            if (!fs.existsSync("output_logos")) {
                fs.mkdirSync("output_logos");
            }

            response.data.forEach((image, idx) => {
                const image_base64 = image.b64_json;
                const image_bytes = Buffer.from(image_base64, "base64");
                fs.writeFileSync(
                    `output_logos/${companyName}_${Date.now()}_${idx + 1}.png`,
                    image_bytes
                );
            });

            console.log("All generated logos saved successfully.");
            console.timeEnd("Logo generation time");
            return res.status(200).json({
                message: "Logos generated successfully",
                results: response.data
            });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// AI GRAPHICS
exports.onlyPrompt = async (req, res) => {
    // console.time("Logo generation time");
    try {
        let { prompt, stylePreset, ratio, quantity, background } = req.body; // Expecting prompt to be a string text

        if (!prompt || prompt.trim() === "" || prompt === null || prompt === undefined) {
            return res.status(400).json({ error: "Prompt is required" });
        }

        // If quantity is not provided, default to 1
        quantity = Number(quantity) || 1;
        if (quantity < 1 || quantity > 10) {
            return res.status(400).json({ error: "Quantity must be a number between 1 and 10." });
        }

        // If ratio is not provided, default to "1:1"
        ratio = ratio || "1:1";

        // If style is not provided, select a random style preset
        if (!stylePreset || stylePreset.trim() === "") {
            //generate a random style preset if not provided
            const randomIndex = Math.floor(Math.random() * Object.keys(stylePresets).length);
            stylePreset = Object.keys(stylePresets)[randomIndex];
        }

        console.log("Prompt:", prompt);
        console.log("Style Preset:", stylePreset);
        console.log("Ratio:", ratio);
        console.log("Quantity:", quantity);

        // Determine the size based on the ratio
        let size = "1024x1024"; // Default size for 1:1 ratio
        if (ratio === "1:1") {
            size = "1024x1024"; // Default size for 1:1 ratio
        } else if (ratio === "4:3") {
            size = "1536x1024"; // Size for 4:3 ratio
        } else if (ratio === "9:16") {
            size = "1024x1536"; // Size for 9:16 ratio
        } else {
            return res.status(400).json({ error: "Invalid ratio provided. Use '1:1', '4:3', or '9:16'." });
        }

        // return res.status(200).json({
        //     message: "Prompt received successfully",
        //     prompt: prompt,
        //     stylePreset: stylePreset,
        //     ratio: ratio,
        //     quantity: quantity
        // });

        console.log("Enhancing prompt with template...");
        const systemPrompt = (
            "You are an AI assistant that enhances image generation prompts. " +
            "Your task is to take a user's prompt, and generate a detailed and vivid prompt suitable for high-quality image generation." +
            "You will use details from the prompt and enrich the user's prompt, ensuring it is clear, descriptive, and ready for image generation." +
            "You must include all relevant and correct details from the prompt in the enhanced prompt like Company Name, slogan, etc." +
            `You must also make sure that logos are Stylized as a **${stylePresets[stylePreset].name}** (e.g., ${stylePresets[stylePreset].description})`
        );
        const messages = [
            { role: "system", content: systemPrompt },
            { role: "user", content: `User Prompt: ${prompt}` },
        ];

        let enhancedPrompt = prompt; // Default to the original prompt if enhancement fails
        try {
            const response = await openai.responses.create({
                model: "gpt-4.1",
                input: messages,
            });

            enhancedPrompt = response.output_text.trim();
        } catch (error) {
            console.error("Error enhancing prompt:", error);
            throw error;
        }
        console.log("Enhanced prompt:", enhancedPrompt);
        console.log("Now using enhanced prompt for logo generation...");

        // Determine the background option based on the provided background parameter
        let backgroundOption = "opaque"; // Default background option
        if (background && (background === "true" || background === true)) {
            backgroundOption = "opaque";
        } else if (background && (background === "false" || background === false)) {
            backgroundOption = "transparent";
        }

        console.log("Background:", background);
        console.log("Background option:", backgroundOption);
        const response = await openai.images.generate({
            model: "gpt-image-1",
            prompt: enhancedPrompt,
            n: Number(quantity),
            size: size,
            background: backgroundOption, // "opaque" or "transparent"
        });

        if (!response || !response.data || response.data.length === 0) {
            console.timeEnd("Logo generation time");
            return res.status(502).json({
                error: "No logo generated. Please try again.",
            });
        }
        console.log(`Logo generated successfully.`);

        if (!fs.existsSync("output_logos")) {
            fs.mkdirSync("output_logos");
        }

        // console.log(response.data);
        response.data.forEach((image, idx) => {
            const image_base64 = image.b64_json;
            const image_bytes = Buffer.from(image_base64, "base64");
            fs.writeFileSync(
                `output_logos/Logo_${Date.now()}_${idx + 1}.png`,
                image_bytes
            );
        });

        console.log("logo saved successfully.");
        // console.timeEnd("Logo generation time");
        return res.status(200).json({
            message: "Logos generated successfully",
            results: response.data
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
