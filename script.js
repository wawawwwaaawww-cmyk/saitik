/**
 * Централизованная функция аналитики
 * Унифицированный обработчик всех событий аналитики
 */
window.trackEvent = function(eventName, payload = {}) {
    const eventData = {
        event: eventName,
        timestamp: new Date().toISOString(),
        page: window.location.pathname,
        ...payload
    };
    
    // Логирование в консоль для отладки
    console.log(`Analytics Event: ${eventName}`, eventData);
    
    // В реальном проекте здесь будет отправка в систему аналитики
    // Пример для Google Analytics 4:
    // if (typeof gtag === 'function') {
    //     gtag('event', eventName, {
    //         custom_parameter_1: payload.location,
    //         custom_parameter_2: payload.channel,
    //         custom_parameter_3: payload.action
    //     });
    // }
    
    // Пример для Яндекс.Метрики:
    // if (typeof ym === 'function') {
    //     ym(XXXXXX, 'reachGoal', eventName);
    // }
    
    return eventData;
};

/**
 * Инициализация аналитики для CTA кнопок
 */
window.initCTAAnalytics = function() {
    // CTA кнопки в hero секции
    const heroCTAs = document.querySelectorAll('.hero-buttons .cta-button');
    heroCTAs.forEach(button => {
        button.addEventListener('click', () => {
            const text = button.textContent.trim();
            trackEvent('cta_click', {
                location: 'hero',
                button_text: text,
                type: text.toLowerCase().includes('вызвать') ? 'primary' : 'secondary'
            });
        });
    });
    
    // Sticky кнопка на мобильных
    const stickyCTA = document.querySelector('.sticky-mobile-button');
    if (stickyCTA) {
        stickyCTA.addEventListener('click', () => {
            trackEvent('cta_click', {
                location: 'sticky_mobile',
                button_text: stickyCTA.textContent.trim(),
                type: 'primary'
            });
        });
    }
    
    // Кнопки в секциях
    const sectionCTAs = document.querySelectorAll('.section .cta-button:not(.hero-buttons .cta-button):not(.sticky-mobile-button)');
    sectionCTAs.forEach(button => {
        button.addEventListener('click', () => {
            const section = button.closest('section');
            const sectionClass = section ? section.className : 'unknown';
            trackEvent('cta_click', {
                location: 'section',
                section_class: sectionClass,
                button_text: button.textContent.trim(),
                type: button.classList.contains('primary') ? 'primary' : 'secondary'
            });
        });
    });
    
    // Кнопки звонков
    const callButtons = document.querySelectorAll('a[href^="tel:"], .btn--call');
    callButtons.forEach(button => {
        button.addEventListener('click', () => {
            const location = button.closest('.hero, .contact-hero, .contact-options, .sticky-bar, .pre-footer-cta');
            const locationName = location ? location.className.split(' ')[0] : 'unknown';
            trackEvent('call_click', {
                location: locationName,
                phone_number: button.getAttribute('href')?.replace('tel:', '') || 'not_available'
            });
        });
    });
    
    // WhatsApp кнопки
    const whatsappButtons = document.querySelectorAll('a[href*="wa.me"], .btn--wa');
    whatsappButtons.forEach(button => {
        button.addEventListener('click', () => {
            trackEvent('whatsapp_click', {
                location: getButtonLocation(button),
                url: button.getAttribute('href') || 'not_available'
            });
        });
    });
    
    // Telegram кнопки
    const telegramButtons = document.querySelectorAll('a[href*="t.me"], .btn--tg');
    telegramButtons.forEach(button => {
        button.addEventListener('click', () => {
            trackEvent('telegram_click', {
                location: getButtonLocation(button),
                url: button.getAttribute('href') || 'not_available'
            });
        });
    });
};

/**
 * Вспомогательная функция для определения местоположения кнопки
 */
function getButtonLocation(button) {
    const parent = button.closest('.hero, .contact-hero, .contact-options, .sticky-bar, .pre-footer-cta, .site-footer');
    if (parent) {
        return parent.className.split(' ')[0];
    }
    return 'unknown';
}

/**
 * Инициализация аналитики для форм
 */
window.initFormAnalytics = function() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        // Отправка формы
        form.addEventListener('submit', (e) => {
            const formName = form.id || form.className || 'unknown_form';
            const phoneInput = form.querySelector('input[type="tel"]');
            const phone = phoneInput ? phoneInput.value : 'not_provided';
            
            // Простая валидация телефона
            const isValidPhone = phone && phone.length >= 10;
            
            if (isValidPhone) {
                trackEvent('form_submit', {
                    form_name: formName,
                    phone_length: phone.length,
                    has_comment: form.querySelector('textarea')?.value.length > 0
                });
            } else {
                trackEvent('form_error', {
                    form_name: formName,
                    error_type: 'invalid_phone',
                    phone_length: phone ? phone.length : 0
                });
            }
        });
        
        // Ошибки валидации
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('invalid', (e) => {
                trackEvent('form_error', {
                    form_name: form.id || form.className || 'unknown_form',
                    field_name: input.name || input.id || 'unknown_field',
                    error_type: 'validation_error',
                    error_message: e.target.validationMessage
                });
            });
        });
    });
};

/**
 * Инициализация аналитики для слайдеров
 */
window.initSliderAnalytics = function() {
    const sliders = document.querySelectorAll('.reviews, .car-track');
    
    sliders.forEach(slider => {
        let currentSlide = 0;
        const slides = slider.querySelectorAll('.review-card, .car-slide');
        
        if (slides.length === 0) return;
        
        // View событие при появлении слайдера
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    trackEvent('slider_view', {
                        slider_type: slider.classList.contains('reviews') ? 'reviews' : 'methods',
                        total_slides: slides.length
                    });
                    observer.unobserve(slider);
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(slider);
        
        // Клик на кнопки навигации
        const nextButton = slider.querySelector('.slider-next, .car-next');
        const prevButton = slider.querySelector('.slider-prev, .car-prev');
        
        if (nextButton) {
            nextButton.addEventListener('click', () => {
                currentSlide = (currentSlide + 1) % slides.length;
                trackEvent('slider_next', {
                    slider_type: slider.classList.contains('reviews') ? 'reviews' : 'methods',
                    current_slide: currentSlide,
                    total_slides: slides.length
                });
            });
        }
        
        if (prevButton) {
            prevButton.addEventListener('click', () => {
                currentSlide = (currentSlide - 1 + slides.length) % slides.length;
                trackEvent('slider_prev', {
                    slider_type: slider.classList.contains('reviews') ? 'reviews' : 'methods',
                    current_slide: currentSlide,
                    total_slides: slides.length
                });
            });
        }
    });
};

/**
 * Инициализация аналитики для аккордеонов
 */
window.initAccordionAnalytics = function() {
    const accordionItems = document.querySelectorAll('.faq-item, .timeline-step, .js-accordion-title');
    
    accordionItems.forEach(item => {
        const toggle = item.querySelector('.faq-question, .step-accordion__toggle, .js-accordion-title');
        
        if (toggle) {
            toggle.addEventListener('click', () => {
                const isExpanded = item.classList.contains('active') || 
                               item.querySelector('.faq-answer, .step-accordion__content, .js-accordion-content')?.style.maxHeight !== '0px';
                
                trackEvent('accordion_toggle', {
                    accordion_type: item.classList.contains('faq-item') ? 'faq' : 
                                   item.classList.contains('timeline-step') ? 'timeline' : 'footer',
                    item_title: toggle.textContent.trim().substring(0, 50),
                    action: isExpanded ? 'collapse' : 'expand'
                });
            });
        }
    });
};

document.addEventListener('DOMContentLoaded', () => {
    /**
     * Логика модального окна заявки
     */
    const applicationModal = document.getElementById('application-modal');
    console.log('applicationModal element:', applicationModal); // Debug
    const closeButton = applicationModal ? applicationModal.querySelector('.close-button') : null;

    const openModalButtons = document.querySelectorAll(
        'button.cta-button.primary:not([href^="tel:"]):not([data-analytics-event^="footer_phone_click"]), ' + // Кнопки с классом primary, не являющиеся ссылками на телефон
        'button.cta-button.secondary:not([href^="tel:"]):not([data-analytics-event^="footer_phone_click"]), ' + // Кнопки с классом secondary, не являющиеся ссылками на телефон
        'a.cta-button.primary:not([href^="tel:"]):not([href*="wa.me"]):not([href*="t.me"]), ' + // Ссылки с классом primary, не являющиеся ссылками на телефон/мессенджеры
        'a.cta-button.secondary:not([href^="tel:"]):not([href*="wa.me"]):not([href*="t.me"]), ' + // Ссылки с классом secondary, не являющиеся ссылками на телефон/мессенджеры
        '.pre-footer-cta__buttons .cta-button.primary, ' + // Конкретная кнопка в pre-footer
        '.pre-footer-cta__buttons .cta-button.secondary:not([href*="wa.me"]):not([href*="t.me"]), ' + // Конкретные кнопки в pre-footer, не являющиеся ссылками на мессенджеры
        '.sticky-mobile-button' // Плавающая кнопка на мобильных
    );
    console.log('openModalButtons elements:', openModalButtons); // Debug

    function openApplicationModal() {
        if (applicationModal) {
            applicationModal.style.display = 'flex';
            document.body.style.overflow = 'hidden'; // Запретить прокрутку фона
        }
    }

    function closeApplicationModal() {
        if (applicationModal) {
            applicationModal.style.display = 'none';
            document.body.style.overflow = ''; // Разрешить прокрутку фона
        }
    }

    // Enhanced modal form handling
    const modalForm = applicationModal ? applicationModal.querySelector('form') : null;
    if (modalForm) {
        modalForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const nameInput = modalForm.querySelector('input[type="text"]');
            const phoneInput = modalForm.querySelector('input[type="tel"]');
            
            // Basic validation
            if (!nameInput.value.trim()) {
                nameInput.classList.add('error');
                nameInput.focus();
                return;
            }
            
            if (!phoneInput.value.trim() || phoneInput.value.replace(/\D/g, '').length < 10) {
                phoneInput.classList.add('error');
                phoneInput.focus();
                return;
            }
            
            // Analytics will be tracked by initFormAnalytics()
            trackEvent('modal_form_submit', {
                name_length: nameInput.value.length,
                phone_length: phoneInput.value.length
            });
            
            // Show success and close modal
            alert('Спасибо! Мы перезвоним в течение 2 минут.');
            closeApplicationModal();
            modalForm.reset();
        });
        
        // Clear errors on input
        [modalForm.querySelector('input[type="text"]'), modalForm.querySelector('input[type="tel"]')].forEach(input => {
            input.addEventListener('input', () => {
                input.classList.remove('error');
            });
        });
    }

    // Enhanced chat widget form handling
    const chatForm = document.querySelector('.chat-widget__form');
    if (chatForm) {
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const phoneInput = chatForm.querySelector('input[type="tel"]');
            
            // Basic validation
            if (!phoneInput.value.trim() || phoneInput.value.replace(/\D/g, '').length < 10) {
                phoneInput.classList.add('error');
                phoneInput.focus();
                return;
            }
            
            // Analytics will be tracked by initFormAnalytics()
            trackEvent('chat_form_submit', {
                phone_length: phoneInput.value.length
            });
            
            // Show success
            const chatWindow = chatForm.closest('.chat-widget__window');
            const successMessage = document.createElement('div');
            successMessage.style.cssText = `
                background: #10b981;
                color: white;
                padding: 16px;
                border-radius: 8px;
                text-align: center;
                font-weight: 600;
            `;
            successMessage.textContent = '✓ Спасибо! Врач перезвонит через 1 минуту.';
            
            chatWindow.innerHTML = '';
            chatWindow.appendChild(successMessage);
            
            // Auto close after 3 seconds
            setTimeout(() => {
                const chatWidget = document.querySelector('.chat-widget');
                if (chatWidget) {
                    chatWidget.classList.remove('is-open');
                }
            }, 3000);
        });
        
        // Clear errors on input
        const chatPhoneInput = chatForm.querySelector('input[type="tel"]');
        chatPhoneInput.addEventListener('input', () => {
            chatPhoneInput.classList.remove('error');
        });
    }

    if (applicationModal && closeButton) {
        openModalButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                // Дополнительная проверка, чтобы исключить ссылки "tel:", "wa.me" и "t.me"
                if (button.tagName === 'A' && (button.href.startsWith('tel:') || button.href.includes('wa.me/') || button.href.includes('t.me/'))) {
                    return; // Пропускаем, если это ссылка на звонок/мессенджер
                }
                e.preventDefault();
                openApplicationModal();
            });
        });

        closeButton.addEventListener('click', closeApplicationModal);

        applicationModal.addEventListener('click', (e) => {
            if (e.target === applicationModal) {
                closeApplicationModal();
            }
        });

        // Keyboard accessibility
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && applicationModal.style.display === 'flex') {
                closeApplicationModal();
            }
        });

        // Focus management
        const modalContent = applicationModal.querySelector('.modal-content');
        const focusableElements = modalContent.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        modalContent.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusable) {
                        e.preventDefault();
                        lastFocusable.focus();
                    }
                } else {
                    if (document.activeElement === lastFocusable) {
                        e.preventDefault();
                        firstFocusable.focus();
                    }
                }
            }
        });

        // Set initial focus when modal opens
        const originalOpenApplicationModal = openApplicationModal;
        openApplicationModal = function() {
            originalOpenApplicationModal();
            if (firstFocusable) {
                setTimeout(() => firstFocusable.focus(), 100);
            }
        };
    }


    const initHangoverRisksAnalytics = () => {
        const hangoverBlock = document.getElementById('risks-hangover');
        if (!hangoverBlock) {
            return;
        }

        // Mock analytics function
        const trackEvent = (eventName, payload) => {
            console.log(`Analytics Event: ${eventName}`, payload);
            // In a real project, you would send this to your analytics service
            // e.g., gtag('event', eventName, payload);
        };

        // 1. View Event Tracking
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    trackEvent('hangover_block.view', {
                        page: 'hangover',
                        variant: 'A'
                    });
                    observer.unobserve(hangoverBlock); // Track only once
                }
            });
        }, { threshold: 0.5 }); // 50% visibility

        observer.observe(hangoverBlock);

        // 2. CTA Click Tracking
        const primaryCta = hangoverBlock.querySelector('.cta-button.primary');
        const secondaryCta = hangoverBlock.querySelector('.cta-link.secondary');

        if (primaryCta) {
            primaryCta.addEventListener('click', () => {
                trackEvent('hangover_block.cta_click', {
                    position: 'right_side',
                    page: 'hangover',
                    variant: 'A'
                });
                
                // Open modal logic (placeholder)
                alert('Открытие формы: Имя, Телефон, Город...');
            });
        }

        if (secondaryCta) {
            secondaryCta.addEventListener('click', (e) => {
                e.preventDefault(); // Prevent default link behavior
                trackEvent('hangover_block.secondary_click', {
                    page: 'hangover',
                    variant: 'A'
                });
                // Optional: scroll to prices or show info
                alert('Показываем информацию о стоимости и времени приезда...');
            });
        }
    };

    // Initialize the new logic
    initHangoverRisksAnalytics();
    
    // Initialize centralized analytics
    initCTAAnalytics();
    initFormAnalytics();
    initSliderAnalytics();
    initAccordionAnalytics();

    /**
     * 2. Пульс кнопок CTA
     * Динамически создаем и добавляем стили для анимации,
     * чтобы не изменять файл style.css.
     */
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes pulse {
            0% {
                transform: scale(1);
                box-shadow: 0 0 0 0 rgba(0, 200, 179, 0.7);
            }
            70% {
                transform: scale(1.05);
                box-shadow: 0 0 10px 20px rgba(0, 200, 179, 0);
            }
            100% {
                transform: scale(1);
                box-shadow: 0 0 0 0 rgba(0, 200, 179, 0);
            }
        }
        .cta-button-pulse {
            animation: pulse 2s infinite;
        }
    `;
    document.head.appendChild(style);

    // Находим все кнопки с классом .cta-button.primary, исключая кнопку отправки формы
    const ctaButtonsToPulse = document.querySelectorAll('.cta-button.primary:not(form button)');
    ctaButtonsToPulse.forEach(button => {
        button.classList.add('cta-button-pulse');
    });

    /**
     * 3. Анимация чисел (count-up)
     * Анимируем число в секции .danger при ее появлении.
     */
    const dangerSection = document.querySelector('.danger');
    if (dangerSection) {
        const countUpObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const p = dangerSection.querySelector('p'); // Целевой параграф
                    if (p && p.textContent.includes('7100')) { // Изменено с 200 на 7100
                        animateNumber(p, 7100); // Изменено с 200 на 7100
                    }
                    observer.unobserve(dangerSection);
                }
            });
        }, { threshold: 0.5 });

        countUpObserver.observe(dangerSection);
    }

    function animateNumber(element, targetNumber) {
        let currentNumber = 0;
        const duration = 2000; // 2 секунды
        const stepTime = 20; // Интервал обновления
        const steps = duration / stepTime;
        const increment = targetNumber / steps;
        const originalText = element.textContent;
        const textBefore = originalText.split(element.textContent.match(/\d+/)[0])[0]; // Динамический поиск числа
        const textAfter = originalText.split(element.textContent.match(/\d+/)[0])[1]; // Динамический поиск числа

        const interval = setInterval(() => {
            currentNumber += increment;
            if (currentNumber >= targetNumber) {
                currentNumber = targetNumber;
                clearInterval(interval);
            }
            element.textContent = textBefore + Math.floor(currentNumber) + textAfter;
        }, stepTime);
    }

    /**
     * 4. Слайдер отзывов
     * Реализация слайдера с ручным переключением по стрелкам.
     */
    const reviewsSection = document.querySelector('.reviews');
    if (reviewsSection) {
        const slides = reviewsSection.querySelectorAll('.review-card');
        const prevButton = reviewsSection.querySelector('.slider-prev');
        const nextButton = reviewsSection.querySelector('.slider-next');
        let currentSlide = 0;
        let slideInterval;

        const showSlide = (n) => {
            slides.forEach((slide, index) => {
                slide.style.display = (index === n) ? 'flex' : 'none';
            });
        };

        // Сначала проверяем, есть ли вообще слайды, и показываем первый
        if (slides.length > 0) {
            showSlide(currentSlide);
        }

        // Затем, если слайдов больше одного и есть кнопки, добавляем интерактивность
        if (slides.length > 1 && prevButton && nextButton) {
            const next = () => {
                currentSlide = (currentSlide + 1) % slides.length;
                showSlide(currentSlide);
            };

            const prev = () => {
                currentSlide = (currentSlide - 1 + slides.length) % slides.length;
                showSlide(currentSlide);
            };

            const startSlideShow = () => {
                slideInterval = setInterval(next, 7000); // 7 секунд
            };

            const stopSlideShow = () => {
                clearInterval(slideInterval);
            };

            nextButton.addEventListener('click', () => {
                next();
                stopSlideShow();
                startSlideShow(); // Перезапускаем таймер после ручного переключения
            });

            prevButton.addEventListener('click', () => {
                prev();
                stopSlideShow();
                startSlideShow(); // Перезапускаем таймер после ручного переключения
            });

            // Запускаем автопрокрутку
            startSlideShow();
        }
    }

    /**
     * 5. Форма заявки
     * При клике на CTA-кнопки плавно прокручиваем страницу к форме.
     */
    const callButtons = document.querySelectorAll('.hero .cta-button.primary, .solution-new .cta-button.primary');
    const ctaForm = document.getElementById('cta-form');

    if (ctaForm && callButtons.length > 0) {
        callButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                ctaForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
    }

    /**
     * 6. UX-фишки для повышения конверсии
     */

    // --- 6.1. Виджет чата ---
    const chatWidget = document.querySelector('.chat-widget');
    if (chatWidget) {
        const toggleButton = chatWidget.querySelector('.chat-widget__toggle');
        const chatWindow = chatWidget.querySelector('.chat-widget__window');

        toggleButton.addEventListener('click', () => {
            chatWindow.classList.toggle('is-open');
        });

        // Показываем окно чата через 30 секунд
        setTimeout(() => {
            if (!chatWindow.classList.contains('is-open')) {
                chatWindow.classList.add('is-open');
            }
        }, 30000);
    }


    // --- 6.4. Sticky кнопка на мобайле ---
    const stickyButton = document.querySelector('.sticky-mobile-button');
    if (stickyButton && ctaForm) {
        stickyButton.addEventListener('click', (e) => {
            e.preventDefault();
            ctaForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    /**
     * Анимация появления блока .solution-new
     */
    const solutionNewSection = document.querySelector('.solution-new');
    if (solutionNewSection) {
        const fadeInObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const content = entry.target.querySelector('.solution-new__content');
                    if (content) {
                        content.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
                        content.style.opacity = '1';
                        content.style.transform = 'translateY(0)';
                    }
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 }); // Анимация начнется, когда 20% блока будет видно

        fadeInObserver.observe(solutionNewSection);
    }
    /**
     * Живая лента (Эффект присутствия)
     */
    const liveFeed = () => {
        // Отключаем на мобильных устройствах
        if (window.innerWidth < 768) {
            return;
        }

        const notification = document.getElementById('live-feed-notification');
        const notificationText = document.getElementById('live-feed-text');

        // Если элементов нет на странице, ничего не делаем
        if (!notification || !notificationText) {
            return;
        }

        const messages = [
            "Только что завершен анонимный вызов (Вывод из запоя) в районе ЦАО.",
            "В СВАО осталась 1 свободная бригада. Время ожидания ~35 минут.",
            "Врач-нарколог Смирнов А.В. только что освободился и готов принять вызов.",
            "Сейчас 4 пациента проходят процедуру детоксикации на дому.",
            "Семья из ЮЗАО только что оставила благодарность бригаде №3."
        ];

        let lastMessageIndex = -1;

        const showNotification = () => {
            let randomIndex;
            // Гарантируем, что новое сообщение не будет таким же, как предыдущее
            do {
                randomIndex = Math.floor(Math.random() * messages.length);
            } while (messages.length > 1 && randomIndex === lastMessageIndex);
            
            lastMessageIndex = randomIndex;
            notificationText.textContent = messages[randomIndex];
            notification.classList.add('show');

            // Скрываем уведомление через 7 секунд
            setTimeout(() => {
                notification.classList.remove('show');
                // Планируем следующее уведомление после исчезновения текущего
                scheduleNextNotification();
            }, 7000);
        };

        const scheduleNextNotification = () => {
            // Случайная задержка от 30 до 45 секунд
            const randomDelay = Math.floor(Math.random() * (45000 - 30000 + 1)) + 30000;
            setTimeout(showNotification, randomDelay);
        };

        // Первый запуск через 10 секунд
        setTimeout(showNotification, 10000);
    };

    // Запускаем логику живой ленты
    liveFeed();
});


    /**
     * Гамбургер меню
     */
    const hamburger = document.querySelector('.burger-menu');
    const nav = document.querySelector('.main-nav');

    if (hamburger && nav) {
        hamburger.addEventListener('click', () => {
            nav.classList.toggle('is-open');
        });

        // Закрываем меню при клике на ссылку
        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('is-open');
            });
        });
    }

/**
 * ===================================================================
 * NEW FOOTER LOGIC
 * ===================================================================
 */

// --- 1. Footer Accordion for Mobile ---
const footerAccordion = () => {
    // Работаем только на мобильных устройствах
    if (window.innerWidth > 767) {
        return;
    }

    const accordionTitles = document.querySelectorAll('.js-accordion-title');

    accordionTitles.forEach(title => {
        title.addEventListener('click', () => {
            const content = title.nextElementSibling;
            
            // Проверяем, что контент существует и имеет нужный класс
            if (content && content.classList.contains('js-accordion-content')) {
                title.classList.toggle('active');
                
                if (content.style.display === 'block') {
                    content.style.display = 'none';
                } else {
                    content.style.display = 'block';
                }
            }
        });
    });
};

// --- 2. Analytics Events Tracking ---
const trackFooterAnalytics = () => {
    const trackableElements = document.querySelectorAll('[data-analytics-event]');

    trackableElements.forEach(element => {
        element.addEventListener('click', () => {
            const eventName = element.getAttribute('data-analytics-event');
            if (eventName) {
                console.log(`Analytics Event Triggered: ${eventName}`);
                
                // В реальном проекте здесь будет код для отправки события
                // например, для Google Analytics:
                // if (typeof gtag === 'function') {
                //     gtag('event', eventName, {
                //         'event_category': 'Footer Clicks',
                //         'page_path': window.location.pathname
                //     });
                // }
            }
        });
    });
};

// --- Initialize Footer Scripts ---
footerAccordion();
trackFooterAnalytics();

/**
 * --- NEW COMPARISON BLOCK V2 ANIMATION ---
 */
const animateComparisonBlock = () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const items = entry.target.querySelectorAll('.fade-in-item');
                items.forEach((item, index) => {
                    setTimeout(() => {
                        item.classList.add('is-visible');
                    }, index * 150); // Staggered animation
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 }); // Trigger when 20% of the element is visible

    const comparisonBlock = document.querySelector('.comparison-v2');
    if (comparisonBlock) {
        observer.observe(comparisonBlock);
    }
};

// Initialize the animation logic
animateComparisonBlock();

/**
 * --- NEW STEPS SECTION ANIMATION ---
 */
const animateStepsSection = () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const items = entry.target.querySelectorAll('.step-card');
                items.forEach((item, index) => {
                    setTimeout(() => {
                        item.classList.add('is-visible');
                    }, index * 200); // Staggered animation
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 }); // Trigger when 20% of the element is visible

    const stepsSection = document.querySelector('.steps-section');
    if (stepsSection) {
        observer.observe(stepsSection);
    }
};

// Initialize the animation logic
animateStepsSection();

/**
 * --- NEW STEPS SECTION V2 ANIMATION ---
 */
const animateStepsSectionV2 = () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const items = entry.target.querySelectorAll('.step-card-v2');
                items.forEach((item, index) => {
                    setTimeout(() => {
                        item.classList.add('is-visible');
                    }, index * 200); // Staggered animation
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 }); // Trigger when 20% of the element is visible

    const stepsSection = document.querySelector('.steps-section-v2');
    if (stepsSection) {
        observer.observe(stepsSection);
    }
};

// Initialize the animation logic
animateStepsSectionV2();

/**
 * --- FAQ Accordion ---
 */
const faqAccordion = () => {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        if (question && answer) {
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');

                // Close all other items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                        const otherAnswer = otherItem.querySelector('.faq-answer');
                        if (otherAnswer) {
                            otherAnswer.style.maxHeight = null;
                        }
                    }
                });

                // Toggle current item
                if (isActive) {
                    item.classList.remove('active');
                    answer.style.maxHeight = null;
                } else {
                    item.classList.add('active');
                    answer.style.maxHeight = answer.scrollHeight + "px";
                }
            });
        }
    });
};

// Initialize the FAQ accordion logic
faqAccordion();

document.addEventListener('DOMContentLoaded', () => {

    const dangerSignalsSection = document.querySelector('.danger-signals');
    if (!dangerSignalsSection) {
        return;
    }

    // --- 1. Fade-up Animation on Scroll ---
    const animateOnScroll = () => {
        const elementsToAnimate = dangerSignalsSection.querySelectorAll('.danger-signals__symptoms-card, .info-card, .danger-signals__cta-container');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        elementsToAnimate.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            element.style.transition = `opacity 0.3s ease-out ${index * 50}ms, transform 0.3s ease-out ${index * 50}ms`;
            observer.observe(element);
        });
    };

    // --- 2. Toast Notification Logic ---
    const handleToast = () => {
        const toast = document.getElementById('team-toast');
        if (!toast) return;

        setTimeout(() => {
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
            }, 8000); // Hide after 8 seconds
        }, 2000); // Show after 2 seconds
    };

    // --- 3. Sticky CTA on Mobile ---
    const handleStickyCTA = () => {
        const ctaButton = dangerSignalsSection.querySelector('.danger-signals__cta-button');
        if (!ctaButton) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (window.innerWidth <= 600) {
                    if (entry.isIntersecting) {
                        // Section is more than 50% visible, remove sticky
                        if (entry.intersectionRatio > 0.5) {
                            ctaButton.classList.remove('sticky');
                        }
                    } else {
                        // Section is not visible, make button sticky
                        ctaButton.classList.add('sticky');
                    }
                }
            });
        }, { threshold: [0, 0.5] }); // Trigger at 0% and 50% visibility

        observer.observe(dangerSignalsSection);
        
        // Also remove sticky class on resize if screen is larger
        window.addEventListener('resize', () => {
            if (window.innerWidth > 600) {
                ctaButton.classList.remove('sticky');
            }
        });
    };

    // --- Initialize all functionalities ---
    animateOnScroll();
    handleToast();
    handleStickyCTA();

});

document.addEventListener('DOMContentLoaded', () => {

    const threatSectionV2 = document.querySelector('.threat-v2');
    if (!threatSectionV2) {
        return;
    }

    // --- Fade-up Animation on Scroll for Threat Cards ---
    const animateThreatCards = () => {
        const elementsToAnimate = threatSectionV2.querySelectorAll('.threat-v2-card');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        elementsToAnimate.forEach((element, index) => {
            element.style.transitionDelay = `${index * 100}ms`;
            observer.observe(element);
        });
    };

    // --- Initialize the animation ---
    animateThreatCards();

});


document.addEventListener('DOMContentLoaded', () => {
    // ... (существующий код, если он есть)

    // --- Логика для нового блока "4 шага к свободе" ---
    const stepsSection = document.querySelector('.steps-timeline-section');
    if (stepsSection) {
        initStepsAccordion(stepsSection);
        initStepsScrollAnimation(stepsSection);
    }
});

function initStepsAccordion(section) {
    const toggles = section.querySelectorAll('.step-accordion__toggle');

    toggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const content = toggle.nextElementSibling;
            
            // Проверяем, что контент существует и имеет нужный класс
            if (content && content.classList.contains('step-accordion__content')) {
                const isExpanded = content.style.maxHeight && content.style.maxHeight !== '0px';

                if (isExpanded) {
                    content.style.maxHeight = '0px';
                    toggle.textContent = 'Подробнее';
                } else {
                    content.style.maxHeight = content.scrollHeight + 'px';
                    toggle.textContent = 'Свернуть';
                }
            }
        });
    });
}

function initStepsScrollAnimation(section) {
    const animatedSteps = section.querySelectorAll('.timeline-step');

    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.1 // Сработает, когда 10% элемента видно
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Добавляем задержку "лесенкой"
                entry.target.style.transitionDelay = `${index * 80}ms`;
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedSteps.forEach(step => {
        observer.observe(step);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const burgerMenu = document.querySelector('.burger-menu');
    const mobileNav = document.querySelector('.mobile-nav');

    if (burgerMenu && mobileNav) {
        burgerMenu.addEventListener('click', function() {
            burgerMenu.classList.toggle('is-active');
            mobileNav.classList.toggle('is-open');
        });
    }
});

/**
 * --- Accordion for Steps Section on snyatie-lomki.html ---
 */
const initStepsAccordionLogic = () => {
    const timelineSteps = document.querySelectorAll('.timeline-step');
    if (!timelineSteps.length) {
        return;
    }

    timelineSteps.forEach(step => {
        const toggleButton = step.querySelector('.step-accordion__toggle');
        const content = step.querySelector('.step-accordion__content');

        if (toggleButton && content) {
            toggleButton.addEventListener('click', () => {
                const isExpanded = content.style.maxHeight && content.style.maxHeight !== '0px';

                if (isExpanded) {
                    content.style.maxHeight = '0px';
                    toggleButton.textContent = 'Подробнее';
                } else {
                    content.style.maxHeight = content.scrollHeight + 'px';
                    toggleButton.textContent = 'Свернуть';
                }
            });
        }
    });
};

// Initialize the new accordion logic on DOMContentLoaded
document.addEventListener('DOMContentLoaded', initStepsAccordionLogic);




    /**
     * Analytics for Withdrawal Alert Block
     */
    const initWithdrawalAlertAnalytics = () => {
        const withdrawalBlock = document.querySelector('.withdrawal-alert');
        if (!withdrawalBlock) {
            return;
        }

        // Mock analytics function if not globally available
        if (typeof trackEvent === 'undefined') {
            window.trackEvent = (category, action, label) => {
                console.log(`Analytics Event: Category=${category}, Action=${action}, Label=${label}`);
                // In a real project, you would send this to your analytics service
                // e.g., gtag('event', action, { 'event_category': category, 'event_label': label });
            };
        }

        // 1. View Event Tracking
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    trackEvent('withdrawal_block', 'view', 'withdrawal_block_view');
                    observer.unobserve(withdrawalBlock); // Track only once
                }
            });
        }, { threshold: 0.5 }); // 50% visibility

        observer.observe(withdrawalBlock);

        // 2. CTA Click Tracking
        const ctaButtons = withdrawalBlock.querySelectorAll('[data-analytics-action="cta_click"]');
        ctaButtons.forEach(button => {
            button.addEventListener('click', () => {
                const category = button.dataset.analyticsCategory;
                const action = button.dataset.analyticsAction;
                const label = button.dataset.analyticsLabel;
                if (category && action && label) {
                    trackEvent(category, action, label);
                }
            });
        });
    };

    // Initialize the new logic
    initWithdrawalAlertAnalytics();


document.addEventListener('DOMContentLoaded', () => {
    // Logic for the contacts page
    if (document.querySelector('.contact-hero')) {

        // --- Sticky Bar ---
        const stickyBar = document.querySelector('.sticky-bar');
        if (stickyBar) {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 400) {
                    stickyBar.style.display = 'grid';
                } else {
                    stickyBar.style.display = 'none';
                }
            });
        }

        // --- Analytics Events ---
        window.dataLayer = window.dataLayer || [];

        const trackCtaClick = (place, channel) => {
            window.dataLayer.push({
                event: 'cta_click',
                place: place,
                channel: channel
            });
            console.log(`cta_click: place=${place}, channel=${channel}`);
        };

        // Hero buttons
        document.querySelector('.contact-hero .btn--call').addEventListener('click', () => trackCtaClick('hero', 'call'));
        document.querySelector('.contact-hero .btn--wa').addEventListener('click', () => trackCtaClick('hero', 'whatsapp'));
        document.querySelector('.contact-hero .btn--tg').addEventListener('click', () => trackCtaClick('hero', 'telegram'));

        // Contact options buttons
        document.querySelector('.contact-options .btn--call').addEventListener('click', () => trackCtaClick('contact-options', 'call'));
        document.querySelector('.contact-options .btn--wa').addEventListener('click', () => trackCtaClick('contact-options', 'whatsapp'));
        document.querySelector('.contact-options .btn--tg').addEventListener('click', () => trackCtaClick('contact-options', 'telegram'));

        // Sticky bar buttons
        document.querySelector('.sticky-bar .btn--call').addEventListener('click', () => trackCtaClick('sticky', 'call'));
        document.querySelector('.sticky-bar .btn--wa').addEventListener('click', () => trackCtaClick('sticky', 'whatsapp'));
        
        // Footer CTA
        document.querySelector('.cta-bottom .btn').addEventListener('click', () => trackCtaClick('footer', 'form_scroll'));


        // --- Enhanced Form Validation ---
        const callbackForm = document.getElementById('callback-form');
        if (callbackForm) {
            // Remove existing error classes on input
            const clearErrors = () => {
                callbackForm.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
            };

            // Phone validation function
            const validatePhone = (phone) => {
                const cleaned = phone.replace(/\D/g, '');
                return cleaned.length >= 10 && cleaned.startsWith('7') && cleaned.length <= 11;
            };

            // Show error message
            const showError = (input, message) => {
                input.classList.add('error');
                
                // Create or update error message
                let errorDiv = input.parentNode.querySelector('.error-message');
                if (!errorDiv) {
                    errorDiv = document.createElement('div');
                    errorDiv.className = 'error-message';
                    errorDiv.style.color = '#e53e3e';
                    errorDiv.style.fontSize = '14px';
                    errorDiv.style.marginTop = '4px';
                    input.parentNode.appendChild(errorDiv);
                }
                errorDiv.textContent = message;
            };

            callbackForm.addEventListener('submit', (e) => {
                e.preventDefault();
                clearErrors();
                
                const phoneInput = callbackForm.querySelector('input[type="tel"]');
                const agreement = callbackForm.querySelector('input[type="checkbox"]');
                const channelSelect = callbackForm.querySelector('select');
                let isValid = true;

                // Validate phone
                if (!phoneInput.value.trim()) {
                    showError(phoneInput, 'Пожалуйста, введите номер телефона');
                    isValid = false;
                } else if (!validatePhone(phoneInput.value)) {
                    showError(phoneInput, 'Проверьте номер: нужен формат +7 (XXX) XXX-XX-XX');
                    isValid = false;
                }

                // Validate agreement
                if (!agreement.checked) {
                    agreement.classList.add('error');
                    alert('Необходимо согласие на обработку персональных данных.');
                    isValid = false;
                }

                if (isValid) {
                    // Analytics event will be tracked by initFormAnalytics()
                    
                    // Simulate form submission
                    window.dataLayer = window.dataLayer || [];
                    window.dataLayer.push({
                        event: 'lead_submit',
                        form_name: 'callback-form',
                        channel: channelSelect ? channelSelect.value : 'not_selected',
                        phone_length: phoneInput.value.length
                    });
                    
                    // Show success message
                    const successMessage = document.createElement('div');
                    successMessage.className = 'success-message';
                    successMessage.style.cssText = `
                        background: #10b981;
                        color: white;
                        padding: 12px 16px;
                        border-radius: 8px;
                        margin-top: 16px;
                        font-weight: 600;
                    `;
                    successMessage.textContent = '✓ Спасибо! Мы свяжемся в ближайшие минуты.';
                    
                    // Replace form with success message
                    callbackForm.parentNode.replaceChild(successMessage, callbackForm);
                    
                    // Log for debugging
                    console.log('lead_submit', {
                        form_name: 'callback-form',
                        channel: channelSelect ? channelSelect.value : 'not_selected'
                    });
                } else {
                    // Analytics error event will be tracked by initFormAnalytics()
                    phoneInput.focus();
                }
            });

            // Clear errors on input
            phoneInput.addEventListener('input', () => {
                phoneInput.classList.remove('error');
                const errorDiv = phoneInput.parentNode.querySelector('.error-message');
                if (errorDiv) errorDiv.remove();
            });

            agreement.addEventListener('change', () => {
                agreement.classList.remove('error');
            });
        }
    }
});
