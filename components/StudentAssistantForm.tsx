
import React from 'react';
import { IconGraduationCap } from './Icon';
import { LoadingSpinner } from './LoadingSpinner';
import { AssistanceType, QuestionType } from '../constants';

interface StudentAssistantFormProps {
    prompt: string;
    setPrompt: (prompt: string) => void;
    assistanceType: AssistanceType;
    setAssistanceType: (type: AssistanceType) => void;
    isGenerating: boolean;
    onGenerate: () => void;
    numberOfQuestions: number;
    setNumberOfQuestions: (n: number) => void;
    questionType: QuestionType;
    setQuestionType: (type: QuestionType) => void;
}

const placeholderTexts: Record<AssistanceType, string> = {
    [AssistanceType.EXPLAIN]: "مثال: اشرح لي مفهوم الثقوب السوداء.",
    [AssistanceType.SUMMARIZE]: "الصق هنا النص الذي تريد تلخيصه...",
    [AssistanceType.SOLVE]: "مثال: ما هو حل المعادلة 2x + 5 = 15؟",
    [AssistanceType.INTERACTIVE_QUIZ]: "مثال: أنشئ اختباراً عن كواكب المجموعة الشمسية.",
    [AssistanceType.FLASHCARDS]: "مثال: عواصم الدول الأوروبية",
    [AssistanceType.MIND_MAP]: "مثال: فروع علوم الحاسب",
    [AssistanceType.CREATE_TABLE]: "الصق بياناتك هنا (مثال: قائمة منتجات بأسعارها، معلومات طلاب، إلخ)",
};


export const StudentAssistantForm: React.FC<StudentAssistantFormProps> = ({
    prompt, setPrompt, assistanceType, setAssistanceType, isGenerating, onGenerate,
    numberOfQuestions, setNumberOfQuestions, questionType, setQuestionType
}) => {
    return (
        <div className="bg-gray-800 p-6 rounded-xl shadow-2xl space-y-6 sticky top-24">
            <h2 className="text-xl font-semibold text-white">مساعد الطالب الذكي</h2>
            
            <div className="border-t border-gray-700"></div>

            <div className="space-y-2">
                <label htmlFor="assistanceType" className="block font-medium text-gray-300">اختر نوع المساعدة</label>
                <select
                    id="assistanceType"
                    value={assistanceType}
                    onChange={(e) => setAssistanceType(e.target.value as AssistanceType)}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                    disabled={isGenerating}
                >
                    {Object.values(AssistanceType).map((s) => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </div>
            
            {assistanceType === AssistanceType.INTERACTIVE_QUIZ && (
                <div className="space-y-4 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                    <h3 className="font-semibold text-gray-200">إعدادات الاختبار</h3>
                    <div className="space-y-2">
                        <label htmlFor="numberOfQuestions" className="block text-sm font-medium text-gray-300">عدد الأسئلة</label>
                        <input
                            type="range"
                            id="numberOfQuestions"
                            min="3"
                            max="10"
                            step="1"
                            value={numberOfQuestions}
                            onChange={(e) => setNumberOfQuestions(Number(e.target.value))}
                            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                            disabled={isGenerating}
                        />
                        <div className="text-center text-sm text-gray-400">{numberOfQuestions} أسئلة</div>
                    </div>
                    <div className="space-y-2">
                         <label htmlFor="questionType" className="block text-sm font-medium text-gray-300">نوع الأسئلة</label>
                        <select
                            id="questionType"
                            value={questionType}
                            onChange={(e) => setQuestionType(e.target.value as QuestionType)}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                            disabled={isGenerating}
                        >
                            {Object.values(QuestionType).map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}


            <div className="space-y-2">
                <label htmlFor="prompt" className="block font-medium text-gray-300">طلبك</label>
                <textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={placeholderTexts[assistanceType]}
                    rows={assistanceType === AssistanceType.INTERACTIVE_QUIZ ? 4 : 8}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                    disabled={isGenerating}
                />
            </div>
            
            <div className="border-t border-gray-700"></div>

            <button
                onClick={onGenerate}
                disabled={isGenerating || !prompt}
                className="w-full flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-lg text-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity shadow-lg"
            >
                {isGenerating ? (
                    <><LoadingSpinner className="w-6 h-6" /><span>لحظة من فضلك...</span></>
                ) : (
                    <><IconGraduationCap className="w-6 h-6" /><span>احصل على المساعدة</span></>
                )}
            </button>
        </div>
    );
};
