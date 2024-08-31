import {GoogleGenerativeAI} from "@google/generative-ai";

export default class GeminiService {
    private genAI;

    fetchMeasurementByImage(base64Img: string) {

        const model = this.genAI.getGenerativeModel({model: "gemini-1.5-flash" });

        return model.generateContent([
            {
                inlineData: {
                    mimeType: 'image/jpeg',
                    data: base64Img
                }
            },
            { text: "Please get the number from the meter in this image and only output the integer value in your response" },
        ]);
    }

    constructor(genAI: GoogleGenerativeAI) {
        this.genAI = genAI;
    }
}

// geminiAPIKey
