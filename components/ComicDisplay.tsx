import React, { useState, useRef } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { IconLayoutGrid, IconAlertTriangle } from './Icon';
import type { GeneratedComic } from '../types';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';


interface ComicDisplayProps {
    comic: GeneratedComic | null;
    isLoading: boolean;
    error: string | null;
}

const EmptyState: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 bg-gray-800/50 p-8 rounded-xl">
        <IconLayoutGrid className="w-24 h-24 mb-4 text-gray-600" />
        <h3 className="text-2xl font-semibold text-gray-400">استوديو القصص المصورة</h3>
        <p className="mt-2 max-w-sm">
            سيتم عرض قصتك المصورة هنا. املأ التفاصيل واضغط على "إنشاء القصة" لتحويل فكرتك إلى حقيقة.
        </p>
    </div>
);

const LOADING_MESSAGES = [
    "جاري كتابة السيناريو...",
    "رسم المشاهد الأولى...",
    "تلوين الشخصيات...",
    "قد يستغرق إنشاء قصة كاملة بعض الوقت...",
    "وضع الحبر على الصفحات الأخيرة...",
];


const LoadingState: React.FC = () => {
    const [message, setMessage] = React.useState(LOADING_MESSAGES[0]);

    React.useEffect(() => {
        const intervalId = setInterval(() => {
            setMessage(prevMessage => {
                const currentIndex = LOADING_MESSAGES.indexOf(prevMessage);
                const nextIndex = (currentIndex + 1) % LOADING_MESSAGES.length;
                return LOADING_MESSAGES[nextIndex];
            });
        }, 4000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 bg-gray-800/50 p-8 rounded-xl">
            <LoadingSpinner className="w-16 h-16 mb-6" />
            <h3 className="text-2xl font-semibold text-white animate-pulse">{message}</h3>
        </div>
    );
};

const ErrorState: React.FC<{ message: string }> = ({ message }) => (
    <div className="flex flex-col items-center justify-center h-full text-center text-red-400 bg-red-900/20 border border-red-500 p-8 rounded-xl">
        <IconAlertTriangle className="w-16 h-16 mb-4" />
        <h3 className="text-2xl font-semibold text-red-300">حدث خطأ</h3>
        <p className="mt-2">{message}</p>
    </div>
);

export const ComicDisplay: React.FC<ComicDisplayProps> = ({ comic, isLoading, error }) => {
    const [isDownloading, setIsDownloading] = useState(false);
    const pdfRenderRef = useRef<HTMLDivElement>(null);

    const handleDownloadPdf = async () => {
        if (!comic || !pdfRenderRef.current) return;
        setIsDownloading(true);

        try {
            const doc = new jsPDF('p', 'pt', 'a4');
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            
            // --- Render Title Page ---
            const titleContainer = document.createElement('div');
            titleContainer.innerHTML = `
                <div style="width: ${pageWidth}pt; height: ${pageHeight}pt; background-color: #111827; color: white; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 20px; box-sizing: border-box;">
                    <h1 style="font-size: 48px; margin: 0; font-family: 'Arial';">${comic.title}</h1>
                    <p style="font-size: 24px; margin-top: 16px; font-family: 'Arial';">بواسطة ${comic.author}</p>
                    <p style="font-size: 14px; margin-top: 80px; color: #9ca3af; font-family: 'Arial';">تم إنشاؤه بواسطة حمزة كود</p>
                </div>`;
            pdfRenderRef.current.appendChild(titleContainer);
            const titleCanvas = await html2canvas(titleContainer.children[0] as HTMLElement, { useCORS: true });
            pdfRenderRef.current.removeChild(titleContainer);
            const titleImgData = titleCanvas.toDataURL('image/png');
            doc.addImage(titleImgData, 'PNG', 0, 0, pageWidth, pageHeight);


            // --- Render Comic Panels ---
            for (let i = 0; i < comic.panels.length; i++) {
                doc.addPage();
                const panel = comic.panels[i];
                const panelContainer = document.createElement('div');
                // The panel HTML for rendering. Note the RTL direction for Arabic text.
                panelContainer.innerHTML = `
                    <div style="direction: rtl; width: ${pageWidth}pt; height: ${pageHeight}pt; background-color: #111827; display: flex; flex-direction: column; justify-content: space-between; padding: 30px; box-sizing: border-box;">
                        <img src="${panel.image}" style="width: 100%; height: 70%; object-fit: cover; border-radius: 8px; border: 2px solid #374151;" />
                        <div style="height: 25%; display: flex; align-items: center; justify-content: center; text-align: center; background-color: #1f2937; border-radius: 8px; padding: 15px;">
                            <p style="color: #d1d5db; font-size: 18px; margin: 0; font-family: 'Arial';">${panel.text}</p>
                        </div>
                    </div>`;

                pdfRenderRef.current.appendChild(panelContainer);
                const panelCanvas = await html2canvas(panelContainer.children[0] as HTMLElement, { useCORS: true });
                pdfRenderRef.current.removeChild(panelContainer);
                const panelImgData = panelCanvas.toDataURL('image/jpeg', 0.9);
                doc.addImage(panelImgData, 'JPEG', 0, 0, pageWidth, pageHeight);
            }

            doc.save(`${comic.title.replace(/ /g, '_')}.pdf`);
        } catch (e) {
            console.error("Failed to generate PDF:", e);
        } finally {
            setIsDownloading(false);
        }
    };
    
    const renderContent = () => {
        if (isLoading) {
            return <LoadingState />;
        }
        if (error) {
            return <ErrorState message={error} />;
        }
        if (!comic) {
            return <EmptyState />;
        }
        return (
             <div className="w-full h-full flex flex-col gap-4 bg-gray-800/50 rounded-xl p-4">
                 <div className="flex-shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gray-900/50 rounded-lg">
                     <div>
                        <h2 className="text-2xl font-bold text-white">{comic.title}</h2>
                        <p className="text-md text-gray-400">بواسطة {comic.author}</p>
                     </div>
                     <button
                        onClick={handleDownloadPdf}
                        disabled={isDownloading}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-500 transition disabled:opacity-50 disabled:cursor-wait"
                    >
                        {isDownloading ? (
                            <><LoadingSpinner className="w-5 h-5" /> <span>جاري تجهيز PDF...</span></>
                        ) : 'تنزيل القصة (PDF)'}
                    </button>
                 </div>
                <div className="flex-grow w-full h-[60vh] lg:h-auto overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {comic.panels.map((panel, index) => (
                        <div key={index} className="bg-gray-900 rounded-lg shadow-lg overflow-hidden flex flex-col">
                            <img src={panel.image} alt={`Panel ${index + 1}`} className="w-full h-48 object-cover"/>
                            <div className="p-4 flex-grow flex items-center justify-center text-center">
                                <p className="text-gray-300">{panel.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
                 {/* Hidden div for rendering PDF pages */}
                <div ref={pdfRenderRef} style={{ position: 'fixed', left: '-9999px', top: 0 }}></div>
            </div>
        );
    };

    return (
        <div className="w-full min-h-[60vh] lg:min-h-full flex items-center justify-center bg-gray-900 rounded-xl p-4">
            {renderContent()}
        </div>
    );
};