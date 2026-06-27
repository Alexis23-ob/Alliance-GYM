// LOGICA DE SUPABASE - SESIÓN GLOBAL

// DUMMY OBJECT PARA EVITAR CRASHES EN MAIN.JS
window.AllianceAuth = {
    getCurrentUser: () => null,
    getUsers: () => [],
    login: () => ({success: false, message: 'Usar Supabase'}),
    register: () => ({success: false, message: 'Usar Supabase'}),
    purchaseMembership: () => ({success: false}),
    logout: async () => {
        await supabase.auth.signOut();
    }
};

// Sobrescribir función conflictiva de main.js
window.openAuthModal = function(tab = 'login') {
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

supabase.auth.onAuthStateChange(async (event, session) => {
    const navBtn = document.getElementById('nav-portal-btn');
    const joinBtn = document.getElementById('nav-join-btn');
    
    const tempUserStr = localStorage.getItem('alliance_temp_user');
    const tempUser = tempUserStr ? JSON.parse(tempUserStr) : null;
    
    if ((session && session.user) || tempUser) {
        // Ocultar la página pública para mostrar el dashboard completo
        document.getElementById('public-site').style.display = 'none';
        const navbarEl = document.getElementById('navbar');
        if (navbarEl) navbarEl.style.display = 'none';
        
        // Ocultar modal de auth si estaba abierto
        document.getElementById('auth-modal').style.display = 'none';
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
            
            // Mostrar modal de invitación a registrarse
            setTimeout(() => {
                document.getElementById('email-prompt-modal').style.display = 'flex';
                // Pre-llenar datos para que lo completen
                document.getElementById('email-prompt-form').onsubmit = async (e) => {
                    e.preventDefault();
                    const btn = document.getElementById('btn-prompt-submit');
                    btn.innerText = "Registrando..."; btn.disabled = true;
                    const email = document.getElementById('prompt-email').value;
                    const pass = document.getElementById('prompt-password').value;
                    
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
                        localStorage.removeItem('alliance_temp_user');
                        alert("¡Perfil completado exitosamente! Tu cuenta está segura.");
                        window.location.reload();
                    } catch (err) {
                        alert("Error: " + err.message);
                        btn.innerText = "Guardar y Vincular"; btn.disabled = false;
                    }
                };
            }, 1000);
            
        } else if (session && session.user) {
            // Cargar datos reales
            const { data: memberData } = await supabase.from('members').select('full_name, member_number, role').eq('id', session.user.id).single();
            if (memberData) {
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
            }
        }
        if (joinBtn) joinBtn.style.display = 'none';
    } else {
        // No está logueado
        // Ocultar página pública de forma forzada
        document.getElementById('public-site').style.display = 'none';
        const navbarEl = document.getElementById('navbar');
        if (navbarEl) navbarEl.style.display = 'none';
        
        // Forzar modal de auth a que no se cierre
        openAuthModal();
        const closeBtn = document.querySelector('.modal-close-btn');
        if (closeBtn) closeBtn.style.display = 'none';
        
        if (navBtn) {
            navBtn.innerHTML = '<i class="fas fa-user-circle"></i> Mi Cuenta';
            navBtn.onclick = () => openAuthModal();
        }
        if (joinBtn) joinBtn.style.display = 'inline-block';
    }
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

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        // 1. Interceptar Login Temporal (Identificador)
        if (window.INITIAL_USERS && window.INITIAL_USERS[email]) {
            if (window.INITIAL_USERS[email].password === password) {
                // Login exitoso temporal
                localStorage.setItem('alliance_temp_user', JSON.stringify({
                    id: email,
                    name: window.INITIAL_USERS[email].name
                }));
                if (typeof showToast === 'function') showToast('Inicio de sesión exitoso', 'success');
                document.getElementById('auth-modal').style.display = 'none';
                document.body.style.overflow = 'auto';
                
                // Forzar recarga para actualizar el estado
                window.location.reload();
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
    } catch (error) {
        if (typeof showToast === 'function') {
            showToast('Error al iniciar sesión: Verifique sus credenciales.', 'error');
        } else {
            console.error('Error al iniciar sesión: ' + error.message);
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
