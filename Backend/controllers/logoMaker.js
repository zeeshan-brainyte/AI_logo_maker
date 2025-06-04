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

// This function enhances the user prompt with a template using OpenAI's GPT-4 model
const enhancePromptWithTemplate = async (userPrompt, template) => {
  const systemPrompt = (
        "You are an AI assistant that enhances image generation prompts. " +
        "Your task is to take a user's prompt and a template, and generate a detailed and vivid prompt suitable for high-quality image generation."+
        "You will use details from the template to enrich the user's prompt, ensuring it is clear, descriptive, and ready for image generation."+
        "You must include all relevant and correct details from the template in the enhanced prompt like Company Name, slogan, etc."
    );
  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: `User Prompt: ${userPrompt}\nTemplate: ${template}` },
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: messages,
    });

    const enhancedPrompt = completion.choices[0].message.content.trim();
    return enhancedPrompt;
  } catch (error) {
    console.error("Error enhancing prompt:", error);
    throw error;
  }
}


exports.upload = async (req, res) => {
    console.time("Logo generation time");
    try {
        let { prompt } = req.body;
        prompt = JSON.parse(prompt);

        if (!prompt) {
            return res.status(400).json({ error: "Prompt is required" });
        }

        console.log("Parsed prompt:", prompt);

        // return res.status(200).json({
        //     message: "Prompt received successfully",
        //     prompt: prompt,
        // });

        const variantCount = prompt.variantCount || 8;

        // If randomStylePreset is true, generate unique random style presets
        if (prompt.randomStylePreset) {
            const stylePresetIds = Object.keys(stylePresets);
            const uniqueNumbers = generateUniqueRandomNumbers(variantCount, stylePresetIds.length);
            // console.log("Unique random numbers (style preset ids):", uniqueNumbers);

            // Prepare prompts with different style presets
            const promptPairs = uniqueNumbers.map((num) => {
                const stylePresetId = stylePresetIds[num - 1]; // since uniqueNumbers are 1-based
                const promptWithRandomPreset = { ...prompt, stylePreset: stylePresetId };
                const template = createPromptTemplate(promptWithRandomPreset);
                return { userPrompt: prompt.customPrompt, template };
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
                            size: "1024x1024",
                            background: "opaque",
                        })
                    )
                );
            } catch (apiError) {
                // This catch is unlikely to trigger with allSettled, but keep for safety
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
                    const image_base64 = image.b64_json;
                    const image_bytes = Buffer.from(image_base64, "base64");
                    fs.writeFileSync(
                        `output_logos/${prompt.companyName}_${Date.now()}_${idx + 1}.png`,
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
            return res.status(200).json({
                message: `Logos generated: ${successes.length}. Failed: ${failures.length}.`,
                failedDetails: failures.map(f => f.reason?.message || f.reason?.toString()),
            });
        } else {
            // Use the selected stylePreset as before
            const promptString = createPromptTemplate(prompt);
            const enhancedPrompt = await enhancePromptWithTemplate(prompt.customPrompt, promptString);
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
                n: Number(prompt.variantCount),
                size: "1024x1024", // ratio 1:1
                // size: "1536x1024", // ratio 16:9
                // size: "1024x1536", // ratio 9:16
                background: "opaque",
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
                    `output_logos/${prompt.companyName}_${Date.now()}_${idx + 1}.png`,
                    image_bytes
                );
            });

            console.log("All generated logos saved successfully.");
            console.timeEnd("Logo generation time");
            return res.status(200).json({
                message: "Logos generated successfully",
            });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
