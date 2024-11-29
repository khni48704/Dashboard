document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = document.getElementById("theme-toggle");
    const body = document.body;

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
        body.classList.add(savedTheme);
        themeToggle.querySelector(".icon-darklightmode").textContent = savedTheme === "dark-mode" ? "☀️" : "🌙";
    }

    themeToggle.addEventListener("click", () => {
        const isDarkMode = body.classList.toggle("dark-mode");
        themeToggle.querySelector(".icon-darklightmode") = isDarkMode ? "☀️" : "🌙";

        localStorage.setItem("theme", isDarkMode ? "dark-mode" : "light-mode");
    });
});