/**
 * Codi AI — Voice & Speech Engine (STT & TTS)
 * Web Speech API with Indonesian (id-ID) Localization
 * Synchronized with 3D Character States & Haptic Feedback
 */

(function () {
  'use strict';

  // Audio State & Config
  const SpeechState = {
    isListening: false,
    isSpeaking: false,
    isMuted: false
  };

  // 1. Text-to-Speech (TTS Engine)
  const synth = window.speechSynthesis;
  let currentUtterance = null;

  function speakText(text, onStart, onEnd) {
    if (!synth || SpeechState.isMuted) {
      if (onEnd) onEnd();
      return;
    }

    // Cancel ongoing speech
    stopSpeaking();

    // Clean text for speech (strip markdown symbols)
    const cleanText = text
      .replace(/[*_#`~>]/g, '')
      .replace(/\[.*?\]/g, '')
      .trim();

    currentUtterance = new SpeechSynthesisUtterance(cleanText);
    currentUtterance.lang = 'id-ID';
    currentUtterance.rate = 0.92; // Patient tempo for elementary kids
    currentUtterance.pitch = 1.05; // Friendly warm pitch

    // Choose best Indonesian voice if available
    const voices = synth.getVoices();
    const idVoice = voices.find(v => v.lang === 'id-ID' || v.lang.startsWith('id'));
    if (idVoice) {
      currentUtterance.voice = idVoice;
    }

    currentUtterance.onstart = () => {
      SpeechState.isSpeaking = true;
      if (window.setCodiState) window.setCodiState('speaking');
      if (onStart) onStart();
    };

    currentUtterance.onend = () => {
      SpeechState.isSpeaking = false;
      if (window.setCodiState) window.setCodiState('idle');
      if (onEnd) onEnd();
    };

    currentUtterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      SpeechState.isSpeaking = false;
      if (window.setCodiState) window.setCodiState('idle');
      if (onEnd) onEnd();
    };

    synth.speak(currentUtterance);
  }

  function stopSpeaking() {
    if (synth) {
      try {
        synth.cancel();
      } catch (e) {
        console.warn('Speech cancel note:', e);
      }
    }
    SpeechState.isSpeaking = false;
    currentUtterance = null;
    if (window.setCodiState) window.setCodiState('idle');
  }

  function toggleMute() {
    SpeechState.isMuted = !SpeechState.isMuted;
    if (SpeechState.isMuted) {
      stopSpeaking();
    }
    return SpeechState.isMuted;
  }

  // 2. Speech-to-Text (STT Recognition Engine)
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null;

  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
  }

  function startListening(onResult, onError, onFinal) {
    if (!recognition) {
      if (onError) onError('Peramban ini belum mendukung input suara langsung. Adik bisa gunakan ketik ya!');
      return;
    }

    // Stop TTS if speaking
    stopSpeaking();

    // Haptic feedback (15ms vibration)
    if (navigator.vibrate) {
      navigator.vibrate(15);
    }

    try {
      recognition.onstart = () => {
        SpeechState.isListening = true;
        if (window.setCodiState) window.setCodiState('listening');
      };

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (onResult) {
          onResult(finalTranscript || interimTranscript, Boolean(finalTranscript));
        }

        if (finalTranscript && onFinal) {
          onFinal(finalTranscript);
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        SpeechState.isListening = false;
        if (window.setCodiState) window.setCodiState('idle');
        if (onError) onError(event.error);
      };

      recognition.onend = () => {
        SpeechState.isListening = false;
        if (window.setCodiState) window.setCodiState('idle');
      };

      recognition.start();
    } catch (err) {
      console.warn('Recognition start error:', err);
      SpeechState.isListening = false;
      if (window.setCodiState) window.setCodiState('idle');
      if (onError) onError(err);
    }
  }

  function stopListening() {
    if (recognition && SpeechState.isListening) {
      recognition.stop();
      SpeechState.isListening = false;
      if (window.setCodiState) window.setCodiState('idle');
    }
  }

  // Pre-load voices
  if (synth && synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = () => {
      synth.getVoices();
    };
  }

  // Export to global scope
  window.CodiSpeech = {
    state: SpeechState,
    speakText,
    stopSpeaking,
    toggleMute,
    startListening,
    stopListening,
    isSupported: Boolean(SpeechRecognition)
  };
})();
