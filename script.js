/**
 * Глобальная функция аналитики для централизованного отслеживания событий
 */
window.trackAnalyticsEvent = (eventName, payload = {}) => {
    console.log(`Analytics Event: ${eventName}`, payload);
    
    // В реальном проекте здесь будет код для отправки в аналитическую систему
    // Например, для Google Analytics:
    // if (typeof gtag === 'function') {
    //     gtag('event', eventName, {
    //         'event_category': payload.category || 'User Interaction',
    //         'event_label': payload.label || '',
    //         'value': payload.value || 0,
    //         'custom_parameter_1': payload.page || window.location.pathname,
    //         'custom_parameter_2': payload.position || '',
    //         'custom_parameter_3': payload.channel || ''
    //     });
    // }
    
    // Для Яндекс.Метрики:
    // if (typeof ym === 'function') {
    //     ym(YANDEX_COUNTER_ID, 'reachGoal', eventName, payload);
    // }
    
    // Для dataLayer (GTAG):
    if (typeof dataLayer !== 'undefined') {
        window.dataLayer.push({
            event: eventName,
            ...payload
        });
    }
};

/**
 * Вспомогательные функции для отслеживания конкретных типов событий
 */
window.trackCTAClick = (position, channel, page = null) => {
    trackAnalyticsEvent('cta_click', {
        position: position, // hero, sticky, section, footer
        channel: channel,  // call, whatsapp, telegram, form
        page: page || window.location.pathname,
        timestamp: new Date().toISOString()
    });
};

window.trackFormSubmit = (formName, formData = {}) => {
    trackAnalyticsEvent('form_submit', {
        form_name: formName,
        page: window.location.pathname,
        timestamp: new Date().toISOString(),
        ...formData
    });
};

window.trackFormError = (formName, errorType, errorMessage = '') => {
    trackAnalyticsEvent('form_error', {
        form_name: formName,
        error_type: errorType, // validation, network, server_error
        error_message: errorMessage,
        page: window.location.pathname,
        timestamp: new Date().toISOString()
    });
};

window.trackSliderInteraction = (action, sliderName, currentIndex = null) => {
    trackAnalyticsEvent('slider_interaction', {
        action: action, // view, next, prev
        slider_name: sliderName,
        current_index: currentIndex,
        page: window.location.pathname,
        timestamp: new Date().toISOString()
    });
};

window.trackAccordionToggle = (sectionName, isExpanded, accordionTitle = '') => {
    trackAnalyticsEvent('accordion_toggle', {
        section_name: sectionName,
        is_expanded: isExpanded,
        accordion_title: accordionTitle,
        page: window.location.pathname,
        timestamp: new Date().toISOString()
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
        // Используем централизованную аналитику вместо локальной
        // Кнопки уже обрабатываются в initCTAAnalytics()


        // --- Form Validation ---
        const callbackForm = document.getElementById('callback-form');
        if (callbackForm) {
            callbackForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const phoneInput = callbackForm.querySelector('input[type="tel"]');
                const agreement = callbackForm.querySelector('input[type="checkbox"]');
                let isValid = true;

                // Clear previous errors
                callbackForm.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
                
                // Validate phone
                const phone = phoneInput.value.replace(/\D/g, ''); // Remove all non-digits
                if (phone.length < 10) {
                    phoneInput.classList.add('error');
                    phoneInput.setAttribute('aria-invalid', 'true');
                    phoneInput.setAttribute('aria-describedby', 'phone-error');
                    
                    // Create or update error message
                    let errorMsg = document.getElementById('phone-error');
                    if (!errorMsg) {
                        errorMsg = document.createElement('div');
                        errorMsg.id = 'phone-error';
                        errorMsg.className = 'error-message';
                        errorMsg.style.color = '#e53e3e';
                        errorMsg.style.fontSize = '14px';
                        errorMsg.style.marginTop = '4px';
                        phoneInput.parentNode.appendChild(errorMsg);
                    }
                    errorMsg.textContent = 'Проверьте номер: нужен формат +7 (XXX) XXX-XX-XX';
                    isValid = false;
                }

                // Validate agreement
                if (!agreement.checked) {
                    agreement.classList.add('error');
                    agreement.setAttribute('aria-invalid', 'true');
                    
                    // Create or update error message
                    let agreementError = document.getElementById('agreement-error');
                    if (!agreementError) {
                        agreementError = document.createElement('div');
                        agreementError.id = 'agreement-error';
                        agreementError.className = 'error-message';
                        agreementError.style.color = '#e53e3e';
                        agreementError.style.fontSize = '14px';
                        agreementError.style.marginTop = '4px';
                        agreement.parentNode.appendChild(agreementError);
                    }
                    agreementError.textContent = 'Необходимо согласие на обработку персональных данных';
                    isValid = false;
                }

                if (isValid) {
                    window.dataLayer.push({
                        event: 'lead_submit',
                        form_name: 'callback-form',
                        channel: callbackForm.querySelector('select').value
                    });
                    console.log('lead_submit');
                    alert('Спасибо! Мы свяжемся в ближайшие минуты.');
                    callbackForm.reset();
                    
                    // Clear error messages
                    callbackForm.querySelectorAll('.error-message').forEach(el => el.remove());
                }
            });
        }
    }
});

/* ===================================================================
 * MOBILE SECONDARY PAGES FUNCTIONALITY
 * ================================================================ */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize License Gallery Modal
    initLicenseGalleryModal();
    
    // Initialize Pricing Tabs
    initPricingTabs();
    
    // Initialize Enhanced Contact Form
    initEnhancedContactForm();
    
    // Initialize Team Cards Analytics
    initTeamCardsAnalytics();
});

/**
 * License Gallery Modal - Touch zoom modal with keyboard navigation
 */
function initLicenseGalleryModal() {
    const modal = document.getElementById('license-modal');
    if (!modal) return;

    const modalImage = document.getElementById('license-modal-image');
    const modalTitle = document.getElementById('license-modal-title');
    const modalCounter = modal.querySelector('.license-modal__counter');
    const closeBtn = modal.querySelector('.license-modal__close');
    const prevBtn = modal.querySelector('.license-modal__prev');
    const nextBtn = modal.querySelector('.license-modal__next');
    const overlay = modal.querySelector('.license-modal__overlay');
    const licenseItems = document.querySelectorAll('.license-item');

    if (!licenseItems.length) return;

    let currentIndex = 0;
    const totalItems = licenseItems.length;

    const openModal = (index) => {
        currentIndex = index;
        updateModalContent();
        modal.classList.add('is-open');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        trackAnalyticsEvent('license_gallery.open', {
            license_index: index,
            page: window.location.pathname
        });

        setTimeout(() => {
            closeBtn.focus();
        }, 100);
    };

    const closeModal = () => {
        modal.classList.remove('is-open');
        modal.style.display = 'none';
        document.body.style.overflow = '';
        
        trackAnalyticsEvent('license_gallery.close', {
            page: window.location.pathname
        });
    };

    const updateModalContent = () => {
        const currentItem = licenseItems[currentIndex];
        const img = currentItem.querySelector('img');
        const text = currentItem.querySelector('p');

        modalImage.src = img.src;
        modalImage.alt = img.alt;
        modalTitle.textContent = text ? text.textContent : 'Документ';
        modalCounter.textContent = `${currentIndex + 1} / ${totalItems}`;

        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex === totalItems - 1;

        trackAnalyticsEvent('license_gallery.view', {
            license_index: currentIndex,
            page: window.location.pathname
        });
    };

    const navigatePrev = () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateModalContent();
            trackAnalyticsEvent('license_gallery.prev', {
                license_index: currentIndex
            });
        }
    };

    const navigateNext = () => {
        if (currentIndex < totalItems - 1) {
            currentIndex++;
            updateModalContent();
            trackAnalyticsEvent('license_gallery.next', {
                license_index: currentIndex
            });
        }
    };

    licenseItems.forEach((item, index) => {
        item.addEventListener('click', () => openModal(index));
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openModal(index);
            }
        });
        item.setAttribute('tabindex', '0');
        item.setAttribute('role', 'button');
    });

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);
    prevBtn.addEventListener('click', navigatePrev);
    nextBtn.addEventListener('click', navigateNext);

    modal.addEventListener('keydown', (e) => {
        if (!modal.classList.contains('is-open')) return;

        switch(e.key) {
            case 'Escape':
                closeModal();
                break;
            case 'ArrowLeft':
                navigatePrev();
                break;
            case 'ArrowRight':
                navigateNext();
                break;
            case 'Tab':
                const focusableElements = modal.querySelectorAll('button:not([disabled])');
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                } else if (!e.shiftKey && document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
                break;
        }
    });
}

/**
 * Pricing Tabs - Segmented control for filtering service groups
 */
function initPricingTabs() {
    const pricingSection = document.querySelector('.pricing-section');
    if (!pricingSection) return;

    const tabs = pricingSection.querySelectorAll('.pricing-tab');
    const contents = pricingSection.querySelectorAll('.pricing-content');

    if (!tabs.length || !contents.length) return;

    tabs.forEach((tab, index) => {
        tab.setAttribute('role', 'tab');
        tab.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
        tab.setAttribute('aria-controls', `pricing-panel-${index}`);
        tab.setAttribute('id', `pricing-tab-${index}`);

        tab.addEventListener('click', () => {
            tabs.forEach(t => t.setAttribute('aria-selected', 'false'));
            tab.setAttribute('aria-selected', 'true');

            contents.forEach(c => c.classList.remove('active'));
            const targetContent = pricingSection.querySelector(`#pricing-panel-${index}`);
            if (targetContent) {
                targetContent.classList.add('active');
            }

            trackAnalyticsEvent('pricing_tabs.switch', {
                tab_index: index,
                tab_name: tab.textContent.trim(),
                page: window.location.pathname
            });
        });

        tab.addEventListener('keydown', (e) => {
            let newIndex = index;
            
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                newIndex = (index + 1) % tabs.length;
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                newIndex = (index - 1 + tabs.length) % tabs.length;
            } else if (e.key === 'Home') {
                e.preventDefault();
                newIndex = 0;
            } else if (e.key === 'End') {
                e.preventDefault();
                newIndex = tabs.length - 1;
            }

            if (newIndex !== index) {
                tabs[newIndex].click();
                tabs[newIndex].focus();
            }
        });
    });

    contents.forEach((content, index) => {
        content.setAttribute('role', 'tabpanel');
        content.setAttribute('id', `pricing-panel-${index}`);
        content.setAttribute('aria-labelledby', `pricing-tab-${index}`);
        if (index !== 0) {
            content.classList.remove('active');
        } else {
            content.classList.add('active');
        }
    });

    initPricingCards();
}

/**
 * Pricing Cards - Collapsible cards on mobile
 */
function initPricingCards() {
    const pricingCards = document.querySelectorAll('.pricing-card');
    
    pricingCards.forEach((card, index) => {
        const header = card.querySelector('.pricing-card__header');
        if (!header) return;

        if (window.innerWidth <= 768) {
            header.addEventListener('click', () => {
                const isExpanded = card.classList.contains('expanded');
                card.classList.toggle('expanded');

                trackAnalyticsEvent('pricing_card.toggle', {
                    card_index: index,
                    is_expanded: !isExpanded,
                    page: window.location.pathname
                });
            });

            header.setAttribute('role', 'button');
            header.setAttribute('aria-expanded', 'false');
            header.setAttribute('tabindex', '0');

            header.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    header.click();
                }
            });
        }

        const ctaButtons = card.querySelectorAll('.pricing-card__cta .cta-button');
        ctaButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                trackAnalyticsEvent('pricing_card.cta_click', {
                    card_index: index,
                    page: window.location.pathname
                });
            });
        });
    });
}

/**
 * Enhanced Contact Form with proper validation and analytics
 */
function initEnhancedContactForm() {
    const form = document.getElementById('callback-form');
    if (!form) return;

    const phoneInput = form.querySelector('input[name="phone"]');
    const agreeCheckbox = form.querySelector('input[name="agree"]');
    const formSuccess = form.querySelector('.form-success');

    const validatePhone = (phone) => {
        const cleaned = phone.replace(/\D/g, '');
        return cleaned.length === 11 && cleaned.startsWith('7');
    };

    const showError = (input, message) => {
        input.classList.add('error');
        const errorMsg = input.closest('.form-group').querySelector('.error-message');
        if (errorMsg) {
            errorMsg.textContent = message;
            errorMsg.classList.add('visible');
        }
    };

    const clearError = (input) => {
        input.classList.remove('error');
        const errorMsg = input.closest('.form-group').querySelector('.error-message');
        if (errorMsg) {
            errorMsg.classList.remove('visible');
        }
    };

    phoneInput?.addEventListener('input', () => {
        clearError(phoneInput);
    });

    agreeCheckbox?.addEventListener('change', () => {
        const errorMsg = agreeCheckbox.closest('.form-group').querySelector('.error-message');
        if (errorMsg) {
            errorMsg.classList.remove('visible');
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        let isValid = true;

        if (phoneInput && !validatePhone(phoneInput.value)) {
            showError(phoneInput, 'Введите корректный номер телефона');
            isValid = false;
            trackFormError('callback-form', 'phone_validation', 'Некорректный номер телефона');
        }

        if (agreeCheckbox && !agreeCheckbox.checked) {
            const errorMsg = agreeCheckbox.closest('.form-group').querySelector('.error-message');
            if (errorMsg) {
                errorMsg.textContent = 'Необходимо согласие на обработку данных';
                errorMsg.classList.add('visible');
            }
            isValid = false;
            trackFormError('callback-form', 'agreement_validation', 'Отсутствует согласие');
        }

        if (isValid) {
            const formData = {
                phone: phoneInput.value,
                channel: form.querySelector('select[name="channel"]')?.value || 'call',
                comment: form.querySelector('textarea[name="comment"]')?.value || ''
            };

            trackFormSubmit('callback-form', formData);

            form.style.display = 'none';
            if (formSuccess) {
                formSuccess.style.display = 'flex';
            }

            setTimeout(() => {
                form.reset();
                form.style.display = 'block';
                if (formSuccess) {
                    formSuccess.style.display = 'none';
                }
            }, 5000);
        }
    });
}

/**
 * Team Cards Analytics - Track when team section is viewed
 */
function initTeamCardsAnalytics() {
    const teamSection = document.querySelector('.team-section');
    if (!teamSection) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                trackAnalyticsEvent('team_section.view', {
                    page: window.location.pathname
                });
                observer.unobserve(teamSection);
            }
        });
    }, { threshold: 0.3 });

    observer.observe(teamSection);

    const teamCards = teamSection.querySelectorAll('.team-card');
    if (window.innerWidth <= 768 && teamCards.length > 0) {
        trackSliderInteraction('view', 'team_cards', 0);
    }
}

/**
 * Service Pages Mobile Functionality
 * Added for ticket: Services mobile refresh
 */

// FAQ Accordions
function initServiceAccordions() {
    const accordions = document.querySelectorAll('.faq-accordion');
    
    accordions.forEach(accordion => {
        const header = accordion.querySelector('.faq-accordion__header');
        const content = accordion.querySelector('.faq-accordion__content');
        
        if (!header || !content) return;
        
        header.addEventListener('click', () => {
            const isExpanded = accordion.getAttribute('aria-expanded') === 'true';
            const newExpanded = !isExpanded;
            
            accordion.setAttribute('aria-expanded', newExpanded);
            
            // Track analytics
            const title = header.textContent.trim();
            trackAccordionToggle('service_faq', newExpanded, title);
        });
        
        // Initialize collapsed state
        accordion.setAttribute('aria-expanded', 'false');
    });
}

// Methods Segmented Control for Kodirovanie page
function initMethodsSegmentedControl() {
    const controlButtons = document.querySelectorAll('.methods-segmented-control__button');
    const contentPanels = document.querySelectorAll('.methods-content-panel');
    
    if (controlButtons.length === 0 || contentPanels.length === 0) return;
    
    controlButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and panels
            controlButtons.forEach(btn => btn.classList.remove('active'));
            contentPanels.forEach(panel => panel.classList.remove('active'));
            
            // Add active class to clicked button and corresponding panel
            button.classList.add('active');
            
            // Map button index to panel ID
            const panelMap = ['panel-detox', 'panel-coding', 'panel-rehab'];
            const targetPanelId = panelMap[index];
            if (targetPanelId) {
                const targetPanel = document.getElementById(targetPanelId);
                if (targetPanel) {
                    targetPanel.classList.add('active');
                }
            }
            
            // Track analytics
            trackAnalyticsEvent('methods_tab_switch', {
                tab_index: index,
                tab_name: button.textContent.trim(),
                page: window.location.pathname,
                timestamp: new Date().toISOString()
            });
        });
    });
    
    // Set first tab as active
    if (controlButtons.length > 0) {
        controlButtons[0].click();
    }
}

// Horizontal Scrollers with Analytics
function initServiceScrollers() {
    const scrollers = document.querySelectorAll('.scroller, .steps-grid-v2, .composition-v2__grid');
    
    scrollers.forEach(scroller => {
        let currentIndex = 0;
        const items = scroller.children;
        const itemWidth = 280; // Fixed width from CSS
        const gap = 16;
        
        // Determine scroller name for analytics
        let scrollerName = 'unknown';
        if (scroller.classList.contains('steps-grid-v2')) {
            scrollerName = 'steps';
        } else if (scroller.classList.contains('composition-v2__grid')) {
            scrollerName = 'composition';
        } else if (scroller.classList.contains('scroller')) {
            scrollerName = 'general';
        }
        
        // Track initial view
        if (items.length > 0) {
            trackSliderInteraction('view', scrollerName, 0);
        }
        
        // Track scroll interactions
        let scrollTimeout;
        scroller.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                const newIndex = Math.round(scroller.scrollLeft / (itemWidth + gap));
                if (newIndex !== currentIndex) {
                    currentIndex = newIndex;
                    trackSliderInteraction('next', scrollerName, currentIndex);
                }
            }, 150);
        });
        
        // Add controls if they don't exist
        if (scroller.classList.contains('scroller') && !scroller.nextElementSibling?.classList.contains('scroller__controls')) {
            const controls = document.createElement('div');
            controls.className = 'scroller__controls';
            
            const prevBtn = document.createElement('button');
            prevBtn.className = 'scroller__control';
            prevBtn.innerHTML = '←';
            prevBtn.setAttribute('aria-label', 'Предыдущий');
            prevBtn.disabled = true;
            
            const nextBtn = document.createElement('button');
            nextBtn.className = 'scroller__control';
            nextBtn.innerHTML = '→';
            nextBtn.setAttribute('aria-label', 'Следующий');
            nextBtn.disabled = items.length <= 1;
            
            prevBtn.addEventListener('click', () => {
                if (currentIndex > 0) {
                    currentIndex--;
                    scroller.scrollTo({
                        left: currentIndex * (itemWidth + gap),
                        behavior: 'smooth'
                    });
                }
            });
            
            nextBtn.addEventListener('click', () => {
                if (currentIndex < items.length - 1) {
                    currentIndex++;
                    scroller.scrollTo({
                        left: currentIndex * (itemWidth + gap),
                        behavior: 'smooth'
                    });
                }
            });
            
            controls.appendChild(prevBtn);
            controls.appendChild(nextBtn);
            scroller.parentNode.insertBefore(controls, scroller.nextSibling);
            
            // Update button states on scroll
            scroller.addEventListener('scroll', () => {
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    const newIndex = Math.round(scroller.scrollLeft / (itemWidth + gap));
                    currentIndex = newIndex;
                    
                    prevBtn.disabled = currentIndex === 0;
                    nextBtn.disabled = currentIndex >= items.length - 1;
                }, 150);
            });
        }
    });
}

// Sticky Mobile CTA
function initStickyMobileCTA() {
    const stickyCTA = document.querySelector('.sticky-mobile-cta');
    if (!stickyCTA) return;
    
    const ctaButton = stickyCTA.querySelector('.sticky-mobile-cta__button');
    if (!ctaButton) return;
    
    // Show/hide based on scroll position
    let lastScrollY = window.scrollY;
    let ticking = false;
    
    function updateStickyCTA() {
        const currentScrollY = window.scrollY;
        const documentHeight = document.documentElement.scrollHeight;
        const windowHeight = window.innerHeight;
        const scrollThreshold = 300; // Show after scrolling 300px
        
        // Show if scrolled past threshold and not at bottom
        if (currentScrollY > scrollThreshold && currentScrollY < documentHeight - windowHeight - 100) {
            stickyCTA.classList.add('visible');
        } else {
            stickyCTA.classList.remove('visible');
        }
        
        lastScrollY = currentScrollY;
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateStickyCTA);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestTick);
    
    // Track CTA clicks
    ctaButton.addEventListener('click', () => {
        trackCTAClick('sticky_mobile', 'call', window.location.pathname);
    });
}

// Calculator Placeholder with CTA
function initCalculatorPlaceholders() {
    const placeholders = document.querySelectorAll('.calculator-placeholder');
    
    placeholders.forEach(placeholder => {
        const ctaButton = placeholder.querySelector('.cta-button');
        if (ctaButton) {
            ctaButton.addEventListener('click', () => {
                trackCTAClick('calculator_placeholder', 'form', window.location.pathname);
            });
        }
    });
}

// Initialize all service page functionality
function initServicePagesMobile() {
    // Only initialize on mobile
    if (window.innerWidth > 960) return;
    
    initServiceAccordions();
    initMethodsSegmentedControl();
    initServiceScrollers();
    initStickyMobileCTA();
    initCalculatorPlaceholders();
}

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize service pages functionality
    initServicePagesMobile();
    
    // Re-initialize on window resize (debounced)
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            initServicePagesMobile();
        }, 250);
    });
});

// Export functions for potential external use
window.initServicePagesMobile = initServicePagesMobile;
