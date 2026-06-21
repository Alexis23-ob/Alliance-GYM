/**
 * Alliance GYM - Módulo del Personal (Staff & Operaciones)
 * Controles para validación de QR, revisión de asistencia, listado de citas y roles de empleados.
 */

(function () {
    const STORAGE_LOGS_KEY = 'alliance_gym_checkins';

    // Lista de empleados y sus roles con permisos
    const EMPLOYEES_LIST = [
        { name: 'Lucía Fernández', role: 'Recepcionista', email: 'staff@alliance.com', permissions: ['Validar Códigos QR', 'Ver Citas', 'Ver Buzón de Sugerencias'] },
        { name: 'Alex Ramírez', role: 'Entrenador Principal', email: 'alex@alliance.com', permissions: ['Ver Citas', 'Ver Valoraciones de Coaches'] },
        { name: 'Sarah Martínez', role: 'Coach Acondicionamiento', email: 'sarah@alliance.com', permissions: ['Ver Citas', 'Ver Valoraciones de Coaches'] },
        { name: 'David Cruz', role: 'Fisioterapeuta y Coach', email: 'david@alliance.com', permissions: ['Ver Citas', 'Ver Valoraciones de Coaches'] },
        { name: 'Eduardo Gómez', role: 'Gerente General', email: 'admin@alliance.com', permissions: ['Acceso Total', 'Gestión de Empleados', 'Reportes Financieros', 'Validar Códigos QR'] }
    ];

    // Inicializar registros de asistencia si no existen
    function initLogs() {
        if (!localStorage.getItem(STORAGE_LOGS_KEY)) {
            const seedLogs = [
                { id: 'log_1', userName: 'Carlos Pérez', userEmail: 'socio@alliance.com', date: '2026-06-10', time: '08:30 AM', status: 'Acceso Permitido (Plan Black)' },
                { id: 'log_2', userName: 'Carlos Pérez', userEmail: 'socio@alliance.com', date: '2026-06-08', time: '14:22 PM', status: 'Acceso Permitido (Plan Black)' },
                { id: 'log_3', userName: 'Carlos Pérez', userEmail: 'socio@alliance.com', date: '2026-06-05', time: '09:15 AM', status: 'Acceso Permitido (Plan Black)' }
            ];
            localStorage.setItem(STORAGE_LOGS_KEY, JSON.stringify(seedLogs));
        }
    }

    // Obtener lista de empleados
    function getEmployees() {
        return EMPLOYEES_LIST;
    }

    // Obtener registros de asistencia
    function getCheckinLogs() {
        initLogs();
        return JSON.parse(localStorage.getItem(STORAGE_LOGS_KEY));
    }

    // Validar acceso de un cliente o canje de premio
    async function validateQR(qrCodeInput) {
        initLogs();
        const cleanInput = qrCodeInput.trim().toUpperCase();
        
        let normalizedInput = cleanInput;
        if (cleanInput.length === 6 && !cleanInput.includes('-')) {
            normalizedInput = 'RW-' + cleanInput;
        }

        // 1. Verificar si corresponde a un código de recompensa corto (RW-XXXXXX)
        if (normalizedInput.startsWith('RW-')) {
            try {
                // Llamar a la función de validación en Supabase (requiere rol de staff)
                const { data, error } = await supabase.rpc('validate_reward_by_shortcode', {
                    p_shortcode: normalizedInput
                });

                if (error) throw error;

                if (!data.success) {
                    return { success: false, message: data.message };
                }

                // Registrar acción en logs locales de recepción (para visualización rápida)
                const checkinLogs = getCheckinLogs();
                const today = new Date().toISOString().split('T')[0];
                const nowTime = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
                checkinLogs.unshift({
                    id: 'log_' + Date.now(),
                    userName: data.memberName,
                    userEmail: 'Socio: ' + data.memberNumber,
                    date: today,
                    time: nowTime,
                    status: `Canje Validado: ${data.rewardName}`
                });
                localStorage.setItem('alliance_gym_checkins', JSON.stringify(checkinLogs));

                return {
                    success: true,
                    isReward: true,
                    user: { name: data.memberName },
                    rewardName: data.rewardName,
                    code: normalizedInput,
                    benefitMessage: `Entregar producto/beneficio al socio.`,
                    message: `¡Recompensa Canjeada con Éxito! Socio: ${data.memberName}. Premio: ${data.rewardName}.`
                };
            } catch (err) {
                console.error("Error validando premio:", err);
                return { success: false, message: "Error conectando a la base de datos o permisos insuficientes." };
            }
        }

        // Si no es un código RW-, podríamos validar membresía (dejado como simulación por ahora)
        return { success: false, message: 'La validación de membresías por código no está conectada a la base de datos en esta versión. Usa códigos de premio (RW-XXXXXX).' };
    }

    // Obtener todas las citas consolidadas de la base de datos
    async function getAllAppointments() {
        try {
            const { data, error } = await supabase
                .from('appointments')
                .select(`
                    id, 
                    service_type, 
                    appointment_date, 
                    appointment_time, 
                    coach, 
                    status,
                    member_number,
                    members (full_name)
                `)
                .order('appointment_date', { ascending: true });

            if (error) throw error;

            return data.map(app => ({
                id: app.id,
                userId: app.member_number,
                userName: app.members ? app.members.full_name : 'Desconocido',
                userEmail: 'Socio: ' + app.member_number,
                type: app.service_type,
                date: app.appointment_date,
                time: app.appointment_time || 'Por asignar',
                coach: app.coach || 'Por asignar',
                status: app.status
            }));
        } catch (err) {
            console.error("Error obteniendo citas globales:", err);
            return [];
        }
    }

    // Actualizar estatus de cita (Completada, Cancelada) en Supabase
    async function updateAppointmentStatus(userId, appointmentId, newStatus) {
        try {
            const { error } = await supabase
                .from('appointments')
                .update({ status: newStatus })
                .eq('id', appointmentId);

            if (error) throw error;
            return { success: true };
        } catch (err) {
            console.error("Error actualizando cita:", err);
            return { success: false, message: 'Error de base de datos.' };
        }
    }

    // Exponer API global del personal
    window.AllianceStaff = {
        getEmployees,
        getCheckinLogs,
        validateQR,
        getAllAppointments,
        updateAppointmentStatus,
        initLogs
    };

    initLogs();
})();
