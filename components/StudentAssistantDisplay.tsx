
import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { IconGraduationCap, IconAlertTriangle } from './Icon';
import { AssistanceType } from '../constants';
import type { StudentResponseData, Flashcard, MindMapNode, TableData, InteractiveQuiz } from '../types';
import { FlashcardViewer } from './FlashcardViewer';
import { MindMapViewer } from './MindMapViewer';
import { InteractiveTable } from './InteractiveTable';
import { InteractiveQuizViewer } from './InteractiveQuizViewer';

interface StudentAssistantDisplayProps {
    response: { type: AssistanceType | null; data: StudentResponseData | null; };
    isLoading: boolean;
    error: string | null;
}

const BlinkingCursor: React.FC = () => (
    <span className="inline-block w-0.5 h-6 bg-cyan-400 animate-pulse ml-1" />
);

const EmptyState: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 bg-gray-800/50 p-8 rounded-xl">
        <IconGraduationCap className="w-24 h-24 mb-4 text-gray-600" />
        <h3 className="text-2xl font-semibold text-gray-400">رفيقك الدراسي الذكي</h3>
        <p className="mt-2 max-w-sm">
            اختر نوع المساعدة التي تحتاجها، واكتب طلبك في اللوحة اليمنى، ودع الذكاء الاصطناعي يساعدك في واجباتك.
        </p>
    </div>
);

const LoadingState: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 bg-gray-800/50 p-8 rounded-xl">
        <LoadingSpinner className="w-16 h-16 mb-6" />
        <h3 className="text-2xl font-semibold text-white animate-pulse">جاري إعداد الإجابة...</h3>
        <p className="mt-2">يقوم المساعد الذكي بمعالجة طلبك الآن.</p>
    </div>
);

const ErrorState: React.FC<{ message: string }> = ({ message }) => (
    <div className="flex flex-col items-center justify-center h-full text-center text-red-400 bg-red-900/20 border border-red-500 p-8 rounded-xl">
        <IconAlertTriangle className="w-16 h-16 mb-4" />
        <h3 className="text-2xl font-semibold text-red-300">حدث خطأ</h3>
        <p className="mt-2">{message}</p>
    </div>
);

export const StudentAssistantDisplay: React.FC<StudentAssistantDisplayProps> = ({ response, isLoading, error }) => {
    const renderContent = () => {
        if (isLoading && !response?.data) {
            return <LoadingState />;
        }
        if (error) {
            return <ErrorState message={error} />;
        }
        if (!response?.data) {
            return <EmptyState />;
        }

        switch (response.type) {
            case AssistanceType.FLASHCARDS:
                return <FlashcardViewer cards={response.data as Flashcard[]} />;
            case AssistanceType.MIND_MAP:
                return <MindMapViewer root={response.data as MindMapNode} />;
            case AssistanceType.CREATE_TABLE:
                return <InteractiveTable data={response.data as TableData} />;
            case AssistanceType.INTERACTIVE_QUIZ:
                return <InteractiveQuizViewer quiz={response.data as InteractiveQuiz} />;
            case AssistanceType.EXPLAIN:
            case AssistanceType.SUMMARIZE:
            case AssistanceType.SOLVE:
                 return (
                    <div className="w-full h-full bg-gray-800/50 rounded-xl p-6 lg:p-8 overflow-y-auto">
                       <div 
                        className="prose prose-invert prose-lg max-w-none text-gray-200"
                        style={{ whiteSpace: 'pre-wrap' }}
                       >
                        {response.data as string}
                        {isLoading && <BlinkingCursor />}
                       </div>
                    </div>
                );
            default:
                return <EmptyState />;
        }
    };

    return (
        <div className="w-full min-h-[60vh] lg:min-h-full flex items-start justify-center bg-gray-900 rounded-xl p-4">
            {renderContent()}
        </div>
    );
};
