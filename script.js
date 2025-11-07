document.addEventListener('DOMContentLoaded', () => {
    /**
     * Логика модального окна заявки
     */
    const createApplicationModal = () => {
        if (!document.body) {
            return null;
        }

        const modal = document.createElement('div');
        modal.id = 'application-modal';
        modal.className = 'modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'application-modal-title');

        modal.innerHTML = `
            <div class="modal-content">
                <button type="button" class="close-button" aria-label="Закрыть окно"></button>
                <h2 id="application-modal-title">Оставьте заявку</h2>
                <p>Мы перезвоним в течении 2-х минут</p>
                <p>Врач будет у Вас через 30-40 минут</p>
                <form action="#" method="post" data-telegram-form="Модальное окно заявки">
                    <input type="text" name="name" placeholder="Ваше имя (Необязательно)" data-label="Имя">
                    <input type="tel" name="phone" placeholder="Телефон" data-label="Телефон" required>
                    <button type="submit" class="cta-button primary">Оставить заявку</button>
                </form>
            </div>
        `;

        document.body.appendChild(modal);
        return modal;
    };

    let applicationModal = document.getElementById('application-modal');
    if (!applicationModal) {
        applicationModal = createApplicationModal();
    }
    const closeButton = applicationModal ? applicationModal.querySelector('.close-button') : null;

    if (applicationModal) {
        applicationModal.style.display = 'none';
        document.body.style.overflow = '';
    }

    const openModalButtons = Array.from(document.querySelectorAll('.cta-button')).filter((button) => {
        if (!button) {
            return false;
        }

        if (applicationModal && applicationModal.contains(button)) {
            return false;
        }

        if (button.closest('.chat-widget')) {
            return false;
        }

        if (button.closest('form[data-telegram-form]')) {
            return false;
        }

        if (button.matches('[data-analytics-event^="footer_phone_click"]')) {
            return false;
        }

        if (button.tagName === 'A') {
            const href = button.getAttribute('href') || '';
            if (href.startsWith('tel:') || href.includes('wa.me/') || href.includes('t.me/')) {
                return false;
            }
        }

        return true;
    });

    let isApplicationModalOpen = false;

    const TELEGRAM_BOT_TOKEN = '8507158747:AAHnkHF8-NX3onKxJZ6dLu65Nf8IL-tSyPo';
    const TELEGRAM_CHAT_ID = '-1002591344879';
    const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const TELEGRAM_MESSAGE_TITLE = 'Новая заявка с сайта';

    function openApplicationModal() {
        if (applicationModal) {
            applicationModal.style.display = 'flex';
            document.body.style.overflow = 'hidden'; // Запретить прокрутку фона
            isApplicationModalOpen = true;
        }
    }

    function closeApplicationModal() {
        if (applicationModal) {
            applicationModal.style.display = 'none';
            document.body.style.overflow = ''; // Разрешить прокрутку фона
            isApplicationModalOpen = false;
        }
    }

    const getFieldElement = (form, fieldName) => form.querySelector(`[name="${fieldName}"]`);

    const getFieldLabel = (fieldElement, fallbackLabel) => {
        if (!fieldElement) {
            return fallbackLabel;
        }
        return fieldElement.dataset.label || fieldElement.placeholder || fieldElement.name || fallbackLabel;
    };

    const buildTelegramMessage = (form) => {
        const formData = new FormData(form);
        const formName = form.dataset.telegramForm || 'Форма';
        const pageTitle = document.title || 'Без названия';
        const pageUrl = window.location.href;

        const lines = [
            TELEGRAM_MESSAGE_TITLE,
            '',
            `Форма: ${formName}`,
            `Страница: ${pageTitle}`,
            `URL: ${pageUrl}`
        ];

        formData.forEach((value, key) => {
            const fieldElement = getFieldElement(form, key);
            const label = getFieldLabel(fieldElement, key);
            const fieldType = fieldElement && fieldElement.type ? fieldElement.type.toLowerCase() : '';

            if (fieldType === 'checkbox') {
                const checkboxValue = fieldElement.checked ? 'Да' : 'Нет';
                lines.push(`${label}: ${checkboxValue}`);
                return;
            }

            const trimmedValue = typeof value === 'string' ? value.trim() : '';
            if (!trimmedValue) {
                if (key === 'name') {
                    lines.push(`${label}: не указано`);
                }
                return;
            }

            lines.push(`${label}: ${trimmedValue}`);
        });

        return lines.join('\n');
    };

    const sendLeadToTelegram = async (message) => {
        const response = await fetch(TELEGRAM_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                disable_web_page_preview: true
            })
        });

        const data = await response.json();
        if (!response.ok || !data.ok) {
            throw new Error((data && data.description) || 'Telegram API error');
        }
    };

    const handleTelegramFormSubmit = async (form) => {
        const submitButton = form.querySelector('[type="submit"]');
        const originalButtonText = submitButton ? submitButton.textContent : '';

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Отправляем...';
        }

        try {
            const message = buildTelegramMessage(form);
            await sendLeadToTelegram(message);
            form.reset();
            alert('Спасибо! Мы уже получили вашу заявку.');
        } catch (error) {
            console.error('Не удалось отправить заявку', error);
            alert('Не удалось отправить заявку. Попробуйте ещё раз.');
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        }
    };

    const initTelegramLeadForms = () => {
        const telegramForms = document.querySelectorAll('form[data-telegram-form]');
        if (!telegramForms.length) {
            return;
        }

        telegramForms.forEach((form) => {
            form.addEventListener('submit', async (event) => {
                event.preventDefault();
                await handleTelegramFormSubmit(form);
            });
        });
    };

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

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isApplicationModalOpen) {
                closeApplicationModal();
            }
        });
        applicationModal.addEventListener('click', (e) => {
            if (e.target === applicationModal) {
                closeApplicationModal();
                return;
            }

            const closeTarget = e.target.closest('.close-button');
            if (closeTarget) {
                e.preventDefault();
                closeApplicationModal();
            }
        });
    }

    initTelegramLeadForms();


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
    const callButtons = document.querySelectorAll('.solution-new .cta-button.primary');
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
        const chatCloseButton = chatWidget.querySelector('.chat-widget__close');

        toggleButton.addEventListener('click', () => {
            chatWindow.classList.toggle('is-open');
        });

        if (chatCloseButton) {
            chatCloseButton.addEventListener('click', () => {
                chatWindow.classList.remove('is-open');
            });
        }

        // Показываем окно чата через 30 секунд
        setTimeout(() => {
            if (!chatWindow.classList.contains('is-open')) {
                chatWindow.classList.add('is-open');
            }
        }, 30000);
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

    /**
     * 7. Слайдер услуг
     * Реализация слайдера с ручным переключением по стрелкам.
     */
    const servicesSection = document.querySelector('.services');
    if (servicesSection && window.innerWidth < 768) {
        const slidesContainer = servicesSection;
        const prevButton = servicesSection.querySelector('.slider-prev');
        const nextButton = servicesSection.querySelector('.slider-next');

        if (slidesContainer && prevButton && nextButton) {
            const slideWidth = window.innerWidth;

            nextButton.addEventListener('click', () => {
                slidesContainer.scrollBy({ left: slideWidth, behavior: 'smooth' });
            });

            prevButton.addEventListener('click', () => {
                slidesContainer.scrollBy({ left: -slideWidth, behavior: 'smooth' });
            });
        }
    }
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
    const mobileNavCloseButton = mobileNav ? mobileNav.querySelector('.mobile-nav__close') : null;
    const rootElement = document.documentElement;

    if (burgerMenu && mobileNav) {
        if (mobileNav.parentElement !== document.body) {
            document.body.appendChild(mobileNav);
        }

        const toggleMobileNav = () => {
            const isOpen = mobileNav.classList.toggle('is-open');
            burgerMenu.classList.toggle('is-active', isOpen);
            document.body.classList.toggle('mobile-nav-open', isOpen);
            rootElement.classList.toggle('mobile-nav-open', isOpen);
        };

        const closeMobileNav = () => {
            if (!mobileNav.classList.contains('is-open')) {
                return;
            }
            mobileNav.classList.remove('is-open');
            burgerMenu.classList.remove('is-active');
            document.body.classList.remove('mobile-nav-open');
            rootElement.classList.remove('mobile-nav-open');
        };

        burgerMenu.addEventListener('click', toggleMobileNav);

        if (mobileNavCloseButton) {
            mobileNavCloseButton.addEventListener('click', closeMobileNav);
            mobileNavCloseButton.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    closeMobileNav();
                }
            });
        }

        mobileNav.querySelectorAll('a, .phone').forEach((interactiveElement) => {
            interactiveElement.addEventListener('click', closeMobileNav);
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


        // --- Form Validation ---
        const callbackForm = document.getElementById('callback-form');
        if (callbackForm) {
            callbackForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const phoneInput = callbackForm.querySelector('input[type="tel"]');
                const agreement = callbackForm.querySelector('input[type="checkbox"]');
                let isValid = true;

                // Validate phone
                if (phoneInput.value.length < 10) { // Simple validation
                    alert('Проверьте номер: нужен формат +7...');
                    isValid = false;
                }

                // Validate agreement
                if (!agreement.checked) {
                    alert('Необходимо согласие на обработку персональных данных.');
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
                }
            });
        }
    }
});



