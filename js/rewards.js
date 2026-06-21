// Lógica de Recompensas conectada a Supabase

document.addEventListener('DOMContentLoaded', () => {

    // 0. Actualizar Puntos en toda la Interfaz y dibujar el catálogo
    window.updateGlobalPoints = async function() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: memberData } = await supabase
                .from('members')
                .select('points')
                .eq('id', user.id)
                .single();

            let pts = 0;
            if (memberData) {
                pts = memberData.points || 0;
                // Actualizar en el resumen y en la pestaña de recompensas
                const summaryPts = document.getElementById('dash-points-balance');
                const rewardsPts = document.getElementById('rewards-points-val');
                if (summaryPts) summaryPts.innerText = pts;
                if (rewardsPts) rewardsPts.innerText = pts;
            }

            // Dibujar el catálogo de recompensas usando los puntos actuales
            if (window.AlliancePoints) {
                const catalog = window.AlliancePoints.getCatalog();
                const catalogList = document.getElementById('rewards-catalog-list');
                if (catalogList) {
                    catalogList.innerHTML = '';
                    catalog.forEach(item => {
                        const canRedeem = pts >= item.points;
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
                                <button class="btn ${btnClass} w-100" ${btnDisabled} onclick="redeemStoreItem('${item.id}', ${item.points})">
                                    Canjear Premio
                                </button>
                            </div>
                        `;
                    });
                }
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
                
                let statusHTML = `<span class="badge badge-success">${red.status}</span>`;
                if (red.status === 'Pendiente') {
                    // Generar un código corto a partir del UUID de Supabase (ej: RW-A1B2C3)
                    const shortCode = 'RW-' + red.id.substring(0, 6).toUpperCase();
                    statusHTML = `
                        <span class="badge badge-inactive">${red.status}</span>
                        <span style="display: inline-block; background: var(--bg-lighter); padding: 2px 8px; border-radius: 4px; font-family: monospace; font-weight: bold; font-size: 0.85rem; margin-left: 8px; border: 1px dashed var(--glass-border); color: var(--text-main);">
                            <i class="fas fa-ticket-alt"></i> ${shortCode}
                        </span>
                    `;
                }

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${dateStr}</td>
                    <td><strong>${red.reward_name}</strong></td>
                    <td class="text-danger">-${red.cost} pts</td>
                    <td>${statusHTML}</td>
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
            alert("Procesando canje... por favor espera.");

            // Llamar a la función segura (RPC) en Supabase
            const { error } = await supabase.rpc('redeem_reward_secure', {
                p_reward_name: rewardName,
                p_cost: cost
            });

            if (error) {
                if (error.message.includes('Puntos insuficientes')) {
                    alert("❌ No tienes suficientes puntos para esta recompensa.");
                } else {
                    throw error;
                }
                return;
            }

            alert(`✅ ¡Éxito! Has canjeado: ${rewardName}. Revisa tu historial para obtener el código QR de validación.`);
            
            // Recargar datos dinámicamente sin recargar la página
            if (window.updateGlobalPoints) await window.updateGlobalPoints();
            if (window.loadUserRewards) await window.loadUserRewards();

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
