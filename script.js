/* ========================================
 * SHARED SCRIPT FOR ALL PAGES
 * Contains: modal logic, CTA pulse, smooth scrolling, analytics stubs, slider, mobile nav, etc.
 * ======================================== */

/**
 * Track analytics event (console stub for now)
 */
function trackAnalyticsEvent(eventName, data = {}) {
    console.log('[Analytics]', eventName, data);
}

/**
 * Track CTA click events
 */
function trackCTAClick(position, channel, extra = {}) {
    trackAnalyticsEvent('cta_click', {
        position,
        channel,
        page: window.location.pathname,
        timestamp: new Date().toISOString(),
        ...extra
    });
}

/**
 * Track slider interaction
 */
function trackSliderInteraction(action, sliderName, index = null) {
    trackAnalyticsEvent('slider_interaction', {
        action,
        slider: sliderName,
        index,
        page: window.location.pathname,
        timestamp: new Date().toISOString()
    });
}

/**
 * Generic modal functionality
 * Handles open/close with scroll lock and accessibility
 */
function initModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    const openTriggers = document.querySelectorAll(`[data-open="${modalId.replace('Modal', '')}"]`);
    const closeTriggers = modal.querySelectorAll('[data-close]');

    function openModal() {
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.documentElement.classList.add('no-scroll');
        document.body.classList.add('no-scroll');
        
        // Focus first focusable element in modal
        const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) {
            setTimeout(() => firstFocusable.focus(), 100);
        }
    }

    function closeModal() {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.documentElement.classList.remove('no-scroll');
        document.body.classList.remove('no-scroll');
    }

    // Open modal
    openTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            openModal();
        });
    });

    // Close modal
    closeTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal();
        });
    });

    // Close on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('is-open')) {
            closeModal();
        }
    });
}

/**
 * Initialize application modal for lead capture
 */
function initApplicationModal() {
    const modal = document.getElementById('application-modal');
    if (!modal) return;

    const openButtons = document.querySelectorAll('.cta-button, button.primary, button.secondary');
    const closeButton = modal.querySelector('.close-button');
    const form = modal.querySelector('#modal-application-form');

    openButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            if (!button.closest('a[href^="tel:"]') && !button.hasAttribute('type')) {
                e.preventDefault();
                modal.style.display = 'block';
                document.body.style.overflow = 'hidden';
                
                trackCTAClick(
                    button.closest('.hero') ? 'hero' :
                    button.closest('.sticky') ? 'sticky' :
                    'section',
                    'modal'
                );
            }
        });
    });

    if (closeButton) {
        closeButton.addEventListener('click', () => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    });

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const phoneInput = form.querySelector('#modal-phone');
            if (phoneInput && phoneInput.value.trim()) {
                trackAnalyticsEvent('form_submit', {
                    form: 'application_modal',
                    phone: phoneInput.value.trim().substring(0, 3) + '***',
                    page: window.location.pathname
                });
                alert('Спасибо! Мы перезвоним вам в течение 2-5 минут.');
                modal.style.display = 'none';
                document.body.style.overflow = '';
                form.reset();
            }
        });
    }
}

/**
 * CTA button pulse animation
 */
function initCTAPulse() {
    const primaryCTAs = document.querySelectorAll('.cta-button.primary, button.primary');
    primaryCTAs.forEach(btn => {
        btn.style.animation = 'pulse 2s infinite';
    });
}

/**
 * Smooth scroll for anchor links
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === '') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Initialize review slider
 */
function initReviewSlider() {
    const sliders = document.querySelectorAll('.slider-container');
    
    sliders.forEach(sliderContainer => {
        const section = sliderContainer.closest('section, .reviews');
        if (!section) return;

        const prevBtn = section.querySelector('.slider-prev');
        const nextBtn = section.querySelector('.slider-next');
        const cards = Array.from(sliderContainer.querySelectorAll('.review-card'));
        
        if (cards.length === 0) return;

        let currentIndex = 0;

        function updateSlider() {
            cards.forEach((card, index) => {
                card.style.display = index === currentIndex ? 'block' : 'none';
            });

            if (prevBtn) prevBtn.disabled = currentIndex === 0;
            if (nextBtn) nextBtn.disabled = currentIndex === cards.length - 1;
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (currentIndex > 0) {
                    currentIndex--;
                    updateSlider();
                    trackSliderInteraction('prev', 'reviews', currentIndex);
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (currentIndex < cards.length - 1) {
                    currentIndex++;
                    updateSlider();
                    trackSliderInteraction('next', 'reviews', currentIndex);
                }
            });
        }

        updateSlider();
    });
}

/**
 * Chat widget toggle
 */
function initChatWidget() {
    const chatBtn = document.getElementById('chat-btn');
    const chatWidget = document.getElementById('chat-widget');
    const chatClose = document.getElementById('chat-close');

    if (chatBtn && chatWidget) {
        chatBtn.addEventListener('click', () => {
            chatWidget.classList.toggle('active');
            trackAnalyticsEvent('chat_toggle', { state: chatWidget.classList.contains('active') });
        });
    }

    if (chatClose && chatWidget) {
        chatClose.addEventListener('click', () => {
            chatWidget.classList.remove('active');
        });
    }
}

/**
 * Live notification banner
 */
function initLiveNotification() {
    const notification = document.getElementById('live-feed-notification');
    if (!notification) return;

    const messages = [
        'Семья из ЦАО только что оставила благодарность бригаде №3.',
        'Пациент из СВАО выписался после детоксикации. Состояние стабильное.',
        'Новая заявка: выезд бригады в район Кунцево через 20 минут.'
    ];

    let currentMsg = 0;

    function showNotification() {
        const textEl = notification.querySelector('#live-feed-text');
        if (textEl) {
            textEl.textContent = messages[currentMsg];
            currentMsg = (currentMsg + 1) % messages.length;
        }

        notification.style.display = 'flex';
        setTimeout(() => {
            notification.style.display = 'none';
        }, 5000);
    }

    setTimeout(showNotification, 3000);
    setInterval(showNotification, 30000);
}

/**
 * IntersectionObserver for reveal animations
 */
function initRevealOnScroll() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.service-card, .review-card, .step-card, .price-card').forEach(el => {
        el.classList.add('reveal');
        observer.observe(el);
    });
}

/**
 * Accordion functionality
 */
function initAccordions() {
    const accordions = document.querySelectorAll('.accordion, .faq-item');
    
    accordions.forEach(accordion => {
        const header = accordion.querySelector('.accordion__header, .faq-question');
        const body = accordion.querySelector('.accordion__body, .faq-answer');
        
        if (!header || !body) return;

        header.addEventListener('click', () => {
            const isExpanded = accordion.classList.contains('accordion--expanded') || 
                              accordion.classList.contains('faq-item--expanded');
            
            accordion.classList.toggle('accordion--expanded');
            accordion.classList.toggle('faq-item--expanded');
            
            if (header.hasAttribute('aria-expanded')) {
                header.setAttribute('aria-expanded', !isExpanded);
            }

            trackAnalyticsEvent('accordion_toggle', {
                title: header.textContent.trim().substring(0, 50),
                expanded: !isExpanded
            });
        });
    });
}

/**
 * Timeline/steps section with IntersectionObserver
 */
function initTimelineObserver() {
    const timeline = document.querySelector('.timeline, .steps-section');
    if (!timeline) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                trackSliderInteraction('view', 'patient_journey', 0);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    observer.observe(timeline);
}

/**
 * Mobile navigation (burger menu)
 */
/* ========================================
 * MOBILE HEADER OVERHAUL
 * ========================================
 */

/**
 * Initialize mobile navigation bottom sheet
 */
function initMobileNavigation() {
    console.log('=== ИНИЦИАЛИЗАЦИЯ МОБИЛЬНОГО МЕНЮ ===');
    console.log('Ширина экрана:', window.innerWidth);
    
    const burger = document.querySelector('.burger-menu');
    const overlay = document.querySelector('.mobile-nav-overlay');
    const sheet = document.querySelector('.mobile-nav-sheet');
    const stickyBar = document.querySelector('.sticky-bottom-bar');
    
    console.log('Элементы найдены:', {
        burger: !!burger,
        overlay: !!overlay,
        sheet: !!sheet
    });
    
    if (!burger || !overlay || !sheet) {
        console.error('❌ ОШИБКА: Не найдены элементы мобильного меню!');
        return;
    }
    
    console.log('✅ Все элементы найдены, добавляем обработчики');
    
    let isOpen = false;
    let focusableElements = [];
    let firstFocusableElement = null;
    let lastFocusableElement = null;
    
    // Get all focusable elements in the sheet
    function updateFocusableElements() {
        focusableElements = Array.from(
            sheet.querySelectorAll(
                'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            )
        );
        firstFocusableElement = focusableElements[0];
        lastFocusableElement = focusableElements[focusableElements.length - 1];
    }
    
    // Open menu
    function openMenu() {
        console.log('📂 ОТКРЫВАЕМ МЕНЮ...');
        isOpen = true;
        overlay.classList.add('is-open');
        sheet.classList.add('is-open');
        burger.classList.add('is-active');
        burger.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
        console.log('✅ Меню ОТКРЫТО');
        
        // Hide sticky bar when menu is open
        if (stickyBar) {
            stickyBar.classList.add('hidden');
        }
        
        // Update focusable elements and focus first link
        updateFocusableElements();
        setTimeout(() => {
            if (firstFocusableElement) {
                firstFocusableElement.focus();
            }
        }, 300);
        
        // Track analytics
        trackAnalyticsEvent('mobile_menu_open', {
            page: window.location.pathname,
            timestamp: new Date().toISOString()
        });
    }
    
    // Close menu
    function closeMenu() {
        console.log('🔒 ЗАКРЫВАЕМ МЕНЮ...');
        isOpen = false;
        overlay.classList.remove('is-open');
        sheet.classList.remove('is-open');
        burger.classList.remove('is-active');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        console.log('✅ Меню ЗАКРЫТО');
        
        // Show sticky bar again if it was visible
        if (stickyBar && window.scrollY > 400) {
            stickyBar.classList.remove('hidden');
        }
        
        // Return focus to burger
        burger.focus();
        
        // Track analytics
        trackAnalyticsEvent('mobile_menu_close', {
            page: window.location.pathname,
            timestamp: new Date().toISOString()
        });
    }
    
    // Toggle menu
    function toggleMenu() {
        console.log('🔄 ПЕРЕКЛЮЧЕНИЕ МЕНЮ... Текущее состояние:', isOpen);
        if (isOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    }
    
    // Burger click
    burger.addEventListener('click', (e) => {
        console.log('🍔 КЛИК ПО БУРГЕРУ');
        e.stopPropagation();
        toggleMenu();
    });
    
    // Overlay click (close menu)
    overlay.addEventListener('click', (e) => {
        console.log('🌫️ КЛИК ПО ОВЕРЛЕЮ');
        e.stopPropagation();
        if (isOpen) {
            closeMenu();
        }
    });
    
    // Prevent sheet clicks from closing menu
    sheet.addEventListener('click', (e) => {
        e.stopPropagation();
    });
    
    // Close on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isOpen) {
            console.log('⌨️ ESC НАЖАТ - закрываем меню');
            closeMenu();
        }
        
        // Tab trap
        if (e.key === 'Tab' && isOpen) {
            if (e.shiftKey) {
                if (document.activeElement === firstFocusableElement) {
                    e.preventDefault();
                    lastFocusableElement.focus();
                }
            } else {
                if (document.activeElement === lastFocusableElement) {
                    e.preventDefault();
                    firstFocusableElement.focus();
                }
            }
        }
    });
    
    // Close menu when clicking navigation links
    const navLinks = sheet.querySelectorAll('.mobile-nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            console.log('🔗 КЛИК ПО ССЫЛКЕ В МЕНЮ - закрываем');
            closeMenu();
        });
    });
    
    console.log('✅ Мобильное меню инициализировано');
}

/**
 * Initialize call button analytics
 */
function initCallButtonAnalytics() {
    const callBtn = document.querySelector('.call-btn');
    if (!callBtn) return;
    
    callBtn.addEventListener('click', () => {
        trackAnalyticsEvent('header_call_button', {
            position: 'mobile_header',
            channel: 'call',
            page: window.location.pathname,
            timestamp: new Date().toISOString()
        });
    });
}

/**
 * Initialize header CTA analytics (logo phone click)
 */
function initHeaderCTAAnalytics() {
    const logoPhone = document.querySelector('.logo-phone');
    if (!logoPhone) return;
    
    logoPhone.addEventListener('click', () => {
        trackAnalyticsEvent('header_tel', {
            position: 'mobile_header',
            channel: 'tel',
            page: window.location.pathname,
            timestamp: new Date().toISOString()
        });
    });
}

/**
 * Master mobile header initialization
 */
function initMobileHeader() {
    // Only initialize if screen is mobile
    if (window.innerWidth <= 960) {
        console.log('📱 Мобильный экран обнаружен - инициализация мобильного хедера');
        initMobileNavigation();
        initCallButtonAnalytics();
        initHeaderCTAAnalytics();
    } else {
        console.log('🖥️ Десктоп экран - мобильный хедер не нужен');
    }
}

// Debounced resize handler
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        initMobileHeader();
    }, 250);
});

/**
 * Footer accordion (mobile only)
 */
function initFooterAccordion() {
    if (window.innerWidth > 768) return;

    const titles = document.querySelectorAll('.js-accordion-title');
    titles.forEach(title => {
        title.addEventListener('click', () => {
            const content = title.nextElementSibling;
            const isOpen = content.style.maxHeight;

            // Close all
            document.querySelectorAll('.js-accordion-content').forEach(c => {
                c.style.maxHeight = null;
            });

            // Open clicked
            if (!isOpen) {
                content.style.maxHeight = content.scrollHeight + 'px';
            }
        });
    });
}

/* ========================================
 * WARNING MODAL FOR VYVOD-IZ-ZAPOYA PAGE
 * ======================================== */

/**
 * Initialize warning modal
 */
function initWarningModal() {
    const modal = document.getElementById('warnModal');
    if (!modal) return;

    const openTriggers = document.querySelectorAll('[data-open="warn"]');
    const closeTriggers = modal.querySelectorAll('[data-close]');
    const scrim = modal.querySelector('.modal__scrim');

    function openModal() {
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.documentElement.classList.add('no-scroll');
        document.body.classList.add('no-scroll');
        
        trackAnalyticsEvent('warning_modal_open', {
            page: window.location.pathname,
            timestamp: new Date().toISOString()
        });
    }

    function closeModal() {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.documentElement.classList.remove('no-scroll');
        document.body.classList.remove('no-scroll');
        
        trackAnalyticsEvent('warning_modal_close', {
            page: window.location.pathname,
            timestamp: new Date().toISOString()
        });
    }

    // Open modal
    openTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            openModal();
        });
    });

    // Close modal
    closeTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal();
        });
    });

    // Close on scrim click
    if (scrim) {
        scrim.addEventListener('click', () => {
            closeModal();
        });
    }

    // Close on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('is-open')) {
            closeModal();
        }
    });
}

/**
 * FAQ Accordion for snyatie-lomki.html
 * Only one item can be open at a time
 */
function initFAQ() {
    const faqHeads = document.querySelectorAll('.faq-head');
    if (!faqHeads.length) return;

    faqHeads.forEach(head => {
        head.addEventListener('click', () => {
            const item = head.closest('.faq-item');
            const isOpen = item.classList.contains('is-open');
            
            // Close all FAQ items
            document.querySelectorAll('.faq-item').forEach(el => el.classList.remove('is-open'));
            
            // Open current item if it was closed
            if (!isOpen) {
                item.classList.add('is-open');
                
                // Track analytics
                trackAnalyticsEvent('faq_toggle', {
                    question: head.querySelector('h3').textContent,
                    action: 'open',
                    page: window.location.pathname,
                    timestamp: new Date().toISOString()
                });
            } else {
                // Track close
                trackAnalyticsEvent('faq_toggle', {
                    question: head.querySelector('h3').textContent,
                    action: 'close',
                    page: window.location.pathname,
                    timestamp: new Date().toISOString()
                });
            }
        });
    });
}

/**
 * Main initialization
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM загружен - инициализация скриптов...');
    
    // Core functionality
    initApplicationModal();
    initWarningModal(); // New warning modal for vyvod-iz-zapoya.html
    initCTAPulse();
    initSmoothScroll();
    initReviewSlider();
    initChatWidget();
    initLiveNotification();
    initRevealOnScroll();
    initAccordions();
    initTimelineObserver();
    initMobileHeader();
    initFooterAccordion();
    
    // FAQ accordion (snyatie-lomki.html)
    if (window.innerWidth <= 960) {
        initFAQ();
    }
    
    console.log('✅ Все скрипты инициализированы');
});
