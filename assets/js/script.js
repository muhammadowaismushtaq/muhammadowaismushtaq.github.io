'use strict';

/**
 * element toggle function
 */

const elemToggleFunc = function (elem) {
    elem.classList.toggle("active");
}


/**
 * header sticky & go to top
 */

const header = document.querySelector("[data-header]");
const goTopBtn = document.querySelector("[data-go-top]");

window.addEventListener("scroll", function () {

    if (window.scrollY >= 10) {
        header.classList.add("active");
        goTopBtn.classList.add("active");
    } else {
        header.classList.remove("active");
        goTopBtn.classList.remove("active");
    }

});


/**
 * navbar toggle
 */

const navToggleBtn = document.querySelector("[data-nav-toggle-btn]");
const navbar = document.querySelector("[data-navbar]");

navToggleBtn.addEventListener("click", function () {

    elemToggleFunc(navToggleBtn);
    elemToggleFunc(navbar);
    elemToggleFunc(document.body);

});


/**
 * skills toggle
 */

const toggleBtnBox = document.querySelector("[data-toggle-box]");
const toggleBtns = document.querySelectorAll("[data-toggle-btn]");
const skillsBox = document.querySelector("[data-skills-box]");

for (let i = 0; i < toggleBtns.length; i++) {
    toggleBtns[i].addEventListener("click", function () {

        elemToggleFunc(toggleBtnBox);
        for (let i = 0; i < toggleBtns.length; i++) {
            elemToggleFunc(toggleBtns[i]);
        }
        elemToggleFunc(skillsBox);

    });
}


/**
 * dark & light theme toggle
 */

const themeToggleBtn = document.querySelector("[data-theme-btn]");

themeToggleBtn.addEventListener("click", function () {

    elemToggleFunc(themeToggleBtn);

    if (themeToggleBtn.classList.contains("active")) {
        document.body.classList.remove("dark_theme");
        document.body.classList.add("light_theme");

        localStorage.setItem("theme", "light_theme");
    } else {
        document.body.classList.add("dark_theme");
        document.body.classList.remove("light_theme");

        localStorage.setItem("theme", "dark_theme");
    }

});

/**
 * check & apply last time selected theme from localStorage
 */

if (localStorage.getItem("theme") === "light_theme") {
    themeToggleBtn.classList.add("active");
    document.body.classList.remove("dark_theme");
    document.body.classList.add("light_theme");
} else {
    themeToggleBtn.classList.remove("active");
    document.body.classList.remove("light_theme");
    document.body.classList.add("dark_theme");
}

/**
 * close navbar when any nav link is clicked (mobile UX)
 */
const navLinks = document.querySelectorAll(".navbar-link");

navLinks.forEach(link => {
    link.addEventListener("click", function () {
        navbar.classList.remove("active");
        navToggleBtn.classList.remove("active");
        document.body.classList.remove("active");
    });
});

/**
 * Easy selector helper function (Used in the existing file structure)
 */
const select = (el, all = false) => {
    el = el.trim();
    if (all) {
        return [...document.querySelectorAll(el)];
    } else {
        return document.querySelector(el);
    }
}

/**
 * Preloader: fade out after short delay, then remove
 */
let preloader = select('#preloader');

if (preloader) {
    window.addEventListener('load', () => {
        // ⏳ Force loader to stay for at least 2 seconds
        setTimeout(() => {
            preloader.classList.add('preloader--hidden');

            const onTransitionEnd = (e) => {
                if (e.propertyName === 'opacity') {
                    preloader.removeEventListener('transitionend', onTransitionEnd);
                    if (preloader.parentNode) preloader.parentNode.removeChild(preloader);
                }
            };

            preloader.addEventListener('transitionend', onTransitionEnd);

            // Fallback removal
            setTimeout(() => {
                if (preloader.parentNode) preloader.parentNode.removeChild(preloader);
            }, 1000);
        }, 1500); // <-- duration before fade-out (in ms)
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("myModal");
    const openModal = document.getElementById("openModal");
    const closeModal = document.getElementById("closeModal");

    if (openModal && modal && closeModal) {
        openModal.onclick = (e) => {
            e.preventDefault();
            modal.style.display = "block";
        };

        closeModal.onclick = () => {
            modal.style.display = "none";
        };

        window.onclick = (event) => {
            if (event.target === modal) {
                modal.style.display = "none";
            }
        };
    }
});
