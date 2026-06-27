// LOGICA DE SUPABASE - SESIÓN GLOBAL

// DUMMY OBJECT PARA EVITAR CRASHES EN MAIN.JS
window.AllianceAuth = {
    getCurrentUser: () => {
        const tUserStr = localStorage.getItem('alliance_temp_user');
        if (tUserStr) return JSON.parse(tUserStr);
        return null;
    },
    getUsers: () => [],
    login: () => ({success: false, message: 'Usar Supabase'}),
    register: async (name, email, password) => {
        try {
            const { data: authData, error: authError } = await supabase.auth.signUp({ 
                email: email, 
                password: password,
                options: { data: { full_name: name } }
            });
            if (authError) throw authError;

            if (authData && authData.user) {
                // Generar un número de socio al azar de 5 dígitos para nuevos registros
                const memberNumber = Math.floor(10000 + Math.random() * 90000).toString();
                await supabase.from('members').insert([{
                    id: authData.user.id,
                    full_name: name,
                    email: email,
                    member_number: memberNumber,
                    points: 0,
                    role: 'client'
                }]);
                
                alert("¡Registro exitoso! Por favor revisa tu correo electrónico (o bandeja de SPAM) para confirmar tu cuenta. Una vez confirmada, podrás iniciar sesión con tus credenciales.");
                return { success: true, user: { name: name, email: email, role: 'client' } };
            }
            return { success: false, message: 'Error desconocido al registrar' };
        } catch (err) {
            return { success: false, message: err.message };
        }
    },
    purchaseMembership: () => ({success: false}),
    logout: async () => {
        await supabase.auth.signOut();
    }
};

// Sobrescribir función conflictiva de main.js
window.openAuthModal = async function(tab = 'login') {
    const tempUserStr = localStorage.getItem('alliance_temp_user');
    if (tempUserStr) {
        // Ya está logueado, mostrar dashboard
        if (window.renderDashboardState) window.renderDashboardState();
        return;
    }
    
    try {
        const { data } = await supabase.auth.getSession();
        if (data && data.session) {
            if (window.renderDashboardState) window.renderDashboardState(data.session);
            return;
        }
    } catch(err) {
        console.error("Error validando sesión:", err);
    }
    
    document.getElementById('auth-modal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
    window.switchAuthTab(tab);
};
// Función para manejar la recuperación de contraseña
window.handleForgotPassword = async function(event) {
    if (event) event.preventDefault();
    const email = document.getElementById('forgot-email').value;
    if (!email) {
        if (typeof showToast === 'function') showToast('Ingresa tu correo.', 'error');
        return;
    }
    
    // Usar Supabase para enviar el correo de recuperación
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + window.location.pathname,
    });

    if (error) {
        if (typeof showToast === 'function') showToast(error.message, 'error');
    } else {
        if (typeof showToast === 'function') showToast('Si el correo existe, te hemos enviado un enlace.', 'success');
        document.getElementById('forgot-email').value = '';
        if (typeof showLogin === 'function') showLogin();
    }
};

window.renderDashboardState = async (session = null) => {
    const navBtn = document.getElementById('nav-portal-btn');
    const joinBtn = document.getElementById('nav-join-btn');
    
    const tempUserStr = localStorage.getItem('alliance_temp_user');
    const tempUser = tempUserStr ? JSON.parse(tempUserStr) : null;
    
    if ((session && session.user) || tempUser) {
        // Actualizar botón de navegación de forma segura
        try {
            if (navBtn) {
                let displayName = 'Socio';
                if (tempUser && tempUser.name) {
                    displayName = tempUser.name;
                } else if (session?.user?.user_metadata?.full_name) {
                    displayName = session.user.user_metadata.full_name;
                }
                navBtn.innerHTML = `<i class="fas fa-user-shield"></i> ${displayName.split(' ')[0]}`;
            }
        } catch (e) {
            console.error('Error actualizando botón:', e);
        }

        if (joinBtn) joinBtn.style.display = 'none';

        // Ocultar la página pública para mostrar el dashboard completo
        document.getElementById('public-site').style.display = 'none';
        const navbarEl = document.getElementById('navbar');
        if (navbarEl) navbarEl.style.display = 'none';
        
        // Ocultar modal de auth si estaba abierto
        const authModal = document.getElementById('auth-modal');
        if (authModal) authModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Mostrar dashboard
        document.getElementById('client-dashboard').style.display = 'none';
        document.getElementById('staff-dashboard').style.display = 'none';

        window.scrollTo(0, 0);
        
        if (tempUser && (!session || !session.user)) {
            // Logueado de forma temporal (solo dashboard de cliente básico)
            document.getElementById('client-dashboard').style.display = 'flex';
            document.getElementById('dash-client-name').innerText = tempUser.name;
            document.getElementById('dash-client-email').innerText = 'Socio (Sin Correo)';
            
            // Mostrar modal de invitación a registrarse si no lo ha hecho
            if (!tempUser.email_linked && tempUser.email_linked !== 'dismissed') {
                setTimeout(() => {
                    document.getElementById('email-prompt-modal').style.display = 'flex';
                    // Pre-llenar datos para que lo completen
                    document.getElementById('email-prompt-form').onsubmit = async (e) => {
                        e.preventDefault();
                        const email = document.getElementById('prompt-email').value.trim();
                        const pass = document.getElementById('prompt-password').value.trim();
                        const btn = document.getElementById('btn-prompt-submit');
                        btn.innerText = "Guardando..."; btn.disabled = true;
                        
                        try {
                            const { data: authData, error: authError } = await supabase.auth.signUp({ email, password: pass });
                            if (authError) throw authError;
                            if (authData.user) {
                                // Usar UPSERT por si el administrador ya sincronizó la cuenta desde el panel
                                await supabase.from('members').upsert([{ 
                                    id: authData.user.id, 
                                    member_number: tempUser.id, 
                                    full_name: tempUser.name, 
                                    points: 0, 
                                    email: email 
                                }], { onConflict: 'member_number' });
                            }
                            
                            // En lugar de borrar el usuario temporal y recargar (lo que los bloquea si Supabase pide confirmar correo),
                            // actualizamos el registro temporal para saber que ya lo vincularon y cerramos el modal.
                            tempUser.email_linked = true;
                            localStorage.setItem('alliance_temp_user', JSON.stringify(tempUser));
                            
                            alert("¡Perfil guardado exitosamente! Hemos enviado un enlace de confirmación a tu correo. Podrás iniciar sesión con tu correo la próxima vez que ingreses.");
                            document.getElementById('email-prompt-modal').style.display = 'none';
                        } catch (err) {
                            alert("Error: " + err.message);
                            btn.innerText = "Guardar y Vincular"; btn.disabled = false;
                        }
                    };
                }, 1000);
            }
            
        } else if (session && session.user) {
            // Cargar datos reales
            try {
                const { data: memberData, error } = await supabase.from('members').select('full_name, member_number, role').eq('id', session.user.id).single();
                if (memberData) {
                    // Actualizar el botón de navegación con el nombre real de la BD
                    if (navBtn && memberData.full_name) {
                        navBtn.innerHTML = `<i class="fas fa-user-shield"></i> ${memberData.full_name.split(' ')[0]}`;
                    }

                    if (['admin', 'coach', 'receptionist', 'staff'].includes(memberData.role)) {
                        // Es un empleado
                        document.getElementById('staff-dashboard').style.display = 'flex';
                        let formalRole = memberData.role === 'admin' ? 'Administrador General' : 'Staff';
                        if (window.updateStaffDashboardUI) window.updateStaffDashboardUI({ name: memberData.full_name, roleCode: memberData.role, staffRole: formalRole });
                    } else {
                        // Es cliente normal
                        document.getElementById('client-dashboard').style.display = 'flex';
                        document.getElementById('dash-client-name').innerText = memberData.full_name;
                        document.getElementById('dash-client-email').innerText = 'Socio: ' + memberData.member_number;
                        if (window.loadUserAppointments) window.loadUserAppointments();
                        if (window.loadUserRewards) window.loadUserRewards();
                    }
                } else {
                    // Fallback si la cuenta existe en Supabase pero no tiene perfil en 'members'
                    document.getElementById('client-dashboard').style.display = 'flex';
                    document.getElementById('dash-client-name').innerText = session.user.user_metadata?.full_name || session.user.email || 'Socio';
                    document.getElementById('dash-client-email').innerText = 'Socio (Registrado)';
                }
            } catch (err) {
                console.error("Error cargando perfil de usuario:", err);
                // Fallback en caso de error de red
                document.getElementById('client-dashboard').style.display = 'flex';
                document.getElementById('dash-client-name').innerText = session.user.email || 'Socio';
                document.getElementById('dash-client-email').innerText = 'Socio (Modo Offline)';
            }
        }
        if (joinBtn) joinBtn.style.display = 'none';
    } else {
        // No está logueado
        // Asegurarse de que el sitio público sea visible
        document.getElementById('public-site').style.display = 'block';
        const navbarEl = document.getElementById('navbar');
        if (navbarEl) navbarEl.style.display = '';
        
        // Ocultar dashboards
        document.getElementById('client-dashboard').style.display = 'none';
        document.getElementById('staff-dashboard').style.display = 'none';

        const closeBtn = document.querySelector('.modal-close-btn');
        if (closeBtn) closeBtn.style.display = 'block';
        
        if (navBtn) {
            navBtn.innerHTML = '<i class="fas fa-user-circle"></i> Mi Cuenta';
            navBtn.onclick = () => openAuthModal();
        }
        if (joinBtn) joinBtn.style.display = 'inline-block';
    }
};

// Ejecutar inmediatamente para usuarios temporales (evita esperas o fallos si Supabase tarda en cargar)
window.renderDashboardState();

supabase.auth.onAuthStateChange(async (event, session) => {
    window.renderDashboardState(session);
});

// Funciones de navegación del modal de Auth
function showForgotPassword() {
    document.getElementById('auth-login-form').style.display = 'none';
    document.getElementById('auth-register-form').style.display = 'none';
    document.getElementById('auth-forgot-form').style.display = 'block';
    document.querySelector('.modal-auth-tabs').style.display = 'none';
}

function showLoginForm() {
    document.getElementById('auth-forgot-form').style.display = 'none';
    document.querySelector('.modal-auth-tabs').style.display = 'flex';
    switchAuthTab('login');
}

// Sobrescribir switchAuthTab de main.js
window.switchAuthTab = function(tab) {
    document.getElementById('btn-tab-login').classList.remove('active');
    document.getElementById('btn-tab-register').classList.remove('active');
    document.getElementById('auth-login-form').style.display = 'none';
    document.getElementById('auth-register-form').style.display = 'none';
    document.getElementById('auth-forgot-form').style.display = 'none';
    
    if (tab === 'login') {
        document.getElementById('btn-tab-login').classList.add('active');
        document.getElementById('auth-login-form').style.display = 'block';
    } else {
        document.getElementById('btn-tab-register').classList.add('active');
        document.getElementById('auth-register-form').style.display = 'block';
    }
}

// LOGICA DE SUPABASE

// 1. Registro de Usuario (Vincular Cuenta)
document.getElementById('auth-register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-register-submit');
    const originalText = btn.innerText;
    btn.innerText = 'Cargando...';
    btn.disabled = true;

    const memberId = document.getElementById('register-member-id').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
        // Registrar en Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        if (authError) throw authError;

        // Insertar en la tabla publica 'members'
        if (authData.user) {
            const { error: dbError } = await supabase
                .from('members')
                .insert([
                    { id: authData.user.id, member_number: memberId, full_name: 'Socio ' + memberId, points: 0, email: email }
                ]);
            
            // Si hay error en base de datos (por ejemplo, el número de socio ya existe)
            if (dbError) {
                console.error(dbError);
                // NOTA: Idealmente si falla, deberíamos borrar el usuario en Auth, pero Supabase no lo permite desde el cliente.
                throw new Error("El número de socio ya está registrado o no es válido.");
            }
        }

        alert('¡Registro exitoso! Por favor, verifica tu correo electrónico si es necesario o inicia sesión.');
        showLoginForm();
    } catch (error) {
        alert('Error en registro: ' + error.message);
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
});

// 2. Inicio de Sesión
document.getElementById('auth-login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-login-submit');
    const originalText = btn.innerText;
    btn.innerText = 'Iniciando...';
    btn.disabled = true;

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();

    try {
        // 1. Interceptar Login Temporal (Identificador)
        if (window.INITIAL_USERS && window.INITIAL_USERS[email]) {
            if (window.INITIAL_USERS[email].password.toLowerCase() === password.toLowerCase()) {
                // Login exitoso temporal
                localStorage.setItem('alliance_temp_user', JSON.stringify({
                    id: email,
                    name: window.INITIAL_USERS[email].name,
                    email_linked: false
                }));
                if (typeof showToast === 'function') showToast('Inicio de sesión exitoso', 'success');
                document.getElementById('auth-modal').style.display = 'none';
                document.body.style.overflow = 'auto';
                
                // Actualizar la interfaz de inmediato sin recargar la página
                if (window.renderDashboardState) {
                    window.renderDashboardState();
                } else {
                    window.location.reload(); // Fallback por si acaso
                }
                return;
            } else {
                throw new Error("Contraseña incorrecta para el Identificador.");
            }
        }
        
        // 2. Fallback a login normal de Supabase (Correo)
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) throw error;

        if (typeof showToast === 'function') showToast('Inicio de sesión exitoso', 'success');
        
        // Cerrar modal manualmente por si acaso
        document.getElementById('auth-modal').style.display = 'none';
        document.body.style.overflow = 'auto';

        if (data && data.session && window.renderDashboardState) {
            window.renderDashboardState(data.session);
        }
    } catch (error) {
        let msg = 'Error al iniciar sesión: Verifique sus credenciales.';
        if (error.message && error.message.toLowerCase().includes('email not confirmed')) {
            msg = 'Debes confirmar tu correo electrónico. Por favor revisa tu bandeja de entrada o SPAM.';
        } else if (error.message) {
            msg = error.message;
        }
        
        if (typeof showToast === 'function') {
            showToast(msg, 'error');
        } else {
            alert(msg);
        }
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
});

// 3. Recuperar Contraseña
document.getElementById('auth-forgot-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-forgot-submit');
    const originalText = btn.innerText;
    btn.innerText = 'Enviando...';
    btn.disabled = true;

    const email = document.getElementById('forgot-email').value;

    try {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.href, // Redirigir a la misma página para cambiar password
        });

        if (error) throw error;

        alert('Se ha enviado un enlace de recuperación a tu correo.');
        showLoginForm();
    } catch (error) {
        alert('Error: ' + error.message);
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
});
