import React, { useEffect } from 'react';
import { IconLayoutGrid } from './Icon';
import { LoadingSpinner } from './LoadingSpinner';
import { ImageStyle } from '../constants';

interface ComicGeneratorFormProps {
    prompt: string;
    setPrompt: (prompt: string) => void;
    title: string;
    setTitle: (title: string) => void;
    author: string;
    setAuthor: (author: string) => void;
    style: ImageStyle;
    setStyle: (style: ImageStyle) => void;
    isGenerating: boolean;
    onGenerate: () => void;
    userName?: string;
}

export const ComicGeneratorForm: React.FC<ComicGeneratorFormProps> = ({
    prompt, setPrompt, title, setTitle, author, setAuthor, style, setStyle, isGenerating, onGenerate, userName
}) => {
    
    useEffect(() => {
        if (userName && !author) {
            setAuthor(userName);
        }
    }, [userName, author, setAuthor]);

    return (
        <div className="bg-gray-800 p-6 rounded-xl shadow-2xl space-y-6 sticky top-24">
            <h2 className="text-xl font-semibold text-white">إعدادات القصة المصورة</h2>
            
            <div className="border-t border-gray-700"></div>

            <div className="space-y-4">
                 <div>
                    <label htmlFor="comicTitle" className="block font-medium text-gray-300 mb-2">عنوان القصة</label>
                    <input
                        type="text"
                        id="comicTitle"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="مثال: الفارس الأخير"
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                        disabled={isGenerating}
                    />
                </div>

                <div>
                    <label htmlFor="authorName" className="block font-medium text-gray-300 mb-2">اسم المؤلف</label>
                    <input
                        type="text"
                        id="authorName"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder="مثال: حمزة محمد سعيد"
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                        disabled={isGenerating}
                    />
                </div>

                 <div>
                    <label htmlFor="style" className="block font-medium text-gray-300 mb-2">النمط الفني</label>
                    <select
                        id="style"
                        value={style}
                        onChange={(e) => setStyle(e.target.value as ImageStyle)}
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                        disabled={isGenerating}
                    >
                        {Object.values(ImageStyle).map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="comicPrompt" className="block font-medium text-gray-300 mb-2">فكرة القصة</label>
                    <textarea
                        id="comicPrompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="مثال: فارس شجاع يقاتل تنيناً لإنقاذ أميرة."
                        rows={5}
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                        disabled={isGenerating}
                    />
                </div>
            </div>
            
            <div className="border-t border-gray-700"></div>

            <button
                onClick={onGenerate}
                disabled={isGenerating || !prompt || !title || !author}
                className="w-full flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-lg text-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity shadow-lg"
            >
                {isGenerating ? (
                    <><LoadingSpinner className="w-6 h-6" /><span>جاري رسم القصة...</span></>
                ) : (
                    <><IconLayoutGrid className="w-6 h-6" /><span>إنشاء القصة</span></>
                )}
            </button>
        </div>
    );
};
