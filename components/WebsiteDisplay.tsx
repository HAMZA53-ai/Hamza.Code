
import React, { useState } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { IconCode, IconAlertTriangle, IconExternalLink, IconCloudUpload } from './Icon';
import { Modal } from './Modal';

interface WebsiteDisplayProps {
    htmlContent: string | null;
    isLoading: boolean;
    error: string | null;
}

const EmptyState: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 bg-gray-800/50 p-8 rounded-xl">
        <IconCode className="w-24 h-24 mb-4 text-gray-600" />
        <h3 className="text-2xl font-semibold text-gray-400">معاينة الموقع</h3>
        <p className="mt-2 max-w-sm">
            سيتم عرض الموقع الذي تم إنشاؤه هنا. صف الموقع الذي تريده في اللوحة اليمنى واضغط على "إنشاء الموقع".
        </p>
    </div>
);

const LoadingState: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 bg-gray-800/50 p-8 rounded-xl">
        <LoadingSpinner className="w-16 h-16 mb-6" />
        <h3 className="text-2xl font-semibold text-white animate-pulse">جاري بناء موقعك...</h3>
        <p className="mt-2">يقوم الذكاء الاصطناعي بكتابة الكود الآن، قد يستغرق الأمر لحظات.</p>
    </div>
);

const ErrorState: React.FC<{ message: string }> = ({ message }) => (
    <div className="flex flex-col items-center justify-center h-full text-center text-red-400 bg-red-900/20 border border-red-500 p-8 rounded-xl">
        <IconAlertTriangle className="w-16 h-16 mb-4" />
        <h3 className="text-2xl font-semibold text-red-300">حدث خطأ</h3>
        <p className="mt-2">{message}</p>
    </div>
);

export const WebsiteDisplay: React.FC<WebsiteDisplayProps> = ({ htmlContent, isLoading, error }) => {
    const [copyButtonText, setCopyButtonText] = useState('نسخ الكود');
    const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

    const handleDownload = () => {
        if (!htmlContent) return;
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'website.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleCopy = () => {
        if (!htmlContent) return;
        navigator.clipboard.writeText(htmlContent).then(() => {
            setCopyButtonText('تم النسخ!');
            setTimeout(() => setCopyButtonText('نسخ الكود'), 2000);
        });
    };
    
    const handlePreview = () => {
        if (!htmlContent) return;
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    };
    
    const handlePublish = () => {
        if (!htmlContent) return;

        const data = {
            title: "Generated Website by Hamza Code",
            html: htmlContent,
            editors: "100", // HTML visible, CSS and JS panels hidden
        };

        const form = document.createElement('form');
        form.action = 'https://codepen.io/pen/define';
        form.method = 'POST';
        form.target = '_blank';

        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'data';
        input.value = JSON.stringify(data);

        form.appendChild(input);
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
        setIsPublishModalOpen(false);
    };


    const renderContent = () => {
        if (isLoading) {
            return <LoadingState />;
        }
        if (error) {
            return <ErrorState message={error} />;
        }
        if (!htmlContent) {
            return <EmptyState />;
        }
        return (
            <>
                <div className="w-full h-full flex flex-col bg-gray-800/50 rounded-xl overflow-hidden">
                    <div className="flex-shrink-0 bg-gray-800 p-2 flex items-center justify-end gap-2 border-b border-gray-700 flex-wrap">
                        <button
                            onClick={() => setIsPublishModalOpen(true)}
                            className="px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-md hover:bg-purple-500 transition flex items-center gap-2"
                        >
                            <IconCloudUpload className="w-4 h-4" />
                            <span>نشر ومشاركة مجاناً</span>
                        </button>
                        <button
                            onClick={handlePreview}
                            className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-md hover:bg-green-500 transition flex items-center gap-2"
                        >
                            <IconExternalLink className="w-4 h-4" />
                            <span>معاينة في المتصفح</span>
                        </button>
                        <button
                            onClick={handleCopy}
                            className="px-4 py-2 bg-gray-700 text-white text-sm font-semibold rounded-md hover:bg-gray-600 transition"
                        >
                            {copyButtonText}
                        </button>
                        <button
                            onClick={handleDownload}
                            className="px-4 py-2 bg-cyan-600 text-white text-sm font-semibold rounded-md hover:bg-cyan-500 transition"
                        >
                            تنزيل الملف
                        </button>
                    </div>
                    <div className="flex-grow w-full h-full">
                        <iframe
                            srcDoc={htmlContent}
                            title="Generated Website Preview"
                            className="w-full h-full border-0"
                            sandbox="allow-scripts allow-same-origin"
                        />
                    </div>
                </div>
                <Modal 
                    isOpen={isPublishModalOpen} 
                    onClose={() => setIsPublishModalOpen(false)}
                    title="نشر الموقع على رابط مجاني"
                >
                    <div className="text-gray-300 space-y-4 text-right">
                        <p>
                            سنقوم بنشر موقعك باستخدام خدمة <a href="https://codepen.io" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">CodePen</a>، وهي منصة للمطورين لمشاركة أعمالهم.
                        </p>
                        <p>
                            سيؤدي هذا إلى فتح علامة تبويب جديدة في متصفحك تحتوي على موقعك. من هناك، يمكنك نسخ الرابط من شريط العنوان ومشاركته مع أي شخص.
                        </p>
                        <p className="text-sm text-gray-400 bg-gray-700/50 p-3 rounded-lg border border-gray-600">
                            <strong>ملاحظة:</strong> هذه خدمة خارجية مجانية. نحن لا نتحكم في توفر الموقع أو مدة بقائه.
                        </p>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <button 
                            onClick={() => setIsPublishModalOpen(false)}
                            className="px-5 py-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-500 transition"
                        >
                            إلغاء
                        </button>
                        <button 
                            onClick={handlePublish}
                            className="px-5 py-2 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-500 transition"
                        >
                            المتابعة والنشر
                        </button>
                    </div>
                </Modal>
            </>
        );
    };

    return (
        <div className="w-full min-h-[60vh] lg:min-h-full flex items-center justify-center bg-gray-900 rounded-xl p-4">
            {renderContent()}
        </div>
    );
};
