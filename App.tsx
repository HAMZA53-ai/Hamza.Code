
import React, { useState, useCallback, useEffect } from 'react';
import { ImageGeneratorForm } from './components/ImageGeneratorForm';
import { ImageDisplay } from './components/ImageDisplay';
import { VideoGeneratorForm } from './components/VideoGeneratorForm';
import { VideoDisplay } from './components/VideoDisplay';
import { WebsiteGeneratorForm } from './components/WebsiteGeneratorForm';
import { WebsiteDisplay } from './components/WebsiteDisplay';
import { QaGeneratorForm } from './components/QaGeneratorForm';
import { QaDisplay } from './components/QaDisplay';
import { BookGeneratorForm } from './components/BookGeneratorForm';
import { BookDisplay } from './components/BookDisplay';
import { ComicGeneratorForm } from './components/ComicGeneratorForm';
import { ComicDisplay } from './components/ComicDisplay';
import { StudentAssistantForm } from './components/StudentAssistantForm';
import { StudentAssistantDisplay } from './components/StudentAssistantDisplay';
import { TranslatorForm } from './components/TranslatorForm';
import { Header } from './components/Header';
import { generateImagesFromApi, describeImageFromApi, generateVideoFromApi, generateWebsiteFromApi, generateQaResponseFromApi, generateBookFromApi, generateComicFromApi, generateStudentHelpStreamFromApi, generateStudentHelpJsonFromApi, translateTextFromApi } from './services/geminiService';
import type { GenerateImageOptions, GenerateVideoOptions, GenerateBookOptions, GeneratedBook, User, GenerateComicOptions, GeneratedComic, StudentResponseData } from './types';
import { AspectRatio, ImageStyle, StylePromptTemplates, VideoStyle, VideoStylePromptTemplates, AssistanceType, QuestionType, SUPPORTED_LANGUAGES } from './constants';
import { IconPhoto, IconClapperboard, IconCode, IconHelpCircle, IconBook, IconLayoutGrid, IconGraduationCap, IconLanguages } from './components/Icon';

type Mode = 'image' | 'video' | 'website' | 'qa' | 'book' | 'comic' | 'student' | 'translator';

const addWatermark = (base64Image: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return reject(new Error('لا يمكن الحصول على سياق الرسم.'));
            }
            // Draw original image
            ctx.drawImage(img, 0, 0);

            // Prepare watermark text
            ctx.font = `bold ${Math.max(12, Math.min(canvas.width / 25, canvas.height / 25))}px sans-serif`;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.textAlign = 'left';
            const text = 'حمزة كود';
            const padding = Math.max(10, canvas.width / 50);
            
            // Draw watermark in bottom-left for RTL context
            ctx.fillText(text, padding, canvas.height - padding);
            
            resolve(canvas.toDataURL('image/jpeg', 0.9));
        };
        img.onerror = () => reject(new Error('فشل في تحميل الصورة لوضع العلامة المائية.'));
        img.src = base64Image;
    });
};

const App: React.FC = () => {
    // Shared state
    const [mode, setMode] = useState<Mode>('image');
    const [error, setError] = useState<string | null>(null);
    const [uploadedImage, setUploadedImage] = useState<{ data: string; mimeType: string; base64: string; } | null>(null);
    const [isDescribing, setIsDescribing] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(null);
    
    // Image Generation State
    const [imagePrompt, setImagePrompt] = useState<string>('');
    const [numberOfImages, setNumberOfImages] = useState<number>(1);
    const [imageAspectRatio, setImageAspectRatio] = useState<AspectRatio>(AspectRatio.SQUARE);
    const [imageStyle, setImageStyle] = useState<ImageStyle>(ImageStyle.PHOTOGRAPHIC);
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);
    const [isGeneratingImages, setIsGeneratingImages] = useState<boolean>(false);

    // Video Generation State
    const [videoPrompt, setVideoPrompt] = useState<string>('');
    const [videoAspectRatio, setVideoAspectRatio] = useState<AspectRatio>(AspectRatio.LANDSCAPE);
    const [videoStyle, setVideoStyle] = useState<VideoStyle>(VideoStyle.CINEMATIC);
    const [duration, setDuration] = useState<number>(5);
    const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
    const [isGeneratingVideo, setIsGeneratingVideo] = useState<boolean>(false);
    const [addVoiceOver, setAddVoiceOver] = useState<boolean>(false);
    const [showSubtitles, setShowSubtitles] = useState<boolean>(false);
    
    // Website Generation State
    const [websitePrompt, setWebsitePrompt] = useState<string>('');
    const [generatedWebsiteHtml, setGeneratedWebsiteHtml] = useState<string | null>(null);
    const [isGeneratingWebsite, setIsGeneratingWebsite] = useState<boolean>(false);

    // Q&A State
    const [qaPrompt, setQaPrompt] = useState<string>('');
    const [qaResponse, setQaResponse] = useState<string>('');
    const [isGeneratingQaResponse, setIsGeneratingQaResponse] = useState<boolean>(false);

    // Book Generation State
    const [bookPrompt, setBookPrompt] = useState<string>('');
    const [bookTitle, setBookTitle] = useState<string>('');
    const [authorName, setAuthorName] = useState<string>('');
    const [coverPrompt, setCoverPrompt] = useState<string>('');
    const [generatedBook, setGeneratedBook] = useState<GeneratedBook | null>(null);
    const [isGeneratingBook, setIsGeneratingBook] = useState<boolean>(false);

    // Comic Generation State
    const [comicPrompt, setComicPrompt] = useState<string>('');
    const [comicTitle, setComicTitle] = useState<string>('');
    const [comicAuthor, setComicAuthor] = useState<string>('');
    const [comicStyle, setComicStyle] = useState<ImageStyle>(ImageStyle.ANIME);
    const [generatedComic, setGeneratedComic] = useState<GeneratedComic | null>(null);
    const [isGeneratingComic, setIsGeneratingComic] = useState<boolean>(false);

    // Student Assistant State
    const [studentPrompt, setStudentPrompt] = useState<string>('');
    const [assistanceType, setAssistanceType] = useState<AssistanceType>(AssistanceType.EXPLAIN);
    const [studentResponse, setStudentResponse] = useState<{ type: AssistanceType | null; data: StudentResponseData | null }>({ type: null, data: null });
    const [isGeneratingStudentResponse, setIsGeneratingStudentResponse] = useState<boolean>(false);
    const [numberOfQuestions, setNumberOfQuestions] = useState<number>(5);
    const [questionType, setQuestionType] = useState<QuestionType>(QuestionType.MULTIPLE_CHOICE);
    
    // Translator State
    const [translatorInput, setTranslatorInput] = useState<string>('');
    const [translatorOutput, setTranslatorOutput] = useState<string>('');
    const [sourceLang, setSourceLang] = useState<string>('ar');
    const [targetLang, setTargetLang] = useState<string>('en');
    const [isTranslating, setIsTranslating] = useState<boolean>(false);


    // --- Google Sign-In ---
    useEffect(() => {
        const handleCredentialResponse = (response: any) => {
            try {
                // Decode the JWT token to get user info
                const decodedToken: { name: string; email: string; picture: string } = JSON.parse(atob(response.credential.split('.')[1]));
                setUser({
                    name: decodedToken.name,
                    email: decodedToken.email,
                    picture: decodedToken.picture,
                });
            } catch (e) {
                console.error("Error decoding JWT token:", e);
                setError("حدث خطأ أثناء تسجيل الدخول.");
            }
        };

        const initializeGsi = () => {
            if (window.google) {
                window.google.accounts.id.initialize({
                    // IMPORTANT: Replace with your actual Google Client ID
                    client_id: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
                    callback: handleCredentialResponse,
                });
            } else {
                 console.error("Google Identity Services script not loaded.");
            }
        };
        
        // Ensure GSI script is loaded before initializing
        if (window.google) {
            initializeGsi();
        } else {
            // If the script is loaded asynchronously, we might need to wait
            const script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]') as HTMLScriptElement;
            if (script) {
                script.onload = initializeGsi;
            }
        }

    }, []);

    const handleSignOut = useCallback(() => {
        setUser(null);
        if (window.google) {
            window.google.accounts.id.disableAutoSelect();
        }
    }, []);
    // ----------------------

    const handleGenerateImages = useCallback(async () => {
        if (!imagePrompt) {
            setError('الرجاء إدخال نص.');
            return;
        }
        setIsGeneratingImages(true);
        setError(null);
        setGeneratedImages([]);

        const createFullPrompt = StylePromptTemplates[imageStyle] || StylePromptTemplates[ImageStyle.NONE];
        const fullPrompt = createFullPrompt(imagePrompt);

        const options: GenerateImageOptions = {
            prompt: fullPrompt,
            numberOfImages,
            aspectRatio: imageAspectRatio,
        };

        try {
            const images = await generateImagesFromApi(options);
            const watermarkedImages = await Promise.all(images.map(addWatermark));
            setGeneratedImages(watermarkedImages);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'حدث خطأ أثناء إنشاء الصور. يرجى المحاولة مرة أخرى.');
        } finally {
            setIsGeneratingImages(false);
        }
    }, [imagePrompt, numberOfImages, imageAspectRatio, imageStyle]);

    const handleGenerateVideo = useCallback(async () => {
        if (!videoPrompt) {
            setError('الرجاء إدخال نص.');
            return;
        }
        setIsGeneratingVideo(true);
        setError(null);
        setGeneratedVideo(null);

        const createFullPrompt = VideoStylePromptTemplates[videoStyle] || VideoStylePromptTemplates[VideoStyle.NONE];
        const fullPrompt = createFullPrompt(videoPrompt, videoAspectRatio);

        const options: GenerateVideoOptions = {
            prompt: fullPrompt,
            duration,
            image: uploadedImage ? { base64: uploadedImage.base64, mimeType: uploadedImage.mimeType } : undefined,
        };

        try {
            const videoUrl = await generateVideoFromApi(options);
            setGeneratedVideo(videoUrl);
        } catch (err: any)
        {
            console.error(err);
            setError(err.message || 'حدث خطأ أثناء إنشاء الفيديو. يرجى المحاولة مرة أخرى.');
        } finally {
            setIsGeneratingVideo(false);
        }
    }, [videoPrompt, duration, videoAspectRatio, videoStyle, uploadedImage]);
    
    const handleGenerateWebsite = useCallback(async () => {
        if (!websitePrompt) {
            setError('الرجاء إدخال وصف للموقع.');
            return;
        }
        setIsGeneratingWebsite(true);
        setError(null);
        setGeneratedWebsiteHtml(null);

        try {
            const html = await generateWebsiteFromApi(websitePrompt);
            setGeneratedWebsiteHtml(html);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'حدث خطأ أثناء إنشاء الموقع. يرجى المحاولة مرة أخرى.');
        } finally {
            setIsGeneratingWebsite(false);
        }
    }, [websitePrompt]);

    const handleGenerateQaResponse = useCallback(async () => {
        if (!qaPrompt) {
            setError('الرجاء إدخال سؤال.');
            return;
        }
        setIsGeneratingQaResponse(true);
        setError(null);
        setQaResponse('');

        try {
            let fullResponse = '';
            for await (const chunk of generateQaResponseFromApi(qaPrompt)) {
                fullResponse += chunk;
                setQaResponse(fullResponse);
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'حدث خطأ أثناء الحصول على إجابة.');
        } finally {
            setIsGeneratingQaResponse(false);
        }
    }, [qaPrompt]);

    const handleGenerateBook = useCallback(async () => {
        if (!bookPrompt || !bookTitle || !authorName || !coverPrompt) {
            setError('الرجاء ملء جميع حقول الكتاب.');
            return;
        }
        setIsGeneratingBook(true);
        setError(null);
        setGeneratedBook(null);

        const options: GenerateBookOptions = {
            prompt: bookPrompt,
            title: bookTitle,
            author: authorName,
            coverPrompt: coverPrompt,
        };

        try {
            const book = await generateBookFromApi(options);
            setGeneratedBook(book);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'حدث خطأ أثناء إنشاء الكتاب.');
        } finally {
            setIsGeneratingBook(false);
        }
    }, [bookPrompt, bookTitle, authorName, coverPrompt]);

    const handleGenerateComic = useCallback(async () => {
        if (!comicPrompt || !comicTitle || !comicAuthor) {
            setError('الرجاء ملء جميع حقول القصة المصورة.');
            return;
        }
        setIsGeneratingComic(true);
        setError(null);
        setGeneratedComic(null);

        const options: GenerateComicOptions = {
            prompt: comicPrompt,
            title: comicTitle,
            author: comicAuthor,
            style: comicStyle,
        };

        try {
            const comic = await generateComicFromApi(options);
            setGeneratedComic(comic);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'حدث خطأ أثناء إنشاء القصة المصورة.');
        } finally {
            setIsGeneratingComic(false);
        }
    }, [comicPrompt, comicTitle, comicAuthor, comicStyle]);

    const handleGenerateStudentHelp = useCallback(async () => {
        if (!studentPrompt) {
            setError('الرجاء إدخال طلبك.');
            return;
        }
        setIsGeneratingStudentResponse(true);
        setError(null);
        setStudentResponse({ type: null, data: null });

        try {
            if ([AssistanceType.FLASHCARDS, AssistanceType.MIND_MAP, AssistanceType.CREATE_TABLE, AssistanceType.INTERACTIVE_QUIZ].includes(assistanceType)) {
                const options = assistanceType === AssistanceType.INTERACTIVE_QUIZ 
                    ? { numberOfQuestions, questionType } 
                    : undefined;

                const jsonData = await generateStudentHelpJsonFromApi(studentPrompt, assistanceType, options);
                setStudentResponse({ type: assistanceType, data: jsonData });
            } else {
                let fullResponse = '';
                for await (const chunk of generateStudentHelpStreamFromApi(studentPrompt, assistanceType)) {
                    fullResponse += chunk;
                    setStudentResponse({ type: assistanceType, data: fullResponse });
                }
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'حدث خطأ أثناء معالجة طلبك.');
        } finally {
            setIsGeneratingStudentResponse(false);
        }
    }, [studentPrompt, assistanceType, numberOfQuestions, questionType]);
    
    const handleTranslate = useCallback(async () => {
        if (!translatorInput) {
            setError('الرجاء إدخال نص للترجمة.');
            return;
        }
        setIsTranslating(true);
        setError(null);
        setTranslatorOutput('');

        try {
            const sourceLangName = SUPPORTED_LANGUAGES.find(l => l.code === sourceLang)?.name || sourceLang;
            const targetLangName = SUPPORTED_LANGUAGES.find(l => l.code === targetLang)?.name || targetLang;
            const translatedText = await translateTextFromApi(translatorInput, sourceLangName, targetLangName);
            setTranslatorOutput(translatedText);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'حدث خطأ أثناء الترجمة.');
        } finally {
            setIsTranslating(false);
        }
    }, [translatorInput, sourceLang, targetLang]);


    const handleImageUpload = useCallback((file: File) => {
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = (reader.result as string).split(',')[1];
            const dataUrl = reader.result as string;
            setUploadedImage({ data: dataUrl, mimeType: file.type, base64: base64String });

            setIsDescribing(true);
            setError(null);
            try {
                const description = await describeImageFromApi(base64String, file.type);
                if (mode === 'image') {
                    setImagePrompt(description);
                } else if (mode === 'video') {
                    setVideoPrompt(description);
                }
            } catch (err: any) {
                console.error(err);
                setError(err.message || 'فشل في وصف الصورة.');
            } finally {
                setIsDescribing(false);
            }
        };
        reader.readAsDataURL(file);
    }, [mode]);

    const handleClearImage = useCallback(() => {
        setUploadedImage(null);
    }, []);

    const resetCommonState = () => {
        setError(null);
        setUploadedImage(null);
    };

    const handleModeChange = (newMode: Mode) => {
        setMode(newMode);
        resetCommonState();
    };
    
    const renderContent = () => {
        switch (mode) {
            case 'image':
                return (
                    <>
                        <div className="md:w-1/3 lg:w-1/4">
                            <ImageGeneratorForm 
                                prompt={imagePrompt} setPrompt={setImagePrompt}
                                numberOfImages={numberOfImages} setNumberOfImages={setNumberOfImages}
                                aspectRatio={imageAspectRatio} setAspectRatio={setImageAspectRatio}
                                style={imageStyle} setStyle={setImageStyle}
                                isGenerating={isGeneratingImages} onGenerate={handleGenerateImages}
                                uploadedImage={uploadedImage?.data || null} isDescribing={isDescribing}
                                onImageUpload={handleImageUpload} onClearImage={handleClearImage}
                            />
                        </div>
                        <div className="md:w-2/3 lg:w-3/4">
                            <ImageDisplay images={generatedImages} isLoading={isGeneratingImages} error={error} />
                        </div>
                    </>
                );
            case 'video':
                 return (
                    <>
                        <div className="md:w-1/3 lg:w-1/4">
                            <VideoGeneratorForm 
                                prompt={videoPrompt} setPrompt={setVideoPrompt}
                                aspectRatio={videoAspectRatio} setAspectRatio={setVideoAspectRatio}
                                style={videoStyle} setStyle={setVideoStyle}
                                duration={duration} setDuration={setDuration}
                                addVoiceOver={addVoiceOver} setAddVoiceOver={setAddVoiceOver}
                                showSubtitles={showSubtitles} setShowSubtitles={setShowSubtitles}
                                isGenerating={isGeneratingVideo} onGenerate={handleGenerateVideo}
                                uploadedImage={uploadedImage?.data || null} isDescribing={isDescribing}
                                onImageUpload={handleImageUpload} onClearImage={handleClearImage}
                            />
                        </div>
                        <div className="md:w-2/3 lg:w-3/4">
                            <VideoDisplay 
                                videoUrl={generatedVideo} 
                                isLoading={isGeneratingVideo} 
                                error={error} 
                                addVoiceOver={addVoiceOver}
                                showSubtitles={showSubtitles}
                                prompt={videoPrompt}
                            />
                        </div>
                    </>
                );
            case 'website':
                 return (
                    <>
                        <div className="md:w-1/3 lg:w-1/4">
                            <WebsiteGeneratorForm 
                                prompt={websitePrompt}
                                setPrompt={setWebsitePrompt}
                                isGenerating={isGeneratingWebsite}
                                onGenerate={handleGenerateWebsite}
                            />
                        </div>
                        <div className="md:w-2/3 lg:w-3/4">
                           <WebsiteDisplay htmlContent={generatedWebsiteHtml} isLoading={isGeneratingWebsite} error={error} />
                        </div>
                    </>
                );
            case 'qa':
                 return (
                    <>
                        <div className="md:w-1/3 lg:w-1/4">
                            <QaGeneratorForm 
                                prompt={qaPrompt}
                                setPrompt={setQaPrompt}
                                isGenerating={isGeneratingQaResponse}
                                onGenerate={handleGenerateQaResponse}
                            />
                        </div>
                        <div className="md:w-2/3 lg:w-3/4">
                           <QaDisplay response={qaResponse} isLoading={isGeneratingQaResponse} error={error} />
                        </div>
                    </>
                );
            case 'book':
                return (
                    <>
                        <div className="md:w-1/3 lg:w-1/4">
                            <BookGeneratorForm
                                prompt={bookPrompt} setPrompt={setBookPrompt}
                                title={bookTitle} setTitle={setBookTitle}
                                author={authorName} setAuthor={setAuthorName}
                                coverPrompt={coverPrompt} setCoverPrompt={setCoverPrompt}
                                isGenerating={isGeneratingBook} onGenerate={handleGenerateBook}
                                userName={user?.name}
                            />
                        </div>
                        <div className="md:w-2/3 lg:w-3/4">
                            <BookDisplay book={generatedBook} isLoading={isGeneratingBook} error={error} />
                        </div>
                    </>
                );
            case 'comic':
                return (
                    <>
                        <div className="md:w-1/3 lg:w-1/4">
                            <ComicGeneratorForm
                                prompt={comicPrompt} setPrompt={setComicPrompt}
                                title={comicTitle} setTitle={setComicTitle}
                                author={comicAuthor} setAuthor={setComicAuthor}
                                style={comicStyle} setStyle={setComicStyle}
                                isGenerating={isGeneratingComic} onGenerate={handleGenerateComic}
                                userName={user?.name}
                            />
                        </div>
                        <div className="md:w-2/3 lg:w-3/4">
                            <ComicDisplay comic={generatedComic} isLoading={isGeneratingComic} error={error} />
                        </div>
                    </>
                );
             case 'student':
                return (
                    <>
                        <div className="md:w-1/3 lg:w-1/4">
                            <StudentAssistantForm
                                prompt={studentPrompt}
                                setPrompt={setStudentPrompt}
                                assistanceType={assistanceType}
                                setAssistanceType={setAssistanceType}
                                isGenerating={isGeneratingStudentResponse}
                                onGenerate={handleGenerateStudentHelp}
                                numberOfQuestions={numberOfQuestions}
                                setNumberOfQuestions={setNumberOfQuestions}
                                questionType={questionType}
                                setQuestionType={setQuestionType}
                            />
                        </div>
                        <div className="md:w-2/3 lg:w-3/4">
                            <StudentAssistantDisplay
                                response={studentResponse}
                                isLoading={isGeneratingStudentResponse}
                                error={error}
                            />
                        </div>
                    </>
                );
            case 'translator':
                return (
                    <div className="w-full">
                         <TranslatorForm
                            inputText={translatorInput}
                            setInputText={setTranslatorInput}
                            outputText={translatorOutput}
                            setSourceLang={setSourceLang}
                            sourceLang={sourceLang}
                            setTargetLang={setTargetLang}
                            targetLang={targetLang}
                            isTranslating={isTranslating}
                            onTranslate={handleTranslate}
                            error={error}
                        />
                    </div>
                );
            default:
                return null;
        }
    };

    const navigationItems: { id: Mode; label: string; icon: React.FC<{className?: string}> }[] = [
        { id: 'image', label: 'مولد الصور', icon: IconPhoto },
        { id: 'video', label: 'مولد الفيديو', icon: IconClapperboard },
        { id: 'website', label: 'منشئ المواقع', icon: IconCode },
        { id: 'comic', label: 'قصص مصورة', icon: IconLayoutGrid },
        { id: 'book', label: 'مؤلف الكتب', icon: IconBook },
        { id: 'student', label: 'مساعد الطالب', icon: IconGraduationCap },
        { id: 'translator', label: 'المترجم الصوتي', icon: IconLanguages },
        { id: 'qa', label: 'سؤال وجواب', icon: IconHelpCircle },
    ];

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100">
            <Header user={user} onSignOut={handleSignOut}/>
            <main className="container mx-auto px-4 lg:px-8 py-8">
                <nav className="mb-8 overflow-x-auto">
                    <ul className="flex items-center gap-2 sm:gap-4 border-b border-gray-700 pb-2">
                        {navigationItems.map(item => (
                             <li key={item.id} className="flex-shrink-0">
                                <button
                                    onClick={() => handleModeChange(item.id)}
                                    className={`flex items-center gap-2 px-4 py-3 rounded-t-lg font-semibold transition-colors duration-200 ${
                                        mode === item.id 
                                            ? 'bg-gray-800 text-cyan-400 border-b-2 border-cyan-400' 
                                            : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                                    }`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span>{item.label}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="flex flex-col md:flex-row gap-8">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default App;