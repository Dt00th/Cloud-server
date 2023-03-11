// Handle dark/light theme
const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches

document.documentElement.setAttribute('data-theme', (isDark?'dark':'light'))
