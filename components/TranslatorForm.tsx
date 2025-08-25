import React, { useState, useEffect, useCallback } from 'react';
import { SUPPORTED_LANGUAGES } from '../constants';
import type { Language } from '../types';
import { IconMicrophone, IconVolume2, IconDownload, IconArrowRightLeft, IconAlertTriangle } from './Icon';
import { LoadingSpinner } from './LoadingSpinner';

interface TranslatorFormProps {
    inputText: string;
    setInputText: (text: string) => void;
    outputText: string;
    sourceLang: string;
    setSourceLang: (lang: string) => void;
    targetLang: string;
    setTargetLang: (lang: string) => void;
    isTranslating: boolean;
    onTranslate: () => void;
    error: string | null;
}

declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

// Check for SpeechRecognition API
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;
if (recognition) {
    recognition.continuous = false;
    recognition.interimResults = false;
}

export const TranslatorForm: React.FC<TranslatorFormProps> = ({
    inputText, setInputText, outputText, sourceLang, setSourceLang, targetLang, setTargetLang,
    isTranslating, onTranslate, error
}) => {
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
    const synth = window.speechSynthesis;

    const populateVoiceList = useCallback(() => {
        const voices = synth.getVoices();
        setAvailableVoices(voices);
        if (voices.length > 0 && !selectedVoiceURI) {
            // Try to set a default voice that matches the target language, otherwise the first one.
            const defaultVoice = voices.find(voice => voice.lang.startsWith(targetLang)) || voices[0];
            setSelectedVoiceURI(defaultVoice.voiceURI);
        }
    }, [synth, targetLang, selectedVoiceURI]);

    useEffect(() => {
        populateVoiceList();
        if (synth.onvoiceschanged !== undefined) {
            synth.onvoiceschanged = populateVoiceList;
        }
    }, [populateVoiceList, synth]);

    const handleSwapLanguages = () => {
        setSourceLang(targetLang);
        setTargetLang(sourceLang);
        setInputText(outputText);
    };

    const handleListen = () => {
        if (!recognition) {
            alert('خاصية التعرف على الكلام غير مدعومة في هذا المتصفح.');
            return;
        }

        if (isListening) {
            recognition.stop();
            setIsListening(false);
            return;
        }
        
        recognition.lang = sourceLang;
        recognition.start();

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
        };
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInputText(transcript);
        };
    };

    const handleSpeak = () => {
        if (isSpeaking) {
            synth.cancel();
            setIsSpeaking(false);
            return;
        }
        if (!outputText) return;

        const utterance = new SpeechSynthesisUtterance(outputText);
        const selectedVoice = availableVoices.find(voice => voice.voiceURI === selectedVoiceURI);
        
        utterance.voice = selectedVoice || null;
        utterance.lang = selectedVoice?.lang || targetLang;
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        
        synth.speak(utterance);
        setIsSpeaking(true);
    };

    const handleDownloadAudio = () => {
        // This is a placeholder as direct download from SpeechSynthesis is not supported by browsers.
        // For a full implementation, a server-side TTS service would be required.
        alert('ميزة تنزيل الصوت هي ميزة تجريبية وتعتمد على المتصفح وقد لا تعمل. الطريقة الموصى بها هي استخدام مسجل صوت خارجي أثناء تشغيل الصوت.');
        handleSpeak(); // Play the audio for the user
    };

    return (
        <div className="bg-gray-800 p-6 rounded-xl shadow-2xl space-y-6 w-full">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <select
                    value={sourceLang}
                    onChange={(e) => setSourceLang(e.target.value)}
                    className="w-full sm:w-auto p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                >
                    {SUPPORTED_LANGUAGES.map(lang => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
                </select>
                <button onClick={handleSwapLanguages} className="p-3 bg-gray-700 rounded-full hover:bg-gray-600 transition text-cyan-400">
                    <IconArrowRightLeft className="w-6 h-6" />
                </button>
                <select
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                    className="w-full sm:w-auto p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                >
                    {SUPPORTED_LANGUAGES.map(lang => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Input Area */}
                <div className="space-y-2">
                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="اكتب أو انطق النص هنا..."
                        rows={10}
                        className="w-full p-4 bg-gray-700/50 border-2 border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                    />
                    <div className="flex items-center justify-end">
                        <button onClick={handleListen} title="التعرف على الكلام" className={`p-3 rounded-full transition ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-700 hover:bg-gray-600'}`}>
                            <IconMicrophone className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Output Area */}
                <div className="space-y-2">
                    <div className="relative w-full h-full">
                        <textarea
                            value={isTranslating ? 'جاري الترجمة...' : outputText}
                            readOnly
                            placeholder="الترجمة..."
                            rows={10}
                            className="w-full h-full p-4 bg-gray-900/50 border-2 border-gray-700 rounded-lg"
                        />
                        {isTranslating && <div className="absolute inset-0 flex items-center justify-center"><LoadingSpinner /></div>}
                    </div>
                     <div className="flex items-center justify-end gap-2 flex-wrap">
                        <select
                            value={selectedVoiceURI}
                            onChange={(e) => setSelectedVoiceURI(e.target.value)}
                            className="flex-grow p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                            disabled={availableVoices.length === 0}
                        >
                            {availableVoices.length > 0 ? (
                                availableVoices.map(voice => <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name} ({voice.lang})</option>)
                            ) : (
                                <option>لا توجد أصوات متاحة</option>
                            )}
                        </select>
                        <button onClick={handleSpeak} title="قراءة النص" disabled={!outputText || isTranslating} className={`p-3 rounded-full transition disabled:opacity-50 ${isSpeaking ? 'bg-cyan-500 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>
                            <IconVolume2 className="w-6 h-6" />
                        </button>
                        <button onClick={handleDownloadAudio} title="تنزيل الصوت (تجريبي)" disabled={!outputText || isTranslating} className="p-3 bg-gray-700 rounded-full hover:bg-gray-600 transition disabled:opacity-50">
                            <IconDownload className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-3 text-red-400 bg-red-900/20 border border-red-500 p-4 rounded-lg">
                    <IconAlertTriangle className="w-6 h-6 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <button
                onClick={onTranslate}
                disabled={isTranslating || !inputText}
                className="w-full flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-lg text-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity shadow-lg"
            >
                {isTranslating ? (
                    <><LoadingSpinner className="w-6 h-6" /><span>جاري الترجمة...</span></>
                ) : (
                    <span>ترجمة</span>
                )}
            </button>
        </div>
    );
};