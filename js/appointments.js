// Lógica de Citas conectada a Supabase

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Manejar el envío de nuevas citas
    const appointmentForm = document.getElementById('dash-appointment-form');
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const btn = appointmentForm.querySelector('button[type="submit"]');
            const originalText = btn.innerText;
            btn.innerText = "Agendando...";
            btn.disabled = true;

            const appType = document.getElementById('dash-app-type').value;
            const appCoach = document.getElementById('dash-app-coach').value;
            const appDate = document.getElementById('dash-app-date').value;
            const appTime = document.getElementById('dash-app-time').value;

            try {
                // Verificar usuario logueado
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error("Debes iniciar sesión para agendar.");

                // Obtener el número de socio del usuario actual
                const { data: memberData, error: memberError } = await supabase
                    .from('members')
                    .select('member_number')
                    .eq('id', user.id)
                    .single();

                if (memberError || !memberData) throw new Error("No se encontró tu número de socio.");

                // Insertar la cita
                const { error: insertError } = await supabase
                    .from('appointments')
                    .insert([{
                        member_number: memberData.member_number,
                        service_type: appType,
                        appointment_date: appDate,
                        // Guardamos el coach y la hora temporalmente en el status si no existen las columnas, 
                        // o lo ideal es tener las columnas. Asumiremos que el admin correrá el parche SQL.
                        coach: appCoach,
                        appointment_time: appTime,
                        status: 'Pendiente'
                    }]);

                if (insertError) throw insertError;

                alert("¡Cita agendada con éxito!");
                appointmentForm.reset();
                loadUserAppointments(); // Recargar la tabla
                
            } catch (error) {
                console.error(error);
                alert("Error al agendar: " + error.message);
            } finally {
                btn.innerText = originalText;
                btn.disabled = false;
            }
        });
    }

    // 2. Cargar las citas del usuario al abrir el dashboard
    // Se llamará externamente cuando el usuario inicie sesión o abra la pestaña
    window.loadUserAppointments = async function() {
        const listEl = document.getElementById('client-appointments-list');
        if (!listEl) return;

        listEl.innerHTML = '<tr><td colspan="5" class="text-center">Cargando citas...</td></tr>';

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: memberData } = await supabase
                .from('members')
                .select('member_number')
                .eq('id', user.id)
                .single();

            if (!memberData) return;

            // Buscar citas de este socio
            const { data: appointments, error } = await supabase
                .from('appointments')
                .select('*')
                .eq('member_number', memberData.member_number)
                .order('appointment_date', { ascending: false });

            if (error) throw error;

            if (appointments.length === 0) {
                listEl.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No tienes citas programadas.</td></tr>';
                return;
            }

            listEl.innerHTML = '';
            appointments.forEach(app => {
                // Formatear fecha
                const dateObj = new Date(app.appointment_date);
                const dateStr = dateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
                
                // Badge de estado
                let badgeClass = 'badge-warning';
                if (app.status.toLowerCase().includes('confirmad')) badgeClass = 'badge-success';
                if (app.status.toLowerCase().includes('cancelad')) badgeClass = 'badge-danger';

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${dateStr}</td>
                    <td>${app.appointment_time || '--:--'}</td>
                    <td>${app.service_type}</td>
                    <td>${app.coach || 'Sin asignar'}</td>
                    <td><span class="badge ${badgeClass}">${app.status}</span></td>
                `;
                listEl.appendChild(tr);
            });

        } catch (error) {
            console.error("Error cargando citas:", error);
            listEl.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error al cargar citas.</td></tr>';
        }
    };
});
