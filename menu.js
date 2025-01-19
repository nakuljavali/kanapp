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

    function openMenu(e) {
        console.log('Opening menu');
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        requestAnimationFrame(() => {
            sideMenu.classList.add('active');
            menuOverlay.classList.add('active');
            menuOverlay.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    }

    function handleCloseMenu(e) {
        console.log('Closing menu');
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        requestAnimationFrame(() => {
            sideMenu.classList.remove('active');
            menuOverlay.classList.remove('active');
            menuOverlay.style.display = 'none';
            document.body.style.overflow = '';
        });
    }

    if (menuButton) {
        menuButton.addEventListener('click', openMenu);
        menuButton.addEventListener('touchend', (e) => {
            e.preventDefault();
            openMenu(e);
        }, { passive: false });
    }

    if (closeMenuButton) {
        closeMenuButton.addEventListener('click', handleCloseMenu);
        closeMenuButton.addEventListener('touchend', (e) => {
            e.preventDefault();
            handleCloseMenu(e);
        }, { passive: false });
    }

    if (menuOverlay) {
        menuOverlay.addEventListener('click', handleCloseMenu);
        menuOverlay.addEventListener('touchend', (e) => {
            e.preventDefault();
            handleCloseMenu(e);
        }, { passive: false });
    }

    // ESC key to close menu
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            handleCloseMenu();
        }
    });
}); 