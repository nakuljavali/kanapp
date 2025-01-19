document.addEventListener('DOMContentLoaded', () => {
    console.log('Menu script loaded');
    
    const menuButton = document.getElementById('menuButton');
    const closeMenuButton = document.getElementById('closeMenu');
    const sideMenu = document.getElementById('sideMenu');
    const menuOverlay = document.getElementById('menuOverlay');

    function openMenu(e) {
        console.log('Opening menu triggered');
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        sideMenu.classList.add('active');
        menuOverlay.style.display = 'block';
        document.body.style.overflow = 'hidden';
        console.log('Menu should be open now');
    }

    function handleCloseMenu(e) {
        console.log('Closing menu triggered');
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        sideMenu.classList.remove('active');
        menuOverlay.style.display = 'none';
        document.body.style.overflow = '';
        console.log('Menu should be closed now');
    }

    // Add both click and touch events for menu button
    if (menuButton) {
        ['click', 'touchend'].forEach(eventType => {
            menuButton.addEventListener(eventType, (e) => {
                e.preventDefault();
                openMenu(e);
            }, { passive: false });
        });
    }

    // Add both click and touch events for close button
    if (closeMenuButton) {
        ['click', 'touchend'].forEach(eventType => {
            closeMenuButton.addEventListener(eventType, (e) => {
                e.preventDefault();
                handleCloseMenu(e);
            }, { passive: false });
        });
    }

    // Add both click and touch events for overlay
    if (menuOverlay) {
        ['click', 'touchend'].forEach(eventType => {
            menuOverlay.addEventListener(eventType, (e) => {
                e.preventDefault();
                handleCloseMenu(e);
            }, { passive: false });
        });
    }

    // ESC key to close menu
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            handleCloseMenu();
        }
    });
}); 