
import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { IconBook, IconAlertTriangle } from './Icon';
import type { GeneratedBook } from '../types';

interface BookDisplayProps {
    book: GeneratedBook | null;
    isLoading: boolean;
    error: string | null;
}

const EmptyState: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 bg-gray-800/50 p-8 rounded-xl">
        <IconBook className="w-24 h-24 mb-4 text-gray-600" />
        <h3 className="text-2xl font-semibold text-gray-400">مكتبة إبداعاتك</h3>
        <p className="mt-2 max-w-sm">
            سيتم عرض الكتاب الذي تم إنشاؤه هنا. املأ التفاصيل في اللوحة اليمنى واضغط على "إنشاء الكتاب" لتبدأ رحلتك كمؤلف.
        </p>
    </div>
);

const LOADING_MESSAGES = [
    "جاري استدعاء الإلهام...",
    "يتم الآن نسج الكلمات وتصميم الغلاف...",
    "تأليف الفصول الأولى...",
    "قد يستغرق إنشاء كتاب كامل بعض الوقت...",
    "وضع اللمسات الأخيرة على تحفتك الأدبية...",
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

export const BookDisplay: React.FC<BookDisplayProps> = ({ book, isLoading, error }) => {

    const handleDownload = () => {
        if (!book) return;
        const blob = new Blob([book.content], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${book.title.replace(/ /g, '_')}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const renderContent = () => {
        if (isLoading) {
            return <LoadingState />;
        }
        if (error) {
            return <ErrorState message={error} />;
        }
        if (!book) {
            return <EmptyState />;
        }
        return (
            <div className="w-full h-full flex flex-col lg:flex-row gap-8 bg-gray-800/50 rounded-xl p-4 lg:p-8">
                {/* Book Cover */}
                <div className="flex-shrink-0 lg:w-1/3 flex flex-col items-center">
                    <img src={book.coverImage} alt={`Cover for ${book.title}`} className="rounded-lg shadow-2xl w-full max-w-xs object-cover aspect-[9/16]" />
                     <button
                        onClick={handleDownload}
                        className="w-full max-w-xs mt-4 px-4 py-3 bg-cyan-600 text-white text-md font-semibold rounded-md hover:bg-cyan-500 transition"
                    >
                        تنزيل محتوى الكتاب (.md)
                    </button>
                </div>
                {/* Book Content */}
                <div className="flex-grow w-full h-[60vh] lg:h-auto overflow-y-auto bg-gray-900/50 p-6 rounded-lg border border-gray-700">
                    <div className="prose prose-invert prose-lg max-w-none" style={{ whiteSpace: 'pre-wrap' }}>
                        {book.content}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full min-h-[60vh] lg:min-h-full flex items-center justify-center bg-gray-900 rounded-xl p-4">
            {renderContent()}
        </div>
    );
};