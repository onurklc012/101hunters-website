/**
 * 101st Hunter Squadron - Interactive Features
 */

document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const intro = document.getElementById('intro');
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = document.getElementById('lightboxClose');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const revealElements = document.querySelectorAll('.reveal');
    const parallaxSections = document.querySelectorAll('.parallax-section');

    // =====================================================
    // INTRO ANIMATION
    // =====================================================
    if (intro) {
        // Lock body during intro
        document.body.classList.add('intro-active');

        // Hide intro after animation completes
        setTimeout(() => {
            intro.classList.add('hidden');
            document.body.classList.remove('intro-active');
        }, 3000); // 3 seconds for full animation
    }

    // =====================================================
    // PARALLAX BACKGROUNDS SETUP
    // =====================================================
    parallaxSections.forEach(section => {
        const bg = section.querySelector('.parallax-bg');
        const bgImage = section.dataset.bg;
        if (bg && bgImage) {
            bg.style.backgroundImage = `url('${bgImage}')`;
        }
    });

    // =====================================================
    // SMOOTH PARALLAX SCROLLING (using requestAnimationFrame)
    // =====================================================
    let ticking = false;

    const updateParallax = () => {
        const scrolled = window.pageYOffset;

        // Hero parallax (smoother)
        const heroBg = document.querySelector('.hero-bg img');
        if (heroBg && scrolled < window.innerHeight * 1.5) {
            const rate = scrolled * 0.4;
            heroBg.style.transform = `translate3d(0, ${rate}px, 0)`;
        }

        // Section parallax backgrounds - VISIBLE MOVEMENT
        parallaxSections.forEach(section => {
            const bg = section.querySelector('.parallax-bg');
            if (bg) {
                const rect = section.getBoundingClientRect();
                // Calculate how far into view the section is (0 when at bottom, 1 when at top)
                const viewportHeight = window.innerHeight;
                const sectionVisibility = 1 - (rect.top / viewportHeight);
                // Move background at different speed - creates parallax effect
                const parallaxSpeed = 0.5; // Higher = more movement
                const offset = rect.top * parallaxSpeed;
                bg.style.transform = `translate3d(0, ${offset}px, 0)`;
            }
        });


        ticking = false;
    };

    const onScroll = () => {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    updateParallax(); // Initial call

    // =====================================================
    // NAVBAR SCROLL EFFECT
    // =====================================================
    const handleNavbarScroll = () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleNavbarScroll);
    handleNavbarScroll();

    // =====================================================
    // MOBILE MENU TOGGLE
    // =====================================================
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // =====================================================
    // SMOOTH SCROLLING
    // =====================================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);

            if (target) {
                const navHeight = navbar.offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // =====================================================
    // SCROLL REVEAL ANIMATIONS
    // =====================================================
    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;

        revealElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const revealPoint = 150;

            if (elementTop < windowHeight - revealPoint) {
                element.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll();

    // =====================================================
    // GALLERY LIGHTBOX WITH NAVIGATION
    // =====================================================
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    const lightboxCounter = document.getElementById('lightboxCounter');
    let currentGalleryIndex = 0;
    const galleryImages = Array.from(galleryItems).map(item => {
        const img = item.querySelector('img');
        return { src: img.src, alt: img.alt };
    });

    const updateLightboxImage = (index) => {
        currentGalleryIndex = index;
        lightboxImg.style.opacity = '0';
        lightboxImg.style.transform = 'scale(0.95)';
        setTimeout(() => {
            lightboxImg.src = galleryImages[index].src;
            lightboxImg.alt = galleryImages[index].alt;
            lightboxImg.style.opacity = '1';
            lightboxImg.style.transform = 'scale(1)';
        }, 150);
        lightboxCounter.textContent = `${index + 1} / ${galleryImages.length}`;
    };

    galleryItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            currentGalleryIndex = index;
            lightboxImg.src = galleryImages[index].src;
            lightboxImg.alt = galleryImages[index].alt;
            lightboxCounter.textContent = `${index + 1} / ${galleryImages.length}`;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    const navigateLightbox = (direction) => {
        let newIndex = currentGalleryIndex + direction;
        if (newIndex < 0) newIndex = galleryImages.length - 1;
        if (newIndex >= galleryImages.length) newIndex = 0;
        updateLightboxImage(newIndex);
    };

    lightboxPrev.addEventListener('click', (e) => {
        e.stopPropagation();
        navigateLightbox(-1);
    });

    lightboxNext.addEventListener('click', (e) => {
        e.stopPropagation();
        navigateLightbox(1);
    });

    const closeLightbox = () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    };

    lightboxClose.addEventListener('click', closeLightbox);

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') navigateLightbox(-1);
        if (e.key === 'ArrowRight') navigateLightbox(1);
    });

    // =====================================================
    // ACTIVE NAV LINK ON SCROLL
    // =====================================================
    const sections = document.querySelectorAll('section[id]');

    const highlightNavLink = () => {
        const scrollY = window.pageYOffset;

        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-links a[href="#${sectionId}"]`);

            if (navLink) {
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    navLink.style.color = 'var(--color-accent-gold)';
                } else {
                    navLink.style.color = '';
                }
            }
        });
    };

    window.addEventListener('scroll', highlightNavLink);

    // =====================================================
    // FIRE CURSOR TRAIL EFFECT
    // =====================================================
    let lastMouseX = 0;
    let lastMouseY = 0;
    let mouseThrottle = 0;

    const createCursorFireParticle = (x, y) => {
        const particle = document.createElement('div');
        const size = 4 + Math.random() * 8;
        const hue = 15 + Math.random() * 35; // Orange to gold
        const offsetX = (Math.random() - 0.5) * 10;
        const offsetY = (Math.random() - 0.5) * 10;
        const floatY = -30 - Math.random() * 40; // Float upward
        const floatX = (Math.random() - 0.5) * 30; // Slight horizontal drift

        particle.style.cssText = `
            position: fixed;
            left: ${x + offsetX}px;
            top: ${y + offsetY}px;
            width: ${size}px;
            height: ${size}px;
            background: radial-gradient(circle, 
                hsl(${hue + 20}, 100%, 80%) 0%, 
                hsl(${hue}, 100%, 55%) 40%, 
                hsl(${hue - 15}, 100%, 35%) 100%);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            opacity: 0.9;
            box-shadow: 0 0 ${size * 1.5}px hsl(${hue}, 100%, 50%),
                        0 0 ${size * 3}px hsl(${hue}, 80%, 40%);
            transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        `;
        document.body.appendChild(particle);

        // Animate floating up and fading
        requestAnimationFrame(() => {
            particle.style.opacity = '0';
            particle.style.transform = `translate(${floatX}px, ${floatY}px) scale(0.2)`;
        });

        setTimeout(() => particle.remove(), 600);
    };

    // Global mouse move listener for fire trail
    document.addEventListener('mousemove', (e) => {
        mouseThrottle++;

        // Only create particles every 3rd mouse event for performance
        if (mouseThrottle % 3 !== 0) return;

        // Calculate mouse speed for intensity
        const dx = e.clientX - lastMouseX;
        const dy = e.clientY - lastMouseY;
        const speed = Math.sqrt(dx * dx + dy * dy);

        lastMouseX = e.clientX;
        lastMouseY = e.clientY;

        // Only create particles when moving (speed > threshold)
        if (speed > 5) {
            // More particles for faster movement
            const particleCount = Math.min(Math.floor(speed / 15) + 1, 3);
            for (let i = 0; i < particleCount; i++) {
                createCursorFireParticle(e.clientX, e.clientY);
            }
        }
    }, { passive: true });

    console.log('%c🔥 101st Hunter Squadron 🔥', 'color: #d4a020; font-size: 24px; font-weight: bold;');
    console.log('%cThere are 2 types of squadrons; Hunters and our targets.', 'color: #ff6b35; font-size: 14px;');
});
