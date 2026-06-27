/**
 * Alliance GYM - Coordinador Principal (SPA & UI Bindings)
 * Controla el flujo de la página, modales, transiciones de vistas y cableado de formularios.
 */

document.addEventListener('DOMContentLoaded', () => {
    const DEFAULT_CONFIG = {
        hours: {
            weekday: '5:00 AM - 11:00 PM',
            saturday: '6:00 AM - 8:00 PM',
            sunday: '7:00 AM - 2:00 PM'
        },
        promo: {
            title: '🔥 PROMO INAUGURAL 🔥',
            description: 'Inscríbete hoy en línea y llévate tu primer mes con <strong>500 Puntos de Regalo</strong> en tu monedero de recompensas.'
        },
        plans: {
            basico: { price: 399 },
            black: { price: 599 },
            vip: { price: 899 }
        }
    };

    window.applySiteConfig = function() {
        const saved = JSON.parse(localStorage.getItem('alliance_gym_config')) || {};
        const config = {
            hours: { ...DEFAULT_CONFIG.hours, ...(saved.hours || {}) },
            promo: { ...DEFAULT_CONFIG.promo, ...(saved.promo || {}) },
            plans: { ...DEFAULT_CONFIG.plans, ...(saved.plans || {}) }
        };
        
        // Guardar por si no existía en localStorage o estaba incompleto
        localStorage.setItem('alliance_gym_config', JSON.stringify(config));

        // Aplicar horarios
        const hourWeekday = document.getElementById('hour-weekday');
        const hourSat = document.getElementById('hour-sat');
        const hourSun = document.getElementById('hour-sun');
        if (hourWeekday) hourWeekday.innerText = config.hours.weekday;
        if (hourSat) hourSat.innerText = config.hours.saturday;
        if (hourSun) hourSun.innerText = config.hours.sunday;

        // Aplicar promociones
        const promoTitle = document.getElementById('promo-title');
        const promoText = document.getElementById('promo-text');
        if (promoTitle) promoTitle.innerText = config.promo.title;
        if (promoText) promoText.innerHTML = config.promo.description;

        // Aplicar precios de membresías
        const priceBasico = document.getElementById('val-price-basico');
        const priceBlack = document.getElementById('val-price-black');
        const priceVip = document.getElementById('val-price-vip');
        if (priceBasico) priceBasico.innerText = `$${config.plans.basico.price}`;
        if (priceBlack) priceBlack.innerText = `$${config.plans.black.price}`;
        if (priceVip) priceVip.innerText = `$${config.plans.vip.price}`;
    };

    window.renderWebConfigTab = function() {
        const saved = JSON.parse(localStorage.getItem('alliance_gym_config')) || {};
        const config = {
            hours: { ...DEFAULT_CONFIG.hours, ...(saved.hours || {}) },
            promo: { ...DEFAULT_CONFIG.promo, ...(saved.promo || {}) },
            plans: { ...DEFAULT_CONFIG.plans, ...(saved.plans || {}) }
        };
        
        document.getElementById('cfg-price-basico').value = config.plans.basico.price;
        document.getElementById('cfg-price-black').value = config.plans.black.price;
        document.getElementById('cfg-price-vip').value = config.plans.vip.price;
        
        document.getElementById('cfg-hours-weekday').value = config.hours.weekday;
        document.getElementById('cfg-hours-sat').value = config.hours.saturday;
        document.getElementById('cfg-hours-sun').value = config.hours.sunday;
        
        document.getElementById('cfg-promo-title').value = config.promo.title;
        document.getElementById('cfg-promo-desc').value = config.promo.description;
    };

    // -------------------------------------------------------------
    // 1. EFECTOS VISUALES GENERALES DE LA WEB (Preservados)
    // -------------------------------------------------------------
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    const hamburger = document.getElementById('hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });

    // Filtrado de Maquinaria
    const filterBtns = document.querySelectorAll('.filter-btn');
    const equipmentItems = document.querySelectorAll('.equipment-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filterValue = btn.getAttribute('data-filter');

            equipmentItems.forEach(item => {
                if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                    item.style.display = 'block';
                    item.style.opacity = '0';
                    setTimeout(() => {
                        item.style.transition = 'opacity 0.4s ease';
                        item.style.opacity = '1';
                    }, 50);
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // Formulario de citas público (Simulación preservada)
    const publicAppForm = document.getElementById('appointment-form');
    const successMessage = document.getElementById('appointment-success');
    if (publicAppForm) {
        publicAppForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = publicAppForm.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
            btn.disabled = true;

            setTimeout(() => {
                publicAppForm.reset();
                btn.innerHTML = originalText;
                btn.disabled = false;
                successMessage.style.display = 'block';
                setTimeout(() => {
                    successMessage.style.display = 'none';
                }, 5000);
            }, 1500);
        });
    }

    // Inicializar Visor 360° (Pannellum)
    try {
        if (document.getElementById('panorama')) {
            pannellum.viewer('panorama', {
                "type": "equirectangular",
                "panorama": "https://upload.wikimedia.org/wikipedia/commons/e/e6/Equirectangular_projection_SW.jpg",
                "autoLoad": true,
                "autoRotate": -2,
                "compass": true
            });
            document.querySelector('.panorama-placeholder').style.display = 'none';
        }
    } catch (e) {
        console.error("Error al inicializar Pannellum", e);
        if (document.querySelector('.panorama-placeholder')) {
            document.querySelector('.panorama-placeholder').innerHTML = "No se pudo cargar el visor 360. Asegúrate de tener conexión a internet.";
        }
    }

    // Inicializar Slider de TikTok
    if (document.querySelector('.tiktok-swiper')) {
        new Swiper('.tiktok-swiper', {
            slidesPerView: 1,
            spaceBetween: 20,
            loop: true,
            pagination: { el: '.swiper-pagination', clickable: true },
            navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
            breakpoints: {
                576: { slidesPerView: 2, spaceBetween: 20 },
                768: { slidesPerView: 3, spaceBetween: 30 },
                992: { slidesPerView: 4, spaceBetween: 30 }
            }
        });
    }

    // Lógica de la Calculadora Nutricional (Preservada)
    const calcForm = document.getElementById('nutrition-form');
    if (calcForm) {
        calcForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const age = parseInt(document.getElementById('calc-age').value);
            const gender = document.getElementById('calc-gender').value;
            const weight = parseFloat(document.getElementById('calc-weight').value);
            const height = parseFloat(document.getElementById('calc-height').value);
            const activity = parseFloat(document.getElementById('calc-activity').value);
            const goal = document.getElementById('calc-goal').value;

            let bmr = gender === 'male' 
                ? (10 * weight) + (6.25 * height) - (5 * age) + 5
                : (10 * weight) + (6.25 * height) - (5 * age) - 161;

            let tdee = bmr * activity;
            let targetCalories = goal === 'lose' ? tdee - 500 : (goal === 'gain' ? tdee + 500 : tdee);
            targetCalories = Math.round(targetCalories);

            let proPct, carbPct, fatPct;
            if (goal === 'lose') { proPct = 35; carbPct = 35; fatPct = 30; }
            else if (goal === 'maintain') { proPct = 30; carbPct = 40; fatPct = 30; }
            else { proPct = 30; carbPct = 45; fatPct = 25; }

            const proGrams = Math.round((targetCalories * (proPct / 100)) / 4);
            const carbGrams = Math.round((targetCalories * (carbPct / 100)) / 4);
            const fatGrams = Math.round((targetCalories * (fatPct / 100)) / 9);

            document.getElementById('res-calories').innerText = targetCalories;
            document.getElementById('res-pro-pct').innerText = proPct + '%';
            document.getElementById('res-pro-g').innerText = proGrams;
            document.getElementById('bar-pro').style.width = proPct + '%';
            document.getElementById('res-carb-pct').innerText = carbPct + '%';
            document.getElementById('res-carb-g').innerText = carbGrams;
            document.getElementById('bar-carb').style.width = carbPct + '%';
            document.getElementById('res-fat-pct').innerText = fatPct + '%';
            document.getElementById('res-fat-g').innerText = fatGrams;
            document.getElementById('bar-fat').style.width = fatPct + '%';

            document.getElementById('meal-1').innerText = Math.round(targetCalories * 0.25);
            document.getElementById('meal-2').innerText = Math.round(targetCalories * 0.35);
            document.getElementById('meal-3').innerText = Math.round(targetCalories * 0.15);
            document.getElementById('meal-4').innerText = Math.round(targetCalories * 0.25);

            const resultsPanel = document.getElementById('calc-results');
            resultsPanel.style.display = 'block';
            
            if (window.innerWidth < 992) {
                setTimeout(() => {
                    resultsPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        });
    }

    // -------------------------------------------------------------
    // 2. INICIALIZACIÓN DEL SISTEMA DINÁMICO (SPA, Modales, Session)
    // -------------------------------------------------------------
    applySiteConfig();
    checkActiveSession();
    renderPublicReviews();

    // Eventos de Modales de Autenticación
    const authLoginForm = document.getElementById('auth-login-form');
    /* if (authLoginForm) {
        authLoginForm.addEventListener('submit', handleLogin);
    } */

    const authRegisterForm = document.getElementById('auth-register-form');
    /* if (authRegisterForm) {
        authRegisterForm.addEventListener('submit', handleRegister);
    } */

    // Configuración del Selector de Estrellas para Feedback
    const starButtons = document.querySelectorAll('#stars-selector .star-btn');
    starButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const val = parseInt(btn.getAttribute('data-value'));
            document.getElementById('feedback-rating-val').value = val;
            
            starButtons.forEach(star => {
                const starVal = parseInt(star.getAttribute('data-value'));
                if (starVal <= val) {
                    star.classList.remove('far');
                    star.classList.add('fas');
                } else {
                    star.classList.remove('fas');
                    star.classList.add('far');
                }
            });
        });
    });

    // Formulario de opiniones
    const feedbackForm = document.getElementById('feedback-form');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', handleFeedbackSubmit);
    }

    // Formulario de configuración de la web (Admin)
    const webConfigForm = document.getElementById('webconfig-form');
    if (webConfigForm) {
        webConfigForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const config = {
                hours: {
                    weekday: document.getElementById('cfg-hours-weekday').value,
                    saturday: document.getElementById('cfg-hours-sat').value,
                    sunday: document.getElementById('cfg-hours-sun').value
                },
                promo: {
                    title: document.getElementById('cfg-promo-title').value,
                    description: document.getElementById('cfg-promo-desc').value
                },
                plans: {
                    basico: { price: parseInt(document.getElementById('cfg-price-basico').value) },
                    black: { price: parseInt(document.getElementById('cfg-price-black').value) },
                    vip: { price: parseInt(document.getElementById('cfg-price-vip').value) }
                }
            };
            localStorage.setItem('alliance_gym_config', JSON.stringify(config));
            window.applySiteConfig();
            showToast('¡Modificaciones de la página guardadas con éxito!', 'success');
        });
    }

    // Formulario de sugerencias
    const suggestionForm = document.getElementById('suggestion-form');
    if (suggestionForm) {
        suggestionForm.addEventListener('submit', handleSuggestionSubmit);
    }

    // Bindeo del menú de pestañas (Tabs) en Dashboards
    bindDashboardTabs();

    // Formulario de citas interno (Cliente)
    const clientAppForm = document.getElementById('dash-appointment-form');
    /* if (clientAppForm) {
        clientAppForm.addEventListener('submit', handleClientAppointmentSubmit);
    } */

    // Formulario de Registro en Pasarela de Pago
    const checkoutRegisterForm = document.getElementById('checkout-register-form');
    if (checkoutRegisterForm) {
        checkoutRegisterForm.addEventListener('submit', handleCheckoutRegister);
    }

    // Formulario de Datos de Tarjeta en Pasarela de Pago
    const checkoutPayForm = document.getElementById('checkout-pay-form');
    if (checkoutPayForm) {
        checkoutPayForm.addEventListener('submit', handleCheckoutPayment);
    }

    // Formulario de Cita Post-Pago en Pasarela
    const checkoutBookingForm = document.getElementById('checkout-booking-form');
    if (checkoutBookingForm) {
        checkoutBookingForm.addEventListener('submit', handleCheckoutBookingSubmit);
    }

    // Formatear campos de tarjeta y refrescar vista previa interactiva
    setupCreditCardInputFormatting();
});

// -------------------------------------------------------------
// 3. FUNCIONES GLOBALES DE NAVEGACIÓN Y PORTALES
// -------------------------------------------------------------

// Función global para seleccionar coach desde las tarjetas
window.selectCoach = function(coachValue, coachName) {
    document.querySelectorAll('.coach-card').forEach(card => card.classList.remove('active'));
    event.currentTarget.classList.add('active');
    document.getElementById('selected-coach-name').innerText = coachValue.replace('.', '');
    
    const select = document.getElementById('coach-select');
    select.value = coachValue;
    document.querySelector('.appointment-form-container').scrollIntoView({ behavior: 'smooth', block: 'center' });
};

// Redireccionar al inicio de la web
window.goToHome = function() {
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    exitDashboard();
};

window.goToSection = function(sectionId) {
    exitDashboard();
    const el = document.getElementById(sectionId);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
    }
};

// Gestión de Modales de Autenticación
window.openAuthModal = function() {
    const currentUser = window.AllianceAuth.getCurrentUser();
    if (currentUser) {
        openDashboard(currentUser);
    } else {
        document.getElementById('auth-modal').style.display = 'flex';
        switchAuthTab('login');
    }
};

window.closeAuthModal = function() {
    document.getElementById('auth-modal').style.display = 'none';
};

window.switchAuthTab = function(tabName) {
    const btnLogin = document.getElementById('btn-tab-login');
    const btnRegister = document.getElementById('btn-tab-register');
    const formLogin = document.getElementById('auth-login-form');
    const formRegister = document.getElementById('auth-register-form');

    if (tabName === 'login') {
        if (btnLogin) btnLogin.classList.add('active');
        if (btnRegister) btnRegister.classList.remove('active');
        if (formLogin) formLogin.style.display = 'block';
        if (formRegister) formRegister.style.display = 'none';
    } else {
        if (btnLogin) btnLogin.classList.remove('active');
        if (btnRegister) btnRegister.classList.add('active');
        if (formLogin) formLogin.style.display = 'none';
        if (formRegister) formRegister.style.display = 'block';
    }
};

// Pasarela de Compra / Pago Seguro
let selectedPlanData = { name: '', price: 0 };

window.startPurchaseFlow = function(planName) {
    let baseMsg = '';
    
    if (planName === 'Plan Mensual') {
        baseMsg = `Hola, solicito información para inscribirme a Alliance GYM con la Mensualidad regular de $550 y cómo realizar el pago de inscripción.`;
    } else if (planName === 'Plan Semestral') {
        baseMsg = `Hola, solicito información para inscribirme a Alliance GYM con el Plan Semestral de $2600 y cómo realizar el pago.`;
    } else if (planName === 'Plan Anual') {
        baseMsg = `Hola, solicito información para inscribirme a Alliance GYM con la Anualidad de $5000 y cómo realizar el pago.`;
    } else if (planName === 'Promo Estudiante') {
        baseMsg = `Hola, me interesa la Promo Estudiantes con mensualidad de $380 en Alliance GYM. Cuento con mi credencial vigente, ¿cómo realizo mi pago?`;
    } else if (planName === 'Promo Día del Padre') {
        baseMsg = `Hola, quiero aprovechar la Promo Día del Padre en Alliance GYM con inscripción gratis. ¿Me podrían dar información de los costos por persona y cómo inscribirme?`;
    } else {
        baseMsg = `Hola, solicito información para inscribirme a Alliance GYM con el ${planName} y cómo realizar mi pago.`;
    }

    const encodedMsg = encodeURIComponent(baseMsg);
    const whatsappUrl = `https://wa.me/525567659004?text=${encodedMsg}`;
    window.open(whatsappUrl, '_blank');
};


window.closeCheckoutModal = function() {
    document.getElementById('checkout-modal').style.display = 'none';
};

function switchCheckoutStep(stepNumber) {
    document.querySelectorAll('.checkout-step-panel').forEach(panel => panel.style.display = 'none');
    document.querySelectorAll('.step-indicator').forEach(ind => ind.classList.remove('active'));

    document.getElementById(`checkout-step-${stepNumber}`).style.display = 'block';
    for (let i = 1; i <= stepNumber; i++) {
        const ind = document.getElementById(`step-ind-${i}`);
        if (ind) ind.classList.add('active');
    }
}

// -------------------------------------------------------------
// 4. CONTROLADORES DE ACCIONES Y ENVIOS
// -------------------------------------------------------------

// Iniciar sesión
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-password').value;

    const res = window.AllianceAuth.login(email, pass);
    if (res.success) {
        closeAuthModal();
        openDashboard(res.user);
        showToast(`Bienvenido de vuelta, ${res.user.name}`, 'success');
    } else {
        showToast(res.message, 'error');
    }
}

// Registrar nuevo usuario desde modal de login
function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const pass = document.getElementById('register-password').value;

    const res = window.AllianceAuth.register(name, email, pass);
    if (res.success) {
        // Loguear de inmediato
        window.AllianceAuth.login(email, pass);
        closeAuthModal();
        openDashboard(res.user);
        showToast('Cuenta creada con éxito. Elige tu membresía para comenzar.', 'success');
    } else {
        showToast(res.message, 'error');
    }
}

// Registro rápido en el checkout
function handleCheckoutRegister(e) {
    e.preventDefault();
    const name = document.getElementById('check-reg-name').value;
    const email = document.getElementById('check-reg-email').value;
    const pass = document.getElementById('check-reg-password').value;

    const res = window.AllianceAuth.register(name, email, pass);
    if (res.success) {
        window.AllianceAuth.login(email, pass);
        switchCheckoutStep(2);
    } else {
        showToast(res.message, 'error');
    }
}

// Simulación de Pago de membresía
function handleCheckoutPayment(e) {
    e.preventDefault();
    const btn = document.getElementById('btn-pay-submit');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Validando tarjeta y procesando cobro...';
    btn.disabled = true;

    const currentUser = window.AllianceAuth.getCurrentUser();
    
    // Simular retraso del banco
    setTimeout(() => {
        const cardName = document.getElementById('card-holder').value;
        const res = window.AllianceAuth.purchaseMembership(currentUser.id, selectedPlanData.name, selectedPlanData.price, { name: cardName });
        
        btn.innerHTML = originalText;
        btn.disabled = false;

        if (res.success) {
            // Ir al paso de agendar cita
            switchCheckoutStep(3);
            showToast('¡Pago aprobado! Membresía activada.', 'success');
        } else {
            showToast(res.message, 'error');
        }
    }, 2000);
}

// Agendar cita post-pago
function handleCheckoutBookingSubmit(e) {
    e.preventDefault();
    const coach = document.getElementById('checkout-coach').value;
    const date = document.getElementById('checkout-date').value;
    const time = document.getElementById('checkout-time').value;

    const currentUser = window.AllianceAuth.getCurrentUser();
    
    // Agregar cita al usuario en base de datos
    const users = window.AllianceAuth.getUsers();
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        const user = users[userIndex];
        const newApp = {
            id: 'app_' + Date.now(),
            date: date,
            time: time,
            type: 'Evaluación e Inducción Inicial',
            coach: coach,
            status: 'Programada'
        };
        if (!user.appointments) user.appointments = [];
        user.appointments.unshift(newApp);
        users[userIndex] = user;
        localStorage.setItem('alliance_gym_users', JSON.stringify(users));
    }

    // Configurar ticket final
    const latestUser = window.AllianceAuth.getCurrentUser();
    document.getElementById('ticket-plan-name').innerText = latestUser.membership.planName.toUpperCase();
    document.getElementById('ticket-user-name').innerText = latestUser.name;
    document.getElementById('ticket-user-code').innerText = latestUser.qrCode;
    document.getElementById('ticket-appointment-detail').innerText = `${date} a las ${time} hrs con ${coach}`;
    
    // Generar código QR real en canvas del ticket
    const ticketQrCanvas = document.getElementById('checkout-qrcode-canvas');
    ticketQrCanvas.innerHTML = '';
    try {
        new QRCode(ticketQrCanvas, {
            text: latestUser.qrCode,
            width: 120,
            height: 120,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    } catch (e) {
        ticketQrCanvas.innerHTML = `<div style="padding:10px; border:1px solid #000; font-weight:bold; font-size:0.8rem;">${latestUser.qrCode}</div>`;
    }

    switchCheckoutStep(4);
}

window.finishCheckoutFlow = function() {
    closeCheckoutModal();
    const user = window.AllianceAuth.getCurrentUser();
    openDashboard(user);
};

// Formulario de Cita dentro del panel de cliente
function handleClientAppointmentSubmit(e) {
    e.preventDefault();
    const type = document.getElementById('dash-app-type').value;
    const coach = document.getElementById('dash-app-coach').value;
    const date = document.getElementById('dash-app-date').value;
    const time = document.getElementById('dash-app-time').value;

    const currentUser = window.AllianceAuth.getCurrentUser();
    
    const users = window.AllianceAuth.getUsers();
    const userIndex = users.findIndex(u => u.id === currentUser.id);

    if (userIndex !== -1) {
        const user = users[userIndex];
        
        // Verificar restricciones de membresía: si está inactiva no puede agendar
        if (!user.membership || !user.membership.active) {
            showToast('Debes tener una membresía activa para agendar citas.', 'error');
            return;
        }

        const newApp = {
            id: 'app_' + Date.now(),
            date: date,
            time: time,
            type: type,
            coach: coach,
            status: 'Programada'
        };
        
        if (!user.appointments) user.appointments = [];
        user.appointments.unshift(newApp);
        
        users[userIndex] = user;
        localStorage.setItem('alliance_gym_users', JSON.stringify(users));

        document.getElementById('dash-appointment-form').reset();
        showToast('Cita programada con éxito.', 'success');
        
        // Refrescar paneles
        updateClientDashboardUI(user);
    }
}

// Envío de opiniones en el panel de cliente
function handleFeedbackSubmit(e) {
    e.preventDefault();
    const target = document.getElementById('feedback-target').value;
    const rating = document.getElementById('feedback-rating-val').value;
    const comment = document.getElementById('feedback-comment').value;

    const currentUser = window.AllianceAuth.getCurrentUser();
    const name = currentUser ? currentUser.name : 'Socio Anónimo';

    const res = window.AllianceReviews.addReview(name, rating, target, comment);
    if (res.success) {
        document.getElementById('feedback-form').reset();
        // Reset estrellas
        document.querySelectorAll('#stars-selector .star-btn').forEach(star => {
            star.classList.remove('fas');
            star.classList.add('far');
        });
        document.getElementById('feedback-rating-val').value = '5';
        
        if (res.pointsAwarded) {
            showToast('¡Muchas gracias por valorar! Se te han sumado +50 puntos.', 'success');
        } else {
            showToast('¡Muchas gracias por valorar! Tu opinión ha sido publicada (límite de 50 pts semanales ya alcanzado).', 'info');
        }
        
        // Actualizar UI
        renderPublicReviews();
        if (currentUser) {
            updateClientDashboardUI(window.AllianceAuth.getCurrentUser());
        }
    }
}

// Envío de quejas y sugerencias en buzón de cliente
function handleSuggestionSubmit(e) {
    e.preventDefault();
    const type = document.getElementById('sug-type').value;
    const identity = document.getElementById('sug-identity').value;
    const subject = document.getElementById('sug-subject').value;
    const message = document.getElementById('sug-message').value;

    const currentUser = window.AllianceAuth.getCurrentUser();
    const name = identity === 'public' ? (currentUser ? currentUser.name : 'Socio') : 'Anónimo';

    const res = window.AllianceReviews.submitSuggestion(name, type, subject, message);
    if (res.success) {
        document.getElementById('suggestion-form').reset();
        showToast('Tu mensaje ha sido depositado en el buzón administrativo.', 'success');
    }
}

// -------------------------------------------------------------
// 5. TRANSICIONES DEL CLIENTE Y PERSONAL (SPA)
// -------------------------------------------------------------

function checkActiveSession() {
    const user = window.AllianceAuth.getCurrentUser();
    const navBtn = document.getElementById('nav-portal-btn');
    const joinBtn = document.getElementById('nav-join-btn');

    if (user) {
        if (navBtn) navBtn.innerHTML = `<i class="fas fa-user-shield"></i> ${user.name.split(' ')[0]}`;
        if (joinBtn) joinBtn.style.display = 'none';
    } else {
        if (navBtn) navBtn.innerHTML = '<i class="fas fa-user-circle"></i> Mi Cuenta';
        if (joinBtn) joinBtn.style.display = 'inline-block';
    }
}

window.openDashboard = function(user) {
    document.getElementById('public-site').style.display = 'none';
    const navbarEl = document.getElementById('navbar');
    if (navbarEl) {
        navbarEl.style.display = 'none';
    }
    
    if (user.role === 'client') {
        document.getElementById('client-dashboard').style.display = 'flex';
        document.getElementById('staff-dashboard').style.display = 'none';
        updateClientDashboardUI(user);
        switchClientTab('client-summary');
    } else if (user.role === 'staff') {
        document.getElementById('client-dashboard').style.display = 'none';
        document.getElementById('staff-dashboard').style.display = 'flex';
        updateStaffDashboardUI(user);
        switchStaffTab('staff-checkin');
    }
};

window.exitDashboard = function() {
    closeDashboardDrawer();
    document.getElementById('public-site').style.display = 'block';
    document.getElementById('client-dashboard').style.display = 'none';
    document.getElementById('staff-dashboard').style.display = 'none';
    const navbarEl = document.getElementById('navbar');
    if (navbarEl) {
        navbarEl.style.display = '';
    }
    checkActiveSession();
};

window.logoutSession = async function() {
    localStorage.removeItem('alliance_temp_user');
    if (window.AllianceAuth && window.AllianceAuth.logout) {
        await window.AllianceAuth.logout();
    }
    window.location.reload();
};

// -------------------------------------------------------------
// 6. RENDERIZACIÓN DE TABS Y DATOS DINÁMICOS
// -------------------------------------------------------------

// Renders en el Home público
function renderPublicReviews() {
    const publicReviewsList = document.getElementById('public-reviews-list');
    if (!publicReviewsList) return;

    const reviews = window.AllianceReviews.getReviews('all');
    const averages = window.AllianceReviews.getAverageRatings();

    // Actualizar barras superiores
    document.getElementById('avg-gym-rating').innerText = averages.general;
    document.getElementById('avg-gym-val').innerText = averages.general;
    document.getElementById('avg-coaches-val').innerText = averages.coaches;
    document.getElementById('avg-staff-val').innerText = averages.recepcion;

    // Actualizar estrellas promedio generales
    const avgStars = document.getElementById('avg-gym-stars');
    avgStars.innerHTML = '';
    const fullStars = Math.floor(averages.general);
    const halfStar = averages.general % 1 >= 0.4;
    for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
            avgStars.innerHTML += '<i class="fas fa-star"></i>';
        } else if (i === fullStars + 1 && halfStar) {
            avgStars.innerHTML += '<i class="fas fa-star-half-alt"></i>';
        } else {
            avgStars.innerHTML += '<i class="far fa-star"></i>';
        }
    }

    // Listar las últimas 4 opiniones públicas
    publicReviewsList.innerHTML = '';
    const limitReviews = reviews.slice(0, 4);
    
    limitReviews.forEach(r => {
        let starsHTML = '';
        for (let i = 1; i <= 5; i++) {
            starsHTML += i <= r.rating ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>';
        }

        publicReviewsList.innerHTML += `
            <div class="review-card-item">
                <div class="rev-header">
                    <span class="rev-user">${r.userName}</span>
                    <span class="rev-stars">${starsHTML}</span>
                </div>
                <p class="rev-comment">"${r.comment}"</p>
                <div class="rev-meta">
                    <span>Destinatario: <strong>${r.target === 'general' ? 'Gimnasio' : r.target}</strong></span>
                    <span>${r.date}</span>
                </div>
            </div>
        `;
    });

    // Controlar el banner en opiniones para redirigir a Google Maps
    const loginPromo = document.getElementById('reviews-login-promo');
    if (loginPromo) {
        loginPromo.innerHTML = `<p class="mb-2 text-muted">¿Te gusta nuestro servicio? Ayúdanos dejando tu valoración en Google Maps.</p>
                                <a href="https://maps.google.com" target="_blank" class="btn btn-outline" style="text-decoration: none; color: inherit;">Dejar Reseña en Google Maps</a>`;
    }
}

// ----------------- TAB CONTROL CLIENTE -----------------
function bindDashboardTabs() {
    // Tabs de cliente
    const clientItems = document.querySelectorAll('#client-dashboard .menu-item');
    clientItems.forEach(item => {
        item.addEventListener('click', () => {
            clientItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            const tabName = item.getAttribute('data-tab');
            switchClientTab(tabName);
            closeDashboardDrawer();
        });
    });

    // Tabs de staff
    const staffItems = document.querySelectorAll('#staff-dashboard .menu-item');
    staffItems.forEach(item => {
        item.addEventListener('click', () => {
            staffItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            const tabName = item.getAttribute('data-tab');
            switchStaffTab(tabName);
            closeDashboardDrawer();
        });
    });
}

function switchClientTab(tabName) {
    document.querySelectorAll('#client-dashboard .dash-tab-section').forEach(sec => sec.style.display = 'none');
    
    const targetSec = document.getElementById(`tab-${tabName}`);
    if (targetSec) targetSec.style.display = 'block';

    // Sincronizar título superior
    const titleEl = document.getElementById('dash-title');
    if (tabName === 'client-summary') titleEl.innerText = 'Resumen de Cuenta';
    if (tabName === 'client-qr') titleEl.innerText = 'Mi Credencial QR de Acceso';
    if (tabName === 'client-appointments') titleEl.innerText = 'Mis Citas y Evaluaciones';
    if (tabName === 'client-points') titleEl.innerText = 'Club de Recompensas';
    if (tabName === 'client-payments') titleEl.innerText = 'Pagos y Facturas';
    if (tabName === 'client-feedback') titleEl.innerText = 'Valorar Servicio y Buzón';

    // Actualizar menú en caso de salto manual (por botón)
    const menuItems = document.querySelectorAll('#client-dashboard .menu-item');
    menuItems.forEach(item => {
        if (item.getAttribute('data-tab') === tabName) {
            menuItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        }
    });
}

function switchStaffTab(tabName) {
    document.querySelectorAll('#staff-dashboard .dash-tab-section').forEach(sec => sec.style.display = 'none');
    
    const targetSec = document.getElementById(`tab-${tabName}`);
    if (targetSec) targetSec.style.display = 'block';

    const titleEl = document.getElementById('dash-staff-title');
    if (tabName === 'staff-checkin') titleEl.innerText = 'Registro y Validación de Accesos';
    if (tabName === 'staff-opinions') titleEl.innerText = 'Buzón de Opiniones y Quejas';
    if (tabName === 'staff-appointments') titleEl.innerText = 'Control de Citas';
    if (tabName === 'staff-employees') titleEl.innerText = 'Organigrama y Roles';
    if (tabName === 'staff-webconfig') {
        titleEl.innerText = 'Modificaciones de la Página';
        window.renderWebConfigTab();
    }

    const menuItems = document.querySelectorAll('#staff-dashboard .menu-item');
    menuItems.forEach(item => {
        if (item.getAttribute('data-tab') === tabName) {
            menuItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        }
    });
}

// Actualizar datos del Cliente
function updateClientDashboardUI(user) {
    // Perfil en sidebar
    document.getElementById('dash-client-name').innerText = user.name;
    document.getElementById('dash-client-email').innerText = user.email;
    document.getElementById('header-points-val').innerText = user.points || 0;
    
    // Summary
    const statusBadge = document.getElementById('m-status-badge');
    const planTitle = document.getElementById('m-plan-title');
    const expiryText = document.getElementById('m-expiry-text');
    const expiryProgress = document.getElementById('m-expiry-progress');
    const daysLabel = document.getElementById('m-days-remaining-label');

    planTitle.innerText = user.membership.planName || 'Ninguno';
    document.getElementById('summary-points-val').innerText = user.points || 0;

    if (user.membership && user.membership.active) {
        statusBadge.innerText = 'ACTIVA';
        statusBadge.className = 'badge badge-active';
        
        expiryText.innerText = `Vence el: ${user.membership.endDate}`;

        // Calcular porcentaje de días restantes
        const start = new Date(user.membership.startDate).getTime();
        const end = new Date(user.membership.endDate).getTime();
        const now = new Date().getTime();

        const total = end - start;
        const remaining = end - now;
        let pct = Math.round((remaining / total) * 100);
        pct = Math.max(0, Math.min(100, pct)); // Acotar 0-100

        expiryProgress.style.width = pct + '%';

        const days = Math.max(0, Math.ceil(remaining / (1000 * 60 * 60 * 24)));
        daysLabel.innerText = `Quedan ${days} días`;
    } else {
        statusBadge.innerText = 'INACTIVA';
        statusBadge.className = 'badge badge-inactive';
        expiryText.innerText = 'Sin vencimiento';
        expiryProgress.style.width = '0%';
        daysLabel.innerText = 'Quedan 0 días';
        
        // Alerta
        if (user.membership.status === 'expired') {
            statusBadge.innerText = 'EXPIRADA';
            statusBadge.className = 'badge badge-expired';
            expiryText.innerText = `Venció el: ${user.membership.endDate}`;
        }
    }

    // Actualizar próx cita en resumen
    const nextAppBox = document.getElementById('summary-next-appointment-box');
    const activeApps = (user.appointments || []).filter(a => a.status === 'Programada');
    if (activeApps.length > 0) {
        const next = activeApps[0];
        nextAppBox.innerHTML = `
            <div class="alert-info-box" style="margin: 10px 0 0 0; border-color: var(--primary-color);">
                <i class="fas fa-calendar-check"></i>
                <div>
                    <strong>${next.type}</strong>
                    <p class="text-sm mt-1">Fecha: ${next.date} a las ${next.time} hrs</p>
                    <p class="text-sm">Coach: ${next.coach}</p>
                </div>
            </div>
            <button class="btn btn-outline w-100 mt-4 btn-sm" onclick="switchClientTab('client-appointments')">Gestionar Citas</button>
        `;
    } else {
        nextAppBox.innerHTML = `
            <p class="text-muted text-sm">No tienes ninguna cita agendada próximamente.</p>
            <button class="btn btn-primary mt-4 w-100 btn-sm" onclick="switchClientTab('client-appointments')">Agendar Cita</button>
        `;
    }

    // QR Credencial digital
    const passStatus = document.getElementById('pass-status-indicator');
    const passName = document.getElementById('pass-user-name');
    const passId = document.getElementById('pass-user-id');
    const passPlan = document.getElementById('pass-user-plan');
    const passExpiry = document.getElementById('pass-user-expiry');
    const manualCodeInput = document.getElementById('manual-qr-code-val');

    passName.innerText = user.name;
    passId.innerText = `ID: ${user.id.substring(0, 10).toUpperCase()}`;
    passPlan.innerText = user.membership.planName || 'Sin Membresía';
    
    if (user.membership.active) {
        passStatus.innerText = 'SOCIO ACTIVO';
        passStatus.className = 'pass-status-indicator';
        passExpiry.innerText = user.membership.endDate;
    } else {
        passStatus.innerText = user.membership.status === 'expired' ? 'MEMBRESÍA EXPIRADA' : 'INACTIVO';
        passStatus.className = 'pass-status-indicator badge-expired';
        passExpiry.innerText = user.membership.endDate || 'No Registra';
    }

    manualCodeInput.value = user.qrCode || 'SIN_CODIGO_QR_ACTIVO';

    // Dibujar QR
    const qrContainer = document.getElementById('qrcode-canvas');
    qrContainer.innerHTML = '';
    if (user.qrCode) {
        try {
            new QRCode(qrContainer, {
                text: user.qrCode,
                width: 140,
                height: 140,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
        } catch (e) {
            qrContainer.innerHTML = `<div style="padding: 20px; border: 2px dashed var(--primary-color); font-weight: bold; color: #000; font-size: 0.85rem;">${user.qrCode}</div>`;
        }
    } else {
        qrContainer.innerHTML = '<div style="color:red; font-size:0.8rem; padding: 20px;">Adquiere una membresía para habilitar tu código QR de acceso.</div>';
    }

    // Listar citas del cliente
    const appointmentsList = document.getElementById('client-appointments-list');
    appointmentsList.innerHTML = '';
    if (user.appointments && user.appointments.length > 0) {
        user.appointments.forEach(a => {
            let badgeClass = a.status === 'Programada' ? 'badge-inactive' : (a.status === 'Completada' ? 'badge-active' : 'badge-expired');
            appointmentsList.innerHTML += `
                <tr>
                    <td data-label="Fecha">${a.date}</td>
                    <td data-label="Hora">${a.time} hrs</td>
                    <td data-label="Tipo">${a.type}</td>
                    <td data-label="Coach">${a.coach}</td>
                    <td data-label="Estatus"><span class="badge ${badgeClass}">${a.status}</span></td>
                </tr>
            `;
        });
    } else {
        appointmentsList.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No tienes citas agendadas históricamente.</td></tr>';
    }

    // Tienda de recompensas
    const rewardsPoints = document.getElementById('rewards-points-val');
    rewardsPoints.innerText = user.points || 0;

    const catalog = window.AlliancePoints.getCatalog();
    const catalogList = document.getElementById('rewards-catalog-list');
    catalogList.innerHTML = '';
    
    catalog.forEach(item => {
        const canRedeem = (user.points || 0) >= item.points;
        const btnClass = canRedeem ? 'btn-primary' : 'btn-outline';
        const btnDisabled = canRedeem ? '' : 'disabled style="opacity: 0.5; cursor: not-allowed;"';
        
        catalogList.innerHTML += `
            <div class="reward-item-card glass-card">
                <div>
                    <div class="reward-img-holder" style="background-image: url('${item.image || 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=200'}');"></div>
                    <h4 class="reward-name">${item.name}</h4>
                    <span class="reward-points-cost"><i class="fas fa-gem"></i> ${item.points} pts</span>
                    <p class="reward-desc">${item.description}</p>
                </div>
                <button class="btn ${btnClass} btn-sm w-100" ${btnDisabled} onclick="redeemStoreItem('${item.id}', ${item.points})">Canjear Premio</button>
            </div>
        `;
    });

    // Historial puntos cliente
    const pointsHistory = document.getElementById('client-points-history');
    pointsHistory.innerHTML = '';
    if (user.pointsHistory && user.pointsHistory.length > 0) {
        user.pointsHistory.forEach(h => {
            const isPositive = h.points >= 0;
            const pointsClass = isPositive ? 'text-green' : 'text-danger';
            const prefix = isPositive ? '+' : '';
            pointsHistory.innerHTML += `
                <tr>
                    <td data-label="Fecha">${h.date}</td>
                    <td data-label="Puntos" class="${pointsClass}"><strong>${prefix}${h.points} pts</strong></td>
                    <td data-label="Descripción">${h.description}</td>
                </tr>
            `;
        });
    } else {
        pointsHistory.innerHTML = '<tr><td colspan="3" class="text-center text-muted">Aún no registras historial de puntos.</td></tr>';
    }

    // Historial canjes cliente
    const redeemedHistory = document.getElementById('client-redeemed-history');
    redeemedHistory.innerHTML = '';
    if (user.redeemedRewards && user.redeemedRewards.length > 0) {
        user.redeemedRewards.forEach(r => {
            let statusHTML = '';
            if (r.status === 'Pendiente') {
                statusHTML = `
                    <span class="badge" style="background: rgba(255, 122, 0, 0.2); border: 1px solid #ff7a00; color: #ff7a00;">Pendiente</span>
                    <button class="btn btn-outline btn-sm" onclick="showRewardQR('${r.code}', '${r.rewardName.replace(/'/g, "\\'")}', 'Pendiente')" style="padding: 2px 8px; font-size: 0.75rem; margin-left: 8px;">
                        <i class="fas fa-qrcode"></i> Ver QR
                    </button>
                `;
            } else {
                statusHTML = `<span class="badge badge-active">${r.status}</span>`;
            }

            redeemedHistory.innerHTML += `
                <tr>
                    <td data-label="Fecha">${r.date}</td>
                    <td data-label="Recompensa">${r.rewardName}</td>
                    <td data-label="Puntos" class="text-danger">-${r.points} pts</td>
                    <td data-label="Estado">${statusHTML}</td>
                </tr>
            `;
        });
    } else {
        redeemedHistory.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No has canjeado ningún premio todavía.</td></tr>';
    }

    // Historial pagos cliente
    const paymentsList = document.getElementById('client-payments-list');
    paymentsList.innerHTML = '';
    if (user.paymentHistory && user.paymentHistory.length > 0) {
        user.paymentHistory.forEach(p => {
            paymentsList.innerHTML += `
                <tr>
                    <td data-label="ID Transacción"><code>${p.id}</code></td>
                    <td data-label="Fecha">${p.date}</td>
                    <td data-label="Concepto">${p.description}</td>
                    <td data-label="Monto">$${p.amount} MXN</td>
                    <td data-label="Estatus"><span class="badge badge-active">${p.status}</span></td>
                    <td data-label="Acción"><button class="btn btn-outline btn-sm" onclick="mockDownloadInvoice('${p.id}', ${p.amount}, '${p.date}')"><i class="fas fa-file-pdf"></i> PDF</button></td>
                </tr>
            `;
        });
    } else {
        paymentsList.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Aún no registras pagos completados.</td></tr>';
    }
}

// Canjear recompensa en tienda
window.redeemStoreItem = function(rewardId, pointsCost) {
    const user = window.AllianceAuth.getCurrentUser();
    
    if (confirm(`¿Estás seguro de canjear este premio por ${pointsCost} puntos?`)) {
        const res = window.AlliancePoints.redeemReward(user.id, rewardId);
        if (res.success) {
            showToast(res.message, 'success');
            // Refrescar
            updateClientDashboardUI(window.AllianceAuth.getCurrentUser());

            // Abrir automáticamente el modal del código QR del premio recién canjeado
            const freshUser = window.AllianceAuth.getCurrentUser();
            const newReward = freshUser.redeemedRewards[0]; // El último canje está al inicio
            if (newReward && newReward.code) {
                showRewardQR(newReward.code, newReward.rewardName, newReward.status);
            }
        } else {
            showToast(res.message, 'error');
        }
    }
};

// Descarga simulación PDF de factura
window.mockDownloadInvoice = function(payId, amount, date) {
    const user = window.AllianceAuth.getCurrentUser();
    alert(`---------------------------------------------
        FACTURA DE COMPRA SIMULADA
---------------------------------------------
Gimnasio: ALLIANCE GYM Chimalhuacán
Folio Transacción: ${payId}
Fecha de Emisión: ${date}

Cliente: ${user.name}
Correo: ${user.email}

Detalle de Cobro:
Inscripción y Mensualidad Activa
Importe Pagado: $${amount}.00 MXN
Estatus de Operación: PAGADO (Autorizado en línea)
---------------------------------------------
¡Gracias por tu pago! Este es un comprobante digital.`);
};

// Copiar código alfanumérico al portapapeles
window.copyManualCode = function() {
    const copyText = document.getElementById("manual-qr-code-val");
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(copyText.value);
    showToast("Código copiado al portapapeles.", "success");
};

// Mostrar QR de recompensa canjeada
window.showRewardQR = function(code, rewardName, status) {
    document.getElementById('reward-modal-item-name').innerText = rewardName;
    document.getElementById('reward-modal-code').innerText = code;
    
    const statusBadge = document.getElementById('reward-modal-status-badge');
    statusBadge.innerText = status === 'Pendiente' ? 'Pendiente de Validar' : status;
    if (status === 'Pendiente') {
        statusBadge.style.background = 'rgba(255, 122, 0, 0.2)';
        statusBadge.style.borderColor = '#ff7a00';
        statusBadge.style.color = '#ff7a00';
    } else {
        statusBadge.style.background = 'rgba(46, 213, 115, 0.2)';
        statusBadge.style.borderColor = '#2ed573';
        statusBadge.style.color = '#2ed573';
    }

    const qrContainer = document.getElementById('reward-qrcode-canvas');
    qrContainer.innerHTML = '';
    try {
        new QRCode(qrContainer, {
            text: code,
            width: 140,
            height: 140,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    } catch (e) {
        qrContainer.innerHTML = `<div style="padding: 10px; border: 1px solid #000; font-weight: bold; font-size: 0.8rem;">${code}</div>`;
    }

    document.getElementById('reward-modal').style.display = 'flex';
};

window.closeRewardModal = function() {
    document.getElementById('reward-modal').style.display = 'none';
};

// ----------------- TAB CONTROL STAFF -----------------
async function updateStaffDashboardUI(staffUser) {
    document.getElementById('dash-staff-name').innerText = staffUser.name;
    document.getElementById('dash-staff-role').innerText = staffUser.staffRole;

    // Obtener los botones del menú
    const checkinMenu = document.querySelector('li[data-tab="staff-checkin"]');
    const opinionsMenu = document.querySelector('li[data-tab="staff-opinions"]');
    const appointmentsMenu = document.querySelector('li[data-tab="staff-appointments"]');
    const employeesMenu = document.querySelector('li[data-tab="staff-employees"]');
    const configMenuItem = document.getElementById('menu-item-webconfig');

    // Resetear visibilidad por defecto (todo visible para admin)
    if (checkinMenu) checkinMenu.style.display = 'block';
    if (opinionsMenu) opinionsMenu.style.display = 'block';
    if (appointmentsMenu) appointmentsMenu.style.display = 'block';
    if (employeesMenu) employeesMenu.style.display = 'block';
    if (configMenuItem) configMenuItem.style.display = 'block';

    const role = staffUser.roleCode || 'admin';

    if (role === 'coach') {
        // Coach solo ve citas
        if (checkinMenu) checkinMenu.style.display = 'none';
        if (opinionsMenu) opinionsMenu.style.display = 'none';
        if (employeesMenu) employeesMenu.style.display = 'none';
        if (configMenuItem) configMenuItem.style.display = 'none';
        
        // Forzar apertura de pestaña de citas si es coach
        switchStaffTab('staff-appointments');
    } else if (role === 'receptionist') {
        // Recepcionista ve validación y citas
        if (employeesMenu) employeesMenu.style.display = 'none';
        if (configMenuItem) configMenuItem.style.display = 'none';
        
        switchStaffTab('staff-checkin');
    } else {
        // Admin ve todo
        switchStaffTab('staff-checkin');
    }

    // Historial asistencias
    const logsList = document.getElementById('staff-checkin-logs-list');
    logsList.innerHTML = '';
    const logs = window.AllianceStaff.getCheckinLogs();
    
    logs.forEach(l => {
        const isPermitted = l.status.includes('Permitido');
        const badgeClass = isPermitted ? 'badge-active' : 'badge-expired';
        logsList.innerHTML += `
            <tr>
                <td data-label="Socio"><strong>${l.userName}</strong></td>
                <td data-label="Correo">${l.userEmail}</td>
                <td data-label="Fecha">${l.date}</td>
                <td data-label="Hora Entrada">${l.time}</td>
                <td data-label="Estatus Acceso"><span class="badge ${badgeClass}">${l.status}</span></td>
            </tr>
        `;
    });

    // Buzón opiniones y sugerencias
    const suggestionsList = document.getElementById('staff-suggestions-list');
    suggestionsList.innerHTML = '';
    const suggestions = window.AllianceReviews.getSuggestions();

    suggestions.forEach(s => {
        suggestionsList.innerHTML += `
            <tr>
                <td data-label="Fecha">${s.date}</td>
                <td data-label="Socio"><strong>${s.userName}</strong></td>
                <td data-label="Tipo">${s.type}</td>
                <td data-label="Asunto">${s.subject}</td>
                <td data-label="Mensaje"><span class="text-sm">"${s.message}"</span></td>
                <td data-label="Estado"><span class="badge ${s.status === 'Resuelto' ? 'badge-active' : 'badge-inactive'}">${s.status}</span></td>
                <td data-label="Acciones">
                    <select class="status-dropdown" onchange="changeTicketStatus('${s.id}', this.value)">
                        <option value="Recibido" ${s.status === 'Recibido' ? 'selected' : ''}>Recibido</option>
                        <option value="Leído" ${s.status === 'Leído' ? 'selected' : ''}>Leído</option>
                        <option value="En Proceso" ${s.status === 'En Proceso' ? 'selected' : ''}>En Proceso</option>
                        <option value="Resuelto" ${s.status === 'Resuelto' ? 'selected' : ''}>Resuelto</option>
                    </select>
                </td>
            </tr>
        `;
    });

    // Calificaciones de clientes a entrenadores
    const staffReviews = document.getElementById('staff-reviews-list');
    staffReviews.innerHTML = '';
    const reviews = window.AllianceReviews.getReviews('all');

    reviews.forEach(r => {
        let starsHTML = '';
        for (let i = 1; i <= 5; i++) {
            starsHTML += i <= r.rating ? '<i class="fas fa-star" style="color:#ffd700;"></i>' : '<i class="far fa-star" style="color:#ffd700;"></i>';
        }
        staffReviews.innerHTML += `
            <div class="staff-review-item">
                <div class="d-flex justify-content-between" style="display:flex; justify-content:space-between; margin-bottom:5px;">
                    <strong>${r.userName}</strong>
                    <span>${starsHTML}</span>
                </div>
                <p class="text-sm text-muted">Evalúa a: <strong>${r.target === 'general' ? 'Gimnasio' : r.target}</strong></p>
                <p class="text-sm mt-1" style="font-style:italic;">"${r.comment}"</p>
            </div>
        `;
    });

// Control de citas del personal
    const staffAppsList = document.getElementById('staff-appointments-list');
    staffAppsList.innerHTML = '';
    const apps = await window.AllianceStaff.getAllAppointments();

    if (apps.length > 0) {
        apps.forEach(a => {
            const isScheduled = a.status === 'Pendiente' || a.status === 'Programada';
            const badgeClass = (a.status === 'Pendiente' || a.status === 'Programada') ? 'badge-inactive' : (a.status === 'Completada' ? 'badge-active' : 'badge-expired');
            
            let actionsHTML = '';
            if (isScheduled) {
                actionsHTML = `
                    <button class="btn btn-primary btn-sm" onclick="changeAppointmentState('${a.userId}', '${a.id}', 'Completada')" style="padding:4px 8px; font-size:0.75rem;">Completar</button>
                    <button class="btn btn-outline btn-sm" onclick="changeAppointmentState('${a.userId}', '${a.id}', 'Cancelada')" style="padding:4px 8px; font-size:0.75rem;">Cancelar</button>
                `;
            } else {
                actionsHTML = '<span class="text-muted text-sm">Sin acciones</span>';
            }

            staffAppsList.innerHTML += `
                <tr>
                    <td data-label="Fecha">${a.date}</td>
                    <td data-label="Hora">${a.time} hrs</td>
                    <td data-label="Socio"><strong>${a.userName}</strong></td>
                    <td data-label="Correo">${a.userEmail}</td>
                    <td data-label="Tipo de Cita">${a.type}</td>
                    <td data-label="Coach Asignado">${a.coach}</td>
                    <td data-label="Estatus"><span class="badge ${badgeClass}">${a.status}</span></td>
                    <td data-label="Acciones">${actionsHTML}</td>
                </tr>
            `;
        });
    } else {
        staffAppsList.innerHTML = '<tr><td colspan="8" class="text-center text-muted">No se registran citas solicitadas en sistema.</td></tr>';
    }

    // Organigrama de empleados
    const employeesList = document.getElementById('staff-employees-list');
    employeesList.innerHTML = '';
    const employees = window.AllianceStaff.getEmployees();

    employees.forEach(e => {
        let permissionsHTML = '';
        e.permissions.forEach(p => {
            permissionsHTML += `<span class="badge badge-inactive" style="margin-right:5px; margin-bottom:5px; background:rgba(0,188,212,0.1); border-color:rgba(0,188,212,0.3); color:#00bcd4;">${p}</span>`;
        });

        employeesList.innerHTML += `
            <tr>
                <td data-label="Nombre del Empleado"><strong>${e.name}</strong></td>
                <td data-label="Puesto / Rol">${e.role}</td>
                <td data-label="Correo Institucional"><code>${e.email}</code></td>
                <td data-label="Permisos en Sistema">${permissionsHTML}</td>
                <td data-label="Estatus"><span class="badge badge-active">Activo</span></td>
            </tr>
        `;
    });
}

// Recepcionista valida QR
window.handleQRValidation = async function() {
    const inputVal = document.getElementById('staff-qr-input').value;
    const resultBox = document.getElementById('scanner-result');

    if (!inputVal.trim()) {
        showToast('Ingresa un correo o código QR para validar.', 'error');
        return;
    }

    const res = await window.AllianceStaff.validateQR(inputVal);
    resultBox.style.display = 'block';
    
    if (res.success) {
        if (res.isReward) {
            resultBox.className = 'scanner-result-box result-success';
            resultBox.innerHTML = `
                <div class="result-layout" style="border-left: 5px solid #ffd700; padding-left: 15px;">
                    <div class="result-icon-big" style="color: #ffd700;"><i class="fas fa-gift"></i></div>
                    <h3 style="color: #ffd700;">RECOMPENSA VALIDADA</h3>
                    <h4 class="mt-2">${res.user.name}</h4>
                    <p class="text-sm mt-1">Premio: <strong>${res.rewardName}</strong></p>
                    <p class="text-sm">Código: <code>${res.code}</code></p>
                    <p class="text-sm text-green mt-3" style="font-weight: bold; font-size: 0.95rem; background: rgba(46, 213, 115, 0.1); padding: 8px; border-radius: 4px; border: 1px solid rgba(46, 213, 115, 0.2);">
                        <i class="fas fa-info-circle"></i> Acción: ${res.benefitMessage}
                    </p>
                </div>
            `;
            document.getElementById('staff-qr-input').value = '';
            showToast('Recompensa validada con éxito.', 'success');
        } else {
            resultBox.className = 'scanner-result-box result-success';
            resultBox.innerHTML = `
                <div class="result-layout">
                    <div class="result-icon-big"><i class="fas fa-check-circle"></i></div>
                    <h3>ACCESO PERMITIDO</h3>
                    <h4 class="mt-2">${res.user.name}</h4>
                    <p class="text-sm mt-1">Membresía activa: <strong>${res.user.membership.planName}</strong></p>
                    <p class="text-sm text-green">Vence el: ${res.user.membership.endDate}</p>
                    <p class="text-sm mt-2">Asistencia registrada. Se le sumaron +50 puntos.</p>
                </div>
            `;
            document.getElementById('staff-qr-input').value = '';
            showToast('Acceso validado con éxito.', 'success');
        }
    } else {
        resultBox.className = 'scanner-result-box result-danger';
        resultBox.innerHTML = `
            <div class="result-layout">
                <div class="result-icon-big"><i class="fas fa-times-circle"></i></div>
                <h3>ACCESO DENEGADO</h3>
                <p class="text-sm mt-2">${res.message}</p>
            </div>
        `;
        showToast('Acceso denegado.', 'error');
    }

    // Recargar tabla de accesos
    updateStaffDashboardUI(window.AllianceAuth.getCurrentUser());
};

// Cambiar estatus de buzón
window.changeTicketStatus = function(ticketId, newStatus) {
    const res = window.AllianceReviews.updateSuggestionStatus(ticketId, newStatus);
    if (res.success) {
        showToast('Estado de buzón actualizado.', 'success');
        updateStaffDashboardUI(window.AllianceAuth.getCurrentUser());
    } else {
        showToast(res.message, 'error');
    }
};

// Cambiar estatus de cita
window.changeAppointmentState = async function(userId, appointmentId, newState) {
    const res = await window.AllianceStaff.updateAppointmentStatus(userId, appointmentId, newState);
    if (res.success) {
        showToast(`Cita marcada como: ${newState}.`, 'success');
        updateStaffDashboardUI({name: document.getElementById('dash-staff-name').innerText, staffRole: document.getElementById('dash-staff-role').innerText});
    } else {
        showToast(res.message, 'error');
    }
};

// -------------------------------------------------------------
// 7. UTILERÍAS COMPLEMENTARIAS
// -------------------------------------------------------------

// Refrescar pasarela con inputs interactivos de tarjeta
function setupCreditCardInputFormatting() {
    const cardNumInput = document.getElementById('card-number');
    const cardNameInput = document.getElementById('card-holder');
    const cardExpiryInput = document.getElementById('card-expiry');

    if (!cardNumInput) return;

    // Autogap número tarjeta
    cardNumInput.addEventListener('input', (e) => {
        let val = cardNumInput.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        let formatted = '';
        for (let i = 0; i < val.length; i++) {
            if (i > 0 && i % 4 === 0) formatted += ' ';
            formatted += val[i];
        }
        cardNumInput.value = formatted;
        document.getElementById('preview-card-number').innerText = formatted || '•••• •••• •••• ••••';
    });

    // Titular
    cardNameInput.addEventListener('input', (e) => {
        const val = cardNameInput.value.toUpperCase();
        document.getElementById('preview-card-holder').innerText = val || 'NOMBRE DEL TITULAR';
    });

    // Vencimiento MM/AA con autogap slash
    cardExpiryInput.addEventListener('input', (e) => {
        let val = cardExpiryInput.value.replace(/[^0-9]/g, '');
        if (val.length >= 2) {
            val = val.substring(0, 2) + '/' + val.substring(2, 4);
        }
        cardExpiryInput.value = val;
        document.getElementById('preview-card-expiry').innerText = val || 'MM/AA';
    });
}

// Clean Toast alerts
function showToast(message, type = 'success') {
    const existing = document.querySelector('.toast-box');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast-box toast-${type}`;
    
    // Icon
    let icon = '<i class="fas fa-check-circle"></i>';
    if (type === 'error') icon = '<i class="fas fa-exclamation-circle"></i>';
    if (type === 'info') icon = '<i class="fas fa-info-circle"></i>';

    toast.innerHTML = `${icon} <span>${message}</span>`;
    
    // Style inline toast
    toast.style.position = 'fixed';
    toast.style.bottom = '30px';
    toast.style.right = '30px';
    toast.style.padding = '15px 25px';
    toast.style.borderRadius = '8px';
    toast.style.color = '#fff';
    toast.style.zIndex = '3000';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.gap = '10px';
    toast.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
    toast.style.animation = 'toastSlideIn 0.3s ease-out';
    toast.style.fontFamily = 'var(--font-body)';
    toast.style.fontSize = '0.9rem';

    if (type === 'success') toast.style.background = '#2ed573';
    else if (type === 'error') toast.style.background = '#ff4757';
    else toast.style.background = '#ff7a00';

    // Animation frames key
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
        @keyframes toastSlideIn {
            from { transform: translateY(50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
    `;
    document.head.appendChild(styleSheet);

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.transition = 'opacity 0.4s ease';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 400);
    }, 4000);
}

// Exponer funciones globales de pestañas
window.switchClientTab = switchClientTab;
window.switchStaffTab = switchStaffTab;

// Función global para filtrar maquinaria desde la galería de zonas corporales
window.filterEquipmentFromOutside = function(filterValue) {
    const targetBtn = document.querySelector(`.filter-btn[data-filter="${filterValue}"]`);
    if (targetBtn) {
        targetBtn.click();
    } else {
        // Fallback si no encuentra el botón por alguna razón
        const filterBtns = document.querySelectorAll('.filter-btn');
        const equipmentItems = document.querySelectorAll('.equipment-item');
        
        filterBtns.forEach(b => {
            if (b.getAttribute('data-filter') === filterValue) {
                b.classList.add('active');
            } else {
                b.classList.remove('active');
            }
        });
        
        equipmentItems.forEach(item => {
            if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                item.style.display = 'block';
                item.style.opacity = '1';
            } else {
                item.style.display = 'none';
            }
        });
    }
};

// Funciones globales de Drawer en Dashboard para móviles
window.toggleDashboardDrawer = function() {
    const isClientVisible = document.getElementById('client-dashboard').style.display === 'flex';
    const isStaffVisible = document.getElementById('staff-dashboard').style.display === 'flex';
    
    let activeSidebar = null;
    if (isClientVisible) {
        activeSidebar = document.querySelector('#client-dashboard .dashboard-sidebar');
    } else if (isStaffVisible) {
        activeSidebar = document.querySelector('#staff-dashboard .dashboard-sidebar');
    }
    
    if (activeSidebar) {
        activeSidebar.classList.toggle('drawer-open');
        const overlay = document.getElementById('dash-drawer-overlay');
        if (overlay) {
            overlay.classList.toggle('active');
        }
    }
};

window.closeDashboardDrawer = function() {
    const sidebars = document.querySelectorAll('.dashboard-sidebar');
    sidebars.forEach(s => s.classList.remove('drawer-open'));
    const overlay = document.getElementById('dash-drawer-overlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
};

