import React, { useRef } from 'react';
import { AspectRatio, ImageStyle } from '../constants';
import { IconPhotoUp, IconUpload, IconX } from './Icon';
import { LoadingSpinner } from './LoadingSpinner';

interface ImageGeneratorFormProps {
    prompt: string;
    setPrompt: (prompt: string) => void;
    numberOfImages: number;
    setNumberOfImages: (n: number) => void;
    aspectRatio: AspectRatio;
    setAspectRatio: (ratio: AspectRatio) => void;
    style: ImageStyle;
    setStyle: (style: ImageStyle) => void;
    isGenerating: boolean;
    onGenerate: () => void;
    uploadedImage: string | null;
    isDescribing: boolean;
    onImageUpload: (file: File) => void;
    onClearImage: () => void;
}

export const ImageGeneratorForm: React.FC<ImageGeneratorFormProps> = ({
    prompt, setPrompt, numberOfImages, setNumberOfImages,
    aspectRatio, setAspectRatio, style, setStyle, isGenerating, onGenerate,
    uploadedImage, isDescribing, onImageUpload, onClearImage,
}) => {
    const inspirationFileInputRef = useRef<HTMLInputElement>(null);
    const isBusy = isGenerating || isDescribing;

    const handleInspirationFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onImageUpload(e.target.files[0]);
        }
    };

    const handleInspirationUploadClick = () => {
        inspirationFileInputRef.current?.click();
    };

    return (
        <div className="bg-gray-800 p-6 rounded-xl shadow-2xl space-y-6 sticky top-24">
            <h2 className="text-xl font-semibold text-white">إعدادات التوليد</h2>
            
            <div className="border-t border-gray-700"></div>

            <div className="space-y-2">
                <label className="block font-medium text-gray-300">استلهام من صورة</label>
                <input type="file" ref={inspirationFileInputRef} onChange={handleInspirationFileChange} className="hidden" accept="image/*" disabled={isBusy} />
                {uploadedImage ? (
                    <div className="relative group">
                        <img src={uploadedImage} alt="Uploaded preview" className="w-full rounded-lg object-cover" />
                         {isDescribing && (
                            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center rounded-lg">
                                <LoadingSpinner />
                                <span className="text-white mt-2">جاري التحليل...</span>
                            </div>
                        )}
                        {!isDescribing && (
                             <button onClick={onClearImage} className="absolute top-2 right-2 rtl:right-auto rtl:left-2 bg-black/50 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/75" title="إزالة الصورة" disabled={isBusy}>
                                <IconX className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                ) : (
                    <button onClick={handleInspirationUploadClick} disabled={isBusy} className="w-full flex flex-col items-center justify-center gap-2 p-6 bg-gray-700/50 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:bg-gray-700 hover:border-gray-500 transition disabled:opacity-50 disabled:cursor-not-allowed">
                        <IconUpload className="w-8 h-8" />
                        <span>انقر للرفع</span>
                    </button>
                )}
            </div>

            <div className="border-t border-gray-700"></div>

            <div className="space-y-2">
                <label htmlFor="prompt" className="block font-medium text-gray-300">النص (Prompt)</label>
                <textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="مثال: قط يرتدي قبعة ساحر ويقرأ كتابًا قديمًا"
                    rows={4}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                    disabled={isBusy}
                />
                <p className="text-xs text-gray-500 text-center px-2 pt-1">
                    يرجى مراعاة سياسات الاستخدام وتجنب المحتوى غير اللائق.
                </p>
            </div>

            <div className="space-y-2">
                <label htmlFor="style" className="block font-medium text-gray-300">النمط الفني</label>
                <select
                    id="style"
                    value={style}
                    onChange={(e) => setStyle(e.target.value as ImageStyle)}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                    disabled={isBusy}
                >
                    {Object.values(ImageStyle).map((s) => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </div>

            <div className="space-y-2">
                <label htmlFor="aspectRatio" className="block font-medium text-gray-300">نسبة العرض إلى الارتفاع</label>
                <select
                    id="aspectRatio"
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                    disabled={isBusy}
                >
                    {Object.values(AspectRatio).map((r) => (
                        <option key={r} value={r}>{r}</option>
                    ))}
                </select>
            </div>

            <div className="space-y-2">
                <label htmlFor="numberOfImages" className="block font-medium text-gray-300">عدد الصور (1-4)</label>
                <input
                    type="range"
                    id="numberOfImages"
                    min="1"
                    max="4"
                    step="1"
                    value={numberOfImages}
                    onChange={(e) => setNumberOfImages(Number(e.target.value))}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    disabled={isBusy}
                />
                <div className="text-center text-gray-400">{numberOfImages}</div>
            </div>
            
            <div className="border-t border-gray-700"></div>

            <button
                onClick={onGenerate}
                disabled={isBusy || !prompt}
                className="w-full flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-lg text-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity shadow-lg"
            >
                {isGenerating ? (
                    <><LoadingSpinner className="w-6 h-6" /><span>جاري التوليد...</span></>
                ) : (
                    <><IconPhotoUp className="w-6 h-6" /><span>توليد الصور</span></>
                )}
            </button>
        </div>
    );
};