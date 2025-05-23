function toggleTheme() {
    const body = document.body;
    const themeToggle = document.getElementById('themeToggle');
    const currentTheme = body.getAttribute('data-theme');
    
    if (currentTheme === 'dark') {
        body.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
    } else {
        body.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    }
}

function toggleLanguage() {
    const langBtn = document.querySelector('.language-toggle .lang-text');
    const currentLang = document.documentElement.lang;
    const newLang = currentLang === 'es' ? 'en' : 'es';
    
    document.documentElement.lang = newLang;
    langBtn.textContent = newLang.toUpperCase();
    localStorage.setItem('language', newLang);
    traducirContenido(newLang);
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    const savedLang = localStorage.getItem('language');
    
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        document.getElementById('themeToggle').checked = true;
    }
    
    if (savedLang) {
        document.documentElement.lang = savedLang;
        document.querySelector('.language-toggle .lang-text').textContent = savedLang.toUpperCase();
        traducirContenido(savedLang);
    }
});
