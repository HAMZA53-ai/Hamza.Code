
import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { IconPhoto, IconAlertTriangle } from './Icon';
import { PixelatedImage } from './PixelatedImage';

interface ImageDisplayProps {
    images: string[];
    isLoading: boolean;
    error: string | null;
}

const EmptyState: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 bg-gray-800/50 p-8 rounded-xl">
        <IconPhoto className="w-24 h-24 mb-4 text-gray-600" />
        <h3 className="text-2xl font-semibold text-gray-400">منطقة عرض الصور</h3>
        <p className="mt-2 max-w-sm">
            سيتم عرض الصور التي تم إنشاؤها هنا. أدخل نصًا في اللوحة اليمنى واضغط على "توليد الصور" لتبدأ.
        </p>
    </div>
);

const LoadingState: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 bg-gray-800/50 p-8 rounded-xl">
        <LoadingSpinner className="w-16 h-16 mb-6" />
        <h3 className="text-2xl font-semibold text-white animate-pulse">جاري إنشاء تحفتك الفنية...</h3>
        <p className="mt-2">قد تستغرق هذه العملية بضع لحظات.</p>
    </div>
);

const ErrorState: React.FC<{ message: string }> = ({ message }) => (
    <div className="flex flex-col items-center justify-center h-full text-center text-red-400 bg-red-900/20 border border-red-500 p-8 rounded-xl">
        <IconAlertTriangle className="w-16 h-16 mb-4" />
        <h3 className="text-2xl font-semibold text-red-300">حدث خطأ</h3>
        <p className="mt-2">{message}</p>
    </div>
);

export const ImageDisplay: React.FC<ImageDisplayProps> = ({ images, isLoading, error }) => {
    const hasImages = images.length > 0;

    const renderContent = () => {
        if (isLoading) {
            return <LoadingState />;
        }
        if (error) {
            return <ErrorState message={error} />;
        }
        if (!hasImages) {
            return <EmptyState />;
        }
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {images.map((imageSrc, index) => (
                    <div key={index} className="group relative overflow-hidden rounded-lg shadow-lg aspect-square bg-gray-800">
                        <PixelatedImage
                            src={imageSrc}
                            alt={`Generated image ${index + 1}`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <a
                            href={imageSrc}
                            download={`generated-image-${index + 1}.jpg`}
                            className="absolute bottom-4 right-4 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            title="تنزيل الصورة"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                        </a>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="w-full min-h-[60vh] lg:min-h-full flex items-center justify-center bg-gray-900 rounded-xl p-4">
            {renderContent()}
        </div>
    );
};
