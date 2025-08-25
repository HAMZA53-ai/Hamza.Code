
import React, { useState } from 'react';
import type { Flashcard } from '../types';

interface FlashcardViewerProps {
    cards: Flashcard[];
}

export const FlashcardViewer: React.FC<FlashcardViewerProps> = ({ cards }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    if (!cards || cards.length === 0) {
        return <div className="text-center text-gray-400">لا توجد بطاقات لعرضها.</div>;
    }

    const currentCard = cards[currentIndex];

    const handleNext = () => {
        setIsFlipped(false);
        setCurrentIndex((prevIndex) => (prevIndex + 1) % cards.length);
    };

    const handlePrev = () => {
        setIsFlipped(false);
        setCurrentIndex((prevIndex) => (prevIndex - 1 + cards.length) % cards.length);
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl aspect-[16/9] perspective-1000">
                <div
                    className={`relative w-full h-full cursor-pointer transition-transform duration-700 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}
                    onClick={() => setIsFlipped(!isFlipped)}
                >
                    {/* Front of the card */}
                    <div className="absolute w-full h-full backface-hidden bg-gray-700 rounded-xl shadow-lg flex flex-col items-center justify-center p-6 text-center border-2 border-cyan-500">
                        <span className="absolute top-4 right-4 text-xs text-gray-400">سؤال</span>
                        <p className="text-2xl font-bold text-white">{currentCard.question}</p>
                    </div>

                    {/* Back of the card */}
                    <div className="absolute w-full h-full backface-hidden bg-gray-800 rounded-xl shadow-lg flex flex-col items-center justify-center p-6 text-center rotate-y-180 border-2 border-gray-600">
                        <span className="absolute top-4 right-4 text-xs text-gray-400">إجابة</span>
                        <p className="text-xl text-gray-200">{currentCard.answer}</p>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex items-center justify-between w-full max-w-2xl">
                <button
                    onClick={handlePrev}
                    className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-500 transition"
                >
                    السابق
                </button>
                <div className="text-gray-400 font-medium">
                    {currentIndex + 1} / {cards.length}
                </div>
                <button
                    onClick={handleNext}
                    className="px-6 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-500 transition"
                >
                    التالي
                </button>
            </div>
            
            <style>{`
                .perspective-1000 { perspective: 1000px; }
                .preserve-3d { transform-style: preserve-3d; }
                .rotate-y-180 { transform: rotateY(180deg); }
                .backface-hidden { backface-visibility: hidden; }
            `}</style>
        </div>
    );
};
