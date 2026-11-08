"use strict";

/**
 * ========================================
 * Multilingual support (i18n)
 * ========================================
 *
 * Translates the page into the language picked in the header's language menu.
 *
 * How it works:
 * - Every translatable element in index.html carries a key:
 *     data-i18n="hero.title"                        → replaces the element's text
 *     data-i18n-attr="placeholder:contact.form.name" → replaces an attribute
 *                                                      (several pairs separated by ";")
 * - Each language has a JSON file in assets/i18n/ (en.json, fr.json, ...) mapping keys to text.
 * - The English text written in index.html is the fallback: a key missing from a language file
 *   simply stays in English, and the page still works if a file cannot be loaded.
 * - The chosen language is remembered in localStorage and can be shared with a link such as
 *   ?lang=fr. Arabic and Urdu also switch the page direction to right-to-left.
 *
 * Text is only ever inserted with textContent / setAttribute, never as HTML.
 *
 * To add a language: create assets/i18n/<code>.json with the same keys as en.json, add the code
 * to SUPPORTED_LANGUAGES (and RIGHT_TO_LEFT_LANGUAGES if needed), and add an <option> to the
 * language menu in index.html.
 */

(function initializeTranslations() {

    /** Language codes that have a file in assets/i18n/. */
    const SUPPORTED_LANGUAGES = ["en", "es", "fr", "de", "zh", "ja", "ar", "ur"];

    /** Languages written right to left. */
    const RIGHT_TO_LEFT_LANGUAGES = new Set(["ar", "ur"]);

    /** Language of the text written in index.html. */
    const DEFAULT_LANGUAGE = "en";

    /** localStorage key under which the chosen language is saved. */
    const LANGUAGE_STORAGE_KEY = "language";

    /** URL query parameter that selects a language, e.g. ?lang=fr. */
    const LANGUAGE_QUERY_PARAMETER = "lang";

    /** Folder holding the translation files, relative to index.html. */
    const TRANSLATIONS_FOLDER = "assets/i18n/";

    /** Translation files already downloaded, by language code. */
    const loadedTranslations = new Map();

    /** Original English text of each data-i18n element, used when a key is missing. */
    const originalTexts = new Map();

    /** Original English value of each translated attribute, keyed by element then attribute. */
    const originalAttributes = new Map();

    const languageMenu = document.getElementById("lang");
    const textElements = Array.from(document.querySelectorAll("[data-i18n]"));
    const attributeElements = Array.from(document.querySelectorAll("[data-i18n-attr]"));

    /**
     * Splits a data-i18n-attr value such as "aria-label:header.theme;title:header.theme" into
     * attribute/key pairs.
     *
     * @param {string} attributeSpecification - The raw data-i18n-attr value.
     * @returns {Array<{attributeName: string, translationKey: string}>} The parsed pairs.
     */
    function parseAttributeSpecification(attributeSpecification) {
        return attributeSpecification
            .split(";")
            .map((pair) => pair.split(":").map((part) => part.trim()))
            .filter(([attributeName, translationKey]) => attributeName && translationKey)
            .map(([attributeName, translationKey]) => ({attributeName, translationKey}));
    }

    /**
     * Records the English text and attribute values written in index.html, so they can be
     * restored for English and used whenever a translation is missing.
     *
     * @returns {void}
     */
    function rememberOriginalTexts() {
        textElements.forEach((element) => originalTexts.set(element, element.textContent));
        attributeElements.forEach((element) => {
            const originalValues = new Map();
            parseAttributeSpecification(element.dataset.i18nAttr).forEach(({attributeName}) => {
                originalValues.set(attributeName, element.getAttribute(attributeName));
            });
            originalAttributes.set(element, originalValues);
        });
    }

    /**
     * Checks whether a language code is one this site has translations for.
     *
     * @param {string|null} languageCode - The code to check.
     * @returns {boolean} True if the language is supported.
     */
    function isSupportedLanguage(languageCode) {
        return SUPPORTED_LANGUAGES.includes(languageCode);
    }

    /**
     * Reads the saved language from localStorage, which can be unavailable (privacy modes).
     *
     * @returns {string|null} The saved language code, or null if none is saved or storage fails.
     */
    function readSavedLanguage() {
        try {
            return localStorage.getItem(LANGUAGE_STORAGE_KEY);
        } catch (storageError) {
            return null;
        }
    }

    /**
     * Saves the chosen language to localStorage, silently ignoring unavailable storage.
     *
     * @param {string} languageCode - The language to remember.
     * @returns {void}
     */
    function saveLanguage(languageCode) {
        try {
            localStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode);
        } catch (storageError) {
            // The language still applies for this visit; it just won't be remembered.
        }
    }

    /**
     * Picks the language to show on page load: a ?lang= link wins, then the visitor's saved
     * choice, then English.
     *
     * @returns {string} A supported language code.
     */
    function chooseInitialLanguage() {
        const languageFromLink = new URLSearchParams(window.location.search).get(LANGUAGE_QUERY_PARAMETER);
        if (isSupportedLanguage(languageFromLink)) {
            return languageFromLink;
        }
        const savedLanguage = readSavedLanguage();
        return isSupportedLanguage(savedLanguage) ? savedLanguage : DEFAULT_LANGUAGE;
    }

    /**
     * Downloads (once) and returns the translations for a language. English needs no file
     * because its text is already in the page. Failures resolve to an empty set of
     * translations, so the page simply stays in English.
     *
     * @param {string} languageCode - The language to load.
     * @returns {Promise<Object<string, string>>} Translation text by key.
     */
    function loadTranslations(languageCode) {
        if (languageCode === DEFAULT_LANGUAGE) {
            return Promise.resolve({});
        }
        if (!loadedTranslations.has(languageCode)) {
            const translationsRequest = fetch(`${TRANSLATIONS_FOLDER}${languageCode}.json`)
                .then((response) => (response.ok ? response.json() : {}))
                .catch(() => ({}));
            loadedTranslations.set(languageCode, translationsRequest);
        }
        return loadedTranslations.get(languageCode);
    }

    /**
     * Returns a translation if the language file has the key, otherwise the fallback. An empty
     * string is a valid translation: some languages need no text where English has some
     * (e.g. Japanese has no word before the name in "I'm <name>").
     *
     * @param {Object<string, string>} translations - Translation text by key.
     * @param {string} translationKey - The key to look up.
     * @param {string|null} fallbackText - The English text to use when no translation exists.
     * @returns {string|null} The text to show.
     */
    function translateOrFallback(translations, translationKey, fallbackText) {
        const translatedText = translations[translationKey];
        return typeof translatedText === "string" ? translatedText : fallbackText;
    }

    /**
     * Writes the given translations into every tagged element and attribute, and updates the
     * page's language and text direction.
     *
     * @param {string} languageCode - The language being applied.
     * @param {Object<string, string>} translations - Translation text by key.
     * @returns {void}
     */
    function applyTranslations(languageCode, translations) {
        textElements.forEach((element) => {
            element.textContent = translateOrFallback(translations, element.dataset.i18n, originalTexts.get(element));
        });

        attributeElements.forEach((element) => {
            const originalValues = originalAttributes.get(element);
            parseAttributeSpecification(element.dataset.i18nAttr).forEach(({attributeName, translationKey}) => {
                const attributeValue = translateOrFallback(translations, translationKey, originalValues.get(attributeName));
                if (attributeValue !== null) {
                    element.setAttribute(attributeName, attributeValue);
                }
            });
        });

        document.documentElement.lang = languageCode;
        document.documentElement.dir = RIGHT_TO_LEFT_LANGUAGES.has(languageCode) ? "rtl" : "ltr";
        if (languageMenu) {
            languageMenu.value = languageCode;
        }

        // Lets script.js re-fit layout that depends on text length (e.g. the header menu).
        document.dispatchEvent(new CustomEvent("pagelanguagechange", {detail: {languageCode}}));
    }

    /**
     * Keeps the ?lang= parameter in the address bar in step with the chosen language, so the
     * current URL can be shared. English, the default, needs no parameter.
     *
     * @param {string} languageCode - The language now shown.
     * @returns {void}
     */
    function updateAddressBar(languageCode) {
        const currentUrl = new URL(window.location.href);
        if (languageCode === DEFAULT_LANGUAGE) {
            currentUrl.searchParams.delete(LANGUAGE_QUERY_PARAMETER);
        } else {
            currentUrl.searchParams.set(LANGUAGE_QUERY_PARAMETER, languageCode);
        }
        window.history.replaceState(window.history.state, "", currentUrl);
    }

    /**
     * Loads and shows a language.
     *
     * @param {string} languageCode - A supported language code.
     * @returns {Promise<void>} Resolves once the page shows the language.
     */
    function switchLanguage(languageCode) {
        return loadTranslations(languageCode).then((translations) => applyTranslations(languageCode, translations));
    }

    /**
     * Handles a choice in the language menu: shows the language, remembers it and updates the
     * shareable link.
     *
     * @returns {void}
     */
    function handleLanguageMenuChange() {
        const chosenLanguage = languageMenu.value;
        if (!isSupportedLanguage(chosenLanguage)) {
            return;
        }
        saveLanguage(chosenLanguage);
        updateAddressBar(chosenLanguage);
        switchLanguage(chosenLanguage);
    }

    rememberOriginalTexts();

    const initialLanguage = chooseInitialLanguage();

    /**
     * Resolves once the first language has been applied. script.js keeps the preloader on
     * screen until then, so visitors who chose another language never see the English text
     * flash first.
     *
     * @type {Promise<void>}
     */
    window.pageTranslationReady = initialLanguage === DEFAULT_LANGUAGE
        ? Promise.resolve()
        : switchLanguage(initialLanguage);

    if (languageMenu) {
        languageMenu.value = initialLanguage;
        languageMenu.addEventListener("change", handleLanguageMenuChange);
    }
})();
