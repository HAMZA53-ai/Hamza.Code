
import React, { useState } from 'react';
import type { InteractiveQuiz, QuizQuestion } from '../types';
import { IconCheckCircle, IconXCircle } from './Icon';

interface InteractiveQuizViewerProps {
    quiz: InteractiveQuiz;
}

export const InteractiveQuizViewer: React.FC<InteractiveQuizViewerProps> = ({ quiz }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<(number | null)[]>(Array(quiz.length).fill(null));
    const [isFinished, setIsFinished] = useState(false);

    if (!quiz || quiz.length === 0) {
        return <div className="text-center text-gray-400">فشل إنشاء الاختبار.</div>;
    }

    const handleAnswerSelect = (optionIndex: number) => {
        if (userAnswers[currentQuestionIndex] !== null) return; // Already answered

        const newAnswers = [...userAnswers];
        newAnswers[currentQuestionIndex] = optionIndex;
        setUserAnswers(newAnswers);
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < quiz.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            setIsFinished(true);
        }
    };

    const score = userAnswers.filter((answer, index) => answer === quiz[index].correct_answer_index).length;

    if (isFinished) {
        return (
            <div className="w-full h-full p-4 lg:p-8 overflow-y-auto bg-gray-800/50 rounded-xl">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-center text-white mb-4">نتائج الاختبار</h2>
                    <p className="text-xl text-center text-cyan-400 mb-8">
                        أحسنت! لقد أجبت على {score} من {quiz.length} بشكل صحيح.
                    </p>
                    <div className="space-y-6">
                        {quiz.map((q, index) => (
                            <div key={index} className="bg-gray-800 p-5 rounded-lg border border-gray-700">
                                <p className="text-lg font-semibold text-gray-200 mb-4">{index + 1}. {q.question_text}</p>
                                <div className="space-y-2">
                                    {q.options.map((option, optionIndex) => {
                                        const isCorrect = optionIndex === q.correct_answer_index;
                                        const isUserChoice = optionIndex === userAnswers[index];
                                        let classes = "w-full text-right p-3 rounded-md transition-colors ";
                                        if (isCorrect) {
                                            classes += "bg-green-500/20 border border-green-500 text-green-300";
                                        } else if (isUserChoice && !isCorrect) {
                                            classes += "bg-red-500/20 border border-red-500 text-red-300";
                                        } else {
                                            classes += "bg-gray-700 border border-transparent";
                                        }
                                        return (
                                            <div key={optionIndex} className={`flex items-center gap-3 ${classes}`}>
                                                {isCorrect && <IconCheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />}
                                                {isUserChoice && !isCorrect && <IconXCircle className="w-5 h-5 text-red-400 flex-shrink-0" />}
                                                <span>{option}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="mt-4 p-3 bg-gray-900/50 rounded-md">
                                    <p><strong className="text-cyan-400">الشرح:</strong> {q.explanation}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const currentQuestion = quiz[currentQuestionIndex];
    const answeredCurrent = userAnswers[currentQuestionIndex] !== null;

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
                <div className="text-sm text-gray-400 mb-2">
                    السؤال {currentQuestionIndex + 1} من {quiz.length}
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2.5 mb-6">
                    <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${((currentQuestionIndex + 1) / quiz.length) * 100}%` }}></div>
                </div>

                <h3 className="text-2xl font-bold text-white mb-6 text-center">{currentQuestion.question_text}</h3>
                
                <div className="space-y-4">
                    {currentQuestion.options.map((option, index) => {
                        const isSelected = userAnswers[currentQuestionIndex] === index;
                        const isCorrect = index === currentQuestion.correct_answer_index;
                        let buttonClasses = "w-full p-4 text-lg text-right font-semibold rounded-lg border-2 transition-all duration-200 ";
                        
                        if (answeredCurrent) {
                             if (isCorrect) {
                                buttonClasses += "bg-green-500/30 border-green-500 text-white";
                             } else if (isSelected && !isCorrect) {
                                buttonClasses += "bg-red-500/30 border-red-500 text-white";
                             } else {
                                 buttonClasses += "bg-gray-700 border-gray-700 opacity-60";
                             }
                        } else {
                            buttonClasses += "bg-gray-700 border-gray-600 hover:bg-cyan-500/20 hover:border-cyan-500";
                        }

                        return (
                            <button
                                key={index}
                                onClick={() => handleAnswerSelect(index)}
                                disabled={answeredCurrent}
                                className={buttonClasses}
                            >
                                {option}
                            </button>
                        );
                    })}
                </div>

                {answeredCurrent && (
                     <button
                        onClick={handleNextQuestion}
                        className="w-full mt-8 p-4 bg-cyan-600 text-white font-bold rounded-lg text-lg hover:bg-cyan-500 transition-colors"
                    >
                        {currentQuestionIndex < quiz.length - 1 ? 'السؤال التالي' : 'عرض النتائج'}
                    </button>
                )}
            </div>
        </div>
    );
};
