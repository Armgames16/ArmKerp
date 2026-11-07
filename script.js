"use strict";

/* =========================================================
   Արմ ԿԵՐՊ - PRO ULTIMATE
   PHONE OPTIMIZED SCRIPT
========================================================= */


/* =========================
   DATA
========================= */

const categories = {

    general: {
        name: "Ընդհանուր",
        words: [
            "Արև","Լուսին","Հեռախոս","Համակարգիչ","Դպրոց",
            "Ուսուցիչ","Գիրք","Աթոռ","Սեղան","Պատուհան",
            "Դուռ","Ժամացույց","Մեքենա","Տուն","Ծառ",
            "Ծաղիկ","Շուն","Կատու","Ջուր","Սուրճ",
            "Երաժշտություն","Ֆիլմ","Ընկերություն","Ընտանիք",
            "Ճամփորդություն","Ծով","Լեռ","Անձրև","Ձյուն",
            "Ամառ","Ձմեռ","Գարուն","Աշուն","Ծնունդ",
            "Տոն","Նվեր","Ժպիտ","Սեր","Երջանկություն"
        ]
    },

    football: {
        name: "Ֆուտբոլ",
        words: [
            "Ֆուտբոլիստ","Դարպասապահ","Գոլ","Տուգանային",
            "Անկյունային","Դեղին քարտ","Կարմիր քարտ","Մրցավար",
            "Դաշտ","Գնդակ","Մարզիչ","Թիմ","Չեմպիոն",
            "Եվրագավաթ","Աշխարհի գավաթ","Պենալտի","Հարձակվող",
            "Պաշտպան","Կիսապաշտպան","Կապիտան","Ստադիոն",
            "Երկրպագու","Տրանսֆեր","Լիգա","Մրցաշար",
            "Հաշիվ","Փոխարինում","VAR","Հավաքական","Մրցաշրջան"
        ]
    },

    daily: {
        name: "Առօրյա",
        words: [
            "Ատամի խոզանակ","Սառնարան","Հաց","Կաթ","Խանութ",
            "Ավտոբուս","Տաքսի","Աշխատանք","Գրասենյակ","Ճաշ",
            "Ընթրիք","Նախաճաշ","Մահճակալ","Բարձ","Վերմակ",
            "Հագուստ","Կոշիկ","Պայուսակ","Բանալիներ","Դրամապանակ",
            "Համակարգիչ","Ինտերնետ","Հաղորդագրություն","Սելֆի",
            "Խոհանոց","Լոգարան","Մաքրություն","Գնումներ","Սուրճ"
        ]
    },

    movies: {
        name: "Ֆիլմեր",
        words: [
            "Կինոթատրոն","Դերասան","Դերասանուհի","Ռեժիսոր",
            "Սցենար","Հերոս","Չարագործ","Սուպերհերոս",
            "Կատակերգություն","Սարսափ","Դրամա","Ռոմանտիկա",
            "Ակցիա","Ֆիլմ","Սերիալ","Օսկար","Պրեմիերա",
            "Տոմս","Պոպկորն","Տեսախցիկ","Բեմ","Դեր",
            "Սցենարիստ","Թրեյլեր","Netflix","Marvel",
            "Batman","Spider-Man","Harry Potter"
        ]
    },

    world: {
        name: "Աշխարհ",
        words: [
            "Փարիզ","Լոնդոն","Նյու Յորք","Տոկիո","Դուբայ",
            "Հռոմ","Մադրիդ","Բարսելոնա","Եգիպտոս","Հունաստան",
            "Ֆրանսիա","Իտալիա","Ճապոնիա","ԱՄՆ","Կանադա",
            "Ավստրալիա","Եվրոպա","Ասիա","Աֆրիկա",
            "Օվկիանիա","Էյֆելյան աշտարակ","Կոլիզեում",
            "Բուրգեր","Օվկիանոս","Ծովափ","Օդանավակայան",
            "Ճամպրուկ","Անձնագիր","Տուրիստ","Ճանապարհորդ"
        ]
    },

    food: {
        name: "Սնունդ",
        words: [
            "Պիցցա","Բուրգեր","Պաստան","Սուշի","Խինկալի",
            "Պելմենի","Տոլմա","Խորոված","Լավաշ","Հաց",
            "Պանիր","Շոկոլադ","Պաղպաղակ","Տորթ","Կարկանդակ",
            "Աղցան","Ապուր","Կարտոֆիլ","Լոլիկ","Վարունգ",
            "Խնձոր","Բանան","Ելակ","Ձմերուկ","Սուրճ",
            "Թեյ","Հյութ","Կաթ","Ձու","Մեղր"
        ]
    },

    tech: {
        name: "Տեխնոլոգիա",
        words: [
            "Համակարգիչ","Հեռախոս","iPhone","Android","Լափթոփ",
            "Wi-Fi","Bluetooth","Ինտերնետ","Google","YouTube",
            "Instagram","TikTok","Facebook","WhatsApp","Email",
            "Ծրագիր","Կոդ","Ծրագրավորող","Կայք","Սերվեր",
            "Տվյալներ","Արհեստական բանականություն","Ռոբոտ",
            "Խաղ","Կոնսոլ","PlayStation","Xbox","Keyboard","Mouse"
        ]
    }
};


const avatars = [
    "😀","😎","🤩","🥳",
    "😇","🤓","😈","🤠",
    "🥶","🥰","🤗","😜",
    "🦊","🐼","🐸","🐯"
];


/* =========================
   GAME STATE
========================= */

let teams = [];
let scores = [];
let teamBestCombos = [];

let currentTeamIndex = 0;
let currentRound = 1;
let totalRounds = 1;

let turnDuration = 30;
let timeLeft = 30;

let timerInterval = null;
let countdownInterval = null;

let turnActive = false;

let combo = 0;
let bestCombo = 0;

let currentCard = [];
let availableWords = [];
let activeWordsPool = [];

let customWords = [];

let selectedCategory = "general";

let soundEnabled = true;

let gameHistory = [];


/* =========================
   STORAGE
========================= */

function readJSON(key, fallback) {

    try {

        const value =
            localStorage.getItem(key);

        if (!value) {
            return fallback;
        }

        return JSON.parse(value);

    } catch {

        return fallback;

    }
}


function writeJSON(key, value) {

    try {

        localStorage.setItem(
            key,
            JSON.stringify(value)
        );

    } catch (error) {

        console.warn(error);

    }
}


/* =========================
   USERS
========================= */

function readUsers() {
    return readJSON(
        "aileerp_users",
        []
    );
}


function saveUsers(users) {

    writeJSON(
        "aileerp_users",
        users
    );

}


function getCurrentUser() {

    try {

        const raw =
            localStorage.getItem(
                "currentUser"
            );

        if (!raw) {
            return null;
        }

        const parsed =
            JSON.parse(raw);

        return parsed?.currentUser ||
            parsed ||
            null;

    } catch {

        return null;

    }
}


function saveCurrentUser(user) {

    if (!user) {

        localStorage.removeItem(
            "currentUser"
        );

        return;
    }

    writeJSON(
        "currentUser",
        user
    );
}


/* =========================
   INIT
========================= */

window.addEventListener(
    "load",
    initApp
);


function initApp() {

    loadSettings();

    loadHistory();

    applyTheme();

    updateSoundButton();

    updateUserUI();

    renderCustomWordsChips();

    setupAuthForms();

    const user =
        getCurrentUser();

    if (user) {

        openApp();

    } else {

        showAuthScreen();

    }

    updateTeamNumbers();

}


/* =========================
   AUTH
========================= */

function setupAuthForms() {

    const loginForm =
        document.getElementById(
            "login-form"
        );

    const registerForm =
        document.getElementById(
            "register-form"
        );

    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            loginUser
        );

    }

    if (registerForm) {

        registerForm.addEventListener(
            "submit",
            registerUser
        );

    }

}


function showAuthScreen() {

    hideAllScreens();

    const auth =
        document.getElementById(
            "auth-screen"
        );

    if (auth) {

        auth.classList.add(
            "active"
        );

        auth.style.display =
            "flex";

    }

    showLoginForm();

}


function showLoginForm() {

    const login =
        document.getElementById(
            "login-box"
        );

    const register =
        document.getElementById(
            "register-box"
        );

    if (login) {
        login.style.display =
            "block";
    }

    if (register) {
        register.style.display =
            "none";
    }

}


function showRegisterForm() {

    const login =
        document.getElementById(
            "login-box"
        );

    const register =
        document.getElementById(
            "register-box"
        );

    if (login) {
        login.style.display =
            "none";
    }

    if (register) {
        register.style.display =
            "block";
    }

}


function loginUser(event) {

    event?.preventDefault();

    const username =
        document.getElementById(
            "login-username"
        )?.value.trim();

    const password =
        document.getElementById(
            "login-password"
        )?.value || "";

    if (!username || !password) {

        alert(
            "Լրացրու username-ը և password-ը։"
        );

        return false;
    }

    const users =
        readUsers();

    const user =
        users.find(
            item =>
                item.username?.toLowerCase() ===
                username.toLowerCase() &&
                item.password === password
        );

    if (!user) {

        alert(
            "Username-ը կամ password-ը սխալ է։"
        );

        return false;
    }

    saveCurrentUser(user);

    updateUserUI();

    openApp();

    return false;
}


function registerUser(event) {

    event?.preventDefault();

    const username =
        document.getElementById(
            "register-username"
        )?.value.trim();

    const password =
        document.getElementById(
            "register-password"
        )?.value || "";

    const confirm =
        document.getElementById(
            "register-password-confirm"
        )?.value || "";

    if (!username || !password || !confirm) {

        alert(
            "Լրացրու բոլոր դաշտերը։"
        );

        return false;
    }

    if (password.length < 4) {

        alert(
            "Password-ը պետք է լինի առնվազն 4 նիշ։"
        );

        return false;
    }

    if (password !== confirm) {

        alert(
            "Password-ները չեն համընկնում։"
        );

        return false;
    }

    const users =
        readUsers();

    const exists =
        users.some(
            item =>
                item.username?.toLowerCase() ===
                username.toLowerCase()
        );

    if (exists) {

        alert(
            "Այս username-ը արդեն գոյություն ունի։"
        );

        return false;
    }

    const user = {

        id:
            "user_" +
            Date.now(),

        username,

        password,

        avatar:
            avatars[0],

        gamesPlayed: 0,

        totalPoints: 0,

        createdAt:
            new Date().toISOString()

    };

    users.push(user);

    saveUsers(users);

    saveCurrentUser(user);

    updateUserUI();

    openApp();

    return false;
}


function continueAsGuest() {

    const guest = {

        id: "guest",

        username: "Guest",

        avatar: "😀",

        isGuest: true,

        gamesPlayed: 0,

        totalPoints: 0

    };

    saveCurrentUser(guest);

    updateUserUI();

    openApp();

}


/* =========================
   NAVIGATION
========================= */

function hideAllScreens() {

    document
        .querySelectorAll(".screen")
        .forEach(
            screen => {

                screen.classList.remove(
                    "active"
                );

                screen.style.display =
                    "none";

            }
        );

}


function showScreen(id) {

    const screen =
        document.getElementById(id);

    if (!screen) {
        return;
    }

    hideAllScreens();

    screen.classList.add(
        "active"
    );

    screen.style.display =
        "flex";

}


function openApp() {

    showScreen(
        "setup-screen"
    );

    updateUserUI();

    resetTeamInputs();
    if (typeof phase7Render === "function") phase7Render();

}


function goToLoginPage() {

    closeProfile();

    stopTimer();

    turnActive = false;

    showAuthScreen();

}


function logoutUser() {

    stopTimer();

    turnActive = false;

    localStorage.removeItem(
        "currentUser"
    );

    closeProfile();

    showAuthScreen();

}


/* =========================
   USER UI
========================= */

function updateUserUI() {

    const user =
        getCurrentUser();

    const loggedUser =
        document.getElementById(
            "logged-user"
        );

    const avatar =
        document.getElementById(
            "profile-avatar-button"
        );

    if (loggedUser) {

        loggedUser.textContent =
            user?.username ||
            "Guest";

    }

    if (avatar) {

        avatar.textContent =
            user?.avatar ||
            "😀";

    }

}


/* =========================
   THEME
========================= */

function loadSettings() {

    const theme =
        localStorage.getItem(
            "aileerp_theme"
        );

    if (theme === "light" ||
        theme === "dark") {

        document.documentElement
            .setAttribute(
                "data-theme",
                theme
            );

    } else {

        document.documentElement
            .setAttribute(
                "data-theme",
                "dark"
            );

    }

    const sound =
        localStorage.getItem(
            "aileerp_sound"
        );

    if (sound !== null) {

        soundEnabled =
            sound !== "false";

    }

}


function applyTheme() {

    const theme =
        document.documentElement
            .getAttribute(
                "data-theme"
            ) || "dark";

    const icon =
        document.getElementById(
            "theme-icon"
        );

    const name =
        document.getElementById(
            "theme-name"
        );

    if (theme === "light") {

        if (icon) {
            icon.textContent = "☀️";
        }

        if (name) {
            name.textContent = "Light";
        }

    } else {

        if (icon) {
            icon.textContent = "🌙";
        }

        if (name) {
            name.textContent = "Dark";
        }

    }

}


function toggleTheme() {

    const current =
        document.documentElement
            .getAttribute(
                "data-theme"
            ) || "dark";

    const next =
        current === "dark"
            ? "light"
            : "dark";

    document.documentElement
        .setAttribute(
            "data-theme",
            next
        );

    localStorage.setItem(
        "aileerp_theme",
        next
    );

    applyTheme();

}


/* =========================
   SOUND
========================= */

function updateSoundButton() {

    const button =
        document.getElementById(
            "sound-btn"
        );

    if (!button) {
        return;
    }

    button.textContent =
        soundEnabled
            ? "🔊"
            : "🔇";

}


function toggleSound() {

    soundEnabled =
        !soundEnabled;

    localStorage.setItem(
        "aileerp_sound",
        String(soundEnabled)
    );

    updateSoundButton();

    if (soundEnabled) {

        playSound("click");

    }

}


let audioContext = null;


function playSound(type = "click") {

    if (!soundEnabled) {
        return;
    }

    try {

        if (!audioContext) {

            audioContext =
                new (
                    window.AudioContext ||
                    window.webkitAudioContext
                )();

        }

        if (
            audioContext.state ===
            "suspended"
        ) {

            audioContext.resume();

        }

        const oscillator =
            audioContext
                .createOscillator();

        const gain =
            audioContext
                .createGain();

        oscillator.connect(gain);

        gain.connect(
            audioContext.destination
        );

        let frequency = 500;

        let duration = .08;

        if (type === "correct") {

            frequency = 760;
            duration = .12;

        }

        if (type === "go") {

            frequency = 900;
            duration = .18;

        }

        if (type === "error") {

            frequency = 180;
            duration = .15;

        }

        oscillator.frequency.value =
            frequency;

        gain.gain.setValueAtTime(
            .001,
            audioContext.currentTime
        );

        gain.gain.exponentialRampToValueAtTime(
            .08,
            audioContext.currentTime + .01
        );

        gain.gain.exponentialRampToValueAtTime(
            .001,
            audioContext.currentTime +
            duration
        );

        oscillator.start();

        oscillator.stop(
            audioContext.currentTime +
            duration
        );

    } catch {

        // sound optional

    }

}


/* =========================
   TEAMS
========================= */

// Repair a missing helper in the Phase 6 base: without it, login and new-game
// actions throw before the daily challenge panel can render.
function resetTeamInputs() {
    const container = document.getElementById("teams-container");
    if (!container) return;
    let rows = Array.from(container.querySelectorAll(".team-input-row"));
    // At least two teams are needed; the initial HTML contains two default rows.
    while (rows.length < 2) {
        addTeamInput();
        rows = Array.from(container.querySelectorAll(".team-input-row"));
    }
    rows.slice(2).forEach(row => row.remove());
    rows.slice(0, 2).forEach((row, index) => {
        const name = row.querySelector(".team-name-input");
        const avatar = row.querySelector(".team-avatar-input");
        if (name) name.value = "";
        if (avatar) avatar.value = avatars[index] || avatars[0];
    });
    updateTeamNumbers();
}

function addTeamInput() {

    const container =
        document.getElementById(
            "teams-container"
        );

    if (!container) {
        return;
    }

    const rows =
        container.querySelectorAll(
            ".team-input-row"
        );

    if (rows.length >= 8) {

        alert(
            "Առավելագույնը 8 թիմ։"
        );

        return;
    }

    const row =
        document.createElement(
            "div"
        );

    row.className =
        "team-input-row";

    row.innerHTML = `

        <div class="team-number">
            ${rows.length + 1}
        </div>

        <select class="team-avatar-input">

            ${avatars.map(
        avatar =>
            `<option value="${avatar}">
                        ${avatar}
                    </option>`
    ).join("")}

        </select>

        <input
            class="team-name-input"
            type="text"
            placeholder="Թիմ ${rows.length + 1}"
            maxlength="25"
        >

        <button
            type="button"
            class="remove-team-btn"
            onclick="removeTeamInput(this)"
        >
            ×
        </button>

    `;

    container.appendChild(row);

    updateTeamNumbers();

}


function removeTeamInput(button) {

    const row =
        button.closest(
            ".team-input-row"
        );

    const container =
        document.getElementById(
            "teams-container"
        );

    if (!row || !container) {
        return;
    }

    const rows =
        container.querySelectorAll(
            ".team-input-row"
        );

    if (rows.length <= 2) {

        alert(
            "Պետք է լինի առնվազն 2 թիմ։"
        );

        return;
    }

    row.remove();

    updateTeamNumbers();

}


function updateTeamNumbers() {

    const container =
        document.getElementById(
            "teams-container"
        );

    if (!container) {
        return;
    }

    container
        .querySelectorAll(
            ".team-input-row"
        )
        .forEach(
            (row,index) => {

                const number =
                    row.querySelector(
                        ".team-number"
                    );

                const input =
                    row.querySelector(
                        ".team-name-input"
                    );

                if (number) {

                    number.textContent =
                        index + 1;

                }

                if (
                    input &&
                    !input.value.trim()
                ) {

                    input.placeholder =
                        `Թիմ ${index + 1}`;

                }

            }
        );

}


/* =========================
   CUSTOM WORDS
========================= */

function toggleCustomSection() {

    const section =
        document.getElementById(
            "custom-word-section"
        );

    if (!section) {
        return;
    }

    section.style.display =
        section.style.display === "none"
            ? "block"
            : "none";

}


function addSingleCustomWord() {

    const input =
        document.getElementById(
            "single-custom-word"
        );

    if (!input) {
        return;
    }

    const word =
        input.value.trim();

    if (!word) {
        return;
    }

    if (
        customWords.some(
            item =>
                item.toLowerCase() ===
                word.toLowerCase()
        )
    ) {

        alert(
            "Այս բառը արդեն ավելացված է։"
        );

        return;
    }

    customWords.push(word);

    input.value = "";

    renderCustomWordsChips();

}


function removeCustomWord(index) {

    customWords.splice(
        index,
        1
    );

    renderCustomWordsChips();

}


function renderCustomWordsChips() {

    const container =
        document.getElementById(
            "added-words-chips"
        );

    if (!container) {
        return;
    }

    container.innerHTML = "";

    customWords.forEach(
        (word,index) => {

            const chip =
                document.createElement(
                    "div"
                );

            chip.className =
                "word-chip";

            chip.innerHTML = `

                <span>
                    ${escapeHTML(word)}
                </span>

                <button
                    type="button"
                    onclick="removeCustomWord(${index})"
                >
                    ×
                </button>

            `;

            container.appendChild(chip);

        }
    );

}


/* =========================
   START GAME
========================= */

function startGame() {

    stopTimer();

    const rows =
        document.querySelectorAll(
            "#teams-container .team-input-row"
        );

    if (rows.length < 2) {

        alert(
            "Պետք է լինի առնվազն 2 թիմ։"
        );

        return;
    }

    teams = [];

    rows.forEach(
        (row,index) => {

            const name =
                row.querySelector(
                    ".team-name-input"
                )?.value.trim() ||
                `Թիմ ${index + 1}`;

            const avatar =
                row.querySelector(
                    ".team-avatar-input"
                )?.value ||
                avatars[
                index %
                avatars.length
                    ];

            teams.push({
                name,
                avatar
            });

        }
    );

    turnDuration =
        Number(
            document.getElementById(
                "time-input"
            )?.value ||
            30
        );

    totalRounds =
        Number(
            document.getElementById(
                "rounds-input"
            )?.value ||
            1
        );

    selectedCategory =
        document.getElementById(
            "category-select"
        )?.value ||
        "general";

    scores =
        teams.map(() => 0);

    teamBestCombos =
        teams.map(() => 0);

    currentTeamIndex = 0;

    currentRound = 1;

    combo = 0;

    bestCombo = 0;

    turnActive = false;

    activeWordsPool =
        buildWordsPool();

    if (
        activeWordsPool.length < 7
    ) {

        alert(
            "Բառերի քանակը բավարար չէ։"
        );

        return;
    }

    availableWords =
        shuffleArray(
            [...activeWordsPool]
        );

    showReadyScreen();

}


/* =========================
   WORD POOL
========================= */

function buildWordsPool() {

    let words = [];

    if (
        selectedCategory === "all"
    ) {

        Object.values(
            categories
        ).forEach(
            category => {

                words.push(
                    ...category.words
                );

            }
        );

    } else {

        words.push(
            ...(categories[
                    selectedCategory
                    ]?.words ||
                categories.general.words)
        );

    }

    words.push(
        ...customWords
    );

    return [
        ...new Set(
            words
                .map(
                    word =>
                        String(word).trim()
                )
                .filter(Boolean)
        )
    ];

}


/* =========================
   READY
========================= */

function showReadyScreen() {

    stopTimer();

    turnActive = false;

    const team =
        teams[currentTeamIndex];

    document.getElementById(
        "ready-avatar"
    ).textContent =
        team?.avatar ||
        "😀";

    document.getElementById(
        "ready-team-name"
    ).textContent =
        team?.name ||
        "Թիմ";

    document.getElementById(
        "ready-round-info"
    ).textContent =
        `Ռաունդ ${currentRound} / ${totalRounds}`;

    showScreen(
        "ready-screen"
    );

}


/* =========================
   COUNTDOWN
========================= */

function startTurn() {

    if (countdownInterval) {

        clearInterval(
            countdownInterval
        );

    }

    const overlay =
        document.getElementById(
            "countdown-overlay"
        );

    const teamText =
        document.getElementById(
            "countdown-team"
        );

    const number =
        document.getElementById(
            "countdown-number"
        );

    const team =
        teams[currentTeamIndex];

    if (teamText) {

        teamText.textContent =
            team?.name ||
            "Թիմ";

    }

    if (overlay) {

        overlay.style.display =
            "flex";

    }

    let count = 3;

    number.textContent =
        count;

    playSound("click");

    countdownInterval =
        setInterval(
            () => {

                count--;

                if (count > 0) {

                    number.textContent =
                        count;

                    playSound(
                        "click"
                    );

                    return;
                }

                if (count === 0) {

                    number.textContent =
                        "GO!";

                    playSound(
                        "go"
                    );

                    return;
                }

                clearInterval(
                    countdownInterval
                );

                countdownInterval =
                    null;

                overlay.style.display =
                    "none";

                beginActualTurn();

            },
            700
        );

}


/* =========================
   BEGIN TURN
========================= */

function beginActualTurn() {

    turnActive = true;

    timeLeft =
        turnDuration;

    combo = 0;

    currentCard = [];

    updateGameHeader();

    updateTimerDisplay();

    updateComboDisplay();

    showScreen(
        "game-screen"
    );

    generateNewCard();

    startTimer();

}


/* =========================
   TIMER
========================= */

function startTimer() {

    stopTimer();

    timerInterval =
        setInterval(
            () => {

                if (!turnActive) {
                    return;
                }

                timeLeft--;

                updateTimerDisplay();

                if (timeLeft <= 0) {

                    timeLeft = 0;

                    updateTimerDisplay();

                    endTurn();

                }

            },
            1000
        );

}


function stopTimer() {

    if (timerInterval) {

        clearInterval(
            timerInterval
        );

        timerInterval = null;

    }

}


function updateTimerDisplay() {

    const timer =
        document.getElementById(
            "game-timer"
        );

    if (!timer) {
        return;
    }

    timer.textContent =
        timeLeft;

    if (typeof phase4TimerTick === "function") phase4TimerTick(timeLeft, turnActive);

    timer.classList.remove(
        "timer-warning",
        "timer-danger"
    );

    if (timeLeft <= 10) {

        timer.classList.add(
            "timer-danger"
        );

    } else if (timeLeft <= 20) {

        timer.classList.add(
            "timer-warning"
        );

    }

}


/* =========================
   GAME HEADER
========================= */

function updateGameHeader() {

    const team =
        teams[currentTeamIndex];

    if (!team) {
        return;
    }

    document.getElementById(
        "game-team-avatar"
    ).textContent =
        team.avatar;

    document.getElementById(
        "game-team-name"
    ).textContent =
        team.name;

    document.getElementById(
        "game-round"
    ).textContent =
        `Ռաունդ ${currentRound} / ${totalRounds}`;

    updateScoreCounter();

}


/* =========================
   WORD CARDS
========================= */

function generateNewCard() {

    if (!turnActive) {
        return;
    }

    if (
        availableWords.length < 7
    ) {

        availableWords =
            shuffleArray(
                [
                    ...availableWords,
                    ...activeWordsPool
                ]
            );

    }

    currentCard = [];

    for (
        let i = 0;
        i < 7;
        i++
    ) {

        if (
            availableWords.length === 0
        ) {
            break;
        }

        currentCard.push({

            text:
                availableWords.shift(),

            guessed: false

        });

    }

    renderCard();

}


function updateWordProgress() {

    const guessed = currentCard.filter(item => item.guessed).length;
    const total = currentCard.length || 7;
    const label = document.getElementById("game-progress-label");
    const fill = document.getElementById("game-progress-fill");
    const bar = document.getElementById("game-progress");

    if (label) label.textContent = `${guessed} / ${total}`;
    if (fill) fill.style.width = `${total ? (guessed / total) * 100 : 0}%`;
    if (bar) {
        bar.setAttribute("aria-valuemax", String(total));
        bar.setAttribute("aria-valuenow", String(guessed));
        bar.setAttribute("aria-valuetext", `${guessed} of ${total} words guessed`);
    }
}


/* =========================
   RENDER WORD CARDS
========================= */

function renderCard() {

    const container =
        document.getElementById(
            "words-container"
        );

    if (!container) {
        return;
    }

    updateWordProgress();
    container.innerHTML = "";

    currentCard.forEach(
        (item,index) => {

            const button =
                document.createElement(
                    "button"
                );

            button.type = "button";

            button.className =
                "word-card";

            button.dataset.index =
                index;

            button.innerHTML = `

                <span class="word-card-number">
                    ${index + 1}
                </span>

                <span class="word-card-text">
                    ${escapeHTML(item.text)}
                </span>

                <span class="word-card-check">
                    ✓
                </span>

            `;

            button.addEventListener(
                "click",
                () => selectWord(index)
            );

            container.appendChild(
                button
            );

        }
    );

}


/* =========================
   SELECT WORD
========================= */

function selectWord(index) {

    if (!turnActive) {
        return;
    }

    const item =
        currentCard[index];

    if (!item || item.guessed) {
        return;
    }

    item.guessed = true;
    updateWordProgress();

    combo++;

    bestCombo =
        Math.max(
            bestCombo,
            combo
        );

    teamBestCombos[currentTeamIndex] =
        Math.max(
            teamBestCombos[currentTeamIndex] || 0,
            combo
        );

    scores[currentTeamIndex]++;
    if (typeof phase7OnWordGuessed === "function") phase7OnWordGuessed(combo);

    updateScoreCounter();

    updateComboDisplay();
    if (typeof phase4ComboCelebrate === "function") phase4ComboCelebrate(combo);

    const button =
        document.querySelector(
            `.word-card[data-index="${index}"]`
        );

    if (button) {

        button.classList.add(
            "guessed"
        );

        button.disabled = true;

    }

    showPointsPopup();

    playSound("correct");

    if (
        currentCard.every(
            item =>
                item.guessed
        )
    ) {

        setTimeout(
            () => {

                if (turnActive) {

                    generateNewCard();

                }

            },
            300
        );

    }

}


/* =========================
   SCORE
========================= */

function updateScoreCounter() {

    const counter =
        document.getElementById(
            "game-score-count"
        );

    if (counter) {

        counter.textContent =
            scores[
                currentTeamIndex
                ] || 0;

    }

}


function updateComboDisplay() {

    const comboBox =
        document.getElementById(
            "combo-box"
        );

    if (!comboBox) {
        return;
    }

    comboBox.textContent =
        `🔥 Combo x${combo}`;

    comboBox.classList.toggle(
        "active",
        combo > 0
    );

}


/* =========================
   POPUP
========================= */

function showPointsPopup() {

    const popup =
        document.getElementById(
            "points-popup"
        );

    if (!popup) {
        return;
    }

    popup.classList.remove(
        "show"
    );

    void popup.offsetWidth;

    popup.classList.add(
        "show"
    );

    setTimeout(
        () => {

            popup.classList.remove(
                "show"
            );

        },
        600
    );

}


/* =========================
   END TURN
========================= */

function endTurn() {

    if (!turnActive) {
        return;
    }

    turnActive = false;

    stopTimer();

    showTurnResult();

}


/* =========================
   TURN RESULT
========================= */

function showTurnResult() {

    const team =
        teams[currentTeamIndex];

    const guessedCount =
        currentCard.filter(
            item =>
                item.guessed
        ).length;

    document.getElementById(
        "turn-summary-text"
    ).textContent =
        `${team.name} թիմի հերթն ավարտվեց։`;

    document.getElementById(
        "turn-points"
    ).textContent =
        `Միավորներ՝ ${scores[currentTeamIndex]}`;

    document.getElementById(
        "turn-best-combo"
    ).textContent =
        `Լավագույն combo՝ x${bestCombo}`;

    document.getElementById(
        "turn-achievements"
    ).innerHTML = `

        <div class="achievement-chip">
            🎯 ${guessedCount} բառ
        </div>

        ${
        bestCombo >= 3
            ? `
                    <div class="achievement-chip">
                        🔥 Combo x${bestCombo}
                    </div>
                `
            : ""
    }

    `;

    renderScoreboard(
        document.getElementById(
            "turn-scoreboard"
        )
    );

    showScreen(
        "turn-result-screen"
    );

}


/* =========================
   SCOREBOARD
========================= */

function renderScoreboard(container) {

    if (!container) {
        return;
    }

    const order =
        teams
            .map(
                (team,index) => ({
                    ...team,
                    score:
                        scores[index] || 0
                })
            )
            .sort(
                (a,b) =>
                    b.score -
                    a.score
            );

    container.innerHTML = "";

    const topScore = order[0]?.score;

    order.forEach(
        (team,index) => {

            const row =
                document.createElement(
                    "div"
                );

            row.className = "score-row";
            if (team.score === topScore) {
                row.classList.add("score-leader");
            }

            const rank = index > 0 && team.score === order[index - 1].score
                ? (order[index - 1].displayRank || index)
                : index + 1;
            team.displayRank = rank;

            row.innerHTML = `

                <div class="score-left">

                    <span class="score-rank">
                        ${rank}
                    </span>

                    <span class="score-avatar">
                        ${team.avatar}
                    </span>

                    <span class="score-team-name">
                        ${escapeHTML(team.name)}
                    </span>

                </div>

                <div class="score-points">
                    ${team.score}
                </div>

            `;

            container.appendChild(row);

        }
    );

}


/* =========================
   NEXT TURN
========================= */

function nextTurnOrFinish() {

    currentTeamIndex++;

    if (
        currentTeamIndex >=
        teams.length
    ) {

        currentTeamIndex = 0;

        currentRound++;

    }

    if (
        currentRound >
        totalRounds
    ) {

        finishGame();

        return;

    }

    combo = 0;

    bestCombo = 0;

    showReadyScreen();

}


/* =========================
   FINISH GAME
========================= */

function finishGame() {

    stopTimer();

    turnActive = false;

    const winnerIndex =
        getWinnerIndex();

    const winner =
        teams[winnerIndex];

    const winningTeams = getWinningTeamIndexes();
    const isDraw = winningTeams.length > 1;
    const gameBestCombo = Math.max(0, ...teamBestCombos);

    document.getElementById(
        "winner-name"
    ).textContent = isDraw
        ? "🤝 Ոչ-ոքի"
        : `${winner.avatar} ${winner.name}`;

    document.getElementById(
        "winner-subtitle"
    ).textContent = isDraw
        ? `${scores[winnerIndex]} միավոր՝ յուրաքանչյուրին`
        : `${scores[winnerIndex]} միավոր`;

    document.getElementById(
        "winner-achievement"
    ).textContent =
        `🔥 Խաղի լավագույն combo՝ x${gameBestCombo}`;

    renderScoreboard(
        document.getElementById(
            "final-scoreboard"
        )
    );

    saveGameToHistory(
        winnerIndex
    );

    if (typeof phase5RenderSummary === "function") phase5RenderSummary();

    updateUserStats();
    if (typeof phase6AwardProgress === "function") phase6AwardProgress();
    if (typeof phase7OnGameFinished === "function") phase7OnGameFinished();
    if (typeof phase8OnGameFinished === "function") phase8OnGameFinished();
    if (typeof phase9OnGameFinished === "function") phase9OnGameFinished();

    showScreen(
        "winner-screen"
    );
    if (typeof phase4WinnerCelebrate === "function") phase4WinnerCelebrate(isDraw);

}


function getWinnerIndex() {
    if (!scores.length) return -1;
    return scores.indexOf(Math.max(...scores));
}

function getWinningTeamIndexes() {
    if (!scores.length) return [];
    const highScore = Math.max(...scores);
    return scores.reduce((indexes, score, index) => {
        if (score === highScore) indexes.push(index);
        return indexes;
    }, []);
}


/* =========================
   HISTORY
========================= */

function loadHistory() {

    gameHistory =
        readJSON(
            "aileerp_history",
            []
        );

}


function saveGameToHistory(
    winnerIndex
) {

    const winner =
        teams[winnerIndex];
    const isDraw = getWinningTeamIndexes().length > 1;

    const game = {

        id:
            Date.now(),

        date:
            new Date().toISOString(),

        category:
            categories[
                selectedCategory
                ]?.name ||
            "Custom",

        rounds:
        totalRounds,

        winner:
            isDraw ? "Ոչ-ոքի" : (winner?.name || "—"),

        winnerAvatar:
            isDraw ? "🤝" : (winner?.avatar || "🏆"),

        teams:
            teams.map(
                (team,index) => ({

                    name:
                    team.name,

                    avatar:
                    team.avatar,

                    score:
                        scores[index] ||
                        0

                })
            )

    };

    gameHistory.unshift(game);

    gameHistory =
        gameHistory.slice(
            0,
            50
        );

    writeJSON(
        "aileerp_history",
        gameHistory
    );

}


function showProfileHistory() {

    const box =
        document.getElementById(
            "profile-history"
        );

    const container =
        document.getElementById(
            "history-container"
        );

    if (!box || !container) {
        return;
    }

    loadHistory();

    box.style.display =
        "block";

    if (!gameHistory.length) {

        container.innerHTML = `
            <div class="empty-history">
                📜 Դեռ խաղերի պատմություն չկա։
            </div>
        `;

        return;
    }

    container.innerHTML =
        gameHistory
            .map(
                game => {

                    const date =
                        new Date(
                            game.date
                        );

                    return `

                        <div class="history-item">

                            <div class="history-main">

                                <div class="history-winner">
                                    ${game.winnerAvatar}
                                    ${escapeHTML(game.winner)}
                                </div>

                                <div class="history-date">
                                    ${date.toLocaleDateString("hy-AM")}
                                </div>

                            </div>

                            <div class="history-category">
                                ${escapeHTML(game.category)}
                            </div>

                            <div class="history-teams">

                                ${game.teams
                        .map(
                            team => `

                                            <div class="history-team">

                                                <span>
                                                    ${team.avatar}
                                                    ${escapeHTML(team.name)}
                                                </span>

                                                <strong>
                                                    ${team.score}
                                                </strong>

                                            </div>

                                        `
                        )
                        .join("")
                    }

                            </div>

                        </div>

                    `;

                }
            )
            .join("");

}


/* =========================
   PROFILE
========================= */

function openProfile() {

    const panel =
        document.getElementById(
            "profile-panel"
        );

    if (!panel) {
        return;
    }

    const user =
        getCurrentUser();

    document.getElementById(
        "profile-panel-avatar"
    ).textContent =
        user?.avatar ||
        "😀";

    document.getElementById(
        "profile-panel-name"
    ).textContent =
        user?.username ||
        "Guest";

    panel.style.display =
        "flex";
    if (typeof phase6RenderProfile === "function") phase6RenderProfile();
    if (typeof phase7Render === "function") phase7Render();

}


function closeProfile() {

    const panel =
        document.getElementById(
            "profile-panel"
        );

    if (panel) {

        panel.style.display =
            "none";

    }

}


/* =========================
   AVATAR
========================= */

function openAvatarPicker() {

    const modal =
        document.getElementById(
            "avatar-modal"
        );

    const grid =
        document.getElementById(
            "avatar-grid"
        );

    if (!modal || !grid) {
        return;
    }

    const user =
        getCurrentUser();

    grid.innerHTML = "";

    avatars.forEach(
        avatar => {

            const button =
                document.createElement(
                    "button"
                );

            button.type =
                "button";

            button.className =
                "avatar-option";

            if (
                user?.avatar ===
                avatar
            ) {

                button.classList.add(
                    "selected"
                );

            }

            button.textContent =
                avatar;

            button.onclick =
                () =>
                    selectAvatar(
                        avatar
                    );

            grid.appendChild(
                button
            );

        }
    );

    modal.style.display =
        "flex";

}


function closeAvatarPicker() {

    const modal =
        document.getElementById(
            "avatar-modal"
        );

    if (modal) {

        modal.style.display =
            "none";

    }

}


function selectAvatar(avatar) {

    const user =
        getCurrentUser();

    if (!user) {
        return;
    }

    user.avatar =
        avatar;

    saveCurrentUser(user);

    if (!user.isGuest) {

        const users =
            readUsers();

        const index =
            users.findIndex(
                item =>
                    item.id ===
                    user.id
            );

        if (index !== -1) {

            users[index] =
                user;

            saveUsers(users);

        }

    }

    updateUserUI();

    document.getElementById(
        "profile-panel-avatar"
    ).textContent =
        avatar;

    closeAvatarPicker();

}


/* =========================
   USER STATS
========================= */

function updateUserStats() {

    const user =
        getCurrentUser();

    if (
        !user ||
        user.isGuest
    ) {
        return;
    }

    user.gamesPlayed =
        Number(
            user.gamesPlayed ||
            0
        ) + 1;

    user.totalPoints =
        Number(
            user.totalPoints ||
            0
        ) +
        scores.reduce(
            (sum,value) =>
                sum +
                Number(
                    value || 0
                ),
            0
        );

    saveCurrentUser(user);

    const users =
        readUsers();

    const index =
        users.findIndex(
            item =>
                item.id ===
                user.id
        );

    if (index !== -1) {

        users[index] =
            user;

        saveUsers(users);

    }

}


/* =========================
   RESET
========================= */

function resetGame() {

    stopTimer();

    turnActive = false;

    teams = [];

    scores = [];
    teamBestCombos = [];

    currentTeamIndex = 0;

    currentRound = 1;

    combo = 0;

    bestCombo = 0;

    currentCard = [];

    availableWords = [];

    showScreen(
        "setup-screen"
    );

    resetTeamInputs();

    updateTeamNumbers();
    if (typeof phase7Render === "function") phase7Render();

}


/* =========================
   MODAL EVENTS
========================= */

document.addEventListener(
    "click",
    event => {

        const profile =
            document.getElementById(
                "profile-panel"
            );

        if (
            profile &&
            event.target ===
            profile
        ) {

            closeProfile();

        }

        const avatar =
            document.getElementById(
                "avatar-modal"
            );

        if (
            avatar &&
            event.target ===
            avatar
        ) {

            closeAvatarPicker();

        }

    }
);


document.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "Escape"
        ) {

            closeProfile();

            closeAvatarPicker();

        }

    }
);


/* =========================
   HELPERS
========================= */

function shuffleArray(array) {

    const result =
        [...array];

    for (
        let i =
            result.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() *
                (i + 1)
            );

        [
            result[i],
            result[j]
        ] = [
            result[j],
            result[i]
        ];

    }

    return result;
}


function escapeHTML(value) {

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


/* =========================
   GLOBALS
========================= */

window.loginUser =
    loginUser;

window.registerUser =
    registerUser;

window.showLoginForm =
    showLoginForm;

window.showRegisterForm =
    showRegisterForm;

window.continueAsGuest =
    continueAsGuest;

window.goToLoginPage =
    goToLoginPage;

window.logoutUser =
    logoutUser;

window.toggleTheme =
    toggleTheme;

window.toggleSound =
    toggleSound;

window.openProfile =
    openProfile;

window.closeProfile =
    closeProfile;

window.openAvatarPicker =
    openAvatarPicker;

window.closeAvatarPicker =
    closeAvatarPicker;

window.selectAvatar =
    selectAvatar;

window.addTeamInput =
    addTeamInput;

window.removeTeamInput =
    removeTeamInput;

window.toggleCustomSection =
    toggleCustomSection;

window.addSingleCustomWord =
    addSingleCustomWord;

window.removeCustomWord =
    removeCustomWord;

window.startGame =
    startGame;

window.startTurn =
    startTurn;

window.selectWord =
    selectWord;

window.nextTurnOrFinish =
    nextTurnOrFinish;

window.resetGame =
    resetGame;

window.showProfileHistory =
    showProfileHistory;