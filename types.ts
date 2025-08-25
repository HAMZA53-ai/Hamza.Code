
import type { AspectRatio, ImageStyle } from './constants';

export interface GenerateImageOptions {
  prompt: string;
  numberOfImages: number;
  aspectRatio: AspectRatio;
}

export interface GenerateVideoOptions {
    prompt: string;
    duration: number;
    image?: {
        base64: string;
        mimeType: string;
    };
}

export interface GenerateBookOptions {
  prompt: string;
  title: string;
  author: string;
  coverPrompt: string;
}

export interface GeneratedBook {
  coverImage: string; // base64 string
  content: string; // Markdown content
  title: string;
  author: string;
}

export interface GenerateComicOptions {
  prompt: string;
  title: string;
  author: string;
  style: ImageStyle;
}

export interface GeneratedComicPanel {
  text: string;
  image: string; // base64 string
}

export interface GeneratedComic {
  title: string;
  author: string;
  panels: GeneratedComicPanel[];
}


export interface User {
    name: string;
    email: string;
    picture: string;
}

// --- Student Assistant Types ---
export interface Flashcard {
  question: string;
  answer: string;
}

export interface MindMapNode {
  text: string;
  children?: MindMapNode[];
}

export interface TableData {
  headers: string[];
  rows: string[][];
}

export interface QuizQuestion {
  question_text: string;
  options: string[];
  correct_answer_index: number;
  explanation: string;
}

export type InteractiveQuiz = QuizQuestion[];

export type StudentResponseData = string | Flashcard[] | MindMapNode | TableData | InteractiveQuiz;

// --- Translator Types ---
export interface Language {
  code: string;
  name: string;
}
