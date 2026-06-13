/**
 * Alliance GYM - Módulo de Puntos y Recompensas (Loyalty System)
 * Controla el catálogo de premios, el historial de puntos y el canje.
 */

(function () {
    // Catálogo de recompensas
    const REWARDS_CATALOG = [
        { id: 'reward_shaker', name: 'Shaker Alliance Premium', points: 500, description: 'Cilindro mezclador de alta calidad con logo Alliance.', category: 'product', image: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=200' },
        { id: 'reward_playera', name: 'Playera Oficial Alliance', points: 1000, description: 'Playera deportiva dry-fit oficial dry-fit.', category: 'product', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=200' },
        { id: 'reward_desc_20', name: '20% Descuento Mensualidad', points: 1500, description: 'Aplica 20% de descuento en tu siguiente pago.', category: 'discount', value: 0.20 },
        { id: 'reward_half_month', name: 'Media Mensualidad Gratis', points: 3000, description: 'Ahorra el 50% de tu siguiente pago mensual.', category: 'discount', value: 0.50 },
        { id: 'reward_full_month', name: 'Mensualidad Completa Gratis', points: 5000, description: 'Un mes completo gratis en cualquiera de tus planes.', category: 'membership', value: 30 },
        { id: 'reward_year', name: 'Anualidad Completa Gratis', points: 45000, description: '¡Un año de gimnasio 100% patrocinado!', category: 'membership', value: 365 }
    ];

    // Obtener catálogo
    function getCatalog() {
        return REWARDS_CATALOG;
    }

    // Agregar puntos por una actividad específica
    function addPoints(userId, pointsAmount, description) {
        const users = window.AllianceAuth.getUsers();
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex === -1) return { success: false, message: 'Usuario no encontrado.' };

        const user = users[userIndex];
        user.points = (user.points || 0) + pointsAmount;

        if (!user.pointsHistory) user.pointsHistory = [];
        user.pointsHistory.unshift({
            date: new Date().toISOString().split('T')[0],
            points: pointsAmount,
            description: description
        });

        users[userIndex] = user;
        window.AllianceAuth.getUsers(); // Sincroniza
        localStorage.setItem('alliance_gym_users', JSON.stringify(users));

        return { success: true, points: user.points, history: user.pointsHistory };
    }

    // Canjear un premio
    function redeemReward(userId, rewardId) {
        const users = window.AllianceAuth.getUsers();
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex === -1) return { success: false, message: 'Usuario no encontrado.' };

        const user = users[userIndex];
        const reward = REWARDS_CATALOG.find(r => r.id === rewardId);

        if (!reward) return { success: false, message: 'Recompensa no válida.' };

        if ((user.points || 0) < reward.points) {
            return { success: false, message: 'Puntos insuficientes para canjear este premio.' };
        }

        // Descontar puntos
        user.points -= reward.points;

        // Registrar en historial de puntos (número negativo)
        if (!user.pointsHistory) user.pointsHistory = [];
        user.pointsHistory.unshift({
            date: new Date().toISOString().split('T')[0],
            points: -reward.points,
            description: `Canje de recompensa: ${reward.name}`
        });

        // Generar un código alfanumérico único para el canje
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let randomCode = '';
        for (let i = 0; i < 6; i++) {
            randomCode += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        const fullCode = `ALLIANCE-RW-${randomCode}`;

        // Registrar canje en un listado interno
        if (!user.redeemedRewards) user.redeemedRewards = [];
        user.redeemedRewards.unshift({
            id: 'red_' + Date.now(),
            date: new Date().toISOString().split('T')[0],
            rewardId: reward.id,
            rewardName: reward.name,
            points: reward.points,
            category: reward.category,
            value: reward.value || null,
            code: fullCode,
            status: 'Pendiente'
        });

        // Guardar cambios
        users[userIndex] = user;
        localStorage.setItem('alliance_gym_users', JSON.stringify(users));

        // Actualizar sesión activa
        const currentUser = window.AllianceAuth.getCurrentUser();
        if (currentUser && currentUser.id === userId) {
            localStorage.setItem('alliance_gym_current_user', JSON.stringify(user));
        }

        return { success: true, message: `¡Canje exitoso! Presenta tu código QR o alfanumérico en recepción para reclamarlo: ${reward.name}`, user: user, code: fullCode };
    }

    // Exponer API global de puntos
    window.AlliancePoints = {
        getCatalog,
        addPoints,
        redeemReward
    };
})();
