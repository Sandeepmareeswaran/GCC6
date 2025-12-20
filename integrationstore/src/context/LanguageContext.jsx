import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const LanguageContext = createContext();

// Supported languages
export const LANGUAGES = {
          en: { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
          hi: { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
          ta: { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
};

const API_BASE = 'http://localhost:5009';

export function LanguageProvider({ children }) {
          const [language, setLanguageState] = useState(() => {
                    return localStorage.getItem('language') || 'en';
          });
          const [translations, setTranslations] = useState(() => {
                    try {
                              const cached = localStorage.getItem('translations_cache');
                              return cached ? JSON.parse(cached) : {};
                    } catch {
                              return {};
                    }
          });
          const [isLoading, setIsLoading] = useState(false);
          const [pendingTexts, setPendingTexts] = useState(new Set());
          const batchTimeoutRef = useRef(null);
          const batchQueueRef = useRef([]);

          // Save translations to localStorage
          useEffect(() => {
                    if (Object.keys(translations).length > 0) {
                              localStorage.setItem('translations_cache', JSON.stringify(translations));
                    }
          }, [translations]);

          // Batch translate texts via API
          const batchTranslate = useCallback(async (texts, targetLang) => {
                    if (!texts.length || targetLang === 'en') return {};

                    const targetLanguage = targetLang === 'hi' ? 'Hindi' : 'Tamil';

                    try {
                              const response = await fetch(`${API_BASE}/api/translate/batch`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ texts, targetLanguage }),
                              });

                              const result = await response.json();
                              if (result.success && result.translations) {
                                        const newTranslations = {};
                                        texts.forEach((text, idx) => {
                                                  const key = `${targetLang}:${text}`;
                                                  newTranslations[key] = result.translations[idx] || text;
                                        });
                                        return newTranslations;
                              }
                    } catch (error) {
                              console.error('Batch translation error:', error);
                    }

                    return {};
          }, []);

          // Process batch queue
          const processBatchQueue = useCallback(async () => {
                    if (batchQueueRef.current.length === 0) return;

                    const textsToTranslate = [...new Set(batchQueueRef.current)];
                    batchQueueRef.current = [];

                    if (textsToTranslate.length === 0) return;

                    setIsLoading(true);

                    try {
                              // Translate in batches of 15
                              const batchSize = 15;
                              const allNewTranslations = {};

                              for (let i = 0; i < textsToTranslate.length; i += batchSize) {
                                        const batch = textsToTranslate.slice(i, i + batchSize);
                                        const newTranslations = await batchTranslate(batch, language);
                                        Object.assign(allNewTranslations, newTranslations);
                              }

                              if (Object.keys(allNewTranslations).length > 0) {
                                        setTranslations(prev => ({ ...prev, ...allNewTranslations }));
                              }
                    } finally {
                              setIsLoading(false);
                              setPendingTexts(new Set());
                    }
          }, [language, batchTranslate]);

          // Queue text for translation
          const queueForTranslation = useCallback((text) => {
                    if (!text || language === 'en') return;

                    const key = `${language}:${text}`;
                    if (translations[key]) return;

                    // Check if already pending
                    if (pendingTexts.has(text)) return;

                    setPendingTexts(prev => new Set(prev).add(text));
                    batchQueueRef.current.push(text);

                    // Debounce batch processing
                    if (batchTimeoutRef.current) {
                              clearTimeout(batchTimeoutRef.current);
                    }

                    batchTimeoutRef.current = setTimeout(() => {
                              processBatchQueue();
                    }, 300);
          }, [language, translations, pendingTexts, processBatchQueue]);

          // Change language
          const setLanguage = useCallback(async (newLang) => {
                    setLanguageState(newLang);
                    localStorage.setItem('language', newLang);

                    // Clear pending texts when changing language
                    batchQueueRef.current = [];
                    setPendingTexts(new Set());
          }, []);

          // Translation function - returns cached translation or queues for translation
          const t = useCallback((text) => {
                    if (!text) return text;
                    if (language === 'en') return text;

                    const key = `${language}:${text}`;

                    // Return cached translation if available
                    if (translations[key]) {
                              return translations[key];
                    }

                    // Queue for translation in background
                    queueForTranslation(text);

                    // Return original text while waiting
                    return text;
          }, [language, translations, queueForTranslation]);

          // Translate single text immediately (for dynamic content)
          const translateNow = useCallback(async (text) => {
                    if (!text || language === 'en') return text;

                    const key = `${language}:${text}`;
                    if (translations[key]) return translations[key];

                    try {
                              const targetLanguage = language === 'hi' ? 'Hindi' : 'Tamil';
                              const response = await fetch(`${API_BASE}/api/translate`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ text, targetLanguage }),
                              });

                              const result = await response.json();
                              if (result.success && result.translatedText) {
                                        setTranslations(prev => ({
                                                  ...prev,
                                                  [key]: result.translatedText,
                                        }));
                                        return result.translatedText;
                              }
                    } catch (error) {
                              console.error('Translation error:', error);
                    }

                    return text;
          }, [language, translations]);

          // Translate array of texts immediately
          const translateMany = useCallback(async (texts) => {
                    if (!texts?.length || language === 'en') return texts;

                    const uncached = texts.filter(text => !translations[`${language}:${text}`]);

                    if (uncached.length > 0) {
                              setIsLoading(true);
                              try {
                                        const newTranslations = await batchTranslate(uncached, language);
                                        if (Object.keys(newTranslations).length > 0) {
                                                  setTranslations(prev => ({ ...prev, ...newTranslations }));
                                        }
                              } finally {
                                        setIsLoading(false);
                              }
                    }

                    return texts.map(text => {
                              const key = `${language}:${text}`;
                              return translations[key] || text;
                    });
          }, [language, translations, batchTranslate]);

          // Clear translation cache
          const clearCache = useCallback(() => {
                    setTranslations({});
                    localStorage.removeItem('translations_cache');
          }, []);

          const currentLanguage = LANGUAGES[language];

          return (
                    <LanguageContext.Provider value={{
                              language,
                              setLanguage,
                              t,
                              translateNow,
                              translateMany,
                              queueForTranslation,
                              clearCache,
                              currentLanguage,
                              isLoading,
                              languages: LANGUAGES,
                              translations,
                    }}>
                              {children}
                    </LanguageContext.Provider>
          );
}

export function useLanguage() {
          const context = useContext(LanguageContext);
          if (!context) {
                    throw new Error('useLanguage must be used within a LanguageProvider');
          }
          return context;
}

export default LanguageContext;
