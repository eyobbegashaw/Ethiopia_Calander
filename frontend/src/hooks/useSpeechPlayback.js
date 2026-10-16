import { useSyncExternalStore } from 'react';

let activeSpeechId = null;
let currentSpeechToken = 0;
const listeners = new Set();

const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
};

const getSnapshot = () => activeSpeechId;

const setActiveSpeechId = (speechId) => {
    activeSpeechId = speechId;
    listeners.forEach((listener) => listener());
};

const cancelSpeech = () => {
    currentSpeechToken += 1;
    window.speechSynthesis.cancel();
    setActiveSpeechId(null);
};

const toggleSpeech = (speechId, text, lang = 'am-ET') => {
    if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
        window.alert('Audio playback is not supported in this browser.');
        return;
    }

    if (activeSpeechId === speechId) {
        cancelSpeech();
        return;
    }

    currentSpeechToken += 1;
    const token = currentSpeechToken;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.onend = () => {
        if (token === currentSpeechToken) {
            setActiveSpeechId(null);
        }
    };
    utterance.onerror = (event) => {
        if (token === currentSpeechToken) {
            setActiveSpeechId(null);
            if (event.error !== 'canceled' && event.error !== 'interrupted') {
                console.error('Speech playback failed:', event.error);
            }
        }
    };

    setActiveSpeechId(speechId);
    window.speechSynthesis.speak(utterance);
};

export default function useSpeechPlayback() {
    const currentId = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

    return {
        activeSpeechId: currentId,
        toggleSpeech
    };
}
