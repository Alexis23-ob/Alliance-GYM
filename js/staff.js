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

    // Validar acceso de un cliente mediante código de barras / QR
    function validateQR(qrCodeInput) {
        initLogs();
        const users = window.AllianceAuth.getUsers();
        const cleanInput = qrCodeInput.trim().toUpperCase();

        // Normalizar código si se ingresó sin prefijo
        let normalizedInput = cleanInput;
        if (cleanInput.length === 6 && !cleanInput.includes('-')) {
            normalizedInput = 'ALLIANCE-RW-' + cleanInput;
        } else if (cleanInput.startsWith('RW-')) {
            normalizedInput = 'ALLIANCE-' + cleanInput;
        }

        // 1. Verificar si corresponde a un código de recompensa (ALLIANCE-RW-XXXXXX)
        if (normalizedInput.startsWith('ALLIANCE-RW-')) {
            let foundUser = null;
            let foundReward = null;
            let foundUserIndex = -1;

            for (let i = 0; i < users.length; i++) {
                const u = users[i];
                if (u.redeemedRewards) {
                    const r = u.redeemedRewards.find(item => item.code && item.code.toUpperCase() === normalizedInput);
                    if (r) {
                        foundUser = u;
                        foundReward = r;
                        foundUserIndex = i;
                        break;
                    }
                }
            }

            if (!foundUser || !foundReward) {
                return { success: false, message: 'Código de recompensa no válido o no encontrado.' };
            }

            if (foundReward.status !== 'Pendiente') {
                return { success: false, message: `Esta recompensa ya fue validada previamente el ${foundReward.date}.` };
            }

            // Validar la recompensa
            foundReward.status = 'Entregado/Aplicado';
            foundReward.date = new Date().toISOString().split('T')[0]; // Guardar fecha de validación

            let benefitMessage = '';
            if (foundReward.category === 'membership') {
                const currentEndDate = new Date(foundUser.membership.endDate || new Date());
                currentEndDate.setDate(currentEndDate.getDate() + (foundReward.value || 30));
                foundUser.membership.endDate = currentEndDate.toISOString().split('T')[0];
                foundUser.membership.active = true;
                foundUser.membership.status = 'active';
                benefitMessage = `Membresía extendida por ${foundReward.value} días (Vence el ${foundUser.membership.endDate}).`;
            } else if (foundReward.category === 'discount') {
                benefitMessage = `Descuento del ${Math.round((foundReward.value || 0.20) * 100)}% aplicado a su cuenta.`;
            } else {
                benefitMessage = `Entregar producto físico al socio: ${foundReward.rewardName}.`;
            }

            // Guardar cambios en el usuario
            users[foundUserIndex] = foundUser;
            localStorage.setItem('alliance_gym_users', JSON.stringify(users));

            // Sincronizar sesión activa si es el mismo usuario
            const currentUser = window.AllianceAuth.getCurrentUser();
            if (currentUser && currentUser.id === foundUser.id) {
                localStorage.setItem('alliance_gym_current_user', JSON.stringify(foundUser));
            }

            // Registrar acción en logs de recepción
            const checkinLogs = getCheckinLogs();
            const today = new Date().toISOString().split('T')[0];
            const nowTime = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
            checkinLogs.unshift({
                id: 'log_' + Date.now(),
                userName: foundUser.name,
                userEmail: foundUser.email,
                date: today,
                time: nowTime,
                status: `Canje Validado: ${foundReward.rewardName}`
            });
            localStorage.setItem('alliance_gym_checkins', JSON.stringify(checkinLogs));

            return {
                success: true,
                isReward: true,
                user: foundUser,
                rewardName: foundReward.rewardName,
                code: foundReward.code,
                benefitMessage: benefitMessage,
                message: `¡Recompensa Canjeada con Éxito! Socio: ${foundUser.name}. Premio: ${foundReward.rewardName}. Detalle: ${benefitMessage}`
            };
        }

        // Buscar usuario por su código QR o por su correo
        const user = users.find(u => 
            (u.qrCode && u.qrCode.toLowerCase() === qrCodeInput.trim().toLowerCase()) ||
            u.email.toLowerCase() === qrCodeInput.trim().toLowerCase()
        );

        if (!user) {
            return { success: false, message: 'El código QR o correo ingresado no corresponde a ningún socio registrado.' };
        }

        const today = new Date().toISOString().split('T')[0];
        const nowTime = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
        const checkinLogs = getCheckinLogs();

        // Verificar estatus de membresía
        const hasActiveMembership = user.membership && user.membership.active && user.membership.status === 'active';
        
        // Si el plan venció por fecha, actualizar estatus
        if (hasActiveMembership && user.membership.endDate) {
            const expDate = new Date(user.membership.endDate);
            const todayDate = new Date();
            if (todayDate > expDate) {
                // Membresía vencida
                user.membership.active = false;
                user.membership.status = 'expired';
                // Guardar cambios en el usuario
                const userIndex = users.findIndex(u => u.id === user.id);
                users[userIndex] = user;
                localStorage.setItem('alliance_gym_users', JSON.stringify(users));
                
                // Registrar acceso denegado
                const log = {
                    id: 'log_' + Date.now(),
                    userName: user.name,
                    userEmail: user.email,
                    date: today,
                    time: nowTime,
                    status: 'Acceso Denegado (Membresía Expirada)'
                };
                checkinLogs.unshift(log);
                localStorage.setItem(STORAGE_LOGS_KEY, JSON.stringify(checkinLogs));

                return { success: false, expired: true, user: user, message: `Acceso Denegado. La membresía de ${user.name} expiró el ${user.membership.endDate}.` };
            }
        }

        if (!hasActiveMembership) {
            // Registrar acceso denegado por inactividad
            const log = {
                id: 'log_' + Date.now(),
                userName: user.name,
                userEmail: user.email,
                date: today,
                time: nowTime,
                status: 'Acceso Denegado (Sin Membresía Activa)'
            };
            checkinLogs.unshift(log);
            localStorage.setItem(STORAGE_LOGS_KEY, JSON.stringify(checkinLogs));

            return { success: false, user: user, message: `Acceso Denegado. El socio ${user.name} no cuenta con una membresía activa.` };
        }

        // Registrar acceso permitido
        const log = {
            id: 'log_' + Date.now(),
            userName: user.name,
            userEmail: user.email,
            date: today,
            time: nowTime,
            status: `Acceso Permitido (${user.membership.planName})`
        };
        checkinLogs.unshift(log);
        localStorage.setItem(STORAGE_LOGS_KEY, JSON.stringify(checkinLogs));

        // Asignar puntos por asistencia (+50 puntos)
        window.AlliancePoints.addPoints(user.id, 50, 'Asistencia diaria registrada en recepción');

        return { 
            success: true, 
            user: user, 
            message: `¡Acceso Permitido! Socio: ${user.name}. Plan: ${user.membership.planName}. Vigencia: al ${user.membership.endDate}. Se le otorgaron +50 puntos.` 
        };
    }

    // Obtener todas las citas consolidadas de todos los usuarios
    function getAllAppointments() {
        const users = window.AllianceAuth.getUsers();
        let allApps = [];
        
        users.forEach(user => {
            if (user.appointments && Array.isArray(user.appointments)) {
                user.appointments.forEach(app => {
                    allApps.push({
                        ...app,
                        userId: user.id,
                        userName: user.name,
                        userEmail: user.email
                    });
                });
            }
        });

        // Ordenar por fecha y hora más cercana
        return allApps.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
    }

    // Actualizar estatus de cita (Completada, Cancelada)
    function updateAppointmentStatus(userId, appointmentId, newStatus) {
        const users = window.AllianceAuth.getUsers();
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex !== -1) {
            const user = users[userIndex];
            const appIndex = user.appointments.findIndex(a => a.id === appointmentId);
            if (appIndex !== -1) {
                user.appointments[appIndex].status = newStatus;
                
                // Si la cita de primera visita se completa, dar un premio de bienvenida de 100 puntos extra
                if (newStatus === 'Completada' && user.appointments[appIndex].type.includes('visita')) {
                    user.points = (user.points || 0) + 100;
                    user.pointsHistory.unshift({
                        date: new Date().toISOString().split('T')[0],
                        points: 100,
                        description: 'Primera visita completada - inducción técnica'
                    });
                }
                
                users[userIndex] = user;
                localStorage.setItem('alliance_gym_users', JSON.stringify(users));
                return { success: true };
            }
        }
        return { success: false, message: 'No se encontró la cita.' };
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
