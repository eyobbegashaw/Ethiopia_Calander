import React, { useState } from 'react';
import { arabicToGeez, geezToArabic } from '../utils/geezNumerals';
import './styles/GeezNumeralConverter.css';

const GeezNumeralConverter = () => {
    const [mode, setMode] = useState('arabic-to-geez');
    const [input, setInput] = useState('');
    const isArabicToGeez = mode === 'arabic-to-geez';

    let output = '';
    let error = '';

    if (input.trim()) {
        try {
            if (isArabicToGeez) {
                const value = Number(input);
                if (!/^\d+$/.test(input.trim()) || !Number.isSafeInteger(value) || value < 1) {
                    throw new Error('Enter a positive whole number using Arabic digits.');
                }
                output = arabicToGeez(value);
            } else {
                output = String(geezToArabic(input));
            }
        } catch (conversionError) {
            error = conversionError.message;
        }
    }

    const changeMode = (nextMode) => {
        setMode(nextMode);
        setInput('');
    };

    return (
        <section className="card geez-converter-card" id="geez-numerals">
            <h2 className="section-title">ግእዝ ቁጥር - Geez Number Converter</h2>

            <div className="geez-converter-shell">
                <div className="geez-converter-panel">
                    <div className="geez-mode-toggle" role="group" aria-label="Conversion direction">
                        <button
                            type="button"
                            className={isArabicToGeez ? 'active' : ''}
                            onClick={() => changeMode('arabic-to-geez')}
                            aria-pressed={isArabicToGeez}
                        >
                            Arabic → Geez
                        </button>
                        <button
                            type="button"
                            className={!isArabicToGeez ? 'active' : ''}
                            onClick={() => changeMode('geez-to-arabic')}
                            aria-pressed={!isArabicToGeez}
                        >
                            Geez → Arabic
                        </button>
                    </div>

                    <label className="geez-input-label" htmlFor="geez-number-input">
                        {isArabicToGeez ? 'Enter an Arabic number' : 'Enter a Geez number'}
                    </label>
                    <input
                        id="geez-number-input"
                        className="geez-number-input"
                        type={isArabicToGeez ? 'number' : 'text'}
                        inputMode={isArabicToGeez ? 'numeric' : 'text'}
                        min={isArabicToGeez ? '1' : undefined}
                        value={input}
                        onChange={(event) => setInput(event.target.value)}
                        placeholder={isArabicToGeez ? 'e.g. 1234' : 'e.g. ፲፪፻፴፬'}
                        autoComplete="off"
                    />

                    <div className="geez-conversion-output" aria-live="polite">
                        {error ? (
                            <p className="geez-conversion-error" role="alert">{error}</p>
                        ) : output ? (
                            <>
                                <span className="geez-output-label">{isArabicToGeez ? 'ግእዝ ቁጥር' : 'Arabic number'}</span>
                                <output>{output}</output>
                            </>
                        ) : (
                            <p className="geez-output-placeholder">Converted number appears here as you type.</p>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default GeezNumeralConverter;
