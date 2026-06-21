/**
 * Alliance GYM - Módulo de Opiniones, Reseñas y Buzón
 * Administra las valoraciones del personal y las sugerencias o quejas de los usuarios.
 */

(function () {
    const STORAGE_REVIEWS_KEY = 'alliance_gym_reviews';
    const STORAGE_SUGGESTIONS_KEY = 'alliance_gym_suggestions';

    // Opiniones semilla iniciales (Simulando reseñas de Google Maps)
    const seedReviews = [
        { id: 'rev_1', userName: 'Miguel Ángel', rating: 5, target: 'general', comment: 'Las mejores instalaciones de la zona. Excelente equipo y el ambiente es muy motivador. ¡Totalmente recomendado!', date: '2026-06-05' },
        { id: 'rev_2', userName: 'Sofía Ruiz', rating: 5, target: 'general', comment: 'Llevo 3 meses entrenando aquí y los coaches siempre están atentos para ayudarte con tus rutinas.', date: '2026-06-08' },
        { id: 'rev_3', userName: 'David León', rating: 4, target: 'general', comment: 'Muy buen gimnasio, buenas máquinas y limpieza. Se llena un poco por las tardes pero es normal.', date: '2026-06-11' },
        { id: 'rev_4', userName: 'Laura G.', rating: 5, target: 'general', comment: 'Me encanta que tienen visor 360 en su web, fui a conocerlo y es tal cual. 5 estrellas a la atención en recepción.', date: '2026-06-12' }
    ];

    // Buzón semilla inicial
    const seedSuggestions = [
        { id: 'sug_1', userName: 'Miguel Ángel', type: 'Sugerencia', subject: 'Más discos de 45 lbs', message: 'Sería genial si pudieran añadir un par de discos más de 45 lbs en la zona de peso libre.', date: '2026-06-06', status: 'Leído' },
        { id: 'sug_2', userName: 'Anónimo', type: 'Queja', subject: 'Temperatura de duchas', message: 'A veces el agua sale templada en lugar de caliente en la mañana.', date: '2026-06-09', status: 'En Proceso' }
    ];

    function initReviews() {
        if (!localStorage.getItem(STORAGE_REVIEWS_KEY)) {
            localStorage.setItem(STORAGE_REVIEWS_KEY, JSON.stringify(seedReviews));
        }
        if (!localStorage.getItem(STORAGE_SUGGESTIONS_KEY)) {
            localStorage.setItem(STORAGE_SUGGESTIONS_KEY, JSON.stringify(seedSuggestions));
        }
    }

    // Obtener opiniones
    function getReviews(target = 'all') {
        initReviews();
        const reviews = JSON.parse(localStorage.getItem(STORAGE_REVIEWS_KEY));
        if (target === 'all') return reviews;
        if (target === 'general') return reviews.filter(r => r.target === 'general');
        return reviews.filter(r => r.target.toLowerCase() === target.toLowerCase());
    }

    // Añadir una nueva opinión
    function addReview(userName, rating, target, comment) {
        initReviews();
        const reviews = JSON.parse(localStorage.getItem(STORAGE_REVIEWS_KEY));
        const newReview = {
            id: 'rev_' + Date.now(),
            userName: userName || 'Socio Anónimo',
            rating: parseInt(rating),
            target: target || 'general',
            comment: comment,
            date: new Date().toISOString().split('T')[0]
        };
        reviews.unshift(newReview);
        localStorage.setItem(STORAGE_REVIEWS_KEY, JSON.stringify(reviews));

        // Premiar al usuario por dejar una opinión (50 puntos, máx 1 vez por semana)
        const currentUser = window.AllianceAuth.getCurrentUser();
        let pointsAwarded = false;
        if (currentUser) {
            const todayStr = new Date().toISOString().split('T')[0];
            const todayMs = new Date(todayStr + 'T00:00:00').getTime();
            const last7DaysLimit = 7 * 24 * 60 * 60 * 1000; // 7 días en milisegundos
            
            const hasRecentReviewPoints = (currentUser.pointsHistory || []).some(h => {
                if (h.description && h.description.includes('Opinión')) {
                    const historyDate = new Date(h.date + 'T00:00:00').getTime();
                    return (todayMs - historyDate) < last7DaysLimit;
                }
                return false;
            });

            if (!hasRecentReviewPoints) {
                window.AlliancePoints.addPoints(currentUser.id, 50, `Opinión sobre: ${target}`);
                pointsAwarded = true;
            }
        }

        return { success: true, review: newReview, pointsAwarded: pointsAwarded };
    }

    // Obtener sugerencias y quejas (para Staff)
    function getSuggestions() {
        initReviews();
        return JSON.parse(localStorage.getItem(STORAGE_SUGGESTIONS_KEY));
    }

    // Enviar una sugerencia/queja
    function submitSuggestion(userName, type, subject, message) {
        initReviews();
        const suggestions = JSON.parse(localStorage.getItem(STORAGE_SUGGESTIONS_KEY));
        const newSug = {
            id: 'sug_' + Date.now(),
            userName: userName || 'Anónimo',
            type: type, // 'Sugerencia', 'Queja', 'Felicitación'
            subject: subject,
            message: message,
            date: new Date().toISOString().split('T')[0],
            status: 'Recibido'
        };
        suggestions.unshift(newSug);
        localStorage.setItem(STORAGE_SUGGESTIONS_KEY, JSON.stringify(suggestions));
        return { success: true, suggestion: newSug };
    }

    // Actualizar estatus de sugerencia (Leído, En Proceso, Resuelto)
    function updateSuggestionStatus(id, newStatus) {
        const suggestions = getSuggestions();
        const index = suggestions.findIndex(s => s.id === id);
        if (index !== -1) {
            suggestions[index].status = newStatus;
            localStorage.setItem(STORAGE_SUGGESTIONS_KEY, JSON.stringify(suggestions));
            return { success: true };
        }
        return { success: false, message: 'No se encontró la sugerencia.' };
    }

    // Calcular promedios de calificaciones
    function getAverageRatings() {
        const reviews = getReviews('all');
        const averages = {
            general: 5.0,
            recepcion: 4.8,
            coaches: 4.9,
            totalCount: reviews.length
        };

        if (reviews.length === 0) return averages;

        // Calcular promedio general del gym
        const generalReviews = reviews.filter(r => r.target === 'general');
        if (generalReviews.length > 0) {
            const sum = generalReviews.reduce((acc, r) => acc + r.rating, 0);
            averages.general = parseFloat((sum / generalReviews.length).toFixed(1));
        }

        // Calcular promedio de personal/coaches
        const staffReviews = reviews.filter(r => r.target.includes('Recepcionista') || r.target.includes('Staff'));
        if (staffReviews.length > 0) {
            const sum = staffReviews.reduce((acc, r) => acc + r.rating, 0);
            averages.recepcion = parseFloat((sum / staffReviews.length).toFixed(1));
        }

        const coachReviews = reviews.filter(r => r.target !== 'general' && !r.target.includes('Recepcionista') && !r.target.includes('Staff'));
        if (coachReviews.length > 0) {
            const sum = coachReviews.reduce((acc, r) => acc + r.rating, 0);
            averages.coaches = parseFloat((sum / coachReviews.length).toFixed(1));
        }

        return averages;
    }

    // Exponer API global de reseñas
    window.AllianceReviews = {
        getReviews,
        addReview,
        getSuggestions,
        submitSuggestion,
        updateSuggestionStatus,
        getAverageRatings,
        initReviews
    };

    initReviews();
})();
