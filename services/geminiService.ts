import { 
    GoogleGenAI, 
    Type, 
    HarmCategory, 
    HarmBlockThreshold,
    GenerateContentResponse,
    GenerateImagesResponse,
    StartLongRunningProcessResponse
} from "@google/genai";
import type { GenerateImageOptions, GenerateVideoOptions, GenerateBookOptions, GeneratedBook, GenerateComicOptions, GeneratedComic, GeneratedComicPanel, StudentResponseData } from '../types';
import { AspectRatio, StylePromptTemplates, AssistanceType, QuestionType } from '../constants';


if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Relaxed safety settings for creative content generation
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

// Helper function for retrying API calls with exponential backoff
const withRetry = async <T>(apiCall: () => Promise<T>, maxRetries = 5, initialDelay = 2000): Promise<T> => {
    let attempt = 0;
    while (attempt < maxRetries) {
        try {
            return await apiCall();
        } catch (error: any) {
            attempt++;
            const errorMessage = (error.message || error.toString()).toLowerCase();
            
            // Check for specific rate limit / resource exhausted errors
            if (errorMessage.includes('429') || errorMessage.includes('resource_exhausted') || errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
                if (attempt >= maxRetries) {
                    break; // Exit loop to throw final error
                }
                const delay = initialDelay * (2 ** (attempt - 1));
                console.log(`Rate limit hit. Retrying in ${delay}ms... (Attempt ${attempt}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                console.error("Non-retryable API error:", error);
                throw error; // Not a retryable error, re-throw immediately
            }
        }
    }
    // If loop finishes, it means all retries failed for a retryable error.
    console.error(`API call failed after ${maxRetries} retries.`);
    throw new Error("لقد تجاوزت حد الطلبات الحالي. يرجى الانتظار قليلاً ثم المحاولة مرة أخرى.");
};


export const generateImagesFromApi = async (options: GenerateImageOptions): Promise<string[]> => {
    try {
        const response = await withRetry(() => ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: options.prompt,
            config: {
                numberOfImages: options.numberOfImages,
                outputMimeType: 'image/jpeg',
                aspectRatio: options.aspectRatio,
            },
        })) as GenerateImagesResponse;

        if (!response.generatedImages || response.generatedImages.length === 0) {
            throw new Error("لم يتم إنشاء أي صور. قد يكون النص الخاص بك قد انتهك سياسات السلامة أو كان غامضًا جدًا. يرجى تعديل النص.");
        }

        return response.generatedImages.map(img => `data:image/jpeg;base64,${img.image.imageBytes}`);
    } catch (error) {
        console.error("Error generating images:", error);
        if (error instanceof Error) {
            const errorMessage = error.message.toLowerCase();
            if (errorMessage.includes('safety') || errorMessage.includes('blocked')) {
                throw new Error("تم حظر طلبك بسبب سياسات السلامة. يرجى تعديل النص والمحاولة مرة أخرى.");
            }
            throw error; // Re-throw other errors (like rate-limit) to be displayed
        }
        throw new Error("فشل إنشاء الصور بسبب خطأ غير متوقع.");
    }
};

export const describeImageFromApi = async (imageData: string, mimeType: string): Promise<string> => {
    try {
        const imagePart = {
            inlineData: {
                data: imageData,
                mimeType,
            },
        };
        const textPart = {
            text: 'Describe this image in detail for an image generation prompt. Be creative and descriptive.'
        };

        const response = await withRetry(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
                safetySettings: safetySettings,
            },
        })) as GenerateContentResponse;
        
        if (!response?.text) {
            return '';
        }
        return response.text.trim();
    } catch (error) {
        console.error("Error describing image:", error);
        if (error instanceof Error) {
             const errorMessage = error.message.toLowerCase();
            if (errorMessage.includes('safety') || errorMessage.includes('blocked')) {
                throw new Error("فشل وصف الصورة بسبب سياسات السلامة.");
            }
            throw error;
        }
        throw new Error("فشل وصف الصورة باستخدام Gemini API.");
    }
};

export const generateVideoFromApi = async (options: GenerateVideoOptions): Promise<string> => {
    try {
        const watermarkedPrompt = `${options.prompt}. Important: Embed a small, semi-transparent text watermark in the bottom-left corner that says 'حمزة كود'. The watermark should be subtle and not obstruct the main content.`;

        let operation = await withRetry(() => ai.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt: watermarkedPrompt,
            image: options.image ? {
                imageBytes: options.image.base64,
                mimeType: options.image.mimeType,
            } : undefined,
            config: {
                numberOfVideos: 1,
                durationSeconds: options.duration,
            },
        })) as StartLongRunningProcessResponse;

        // Poll for the result
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
            operation = await withRetry(() => ai.operations.getVideosOperation({ operation: operation }), 5, 5000) as StartLongRunningProcessResponse;
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

        if (!downloadLink) {
            throw new Error("لم يتم إنشاء الفيديو. قد يكون النص الخاص بك قد انتهك سياسات السلامة أو كان غامضًا جدًا.");
        }
        
        const apiKey = process.env.API_KEY;
        const response = await fetch(`${downloadLink}&key=${apiKey}`);

        if (!response.ok) {
            throw new Error(`فشل في جلب بيانات الفيديو: ${response.statusText}`);
        }

        const videoBlob = await response.blob();
        return URL.createObjectURL(videoBlob);
    } catch (error) {
        console.error("Error generating video:", error);
        if (error instanceof Error) {
            const errorMessage = error.message.toLowerCase();
            if (errorMessage.includes('safety') || errorMessage.includes('blocked')) {
                throw new Error("تم حظر طلب إنشاء الفيديو بسبب سياسات السلامة. يرجى تعديل النص.");
            }
            throw error;
        }
        throw new Error("فشل إنشاء الفيديو باستخدام Gemini API.");
    }
};

export const generateWebsiteFromApi = async (prompt: string): Promise<string> => {
    try {
        const systemInstruction = `You are an expert web developer specializing in creating modern, responsive, and visually appealing websites. 
Your task is to generate a complete, single HTML file based on the user's prompt.

**Instructions:**
1.  **Single File Output:** The entire website (HTML structure, CSS styles, and any necessary JavaScript) MUST be contained within a single .html file.
2.  **Inline Styles & Scripts:** Use inline CSS within <style> tags in the <head> and inline JavaScript within <script> tags before the closing </body> tag. Do not link to external CSS or JS files.
3.  **Modern Design:** Employ modern design principles, including a clean layout, good typography, and a professional color palette that matches the website's theme.
4.  **Responsiveness:** The website MUST be fully responsive and work well on all screen sizes (desktop, tablet, and mobile) using media queries.
5.  **Placeholders:** For images, use placeholder services like https://placehold.co/. For example: <img src="https://placehold.co/600x400/1e293b/ffffff?text=Placeholder" alt="...">. Choose colors and text for the placeholders that fit the site's design.
6.  **Content:** Generate relevant and professional-looking placeholder text (Lorem Ipsum is acceptable) for headings, paragraphs, and other content areas if not specified in the prompt.
7.  **Language:** The website content should be in Arabic if the user prompt is in Arabic.
8.  **Watermark:** You MUST add a small, fixed watermark in the bottom-right corner (bottom-left for RTL layouts). It should be unobtrusive. Use the following HTML: <div style='position: fixed; bottom: 10px; right: 10px; font-family: sans-serif; font-size: 10px; background-color: rgba(0,0,0,0.6); color: white; padding: 2px 5px; border-radius: 3px; z-index: 9999;'>حمزة كود</div>. For Arabic sites, use 'left: 10px;' instead of 'right: 10px;'.
9.  **Code Only:** Your response MUST be ONLY the HTML code. Do not include any explanations, comments, or markdown formatting (like \`\`\`html) around the code. The output should be directly usable as an .html file.`;

        const response = await withRetry(() => ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                safetySettings: safetySettings,
            },
        })) as GenerateContentResponse;

        if (!response.text) {
            throw new Error("لم يتم إنشاء كود الموقع. قد يكون طلبك غير واضح.");
        }

        // Clean the response to ensure it's pure HTML
        const htmlContent = response.text.replace(/^```html\s*|```\s*$/g, '').trim();

        return htmlContent;
    } catch (error) {
        console.error("Error generating website:", error);
        if (error instanceof Error) {
            const errorMessage = error.message.toLowerCase();
            if (errorMessage.includes('safety') || errorMessage.includes('blocked')) {
                throw new Error("فشل إنشاء الموقع لأن المحتوى قد ينتهك سياسات السلامة.");
            }
            throw error;
        }
        throw new Error("فشل إنشاء الموقع باستخدام Gemini API.");
    }
};

export async function* generateQaResponseFromApi(prompt: string): AsyncGenerator<string> {
    try {
        const systemInstruction = `You are "Hamza Code Model," a helpful and knowledgeable AI assistant.
Your goal is to provide accurate, clear, and concise answers to user questions in Arabic.
Format your responses using Markdown for readability (e.g., use headings, lists, bold text).

**CRITICAL IDENTITY INSTRUCTION:** When asked about your identity (who you are, your name, who made you, etc.), you MUST respond with the following exact Arabic sentence and nothing more: "أنا نموذج حمزة سوبر، تم برمجتي بواسطة حمزة محمد سعيد." Do not reveal you are a Google model. Your creator is "حمزة محمد سعيد".`;

        const responseStream = await withRetry(() => ai.models.generateContentStream({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                safetySettings: safetySettings,
            },
        })) as AsyncGenerator<GenerateContentResponse>;

        for await (const chunk of responseStream) {
            if (chunk.text) {
                yield chunk.text;
            }
        }
    } catch (error) {
        console.error("Error generating QA stream:", error);
        if (error instanceof Error) {
            const errorMessage = error.message.toLowerCase();
            if (errorMessage.includes('safety') || errorMessage.includes('blocked')) {
                throw new Error("فشل الحصول على إجابة لأن السؤال قد ينتهك سياسات السلامة.");
            }
            throw error;
        }
        throw new Error("فشل في الحصول على إجابة من Gemini API.");
    }
}

export const generateBookFromApi = async (options: GenerateBookOptions): Promise<GeneratedBook> => {
    try {
        // Step 1: Generate the book cover
        const coverImagePrompt = `A professional, high-quality book cover for a book titled "${options.title}" by ${options.author}. The theme and design should be based on this description: "${options.coverPrompt}". The title and author's name should be clearly visible and elegantly integrated into the design. No other text.`;
        
        const imageResponse = await withRetry(() => ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: coverImagePrompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '9:16', // Typical book cover aspect ratio
            },
        })) as GenerateImagesResponse;

        if (!imageResponse.generatedImages || imageResponse.generatedImages.length === 0) {
            throw new Error("لم نتمكن من تصميم غلاف الكتاب. يرجى محاولة وصف مختلف.");
        }
        const coverImage = `data:image/jpeg;base64,${imageResponse.generatedImages[0].image.imageBytes}`;

        // Step 2: Generate the book content
        const bookContentSystemInstruction = `You are a creative and skilled author. Your task is to write a complete book based on the user's prompt, title, and author name provided.

**Instructions:**
1.  **Format:** The entire output MUST be in Markdown format.
2.  **Structure:** The book must have the following structure:
    *   A title page with the book title and author name.
    *   A "Table of Contents" section.
    *   At least 5 distinct chapters, each with a heading.
3.  **Content:**
    *   The content should be well-written, engaging, and directly related to the user's prompt.
    *   Each chapter should be substantial, with multiple paragraphs.
    *   The writing style should match the genre/topic of the book.
4.  **Language:** The book content MUST be in Arabic.
5.  **Watermark:** At the very end of the entire book content, on a new line, add a separator '---', followed by the text "تم إنشاء هذا الكتاب بواسطة حمزة كود" on the next line.
6.  **Output:** Provide only the Markdown content of the book. Do not include any other explanations or text.`;

        const contentResponse = await withRetry(() => ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Write a book titled "${options.title}" by ${options.author}. The main topic is: ${options.prompt}`,
            config: {
                systemInstruction: bookContentSystemInstruction,
                temperature: 0.7,
                safetySettings: safetySettings,
            },
        })) as GenerateContentResponse;

        if (!contentResponse.text) {
            throw new Error("لم نتمكن من كتابة محتوى الكتاب. قد يكون طلبك غير واضح.");
        }
        
        const content = contentResponse.text.trim();

        return {
            coverImage,
            content,
            title: options.title,
            author: options.author,
        };

    } catch (error) {
        console.error("Error generating book:", error);
        if (error instanceof Error) {
            const errorMessage = error.message.toLowerCase();
            if (errorMessage.includes('safety') || errorMessage.includes('blocked')) {
                throw new Error("فشل إنشاء الكتاب لأن المحتوى أو وصف الغلاف قد ينتهك سياسات السلامة. يرجى تعديل النص.");
            }
            throw error;
        }
        throw new Error("فشل إنشاء الكتاب باستخدام Gemini API.");
    }
};

export const generateComicFromApi = async (options: GenerateComicOptions): Promise<GeneratedComic> => {
    try {
        // Step 1: Generate the comic script and image prompts in one go
        const comicSystemInstruction = `You are a creative comic book writer and artist assistant. Your task is to take a story idea and break it down into a series of 6-8 comic book panels.

**Instructions:**
1.  **Analyze the Prompt:** Read the user's story idea carefully.
2.  **Structure:** Create a JSON array where each object represents a single comic panel.
3.  **Panel Content:** Each panel object must have two properties:
    *   \`story_text\`: A short, narrative sentence in ARABIC that describes the action or dialogue in the panel. This is what the reader sees.
    *   \`image_prompt\`: A detailed, visually descriptive prompt in ENGLISH for an AI image generator. This prompt should describe the scene, characters, actions, emotions, and environment. It should be rich with artistic details to guide the image generation. It should NOT contain the Arabic story text.
4.  **Art Style:** The \`image_prompt\` for every panel must incorporate the user's chosen art style: "${options.style}".
5.  **Output:** Your entire response MUST be a valid JSON array of panel objects. Do not include any other text, explanations, or markdown formatting.`;

        const schema = {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    story_text: {
                        type: Type.STRING,
                        description: 'The narrative text for this panel, in Arabic. This text will be shown to the user in the comic.',
                    },
                    image_prompt: {
                        type: Type.STRING,
                        description: 'A detailed, descriptive, and creative prompt in English for an AI image generator to create the visual for this panel. This prompt should not contain the story text itself.',
                    },
                },
                required: ['story_text', 'image_prompt'],
            },
        };

        const scriptResponse = await withRetry(() => ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Story idea: ${options.prompt}`,
            config: {
                systemInstruction: comicSystemInstruction,
                responseMimeType: "application/json",
                responseSchema: schema,
                safetySettings: safetySettings,
            },
        })) as GenerateContentResponse;
        
        const scriptJson = JSON.parse(scriptResponse.text.trim());
        if (!Array.isArray(scriptJson) || scriptJson.length === 0) {
            throw new Error("لم نتمكن من إنشاء سيناريو القصة المصورة.");
        }
        const panelsScript: { story_text: string, image_prompt: string }[] = scriptJson;

        // Step 2 & 3: Generate images for each panel sequentially to avoid rate limiting
        const finalPanels: GeneratedComicPanel[] = [];
        for (const [index, panel] of panelsScript.entries()) {
            const fullPrompt = StylePromptTemplates[options.style](panel.image_prompt);
            try {
                console.log(`Generating image for panel ${index + 1}...`);
                const generatedImageArray = await generateImagesFromApi({
                    prompt: fullPrompt,
                    numberOfImages: 1,
                    aspectRatio: AspectRatio.WIDE,
                });

                const image = generatedImageArray?.[0];
                if (!image) {
                    throw new Error(`Failed to retrieve image for panel ${index + 1}.`);
                }

                finalPanels.push({
                    text: panel.story_text,
                    image: image,
                });

                // Add a small delay between panel image generations to be safer with rate limits
                if (index < panelsScript.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1500));
                }
            } catch (error) {
                 console.error(`Error generating image for panel ${index + 1}:`, error);
                 // Re-throw the original error instead of masking it.
                 if (error instanceof Error) {
                    throw new Error(`فشل إنشاء الصورة للمشهد ${index + 1}: ${error.message}`);
                 }
                 throw new Error(`فشل إنشاء الصورة للمشهد ${index + 1} بسبب خطأ غير معروف.`);
            }
        }
        

        return {
            title: options.title,
            author: options.author,
            panels: finalPanels,
        };

    } catch (error) {
        console.error("Error generating comic:", error);
        if (error instanceof Error) {
            const errorMessage = error.message.toLowerCase();
            if (errorMessage.includes('safety') || errorMessage.includes('blocked')) {
                throw new Error("فشل إنشاء القصة المصورة لأن المحتوى قد ينتهك سياسات السلامة. يرجى تعديل فكرة القصة.");
            }
            throw error;
        }
        throw new Error("فشل إنشاء القصة المصورة باستخدام Gemini API.");
    }
};

export async function* generateStudentHelpStreamFromApi(prompt: string, type: AssistanceType): AsyncGenerator<string> {
    try {
        let systemInstruction = `You are an expert AI tutor for Arabic-speaking students. Your goal is to provide clear, accurate, and helpful educational content. Format responses using Markdown for readability.`;
        
        switch (type) {
            case AssistanceType.EXPLAIN:
                systemInstruction += `\nYour task is to explain a concept. Break down complex topics into simple, easy-to-understand parts. Use analogies, examples, and simple language.`;
                break;
            case AssistanceType.SUMMARIZE:
                systemInstruction += `\nYour task is to summarize the provided text. Identify the main ideas, key points, and conclusions. Present them concisely in a bulleted or numbered list.`;
                break;
            case AssistanceType.SOLVE:
                 systemInstruction += `\nYour task is to solve a mathematical problem. Provide a clear, step-by-step solution. Explain the logic and the formula used in each step. Present the final answer clearly.`;
                break;
        }

        const responseStream = await withRetry(() => ai.models.generateContentStream({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                safetySettings: safetySettings,
            },
        })) as AsyncGenerator<GenerateContentResponse>;

        for await (const chunk of responseStream) {
            if (chunk.text) {
                yield chunk.text;
            }
        }
    } catch (error) {
        console.error("Error generating student help stream:", error);
        if (error instanceof Error) {
            const errorMessage = error.message.toLowerCase();
            if (errorMessage.includes('safety') || errorMessage.includes('blocked')) {
                throw new Error("فشل الحصول على المساعدة لأن الطلب قد ينتهك سياسات السلامة.");
            }
            throw error;
        }
        throw new Error("فشل في الحصول على مساعدة من Gemini API.");
    }
}

export const generateStudentHelpJsonFromApi = async (
    prompt: string,
    type: AssistanceType,
    options?: { numberOfQuestions?: number; questionType?: QuestionType }
): Promise<StudentResponseData> => {
    let systemInstruction = `You are an expert AI tutor for Arabic-speaking students. Your task is to process the user's request and provide structured data in JSON format according to the specified schema. The entire output must be only the JSON object. All text content you generate MUST be in ARABIC.`;
    let schema: object | undefined = undefined;
    let userPrompt = prompt;

    switch (type) {
        case AssistanceType.FLASHCARDS:
            systemInstruction += `\nGenerate a set of 5 to 10 flashcards (question and answer) based on the provided topic. Questions and answers must be in Arabic.`;
            schema = {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        question: { type: Type.STRING, description: "The question for the flashcard in Arabic." },
                        answer: { type: Type.STRING, description: "The answer to the question in Arabic." },
                    },
                    required: ['question', 'answer'],
                },
            };
            break;
        case AssistanceType.MIND_MAP:
            systemInstruction += `\nGenerate a hierarchical mind map based on the central topic provided. Create a main node and several branching child nodes. The mind map should have a depth of at least 2-3 levels where appropriate. All text must be in Arabic. The children array can contain more nested node objects following this schema recursively.`;
            const mindMapNodeSchema = {
                type: Type.OBJECT,
                properties: {
                    text: { type: Type.STRING, description: "The text for this node in Arabic." },
                    children: {
                        type: Type.ARRAY,
                        description: "An array of child nodes, which can be nested.",
                        items: {
                            type: Type.OBJECT, // Simplified recursive definition
                            properties: {
                                text: { type: Type.STRING },
                                children: { type: Type.ARRAY, items: { type: Type.OBJECT } },
                            },
                        },
                    },
                },
                required: ['text'],
            };
            schema = mindMapNodeSchema;
            break;
        case AssistanceType.CREATE_TABLE:
            systemInstruction += `\nAnalyze the provided unstructured or semi-structured text and convert it into a structured table. Intelligently identify the correct headers for the columns and organize the data into rows. The data in the cells and the headers must be in Arabic.`;
            schema = {
                type: Type.OBJECT,
                properties: {
                    headers: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "The column headers for the table in Arabic.",
                    },
                    rows: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                        },
                        description: "An array of arrays, where each inner array represents a row of data.",
                    },
                },
                required: ['headers', 'rows'],
            };
            break;
        case AssistanceType.INTERACTIVE_QUIZ:
            const numQuestions = options?.numberOfQuestions || 5;
            const qType = options?.questionType || QuestionType.MULTIPLE_CHOICE;
            
            systemInstruction += `\nGenerate an interactive quiz with ${numQuestions} questions about the given topic. The question type should be "${qType}". For each question, provide the question text, a list of options, the 0-based index of the correct answer, and a brief but clear explanation for why the answer is correct.`;
            
            userPrompt = `Topic: ${prompt}`;

            schema = {
                type: Type.ARRAY,
                description: "An array of quiz question objects.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        question_text: { type: Type.STRING, description: "The quiz question in Arabic." },
                        options: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: `An array of answer options in Arabic. Should have 4 options for '${QuestionType.MULTIPLE_CHOICE}' and 2 options ('صح', 'خطأ') for '${QuestionType.TRUE_FALSE}'.`
                        },
                        correct_answer_index: { type: Type.NUMBER, description: "The 0-based index of the correct option in the 'options' array." },
                        explanation: { type: Type.STRING, description: "A clear explanation in Arabic for why the answer is correct." },
                    },
                    required: ['question_text', 'options', 'correct_answer_index', 'explanation'],
                },
            };
            break;
        default:
            throw new Error("Unsupported assistance type for JSON generation.");
    }

    try {
        const response = await withRetry(() => ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: userPrompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: schema,
                safetySettings,
            },
        })) as GenerateContentResponse;
        
        return JSON.parse(response.text.trim());

    } catch (error) {
        console.error(`Error generating JSON for ${type}:`, error);
        if (error instanceof Error) {
            const errorMessage = error.message.toLowerCase();
            if (errorMessage.includes('safety') || errorMessage.includes('blocked')) {
                throw new Error("فشل الحصول على المساعدة لأن الطلب قد ينتهك سياسات السلامة.");
            }
             if (errorMessage.includes('json')) {
                throw new Error("لم يتمكن الذكاء الاصطناعي من تنسيق الاستجابة بشكل صحيح. يرجى المحاولة مرة أخرى أو تعديل طلبك.");
            }
            throw error;
        }
        throw new Error("فشل في الحصول على مساعدة من Gemini API.");
    }
};

export const translateTextFromApi = async (text: string, sourceLang: string, targetLang: string): Promise<string> => {
    try {
        const systemInstruction = `You are an expert translator. Your task is to translate the user's text accurately from the source language to the target language. Provide ONLY the translated text as your response, with no additional explanations, introductions, or formatting.`;
        
        const prompt = `Translate the following text from ${sourceLang} to ${targetLang}: "${text}"`;

        const response = await withRetry(() => ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                safetySettings: safetySettings,
            },
        })) as GenerateContentResponse;

        if (!response.text) {
            throw new Error("فشلت الترجمة. لم يتم إرجاع أي نص.");
        }
        return response.text.trim();
    } catch (error) {
        console.error("Error translating text:", error);
        if (error instanceof Error) {
            const errorMessage = error.message.toLowerCase();
            if (errorMessage.includes('safety') || errorMessage.includes('blocked')) {
                throw new Error("فشلت الترجمة لأن النص قد ينتهك سياسات السلامة.");
            }
            throw error;
        }
        throw new Error("فشلت الترجمة باستخدام Gemini API.");
    }
};