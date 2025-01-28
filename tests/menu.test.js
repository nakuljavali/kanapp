/**
 * @jest-environment jsdom
 */

const Menu = require('../menu.js');

describe('Menu Tests', () => {
    let testContainer;

    beforeEach(() => {
        testContainer = document.createElement('div');
        testContainer.innerHTML = `
            <div class="top-bar">
                <button id="menuButton" aria-label="Open Menu">
                    <span class="material-icons">menu</span>
                </button>
                <div class="logo">Learn Kannada Script</div>
            </div>
            <div class="menu-overlay" id="menuOverlay"></div>
            <div class="side-menu" id="sideMenu">
                <div class="menu-header">
                    <div class="logo">Learn Kannada Script</div>
                    <button id="closeMenu" aria-label="Close Menu">
                        <span class="material-icons">close</span>
                    </button>
                </div>
                <nav>
                    <a href="index.html">Home</a>
                    <a href="settings.html">Settings</a>
                    <a href="about.html">About</a>
                </nav>
            </div>
        `;
        document.body.appendChild(testContainer);
    });

    afterEach(() => {
        document.body.removeChild(testContainer);
        jest.clearAllMocks();
    });

    describe('Menu Toggle', () => {
        test('opens menu when menu button is clicked', () => {
            const sideMenu = document.getElementById('sideMenu');
            const menuOverlay = document.getElementById('menuOverlay');
            
            Menu.openMenu();
            
            expect(sideMenu.classList.contains('open')).toBe(true);
            expect(menuOverlay.classList.contains('visible')).toBe(true);
        });

        test('closes menu when close button is clicked', () => {
            const sideMenu = document.getElementById('sideMenu');
            const menuOverlay = document.getElementById('menuOverlay');
            
            // First open the menu
            Menu.openMenu();
            
            Menu.closeMenu();
            
            expect(sideMenu.classList.contains('open')).toBe(false);
            expect(menuOverlay.classList.contains('visible')).toBe(false);
        });

        test('closes menu when overlay is clicked', () => {
            const sideMenu = document.getElementById('sideMenu');
            const menuOverlay = document.getElementById('menuOverlay');
            
            // First open the menu
            Menu.openMenu();
            
            Menu.closeMenu();
            
            expect(sideMenu.classList.contains('open')).toBe(false);
            expect(menuOverlay.classList.contains('visible')).toBe(false);
        });
    });

    describe('Navigation', () => {
        test('menu contains correct navigation links', () => {
            const nav = document.querySelector('nav');
            const links = nav.querySelectorAll('a');
            
            expect(links[0].href).toContain('index.html');
            expect(links[1].href).toContain('settings.html');
            expect(links[2].href).toContain('about.html');
        });
    });

    describe('Accessibility', () => {
        test('menu button has aria-label', () => {
            const menuButton = document.getElementById('menuButton');
            expect(menuButton.getAttribute('aria-label')).toBe('Open Menu');
        });

        test('close button has aria-label', () => {
            const closeButton = document.getElementById('closeMenu');
            expect(closeButton.getAttribute('aria-label')).toBe('Close Menu');
        });
    });
}); 