import React, { useState, useEffect } from "react";
import {
    getColorSchemes,
    getFontStyles,
    getIndustries,
    getStylePresets,
    uploadPrompt,
} from "../services/backendRequests";

const PromptTemplate = () => {
    const [promptData, setPromptData] = useState({
        companyName: "",
        slogan: "",
        industry: "",
        colorScheme: "",
        fontStyle: "",
        stylePreset: "",
        randomStylePreset: false,
        variantCount: 8,
    });

    // Handle random style preset.
    // user can either select a style preset or use a random one (3 paths with variation).
    // input custom prompt from user and inhance it with chatgpt api then send response to image generation api.


    const [industries, setIndustries] = useState([]);
    const [colorSchemes, setColorSchemes] = useState([]);
    const [fontStyles, setFontStyles] = useState([]);
    const [stylePresets, setStylePresets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchIndustries = async () => {
            try {
                const data = await getIndustries();
                setIndustries(data || []);
            } catch (error) {
                console.error("Failed to fetch industries:", error);
                setIndustries([]);
            }
        };
        const fetchColorSchemes = async () => {
            try {
                const data = await getColorSchemes();
                setColorSchemes(data || []);
            } catch (error) {
                console.error("Failed to fetch color schemes:", error);
                setColorSchemes([]);
            }
        };
        const fetchFontStyles = async () => {
            try {
                const data = await getFontStyles();
                setFontStyles(data || []);
            } catch (error) {
                console.error("Failed to fetch font styles:", error);
                setFontStyles([]);
            }
        };
        const fetchStylePresets = async () => {
            try {
                const data = await getStylePresets();
                setStylePresets(data || []);
            } catch (error) {
                console.error("Failed to fetch style presets:", error);
                setStylePresets([]);
            }
        };
        fetchIndustries();
        fetchColorSchemes();
        fetchFontStyles();
        fetchStylePresets();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPromptData({ ...promptData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Form submitted with:", promptData);
        const result = uploadPrompt({ promptData });
        result
            .then((data) => {
                console.log("Logo generated successfully:", data);
                // Handle success (e.g., display the generated logo)
            })
            .catch((error) => {
                console.error("Error generating logo:", error);
                // Handle error (e.g., show an error message)
            });
    };

    return (
        <div className="flex w-full overflow-y-auto justify-center items-center">
            <form
                onSubmit={handleSubmit}
                className="w-[90%] md:w-[80%] lg:w-[70%] p-6 "
            >
                <h1 className="text-2xl text-center font-semibold text-text-primary">
                    AI Logo Maker
                </h1>

                <div>
                    <label className=" text-sm font-medium text-text-secondary">
                        Company Name *
                    </label>
                    <input
                        type="text"
                        name="companyName"
                        required
                        value={promptData.companyName}
                        onChange={handleChange}
                        className="mt-1 text-text-primary focus:outline-none w-full p-2 border border-bg-tertiary rounded-lg"
                    />
                </div>

                <div>
                    <label className=" text-sm font-medium text-text-secondary">
                        Slogan
                    </label>
                    <input
                        type="text"
                        name="slogan"
                        value={promptData.slogan}
                        onChange={handleChange}
                        className="mt-1 text-text-primary focus:outline-none w-full p-2 border border-bg-tertiary rounded-lg"
                    />
                </div>

                <div>
                    <label className=" text-sm font-medium text-text-secondary">
                        Industry
                    </label>
                    <select
                        name="industry"
                        value={promptData.industry}
                        onChange={handleChange}
                        className="mt-1 w-full text-text-primary bg-bg-primary focus:outline-none p-2 border border-bg-tertiary rounded-lg"
                    >
                        <option value="">Select an industry</option>
                        {industries.map((industry) => (
                            <option key={industry.id} value={industry.id}>
                                {industry.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className=" text-sm font-medium text-text-secondary">
                        Color Scheme
                    </label>
                    <select
                        name="colorScheme"
                        value={promptData.colorScheme}
                        onChange={handleChange}
                        className="mt-1  w-full text-text-primary bg-bg-primary focus:outline-none p-2 border border-bg-tertiary rounded-lg"
                    >
                        <option value="">Select a color scheme</option>
                        {colorSchemes.map((color) => (
                            <option key={color.id} value={color.id}>
                                {color.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className=" text-sm font-medium text-text-secondary">
                        Font Style
                    </label>
                    <select
                        name="fontStyle"
                        value={promptData.fontStyle}
                        onChange={handleChange}
                        className="mt-1  w-full text-text-primary bg-bg-primary focus:outline-none p-2 border border-bg-tertiary rounded-lg"
                    >
                        <option value="">Select a font style</option>
                        {fontStyles.map((font) => (
                            <option key={font.id} value={font.id}>
                                {font.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className=" text-sm font-medium text-text-secondary">
                        Style Presets
                    </label>
                    <select
                        name="stylePreset"
                        disabled={promptData.randomStylePreset}
                        value={promptData.stylePreset}
                        onChange={handleChange}
                        className={`my-1  w-full text-text-primary bg-bg-primary focus:outline-none p-2 border border-bg-tertiary rounded-lg ${promptData.randomStylePreset ? "cursor-not-allowed opacity-50" : ""
                            }`}
                    >
                        <option value="">Select a style preset</option>
                        {stylePresets.map((preset) => (
                            <option key={preset.id} value={preset.id}>
                                {preset.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center my-2">
                    <input
                        type="checkbox"
                        id="randomStylePreset"
                        name="randomStylePreset"
                        checked={promptData.randomStylePreset}
                        onChange={(e) =>
                            setPromptData({ ...promptData, randomStylePreset: e.target.checked })
                        }
                        className="mr-2"
                    />
                    <label
                        htmlFor="randomStylePreset"
                        className="cursor-pointer text-sm font-medium text-text-secondary"
                    >
                        Use Random Style Presets
                    </label>
                </div>

                <div>
                    <label className=" text-sm font-medium text-text-secondary">
                        Number of Variants
                    </label>
                    <input
                        type="number"
                        name="variantCount"
                        value={promptData.variantCount}
                        min={1}
                        max={10}
                        onChange={handleChange}
                        className="mt-1  w-full text-text-primary focus:outline-none p-2 border border-bg-tertiary rounded-lg"
                    />
                </div>

                <button
                    type="submit"
                    className=" mt-5 w-full bg-bg-tertiary hover:bg-bg-secondary text-text-primary font-semibold py-2 px-4 rounded-lg shadow-md cursor-pointer focus:outline-none active:scale-x-[98%]"
                >
                    Generate Logo
                </button>
            </form>
        </div>
    );
};

export default PromptTemplate;
