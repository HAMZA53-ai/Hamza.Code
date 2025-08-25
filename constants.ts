
import type { Language } from './types';

export enum AspectRatio {
    SQUARE = '1:1',
    LANDSCAPE = '16:9',
    PORTRAIT = '9:16',
    WIDE = '4:3',
    TALL = '3:4',
}

export enum ImageStyle {
    NONE = 'بدون',
    PHOTOGRAPHIC = 'فوتوغرافي',
    ANIME = 'أنمي',
    FANTASY = 'فنتازيا',
    CYBERPUNK = 'سايبربانك',
    MINIMALIST = 'تبسيطي',
    VIBRANT = 'حيوي',
    WATERCOLOR = 'ألوان مائية',
    PIXEL_ART = 'فن البكسل',
}

export const StylePromptTemplates: Record<ImageStyle, (prompt: string) => string> = {
    [ImageStyle.NONE]: (prompt) => prompt,
    [ImageStyle.PHOTOGRAPHIC]: (prompt) => `A photorealistic, 4k, professional photograph of: ${prompt}, with cinematic lighting.`,
    [ImageStyle.ANIME]: (prompt) => `An anime style key visual of: ${prompt}. Vibrant, detailed illustration in the style of Studio Ghibli.`,
    [ImageStyle.FANTASY]: (prompt) => `Epic fantasy art depicting: ${prompt}. Cinematic, detailed, with a magical and mystical atmosphere.`,
    [ImageStyle.CYBERPUNK]: (prompt) => `A cyberpunk style image of: ${prompt}. Featuring neon lights and a futuristic, high-tech city aesthetic.`,
    [ImageStyle.MINIMALIST]: (prompt) => `A minimalist, modern design of: ${prompt}, featuring clean lines and simple, elegant neutral colors.`,
    [ImageStyle.VIBRANT]: (prompt) => `A vibrant and colorful image of: ${prompt}, featuring vivid, dynamic, and abstract bold patterns.`,
    [ImageStyle.WATERCOLOR]: (prompt) => `A watercolor painting of: ${prompt}, featuring soft, blended colors, artistic brush strokes, and a paper texture.`,
    [ImageStyle.PIXEL_ART]: (prompt) => `8-bit or 16-bit pixel art of: ${prompt}, in a retro video game style.`,
};

export enum VideoStyle {
    NONE = 'بدون',
    CINEMATIC = 'سينمائي',
    TIMELAPSE = 'فاصل زمني',
    STOP_MOTION = 'إيقاف الحركة',
    ANIMATED = 'رسوم متحركة',
    VIVID = 'حيوي',
    DREAMLIKE = 'حالم',
}

export const VideoStylePromptTemplates: Record<VideoStyle, (prompt: string, aspectRatio: AspectRatio) => string> = {
    [VideoStyle.NONE]: (prompt, aspectRatio) => `${prompt}, in aspect ratio ${aspectRatio}.`,
    [VideoStyle.CINEMATIC]: (prompt, aspectRatio) => `A cinematic video of: ${prompt}. High definition, dramatic lighting, epic camera movements, aspect ratio ${aspectRatio}.`,
    [VideoStyle.TIMELAPSE]: (prompt, aspectRatio) => `A timelapse video of: ${prompt}. Showing the passage of time, with fast-moving clouds or crowds, aspect ratio ${aspectRatio}.`,
    [VideoStyle.STOP_MOTION]: (prompt, aspectRatio) => `A stop-motion animation of: ${prompt}. Claymation style, charmingly jerky movements, tangible textures, aspect ratio ${aspectRatio}.`,
    [VideoStyle.ANIMATED]: (prompt, aspectRatio) => `A 2D animated cartoon video of: ${prompt}. Vibrant colors, clean lines, expressive characters, aspect ratio ${aspectRatio}.`,
    [VideoStyle.VIVID]: (prompt, aspectRatio) => `A vivid, hyper-realistic video of: ${prompt}. Saturated colors, sharp focus, dynamic motion, aspect ratio ${aspectRatio}.`,
    [VideoStyle.DREAMLIKE]: (prompt, aspectRatio) => `A dreamlike, surreal video of: ${prompt}. Ethereal, flowing visuals, soft focus, pastel color palette, aspect ratio ${aspectRatio}.`,
};

export enum AssistanceType {
    EXPLAIN = 'شرح مفهوم',
    SUMMARIZE = 'تلخيص نص',
    SOLVE = 'حل مسألة رياضية',
    INTERACTIVE_QUIZ = 'إنشاء اختبار تفاعلي',
    FLASHCARDS = 'إنشاء بطاقات تعليمية',
    MIND_MAP = 'إنشاء خريطة ذهنية',
    CREATE_TABLE = 'تحويل إلى جدول',
}

export enum QuestionType {
    MULTIPLE_CHOICE = 'اختيار من متعدد',
    TRUE_FALSE = 'صح / خطأ',
}

export const SUPPORTED_LANGUAGES: Language[] = [
    { code: 'ar', name: 'العربية' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'it', name: 'Italiano' },
    { code: 'pt', name: 'Português' },
    { code: 'ru', name: 'Русский' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' },
    { code: 'zh', name: '中文' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'tr', name: 'Türkçe' },
    { code: 'nl', name: 'Nederlands' },
    { code: 'sv', name: 'Svenska' },
];
