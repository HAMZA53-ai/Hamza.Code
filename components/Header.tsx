
import React, { useState, useEffect, useRef } from 'react';
import { IconCodeBrackets, IconGoogle } from './Icon';
import type { User } from '../types';

declare global {
    interface Window {
        google?: any;
    }
}

interface HeaderProps {
    user: User | null;
    onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onSignOut }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const signInButtonRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Render the Google Sign-In button if the user is not logged in
        if (!user && signInButtonRef.current && window.google) {
            // Clear the container first to avoid re-rendering issues
            signInButtonRef.current.innerHTML = ''; 
            window.google.accounts.id.renderButton(
                signInButtonRef.current,
                { 
                    theme: "outline", 
                    size: "large", 
                    type: 'standard', 
                    text: 'signin_with', 
                    shape: 'pill',
                    logo_alignment: 'left',
                    locale: 'ar'
                } 
            );
        }
    }, [user]);

    return (
        <header className="bg-gray-800/50 backdrop-blur-sm sticky top-0 z-10 shadow-lg">
            <div className="container mx-auto px-4 lg:px-8 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <IconCodeBrackets className="w-8 h-8 text-cyan-400" />
                        <h1 className="text-2xl font-bold text-white tracking-tight">
                            حمزة كود
                        </h1>
                    </div>
                    <div>
                        {user ? (
                            <div className="relative">
                                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-2">
                                    <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full border-2 border-cyan-400" />
                                </button>
                                {isDropdownOpen && (
                                    <div className="absolute left-0 rtl:left-auto rtl:right-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-4 z-20">
                                        <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-700">
                                            <img src={user.picture} alt={user.name} className="w-12 h-12 rounded-full" />
                                            <div>
                                                 <p className="font-semibold text-white">{user.name}</p>
                                                 <p className="text-sm text-gray-400">{user.email}</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => {
                                                onSignOut();
                                                setIsDropdownOpen(false);
                                            }}
                                            className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-red-500/20 hover:text-red-300 rounded-md transition-colors"
                                        >
                                            تسجيل الخروج
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                           <div ref={signInButtonRef}></div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};