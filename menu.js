document.addEventListener('DOMContentLoaded', () => {
    console.log('Menu script loaded');
    
    const menuButton = document.getElementById('menuButton');
    const closeMenuButton = document.getElementById('closeMenu');
    const sideMenu = document.getElementById('sideMenu');
    const menuOverlay = document.getElementById('menuOverlay');

    console.log('Menu elements found:', {
        menuButton: !!menuButton,
        closeMenuButton: !!closeMenuButton,
        sideMenu: !!sideMenu,
        menuOverlay: !!menuOverlay
    });

    function openMenu() {
        console.log('Opening menu');
        sideMenu.classList.add('open');
        menuOverlay.classList.add('visible');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        console.log('Closing menu');
        sideMenu.classList.remove('open');
        menuOverlay.classList.remove('visible');
        document.body.style.overflow = '';
    }

    if (menuButton) {
        menuButton.addEventListener('click', openMenu);
    }

    if (closeMenuButton) {
        closeMenuButton.addEventListener('click', closeMenu);
    }

    if (menuOverlay) {
        menuOverlay.addEventListener('click', closeMenu);
    }

    // Add touch swipe to close menu
    let touchStartX = 0;
    let touchEndX = 0;

    if (sideMenu) {
        sideMenu.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, false);

        sideMenu.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            if (touchStartX > touchEndX + 50) { // Swipe left
                closeMenu();
            }
        }, false);
    }

    // ESC key to close menu
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeMenu();
        }
    });
}); 