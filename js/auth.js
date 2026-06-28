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
            
            // Mostrar modal de invitación a registrarse de forma obligatoria
            if (!tempUser.email_linked || tempUser.email_linked === 'dismissed') {
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
                            
                            if (authError) {
                                if (authError.message.toLowerCase().includes('already registered') || authError.status === 422) {
                                    // El correo ya está registrado, intentamos iniciar sesión directo
                                    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password: pass });
                                    if (signInError) {
                                        throw new Error("Este correo ya está registrado pero la contraseña ingresada es incorrecta. Si es tuyo, intenta recuperar tu contraseña en el menú principal.");
                                    }
                                    
                                    // Inicio de sesión exitoso con la cuenta existente
                                    tempUser.email_linked = true;
                                    localStorage.setItem('alliance_temp_user', JSON.stringify(tempUser));
                                    alert("Detectamos que ya estabas registrado. Hemos vinculado tu sesión correctamente.");
                                    window.location.reload();
                                    return;
                                }
                                throw authError;
                            }

                            if (authData && authData.user) {
                                // Guardar perfil en 'members'. Se omite onConflict para que use 'id' por defecto.
                                await supabase.from('members').upsert([{ 
                                    id: authData.user.id, 
                                    member_number: tempUser.id, 
                                    full_name: tempUser.name, 
                                    points: 0, 
                                    email: email,
                                    role: 'client'
                                }]);
                            }
                            
                            // En lugar de borrar el usuario temporal y recargar (lo que los bloquea si Supabase pide confirmar correo),
                            // actualizamos el registro temporal para saber que ya lo vincularon y cerramos el modal.
                            tempUser.email_linked = true;
                            localStorage.setItem('alliance_temp_user', JSON.stringify(tempUser));
                            
                            alert("¡Tu cuenta es ahora 100% funcional! Automáticamente has sido registrado de forma segura. Nota: Si te es posible, entra a tu correo para confirmar el enlace de seguridad.");
                            document.getElementById('email-prompt-modal').style.display = 'none';
                        } catch (err) {
                            alert(err.message);
                            btn.innerText = "Guardar y Vincular Cuenta"; btn.disabled = false;
                        }
                    };
                }, 1000);
            }
            
        } else if (session && session.user) {
            // Cargar datos reales
            try {
                const { data: memberData, error } = await supabase.from('members').select('full_name, member_number, role').eq('id', session.user.id).single();
                
                if (error) throw error;

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
                }
            } catch (err) {
                console.error("Error cargando perfil de usuario:", err);
                
                // Si el error es que la fila no existe, la creamos automáticamente (Self-healing)
                if (err.code === 'PGRST116') {
                    console.log("Creando perfil de miembro faltante...");
                    try {
                        const newMemberNumber = Math.floor(10000 + Math.random() * 90000).toString();
                        const newName = session.user.user_metadata?.full_name || session.user.email.split('@')[0];
                        
                        await supabase.from('members').insert([{
                            id: session.user.id,
                            full_name: newName,
                            email: session.user.email,
                            member_number: newMemberNumber,
                            points: 0,
                            role: 'client'
                        }]);
                        
                        document.getElementById('client-dashboard').style.display = 'flex';
                        document.getElementById('dash-client-name').innerText = newName;
                        document.getElementById('dash-client-email').innerText = 'Socio: ' + newMemberNumber;
                        if (navBtn) navBtn.innerHTML = `<i class="fas fa-user-shield"></i> ${newName.split(' ')[0]}`;
                    } catch (insertErr) {
                        console.error("Fallo al auto-recuperar cuenta:", insertErr);
                        document.getElementById('client-dashboard').style.display = 'flex';
                        document.getElementById('dash-client-name').innerText = session.user.email.split('@')[0];
                        document.getElementById('dash-client-email').innerText = 'Socio (Sin Perfil)';
                    }
                } else {
                    // Fallback en caso de error de red real
                    document.getElementById('client-dashboard').style.display = 'flex';
                    document.getElementById('dash-client-name').innerText = session.user.email.split('@')[0];
                    document.getElementById('dash-client-email').innerText = 'Socio (Modo Offline)';
                }
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
    const forgotForm = document.getElementById('auth-forgot-form');
    if (forgotForm) forgotForm.style.display = 'block';
}

function showLoginForm() {
    const forgotForm = document.getElementById('auth-forgot-form');
    if (forgotForm) forgotForm.style.display = 'none';
    const loginForm = document.getElementById('auth-login-form');
    if (loginForm) loginForm.style.display = 'block';
}

// LOGICA DE SUPABASE

// 2. Inicio de Sesión
const loginForm = document.getElementById('auth-login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
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
} // Fin del if (loginForm)


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
