import axios from "axios";

const BASE_URL =
    import.meta.env.MODE === "development"
        ? import.meta.env.VITE_DEV_BACKEND_URL
        : import.meta.env.VITE_PROD_BACKEND_URL;

if (!BASE_URL) {
    throw new Error(
        "Backend URL is not defined. Please set the BACKEND_URL environment variable."
    );
}

// Logo Maker Service

export const getIndustries = async () => {
    try {
        const res = await axios.get(`${BASE_URL}/get-presets/industries`);
        // console.log("Industries fetched successfully:", res.data);
        return res.data;
    } catch (error) {
        console.error("Error fetching industries:", error);
        throw error;
    }
};

export const getColorSchemes = async () => {
    try {
        const res = await axios.get(`${BASE_URL}/get-presets/color-palettes`);
        // console.log("Color schemes fetched successfully:", res.data);
        return res.data;
    } catch (error) {
        console.error("Error fetching color schemes:", error);
        throw error;
    }
}
export const getFontStyles = async () => {
    try {
        const res = await axios.get(`${BASE_URL}/get-presets/font-styles`);
        // console.log("Font styles fetched successfully:", res.data);
        return res.data;
    } catch (error) {
        console.error("Error fetching font styles:", error);
        throw error;
    }
}
export const getStylePresets = async () => {
    try {
        const res = await axios.get(`${BASE_URL}/get-presets/style-presets`);
        // console.log("Style presets fetched successfully:", res.data);
        return res.data;
    } catch (error) {
        console.error("Error fetching style presets:", error);
        throw error;
    }
}

export const uploadPrompt = async ({ promptData }) => {
    const formData = new FormData();
    formData.append("prompt", JSON.stringify(promptData));

    try {
        const res = await axios.post(
            `${BASE_URL}/logo-maker/template`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        const data = res.data;
        if (data.error) {
            throw new Error(data.error);
        }
        return data;
    } catch (error) {
        console.error("Error uploading prompt:", error);
        throw error;
    }
};
