function setupDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');

    // Load the saved state from localStorage
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    document.documentElement.classList.toggle('dark', isDarkMode);
    darkModeToggle.checked = isDarkMode;
    updateIcons(isDarkMode);

    darkModeToggle.addEventListener('change', () => {
        const isDark = darkModeToggle.checked;
        document.documentElement.classList.toggle('dark', isDark);
        localStorage.setItem('darkMode', isDark);
        updateIcons(isDark);
    });
}

function updateIcons(isDark) {
    const moonIcon = document.getElementById('moonIcon');
    const sunIcon = document.getElementById('sunIcon');
    // Show moon icon when toggle is on (dark mode), sun icon when off (light mode)
    moonIcon.classList.toggle('hidden', isDark);
    sunIcon.classList.toggle('hidden', !isDark);
}
