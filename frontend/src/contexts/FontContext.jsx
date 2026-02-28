import React, { createContext, useState, useContext, useEffect } from 'react';

const FontContext = createContext();

export const useFont = () => useContext(FontContext);

export const FontProvider = ({ children }) => {
    const [fontSize, setFontSize] = useState(16);

    useEffect(() => {
        document.documentElement.style.setProperty('--font-size', fontSize + 'px');
    }, [fontSize]);

    const decreaseFontSize = () => {
        setFontSize(prev => Math.max(12, prev - 1));
    };

    const resetFontSize = () => {
        setFontSize(16);
    };

    const increaseFontSize = () => {
        setFontSize(prev => Math.min(24, prev + 1));
    };

    return (
        <FontContext.Provider value={{ fontSize, decreaseFontSize, resetFontSize, increaseFontSize }}>
            {children}
        </FontContext.Provider>
    );
};