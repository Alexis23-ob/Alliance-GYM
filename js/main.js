document.addEventListener('DOMContentLoaded', () => {
    
    // Navbar Scroll Effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile Menu Toggle
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // Close mobile menu on link click
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });

    // Equipment Filtering
    const filterBtns = document.querySelectorAll('.filter-btn');
    const equipmentItems = document.querySelectorAll('.equipment-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            equipmentItems.forEach(item => {
                if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                    item.style.display = 'block';
                    // Pequeña animación
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

    // Appointment Form Simulation
    const form = document.getElementById('appointment-form');
    const successMessage = document.getElementById('appointment-success');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Simular envío
        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
        btn.disabled = true;

        setTimeout(() => {
            form.reset();
            btn.innerHTML = originalText;
            btn.disabled = false;
            successMessage.style.display = 'block';

            // Ocultar mensaje después de 5 segundos
            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 5000);
        }, 1500);
    });

    // Inicializar Visor 360° (Pannellum)
    // Utilizamos una imagen equirectangular de prueba gratuita de Wikimedia Commons
    try {
        pannellum.viewer('panorama', {
            "type": "equirectangular",
            "panorama": "https://upload.wikimedia.org/wikipedia/commons/e/e6/Equirectangular_projection_SW.jpg", // Imagen temporal 360
            "autoLoad": true,
            "autoRotate": -2, // Rotación automática lenta
            "compass": true
        });
        // Ocultar el placeholder si carga exitosamente
        document.querySelector('.panorama-placeholder').style.display = 'none';
    } catch (e) {
        console.error("Error al inicializar Pannellum", e);
        document.querySelector('.panorama-placeholder').innerHTML = "No se pudo cargar el visor 360. Asegúrate de tener conexión a internet.";
    }
});

// Función global para seleccionar coach desde las tarjetas
window.selectCoach = function(coachValue, coachName) {
    // Marcar tarjeta activa
    document.querySelectorAll('.coach-card').forEach(card => card.classList.remove('active'));
    event.currentTarget.classList.add('active');

    // Actualizar nombre en el título del formulario
    document.getElementById('selected-coach-name').innerText = coachValue.replace('.', '');
    
    // Seleccionar opción en el select
    const select = document.getElementById('coach-select');
    select.value = coachValue;

    // Hacer scroll al formulario
    document.querySelector('.appointment-form-container').scrollIntoView({ behavior: 'smooth', block: 'center' });
};

// Lógica de la Calculadora Nutricional
document.addEventListener('DOMContentLoaded', () => {
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

            // Ecuación de Mifflin-St Jeor
            let bmr;
            if (gender === 'male') {
                bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
            } else {
                bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
            }

            let tdee = bmr * activity;
            let targetCalories = tdee;

            if (goal === 'lose') {
                targetCalories -= 500;
            } else if (goal === 'gain') {
                targetCalories += 500;
            }

            targetCalories = Math.round(targetCalories);

            // Distribución de Macros
            let proPct, carbPct, fatPct;
            if (goal === 'lose') {
                proPct = 35; carbPct = 35; fatPct = 30;
            } else if (goal === 'maintain') {
                proPct = 30; carbPct = 40; fatPct = 30;
            } else { // gain
                proPct = 30; carbPct = 45; fatPct = 25;
            }

            const proGrams = Math.round((targetCalories * (proPct / 100)) / 4);
            const carbGrams = Math.round((targetCalories * (carbPct / 100)) / 4);
            const fatGrams = Math.round((targetCalories * (fatPct / 100)) / 9);

            // Distribución de Comidas
            const breakfastCal = Math.round(targetCalories * 0.25);
            const lunchCal = Math.round(targetCalories * 0.35);
            const snackCal = Math.round(targetCalories * 0.15);
            const dinnerCal = Math.round(targetCalories * 0.25);

            // Actualizar UI
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

            document.getElementById('meal-1').innerText = breakfastCal;
            document.getElementById('meal-2').innerText = lunchCal;
            document.getElementById('meal-3').innerText = snackCal;
            document.getElementById('meal-4').innerText = dinnerCal;

            // Mostrar panel de resultados
            const resultsPanel = document.getElementById('calc-results');
            resultsPanel.style.display = 'block';
            
            // Hacer scroll a resultados en móviles
            if (window.innerWidth < 992) {
                setTimeout(() => {
                    resultsPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        });
    }
});
