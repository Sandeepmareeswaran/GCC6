import React, { useState, useEffect, memo } from 'react';
import { useLanguage } from '../context/LanguageContext';

/**
 * DynamicText Component
 * 
 * Translates ANY text dynamically via Groq API.
 * For static UI text, use t() directly.
 * For dynamic content (database, API responses), use this component.
 * 
 * Usage:
 * <DynamicText>Hello World</DynamicText>
 * <DynamicText text={databaseText} />
 * <DynamicText>{product.description}</DynamicText>
 */
const DynamicText = memo(function DynamicText({
          children,
          text,
          as: Component = 'span',
          style,
          className,
          immediate = false,
          ...props
}) {
          const { language, translateNow, translations } = useLanguage();
          const originalText = text || children;
          const [translated, setTranslated] = useState(originalText);
          const [isTranslating, setIsTranslating] = useState(false);

          useEffect(() => {
                    if (!originalText || language === 'en') {
                              setTranslated(originalText);
                              return;
                    }

                    const key = `${language}:${originalText}`;

                    // Check cache first
                    if (translations[key]) {
                              setTranslated(translations[key]);
                              return;
                    }

                    // Translate via API
                    setIsTranslating(true);
                    translateNow(originalText).then((result) => {
                              setTranslated(result);
                              setIsTranslating(false);
                    }).catch(() => {
                              setTranslated(originalText);
                              setIsTranslating(false);
                    });
          }, [originalText, language, translations, translateNow]);

          // For simple span with no styling, return text directly
          if (Component === 'span' && !style && !className && Object.keys(props).length === 0) {
                    return translated;
          }

          return (
                    <Component
                              style={{
                                        ...style,
                                        opacity: isTranslating ? 0.7 : 1,
                                        transition: 'opacity 0.2s',
                              }}
                              className={className}
                              {...props}
                    >
                              {translated}
                    </Component>
          );
});

/**
 * T Component - For static UI text
 * Uses t() function which queues translations in batch
 */
const T = memo(function T({ children, text }) {
          const { t } = useLanguage();
          return t(text || children);
});

/**
 * Hook to translate dynamic content
 * Returns translated text and loading state
 */
export function useDynamicTranslation(text) {
          const { language, translateNow, translations } = useLanguage();
          const [translated, setTranslated] = useState(text);
          const [loading, setLoading] = useState(false);

          useEffect(() => {
                    if (!text || language === 'en') {
                              setTranslated(text);
                              return;
                    }

                    const key = `${language}:${text}`;
                    if (translations[key]) {
                              setTranslated(translations[key]);
                              return;
                    }

                    setLoading(true);
                    translateNow(text).then((result) => {
                              setTranslated(result);
                              setLoading(false);
                    });
          }, [text, language, translations, translateNow]);

          return { translated, loading };
}

/**
 * Hook to translate array of dynamic content
 */
export function useDynamicTranslations(texts) {
          const { language, translateMany, translations } = useLanguage();
          const [translated, setTranslated] = useState(texts);
          const [loading, setLoading] = useState(false);

          useEffect(() => {
                    if (!texts?.length || language === 'en') {
                              setTranslated(texts);
                              return;
                    }

                    // Check if all cached
                    const allCached = texts.every(text => translations[`${language}:${text}`]);
                    if (allCached) {
                              setTranslated(texts.map(text => translations[`${language}:${text}`]));
                              return;
                    }

                    setLoading(true);
                    translateMany(texts).then((results) => {
                              setTranslated(results);
                              setLoading(false);
                    });
          }, [texts?.join('|||'), language, translations, translateMany]);

          return { translated, loading };
}

export { DynamicText, T };
export default DynamicText;
