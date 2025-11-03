# Pricing Section Implementation Guide

## Overview
This guide explains how to add the mobile-responsive pricing section to service detail pages.

## Required Files
Make sure these files are linked in your HTML:
```html
<link rel="stylesheet" href="style.css">
<link rel="stylesheet" href="style-mobile-secondary.css">
<script src="script.js"></script>
```

## HTML Structure

### Basic Pricing Section
```html
<section class="section pricing-section">
    <div class="container">
        <h2 class="section-title">Цены на услуги</h2>
        <p class="section-subtitle">Прозрачные цены без скрытых платежей. Фиксированная стоимость.</p>
        
        <!-- Segmented Control (Tabs) -->
        <div class="pricing-tabs" role="tablist" aria-label="Категории услуг">
            <button class="pricing-tab" role="tab" aria-selected="true">Детокс</button>
            <button class="pricing-tab" role="tab" aria-selected="false">Кодирование</button>
            <button class="pricing-tab" role="tab" aria-selected="false">Реабилитация</button>
        </div>

        <!-- Tab Panel 1: Детокс -->
        <div class="pricing-content active" role="tabpanel" id="pricing-panel-0">
            <div class="pricing-cards">
                
                <!-- Pricing Card 1 -->
                <div class="pricing-card">
                    <div class="pricing-card__header">
                        <div class="pricing-card__title">
                            <h3>Вывод из запоя на дому</h3>
                            <p>Детоксикация организма с выездом врача</p>
                        </div>
                        <div class="pricing-card__price">
                            <span class="pricing-card__price-value">от 5 000₽</span>
                            <span class="pricing-card__price-label">выезд 24/7</span>
                        </div>
                        <div class="pricing-card__toggle">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                    </div>
                    <div class="pricing-card__body">
                        <div class="pricing-card__content">
                            <div class="pricing-card__includes">
                                <h4>Что входит в услугу:</h4>
                                <ul>
                                    <li>Осмотр врача-нарколога с опытом 10+ лет</li>
                                    <li>Капельница с детоксикационными препаратами</li>
                                    <li>Контроль жизненных показателей</li>
                                    <li>Рекомендации по восстановлению</li>
                                    <li>Полная анонимность</li>
                                </ul>
                            </div>
                            <div class="pricing-card__cta">
                                <button class="cta-button primary">Вызвать врача</button>
                                <a href="tel:+78000000000" class="cta-button secondary">Позвонить</a>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Pricing Card 2 -->
                <div class="pricing-card">
                    <div class="pricing-card__header">
                        <div class="pricing-card__title">
                            <h3>Капельница от похмелья</h3>
                            <p>Быстрое снятие симптомов похмелья</p>
                        </div>
                        <div class="pricing-card__price">
                            <span class="pricing-card__price-value">от 3 500₽</span>
                            <span class="pricing-card__price-label">приезд 30-60 мин</span>
                        </div>
                        <div class="pricing-card__toggle">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                    </div>
                    <div class="pricing-card__body">
                        <div class="pricing-card__content">
                            <div class="pricing-card__includes">
                                <h4>Что входит в услугу:</h4>
                                <ul>
                                    <li>Консультация нарколога</li>
                                    <li>Капельница с витаминами и электролитами</li>
                                    <li>Симптоматическое лечение</li>
                                    <li>Улучшение состояния за 1-2 часа</li>
                                </ul>
                            </div>
                            <div class="pricing-card__cta">
                                <button class="cta-button primary">Вызвать врача</button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>

        <!-- Tab Panel 2: Кодирование -->
        <div class="pricing-content" role="tabpanel" id="pricing-panel-1">
            <div class="pricing-cards">
                <div class="pricing-card">
                    <div class="pricing-card__header">
                        <div class="pricing-card__title">
                            <h3>Медикаментозное кодирование</h3>
                            <p>Введение препарата для блокировки тяги</p>
                        </div>
                        <div class="pricing-card__price">
                            <span class="pricing-card__price-value">от 8 000₽</span>
                            <span class="pricing-card__price-label">на дому или в клинике</span>
                        </div>
                        <div class="pricing-card__toggle">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                    </div>
                    <div class="pricing-card__body">
                        <div class="pricing-card__content">
                            <div class="pricing-card__includes">
                                <h4>Что входит в услугу:</h4>
                                <ul>
                                    <li>Полное обследование перед процедурой</li>
                                    <li>Введение сертифицированного препарата</li>
                                    <li>Психотерапевтическая беседа</li>
                                    <li>Наблюдение 1-2 часа после процедуры</li>
                                    <li>Справка о кодировании</li>
                                </ul>
                            </div>
                            <div class="pricing-card__cta">
                                <button class="cta-button primary">Записаться</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Tab Panel 3: Реабилитация -->
        <div class="pricing-content" role="tabpanel" id="pricing-panel-2">
            <div class="pricing-cards">
                <div class="pricing-card">
                    <div class="pricing-card__header">
                        <div class="pricing-card__title">
                            <h3>Амбулаторная программа</h3>
                            <p>Психологическая поддержка и контроль</p>
                        </div>
                        <div class="pricing-card__price">
                            <span class="pricing-card__price-value">от 15 000₽</span>
                            <span class="pricing-card__price-label">за месяц</span>
                        </div>
                        <div class="pricing-card__toggle">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                    </div>
                    <div class="pricing-card__body">
                        <div class="pricing-card__content">
                            <div class="pricing-card__includes">
                                <h4>Что входит в программу:</h4>
                                <ul>
                                    <li>Еженедельные встречи с психологом</li>
                                    <li>Групповая терапия (по желанию)</li>
                                    <li>План профилактики срывов</li>
                                    <li>Работа с созависимостью семьи</li>
                                    <li>Круглосуточная телефонная поддержка</li>
                                </ul>
                            </div>
                            <div class="pricing-card__cta">
                                <button class="cta-button primary">Узнать подробнее</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </div>
</section>
```

## How It Works

### Desktop (>768px)
- All three tabs visible in a horizontal segmented control
- Cards displayed in a grid (1-2 columns depending on content)
- Cards are always expanded (toggle icon hidden)
- Hover effects on cards and tabs

### Mobile (≤768px)
- Tabs stack vertically in a single column
- Cards displayed one per row
- Cards collapsed by default - tap header to expand
- Toggle icon visible and animated
- Smooth expand/collapse animation
- Price information moves below title on small screens

## Analytics Events

The pricing system automatically tracks these events:
- `pricing_tabs.switch` - When user changes tabs
- `pricing_card.toggle` - When user expands/collapses a card (mobile only)
- `pricing_card.cta_click` - When user clicks CTA button in a card

## Accessibility Features

- Proper ARIA attributes (role="tablist", role="tab", role="tabpanel")
- Keyboard navigation support:
  - Arrow keys to switch between tabs
  - Home/End keys to jump to first/last tab
  - Enter/Space to expand cards on mobile
- Focus management and visible focus rings
- Screen reader friendly labels

## Customization

### Colors
The pricing system uses the site's Tiffany color scheme (#03d3dd). To change:
- Primary color: `.pricing-tab[aria-selected="true"]`
- Card border hover: `.pricing-card:hover`
- Toggle icon color: `.pricing-card.expanded .pricing-card__toggle`

### Card Layout
Add more cards by duplicating the `.pricing-card` structure. Desktop will automatically arrange them in a grid.

### Number of Tabs
You can add or remove tabs - just ensure each tab has a corresponding `.pricing-content` panel with matching IDs.

## Example Service Pages
This pricing section can be added to:
- vyvod-iz-zapoya.html
- snyatie-pohmelya.html
- kodirovanie.html
- snyatie-lomki.html
- Any other service detail page

## Notes
- Always include proper pricing disclaimer (consult specialist, etc.)
- Prices should be kept up to date
- CTA buttons should open the lead capture modal or link to tel:
- Test on actual mobile devices for scroll snap behavior
