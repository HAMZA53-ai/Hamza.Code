import React from 'react';
import { IconCode } from './Icon';
import { LoadingSpinner } from './LoadingSpinner';

interface WebsiteGeneratorFormProps {
    prompt: string;
    setPrompt: (prompt: string) => void;
    isGenerating: boolean;
    onGenerate: () => void;
}

export const WebsiteGeneratorForm: React.FC<WebsiteGeneratorFormProps> = ({
    prompt, setPrompt, isGenerating, onGenerate,
}) => {
    return (
        <div className="bg-gray-800 p-6 rounded-xl shadow-2xl space-y-6 sticky top-24">
            <h2 className="text-xl font-semibold text-white">إعدادات إنشاء الموقع</h2>
            
            <div className="border-t border-gray-700"></div>

            <div className="space-y-2">
                <label htmlFor="prompt" className="block font-medium text-gray-300">وصف الموقع</label>
                <textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="مثال: موقع تعريفي لشركة استشارات تقنية، بألوان زرقاء ورمادية، ويحتوي على قسم للخدمات وفريق العمل."
                    rows={8}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                    disabled={isGenerating}
                />
                 <p className="text-xs text-gray-500 text-center px-2 pt-1">
                    كلما كان الوصف أكثر تفصيلاً، كانت النتيجة أفضل.
                </p>
            </div>
            
            <div className="border-t border-gray-700"></div>

            <button
                onClick={onGenerate}
                disabled={isGenerating || !prompt}
                className="w-full flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-lg text-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity shadow-lg"
            >
                {isGenerating ? (
                    <><LoadingSpinner className="w-6 h-6" /><span>جاري إنشاء الموقع...</span></>
                ) : (
                    <><IconCode className="w-6 h-6" /><span>إنشاء الموقع</span></>
                )}
            </button>
        </div>
    );
};
