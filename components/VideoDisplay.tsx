
import React, { useState, useEffect, useRef } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { IconClapperboard, IconAlertTriangle } from './Icon';

interface VideoDisplayProps {
    videoUrl: string | null;
    isLoading: boolean;
    error: string | null;
    addVoiceOver: boolean;
    showSubtitles: boolean;
    prompt: string;
}

const EmptyState: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 bg-gray-800/50 p-8 rounded-xl">
        <IconClapperboard className="w-24 h-24 mb-4 text-gray-600" />
        <h3 className="text-2xl font-semibold text-gray-400">منطقة عرض الفيديو</h3>
        <p className="mt-2 max-w-sm">
            سيتم عرض الفيديو الذي تم إنشاؤه هنا. أدخل نصًا في اللوحة اليمنى واضغط على "توليد الفيديو" لتبدأ.
        </p>
    </div>
);

const LOADING_MESSAGES = [
    "جاري إنشاء تحفتك السينمائية...",
    "يتم الآن تحريك البيكسلات...",
    "تجميع المشاهد معًا...",
    "قد تستغرق هذه العملية بضع دقائق...",
    "نضع اللمسات الأخيرة على المقطع...",
];

const LoadingState: React.FC = () => {
    const [message, setMessage] = useState(LOADING_MESSAGES[0]);

    useEffect(() => {
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

export const VideoDisplay: React.FC<VideoDisplayProps> = ({ videoUrl, isLoading, error, addVoiceOver, showSubtitles, prompt }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isVideoReady, setIsVideoReady] = useState(false);

    useEffect(() => {
        setIsVideoReady(false);
    }, [videoUrl]);


    useEffect(() => {
        const videoElement = videoRef.current;
        const synth = window.speechSynthesis;

        if (!videoElement || !addVoiceOver || !prompt || !synth) {
            if (synth) synth.cancel();
            return;
        }

        const utterance = new SpeechSynthesisUtterance(prompt);
        utterance.lang = 'ar-SA'; 

        const handlePlay = () => {
            synth.cancel(); 
            synth.speak(utterance);
        };

        const handlePauseOrEnd = () => {
            synth.cancel();
        };

        videoElement.addEventListener('play', handlePlay);
        videoElement.addEventListener('pause', handlePauseOrEnd);
        videoElement.addEventListener('ended', handlePauseOrEnd);

        return () => {
            synth.cancel(); 
            videoElement.removeEventListener('play', handlePlay);
            videoElement.removeEventListener('pause', handlePauseOrEnd);
            videoElement.removeEventListener('ended', handlePauseOrEnd);
        };
    }, [videoUrl, addVoiceOver, prompt]);

    const renderContent = () => {
        if (isLoading) {
            return <LoadingState />;
        }
        if (error) {
            return <ErrorState message={error} />;
        }
        if (!videoUrl) {
            return <EmptyState />;
        }
        return (
            <div className="w-full h-full group relative">
                <video
                    ref={videoRef}
                    key={videoUrl}
                    src={videoUrl}
                    controls
                    autoPlay
                    loop
                    onCanPlay={() => setIsVideoReady(true)}
                    className={`w-full h-full object-contain rounded-lg shadow-lg transition-all duration-500 ease-in-out ${isVideoReady ? 'opacity-100 blur-0' : 'opacity-0 blur-lg'}`}
                />
                                
                {showSubtitles && prompt && (
                    <div className={`absolute bottom-[8%] left-1/2 -translate-x-1/2 w-11/12 pointer-events-none transition-opacity duration-500 ${isVideoReady ? 'opacity-100' : 'opacity-0'}`}>
                        <p className="text-center text-lg md:text-xl lg:text-2xl font-semibold text-white bg-black/60 px-4 py-2 rounded-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                            {prompt}
                        </p>
                    </div>
                )}
                
                <a
                    href={videoUrl}
                    download="generated-video.mp4"
                    className="absolute bottom-4 right-4 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    title="تنزيل الفيديو"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                </a>
            </div>
        );
    };

    return (
        <div className="w-full min-h-[60vh] lg:min-h-full flex items-center justify-center bg-gray-900 rounded-xl p-4">
            {renderContent()}
        </div>
    );
};
