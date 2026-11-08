/**
 * ========================================
 * Main JavaScript File - Portfolio Website
 * ========================================
 *
 * This file contains all client-side functionality for the portfolio website including:
 * - Header and navigation management (sticky header, mobile menu toggle)
 * - Theme switching (dark/light mode) with localStorage persistence
 * - Skills section toggle functionality for switching between skill categories
 * - WhatsApp chat modal handling (the chat page is only loaded on first open)
 * - Preloader ("bird" animation) that closes as soon as the page's required assets are loaded
 * - Dynamic copyright year in the footer
 *
 * The script is loaded at the end of <body>, so every element it looks up already exists.
 * It never writes HTML strings into the page (no innerHTML), only classes, text and attributes.
 *
 * ========================================
 */

'use strict';

/* ----------------------------------------
 * Constants
 * ---------------------------------------- */

/** CSS class used throughout the site to mark an element as open / active. */
const ACTIVE_CLASS = "active";

/** localStorage key under which the chosen color theme is saved. */
const THEME_STORAGE_KEY = "theme";

/** Body class for the dark color theme (the default). */
const DARK_THEME_CLASS = "dark_theme";

/** Body class for the light color theme. */
const LIGHT_THEME_CLASS = "light_theme";

/** Scroll distance (px) after which the header becomes sticky and the go-to-top button appears. */
const STICKY_HEADER_SCROLL_OFFSET = 10;

/**
 * Shortest time (ms since navigation start) the preloader stays on screen. It only prevents a
 * one-frame flash on very fast (cached) loads; on a normal load the page takes longer than this
 * anyway, so no extra waiting is added.
 */
const PRELOADER_MIN_VISIBLE_MS = 300;

/**
 * Longest time (ms since navigation start) the preloader may stay on screen. If a resource hangs
 * (slow third-party image host, blocked font), the page is revealed anyway.
 */
const PRELOADER_MAX_VISIBLE_MS = 6000;

/**
 * How long to wait for the CSS fade-out (0.45s in style.css) to finish before removing the
 * preloader from the DOM regardless, in case the transitionend event never fires.
 */
const PRELOADER_FADE_FALLBACK_MS = 700;

/** Media query for the desktop layout, where the menu sits in one row beside the logo. */
const DESKTOP_NAVIGATION_MEDIA_QUERY = "(min-width: 992px)";

/** Smallest font size (px) the desktop menu shrinks to before it wraps onto a second line. */
const NAVIGATION_MIN_FONT_SIZE_PX = 14;

/** Minimum clear space (px) kept between the desktop menu and the logo or header actions. */
const NAVIGATION_MIN_GAP_PX = 16;

/** How much (px) the desktop menu font shrinks per step while it does not fit. */
const NAVIGATION_FONT_STEP_PX = 1;

/** Class that lets the desktop menu wrap onto a second line when even the smallest font does not fit. */
const NAVIGATION_WRAPPED_CLASS = "navbar-list--wrapped";

/* ----------------------------------------
 * Element references
 * ---------------------------------------- */

const headerElement = document.querySelector("[data-header]");
const goToTopButton = document.querySelector("[data-go-top]");
const navbarToggleButton = document.querySelector("[data-nav-toggle-btn]");
const navbarElement = document.querySelector("[data-navbar]");
const navbarLinks = document.querySelectorAll(".navbar-link");
const navbarList = document.querySelector(".navbar-list");
const headerLogo = document.querySelector(".header .logo");
const headerActions = document.querySelector(".header .navbar-actions");
const skillsToggleContainer = document.querySelector("[data-toggle-box]");
const skillsToggleButtons = document.querySelectorAll("[data-toggle-btn]");
const skillsContentBox = document.querySelector("[data-skills-box]");
const themeToggleButton = document.querySelector("[data-theme-btn]");

/* ----------------------------------------
 * Generic helpers
 * ---------------------------------------- */

/**
 * Toggles the shared "active" class on an element.
 *
 * @param {Element} targetElement - The element whose active state should be flipped.
 * @returns {void}
 */
function toggleActiveClass(targetElement) {
    targetElement.classList.toggle(ACTIVE_CLASS);
}

/**
 * Returns a promise that resolves after the given delay. Negative delays resolve immediately.
 *
 * @param {number} delayInMilliseconds - How long to wait.
 * @returns {Promise<void>} Resolves once the delay has passed.
 */
function waitFor(delayInMilliseconds) {
    return new Promise((resolve) => setTimeout(resolve, Math.max(0, delayInMilliseconds)));
}

/* ----------------------------------------
 * Header & navigation
 * ---------------------------------------- */

/**
 * Makes the header sticky and shows the go-to-top button once the user has scrolled past
 * {@link STICKY_HEADER_SCROLL_OFFSET}; reverts both when back at the top.
 *
 * @returns {void}
 */
function updateHeaderOnScroll() {
    const hasScrolledDown = window.scrollY >= STICKY_HEADER_SCROLL_OFFSET;
    headerElement.classList.toggle(ACTIVE_CLASS, hasScrolledDown);
    goToTopButton.classList.toggle(ACTIVE_CLASS, hasScrolledDown);
}

/**
 * Opens or closes the mobile navigation menu. The body also gets the active class so the CSS
 * can stop the page from scrolling behind the open menu.
 *
 * @returns {void}
 */
function toggleMobileNavigation() {
    toggleActiveClass(navbarToggleButton);
    toggleActiveClass(navbarElement);
    toggleActiveClass(document.body);
}

/**
 * Closes the mobile navigation menu (used after a menu link is chosen).
 *
 * @returns {void}
 */
function closeMobileNavigation() {
    navbarElement.classList.remove(ACTIVE_CLASS);
    navbarToggleButton.classList.remove(ACTIVE_CLASS);
    document.body.classList.remove(ACTIVE_CLASS);
}

/**
 * Checks whether two on-screen boxes overlap horizontally.
 *
 * @param {DOMRect} firstBox - The first box.
 * @param {DOMRect} secondBox - The second box.
 * @returns {boolean} True if the boxes share any horizontal space.
 */
function boxesOverlapHorizontally(firstBox, secondBox) {
    return firstBox.left < secondBox.right && secondBox.left < firstBox.right;
}

/**
 * Returns a copy of a box widened by the given margin on both sides.
 *
 * @param {DOMRect} box - The original box.
 * @param {number} marginInPixels - Space to add on the left and the right.
 * @returns {{left: number, right: number}} The widened box.
 */
function widenBox(box, marginInPixels) {
    return {left: box.left - marginInPixels, right: box.right + marginInPixels};
}

/**
 * Checks whether the desktop menu comes closer than NAVIGATION_MIN_GAP_PX to the logo or the
 * header actions (language menu and theme button), or runs outside the header.
 *
 * @returns {boolean} True if the menu does not fit in its row.
 */
function navigationOverflowsHeader() {
    const linkBoxes = Array.from(navbarLinks, (navbarLink) => navbarLink.getBoundingClientRect());
    const menuBox = {
        left: Math.min(...linkBoxes.map((linkBox) => linkBox.left)),
        right: Math.max(...linkBoxes.map((linkBox) => linkBox.right)),
    };
    const headerBox = headerElement.querySelector(".container").getBoundingClientRect();

    return boxesOverlapHorizontally(menuBox, widenBox(headerLogo.getBoundingClientRect(), NAVIGATION_MIN_GAP_PX))
        || boxesOverlapHorizontally(menuBox, widenBox(headerActions.getBoundingClientRect(), NAVIGATION_MIN_GAP_PX))
        || menuBox.left < headerBox.left
        || menuBox.right > headerBox.right;
}

/**
 * Makes the desktop menu fit beside the logo whatever the language: longer words (e.g. Spanish,
 * French, German) shrink the menu font step by step, and if even the smallest size does not fit,
 * the menu wraps onto a second line. On smaller screens the menu is a full-screen overlay, so the
 * stylesheet's own sizes are kept.
 *
 * @returns {void}
 */
function fitNavigationToHeader() {
    if (!navbarList || !headerLogo || !headerActions || navbarLinks.length === 0) {
        return;
    }

    // The links animate all their properties (0.75s); pause that while measuring, or each new
    // font size would only take effect after the measurement.
    navbarLinks.forEach((navbarLink) => {
        navbarLink.style.transition = "none";
        navbarLink.style.removeProperty("font-size");
    });
    navbarList.classList.remove(NAVIGATION_WRAPPED_CLASS);
    requestAnimationFrame(() => navbarLinks.forEach((navbarLink) => navbarLink.style.removeProperty("transition")));

    if (!window.matchMedia(DESKTOP_NAVIGATION_MEDIA_QUERY).matches) {
        return;
    }

    let navigationFontSize = parseFloat(getComputedStyle(navbarLinks[0]).fontSize);
    while (navigationOverflowsHeader() && navigationFontSize > NAVIGATION_MIN_FONT_SIZE_PX) {
        navigationFontSize = Math.max(NAVIGATION_MIN_FONT_SIZE_PX, navigationFontSize - NAVIGATION_FONT_STEP_PX);
        navbarLinks.forEach((navbarLink) => {
            navbarLink.style.fontSize = `${navigationFontSize}px`;
        });
    }

    if (navigationOverflowsHeader()) {
        navbarList.classList.add(NAVIGATION_WRAPPED_CLASS);
    }
}

/* ----------------------------------------
 * Skills section
 * ---------------------------------------- */

/**
 * Switches the skills section between the "Tech" and "Tools" lists by flipping the active state
 * of the toggle container, both toggle buttons and the skills content box.
 *
 * @returns {void}
 */
function switchSkillsCategory() {
    toggleActiveClass(skillsToggleContainer);
    skillsToggleButtons.forEach(toggleActiveClass);
    toggleActiveClass(skillsContentBox);
}

/* ----------------------------------------
 * Theme (dark / light)
 * ---------------------------------------- */

/**
 * Reads the saved theme from localStorage. Storage can be unavailable (privacy modes, blocked
 * cookies) and then throws, so failures fall back to "no saved theme".
 *
 * @returns {string|null} The saved theme class name, or null if none is saved or storage is unavailable.
 */
function readSavedTheme() {
    try {
        return window.localStorage.getItem(THEME_STORAGE_KEY);
    } catch (storageError) {
        return null;
    }
}

/**
 * Saves the chosen theme to localStorage, silently ignoring storage that is unavailable.
 *
 * @param {string} themeClassName - {@link DARK_THEME_CLASS} or {@link LIGHT_THEME_CLASS}.
 * @returns {void}
 */
function saveTheme(themeClassName) {
    try {
        window.localStorage.setItem(THEME_STORAGE_KEY, themeClassName);
    } catch (storageError) {
        // Theme still applies for this visit; it just won't be remembered.
    }
}

/**
 * Applies a color theme to the page and syncs the theme button's active state with it
 * (active = light theme).
 *
 * @param {string} themeClassName - {@link DARK_THEME_CLASS} or {@link LIGHT_THEME_CLASS}.
 * @returns {void}
 */
function applyTheme(themeClassName) {
    const isLightTheme = themeClassName === LIGHT_THEME_CLASS;
    document.body.classList.toggle(LIGHT_THEME_CLASS, isLightTheme);
    document.body.classList.toggle(DARK_THEME_CLASS, !isLightTheme);
    themeToggleButton.classList.toggle(ACTIVE_CLASS, isLightTheme);
}

/**
 * Switches between the dark and light theme and remembers the choice for future visits.
 *
 * @returns {void}
 */
function toggleTheme() {
    const isCurrentlyLight = document.body.classList.contains(LIGHT_THEME_CLASS);
    const nextTheme = isCurrentlyLight ? DARK_THEME_CLASS : LIGHT_THEME_CLASS;
    applyTheme(nextTheme);
    saveTheme(nextTheme);
}

/**
 * Restores the theme the visitor chose last time; defaults to the dark theme.
 *
 * @returns {void}
 */
function restoreSavedTheme() {
    applyTheme(readSavedTheme() === LIGHT_THEME_CLASS ? LIGHT_THEME_CLASS : DARK_THEME_CLASS);
}

/* ----------------------------------------
 * Footer copyright year
 * ---------------------------------------- */

/**
 * Replaces the static fallback year in every [data-current-year] element with the current year,
 * so the copyright notice never goes out of date.
 *
 * @returns {void}
 */
function showCurrentCopyrightYear() {
    const currentYear = String(new Date().getFullYear());
    document.querySelectorAll("[data-current-year]").forEach((yearElement) => {
        yearElement.textContent = currentYear;
    });
}

/* ----------------------------------------
 * Preloader ("bird" loading animation)
 * ---------------------------------------- */

/**
 * Resolves once the window "load" event has fired, i.e. the HTML, CSS, scripts and every
 * non-lazy image have finished loading. Resolves immediately if that already happened.
 *
 * @returns {Promise<void>} Resolves when the page has fully loaded.
 */
function waitForPageLoad() {
    if (document.readyState === "complete") {
        return Promise.resolve();
    }
    return new Promise((resolve) => window.addEventListener("load", () => resolve(), {once: true}));
}

/**
 * Resolves once the web fonts in use (Poppins, Roboto, Russo One) are ready, so the
 * page is not revealed with fallback fonts that then visibly swap. Resolves immediately in
 * browsers without the CSS Font Loading API, and never rejects.
 *
 * @returns {Promise<void>} Resolves when fonts are ready (or cannot be awaited).
 */
function waitForWebFonts() {
    if (!document.fonts || !document.fonts.ready) {
        return Promise.resolve();
    }
    return document.fonts.ready.then(() => undefined, () => undefined);
}

/**
 * Fades the preloader out and then removes it from the DOM. Safe to call more than once.
 *
 * @param {HTMLElement} preloaderElement - The #preloader overlay element.
 * @returns {void}
 */
function hidePreloader(preloaderElement) {
    if (preloaderElement.classList.contains("preloader--hidden")) {
        return;
    }

    /** Removes the preloader from the DOM if it is still attached. */
    const removePreloader = () => preloaderElement.remove();

    preloaderElement.classList.add("preloader--hidden");
    preloaderElement.addEventListener("transitionend", (transitionEvent) => {
        if (transitionEvent.propertyName === "opacity") {
            removePreloader();
        }
    });
    // Fallback in case transitionend never fires (e.g. transitions disabled).
    setTimeout(removePreloader, PRELOADER_FADE_FALLBACK_MS);
}

/**
 * Hides the preloader as soon as the page and its required assets (CSS, above-the-fold images,
 * web fonts, the chosen language's text) are ready, instead of after a fixed delay. A short minimum avoids a flash on
 * instant loads, and a maximum makes sure the loader can never get stuck.
 *
 * Both limits are measured from navigation start (performance.now()), so time already spent
 * loading counts toward them.
 *
 * @returns {void}
 */
function initializePreloader() {
    const preloaderElement = document.getElementById("preloader");
    if (!preloaderElement) {
        return;
    }

    const elapsedSinceNavigation = performance.now();
    // Set by i18n.js: resolves once the visitor's chosen language is shown.
    const translationIsReady = window.pageTranslationReady || Promise.resolve();
    const pageIsReady = Promise.all([
        waitForPageLoad(),
        waitForWebFonts(),
        translationIsReady,
        waitFor(PRELOADER_MIN_VISIBLE_MS - elapsedSinceNavigation),
    ]);
    const safetyTimeout = waitFor(PRELOADER_MAX_VISIBLE_MS - elapsedSinceNavigation);

    Promise.race([pageIsReady, safetyTimeout]).then(() => hidePreloader(preloaderElement));
}

/* ----------------------------------------
 * WhatsApp chat modal
 * ---------------------------------------- */

/**
 * Wires up the WhatsApp chat modal: every ".openModal" link opens it, and the close button or a
 * click on the dark backdrop closes it. The embedded chat page is only loaded on first open
 * (its URL lives in the iframe's data-src), so it does not slow down the initial page load.
 *
 * @returns {void}
 */
function initializeChatModal() {
    const chatModal = document.getElementById("myModal");
    const chatModalFrame = document.getElementById("chatModalFrame");
    const chatModalCloseButton = document.getElementById("closeModal");
    const chatModalOpenLinks = document.querySelectorAll(".openModal");

    if (!chatModal || !chatModalCloseButton || chatModalOpenLinks.length === 0) {
        return;
    }

    /**
     * Shows the modal, loading the chat page into the iframe the first time.
     *
     * @param {MouseEvent} clickEvent - Click on one of the open links; its "#" navigation is cancelled.
     * @returns {void}
     */
    const openChatModal = (clickEvent) => {
        clickEvent.preventDefault();
        if (chatModalFrame && !chatModalFrame.getAttribute("src") && chatModalFrame.dataset.src) {
            chatModalFrame.setAttribute("src", chatModalFrame.dataset.src);
        }
        chatModal.style.display = "block";
    };

    /**
     * Hides the modal.
     *
     * @returns {void}
     */
    const closeChatModal = () => {
        chatModal.style.display = "none";
    };

    chatModalOpenLinks.forEach((openLink) => openLink.addEventListener("click", openChatModal));
    chatModalCloseButton.addEventListener("click", closeChatModal);
    window.addEventListener("click", (clickEvent) => {
        // Only a click on the backdrop itself closes the modal, not clicks inside its content.
        if (clickEvent.target === chatModal) {
            closeChatModal();
        }
    });
}

/* ----------------------------------------
 * Start-up
 * ---------------------------------------- */

initializePreloader();
restoreSavedTheme();
showCurrentCopyrightYear();
initializeChatModal();

fitNavigationToHeader();
// Re-fit once web fonts are in (their widths differ from the fallback font), after every
// language change, and when the window is resized.
waitForWebFonts().then(fitNavigationToHeader);
document.addEventListener("pagelanguagechange", fitNavigationToHeader);
window.addEventListener("resize", fitNavigationToHeader, {passive: true});

window.addEventListener("scroll", updateHeaderOnScroll, {passive: true});
navbarToggleButton.addEventListener("click", toggleMobileNavigation);
navbarLinks.forEach((navbarLink) => navbarLink.addEventListener("click", closeMobileNavigation));
skillsToggleButtons.forEach((toggleButton) => toggleButton.addEventListener("click", switchSkillsCategory));
themeToggleButton.addEventListener("click", toggleTheme);
