
import React, { useRef, useEffect } from 'react';

interface PixelatedImageProps {
    src: string;
    alt: string;
    className?: string;
}

export const PixelatedImage: React.FC<PixelatedImageProps> = ({ src, alt, className }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = src;

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            
            const resolutions = [8, 16, 32, 64, 128, 256, 512, img.width];
            let currentResIndex = 0;

            const drawPixelated = () => {
                if (!canvasRef.current) return; // Check if component is still mounted

                if (currentResIndex >= resolutions.length) {
                    ctx.imageSmoothingEnabled = true;
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    return;
                }

                const res = Math.min(resolutions[currentResIndex], img.width);
                const aspect = img.height / img.width;
                
                const w = res;
                const h = res * aspect;
                
                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(img, 0, 0, w, h);
                ctx.drawImage(canvas, 0, 0, w, h, 0, 0, canvas.width, canvas.height);
                
                currentResIndex++;
                setTimeout(drawPixelated, 75);
            };

            drawPixelated();
        };

        img.onerror = () => {
            console.error("Failed to load image for pixelation effect.");
        };

    }, [src]);

    return <canvas ref={canvasRef} className={className} aria-label={alt} />;
};
