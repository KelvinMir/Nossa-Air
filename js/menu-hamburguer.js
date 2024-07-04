function CloseOpen() {
    const menuOpen = document.getElementById('menu-open')
    if (menuOpen) {
        menuOpen.style.display = (menuOpen.style.display === 'none' || menuOpen.style.display === '') ? 'block' : 'none';
    }
}
