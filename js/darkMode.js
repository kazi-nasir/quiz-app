function setupDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const moonIcon = document.getElementById('moonIcon');
    const sunIcon = document.getElementById('sunIcon');

    darkModeToggle.addEventListener('change', () => {
        document.documentElement.classList.toggle('dark');
        moonIcon.classList.toggle('hidden');
        sunIcon.classList.toggle('hidden');
    });
}
