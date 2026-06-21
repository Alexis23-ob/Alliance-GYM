// Lógica de Recompensas conectada a Supabase

document.addEventListener('DOMContentLoaded', () => {

    // 0. Actualizar Puntos en toda la Interfaz
    window.updateGlobalPoints = async function() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: memberData } = await supabase
                .from('members')
                .select('points')
                .eq('id', user.id)
                .single();

            if (memberData) {
                const pts = memberData.points || 0;
                // Actualizar en el resumen y en la pestaña de recompensas
                const summaryPts = document.getElementById('dash-points-balance');
                const rewardsPts = document.getElementById('rewards-points-val');
                if (summaryPts) summaryPts.innerText = pts;
                if (rewardsPts) rewardsPts.innerText = pts;
            }
        } catch(e) {
            console.error("Error fetching points:", e);
        }
    };

    // 1. Cargar el historial de recompensas canjeadas
    window.loadUserRewards = async function() {
        window.updateGlobalPoints(); // Actualizar puntos al cargar el historial
        
        const historyEl = document.getElementById('client-redeemed-history');
        if (!historyEl) return;

        historyEl.innerHTML = '<tr><td colspan="4" class="text-center">Cargando historial...</td></tr>';

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: memberData, error: memError } = await supabase
                .from('members')
                .select('member_number')
                .eq('id', user.id)
                .single();

            if (memError || !memberData) {
                historyEl.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Error: Cuenta de socio no encontrada. Revisa la base de datos de Supabase.</td></tr>';
                return;
            }

            // Buscar canjes de este socio
            const { data: redemptions, error } = await supabase
                .from('redemptions')
                .select('*')
                .eq('member_number', memberData.member_number)
                .order('redeemed_at', { ascending: false });

            if (error) throw error;

            if (redemptions.length === 0) {
                historyEl.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Aún no has canjeado ninguna recompensa.</td></tr>';
                return;
            }

            historyEl.innerHTML = '';
            redemptions.forEach(red => {
                // Formatear fecha
                const dateObj = new Date(red.redeemed_at);
                const dateStr = dateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
                
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${dateStr}</td>
                    <td><strong>${red.reward_name}</strong></td>
                    <td class="text-danger">-${red.cost} pts</td>
                    <td><span class="badge badge-success">${red.status}</span></td>
                `;
                historyEl.appendChild(tr);
            });

        } catch (error) {
            console.error("Error cargando recompensas:", error);
            historyEl.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Error al cargar historial.</td></tr>';
        }
    };

    // 2. Manejar los clics en los botones de "Canjear"
    window.redeemReward = async function(rewardName, cost) {
        // Confirmación
        if (!confirm(`¿Estás seguro de que deseas canjear ${rewardName} por ${cost} puntos?`)) {
            return;
        }

        try {
            // Mostrar estado de carga (podríamos bloquear la pantalla)
            alert("Procesando canje... por favor espera.");

            // Llamar a la función segura (RPC) en Supabase
            const { data, error } = await supabase.rpc('redeem_reward_secure', {
                p_reward_name: rewardName,
                p_cost: cost
            });

            if (error) {
                // Si la base de datos lanza la excepción 'Puntos insuficientes'
                if (error.message.includes('Puntos insuficientes')) {
                    alert("❌ No tienes suficientes puntos para esta recompensa.");
                } else {
                    throw error;
                }
                return;
            }

            alert(`✅ ¡Éxito! Has canjeado: ${rewardName}.`);
            
            // Recargar datos en la UI
            if (window.loadUserAppointments) { // Reutilizamos el trigger principal del dashboard
                // Recargamos la página entera para que se actualice todo el header y los puntos totales
                window.location.reload(); 
            }

        } catch (error) {
            console.error("Error en el canje:", error);
            alert("Ocurrió un error al intentar canjear la recompensa.");
        }
    };

    // 3. Sobrescribir la función del catálogo en main.js
    window.redeemStoreItem = async function(rewardId, pointsCost) {
        // Encontrar el nombre del premio
        let rewardName = "Recompensa";
        if (window.AlliancePoints) {
            const catalog = window.AlliancePoints.getCatalog();
            const item = catalog.find(r => r.id === rewardId);
            if (item) rewardName = item.name;
        }

        await window.redeemReward(rewardName, pointsCost);
    };
});
