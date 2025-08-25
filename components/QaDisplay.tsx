
import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { IconHelpCircle, IconAlertTriangle } from './Icon';

interface QaDisplayProps {
    response: string | null;
    isLoading: boolean;
    error: string | null;
}

const BlinkingCursor: React.FC = () => (
    <span className="inline-block w-0.5 h-6 bg-cyan-400 animate-pulse ml-1" />
);

const EmptyState: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 bg-gray-800/50 p-8 rounded-xl">
        <IconHelpCircle className="w-24 h-24 mb-4 text-gray-600" />
        <h3 className="text-2xl font-semibold text-gray-400">مساعدك الذكي</h3>
        <p className="mt-2 max-w-sm">
            ستظهر إجابات نموذج حمزة كود هنا. اطرح سؤالاً في اللوحة اليمنى للحصول على إجابة.
        </p>
    </div>
);

const LoadingState: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 bg-gray-800/50 p-8 rounded-xl">
        <LoadingSpinner className="w-16 h-16 mb-6" />
        <h3 className="text-2xl font-semibold text-white animate-pulse">جاري البحث عن إجابة...</h3>
        <p className="mt-2">يقوم النموذج بمعالجة سؤالك الآن.</p>
    </div>
);

const ErrorState: React.FC<{ message: string }> = ({ message }) => (
    <div className="flex flex-col items-center justify-center h-full text-center text-red-400 bg-red-900/20 border border-red-500 p-8 rounded-xl">
        <IconAlertTriangle className="w-16 h-16 mb-4" />
        <h3 className="text-2xl font-semibold text-red-300">حدث خطأ</h3>
        <p className="mt-2">{message}</p>
    </div>
);

export const QaDisplay: React.FC<QaDisplayProps> = ({ response, isLoading, error }) => {
    const renderContent = () => {
        if (isLoading && !response) {
            return <LoadingState />;
        }
        if (error) {
            return <ErrorState message={error} />;
        }
        if (!response && !isLoading) {
            return <EmptyState />;
        }
        return (
            <div className="w-full h-full bg-gray-800/50 rounded-xl p-6 lg:p-8 overflow-y-auto">
               <div 
                className="text-lg text-gray-200 leading-relaxed space-y-4" 
                style={{ whiteSpace: 'pre-wrap' }}
               >
                {response}
                {isLoading && <BlinkingCursor />}
               </div>
            </div>
        );
    };

    return (
        <div className="w-full min-h-[60vh] lg:min-h-full flex items-start justify-center bg-gray-900 rounded-xl p-4">
            {renderContent()}
        </div>
    );
};
