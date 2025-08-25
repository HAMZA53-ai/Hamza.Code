
import React, { useEffect } from 'react';
import { IconBook } from './Icon';
import { LoadingSpinner } from './LoadingSpinner';

interface BookGeneratorFormProps {
    prompt: string;
    setPrompt: (prompt: string) => void;
    title: string;
    setTitle: (title: string) => void;
    author: string;
    setAuthor: (author: string) => void;
    coverPrompt: string;
    setCoverPrompt: (coverPrompt: string) => void;
    isGenerating: boolean;
    onGenerate: () => void;
    userName?: string;
}

export const BookGeneratorForm: React.FC<BookGeneratorFormProps> = ({
    prompt, setPrompt, title, setTitle, author, setAuthor, coverPrompt, setCoverPrompt, isGenerating, onGenerate, userName
}) => {
    
    useEffect(() => {
        if (userName && !author) {
            setAuthor(userName);
        }
    }, [userName, author, setAuthor]);

    return (
        <div className="bg-gray-800 p-6 rounded-xl shadow-2xl space-y-6 sticky top-24">
            <h2 className="text-xl font-semibold text-white">إعدادات إنشاء الكتاب</h2>
            
            <div className="border-t border-gray-700"></div>

            <div className="space-y-4">
                 <div>
                    <label htmlFor="bookTitle" className="block font-medium text-gray-300 mb-2">عنوان الكتاب</label>
                    <input
                        type="text"
                        id="bookTitle"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="مثال: مغامرات في وادي السيليكون"
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
                    <label htmlFor="coverPrompt" className="block font-medium text-gray-300 mb-2">وصف تصميم الغلاف</label>
                    <textarea
                        id="coverPrompt"
                        value={coverPrompt}
                        onChange={(e) => setCoverPrompt(e.target.value)}
                        placeholder="مثال: تصميم بسيط وأنيق به صورة ظلية لمبرمج ينظر إلى مدينة مستقبلية."
                        rows={3}
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                        disabled={isGenerating}
                    />
                </div>

                <div>
                    <label htmlFor="bookPrompt" className="block font-medium text-gray-300 mb-2">موضوع الكتاب</label>
                    <textarea
                        id="bookPrompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="مثال: كتاب عن تاريخ تطور الذكاء الاصطناعي وأثره على مستقبل البشرية."
                        rows={5}
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                        disabled={isGenerating}
                    />
                </div>
            </div>
            
            <div className="border-t border-gray-700"></div>

            <button
                onClick={onGenerate}
                disabled={isGenerating || !prompt || !title || !author || !coverPrompt}
                className="w-full flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-lg text-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity shadow-lg"
            >
                {isGenerating ? (
                    <><LoadingSpinner className="w-6 h-6" /><span>جاري تأليف الكتاب...</span></>
                ) : (
                    <><IconBook className="w-6 h-6" /><span>إنشاء الكتاب</span></>
                )}
            </button>
        </div>
    );
};