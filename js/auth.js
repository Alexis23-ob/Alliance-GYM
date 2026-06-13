/**
 * Alliance GYM - Módulo de Autenticación y Sesiones
 * Gestiona el registro, inicio de sesión, sesiones activas y compras de membresías con localStorage.
 */

(function () {
    const STORAGE_USERS_KEY = 'alliance_gym_users';
    const STORAGE_SESSION_KEY = 'alliance_gym_current_user';

    // Usuarios semilla (Mock Data inicial)
    const seedUsers = [
        {
            id: 'user_demo_1',
            name: 'Carlos Pérez',
            email: 'socio@alliance.com',
            password: 'socio123', // En producción se hashea, aquí es demostrativo
            role: 'client',
            membership: {
                active: true,
                planName: 'Plan Black',
                price: 599,
                startDate: '2026-06-01',
                endDate: '2026-07-01',
                status: 'active'
            },
            qrCode: 'ALLIANCE-CARLOS-BLACK-88',
            points: 750,
            paymentHistory: [
                { id: 'pay_001', date: '2026-06-01', amount: 599, description: 'Inscripción y Mensualidad - Plan Black', status: 'Aprobado' }
            ],
            appointments: [
                { id: 'app_001', date: '2026-06-15', time: '10:00', type: 'Evaluación Corporal', coach: 'Alex Ramírez', status: 'Programada' }
            ],
            pointsHistory: [
                { date: '2026-06-01', points: 500, description: 'Bono de bienvenida' },
                { date: '2026-06-05', points: 50, description: 'Asistencia al gimnasio' },
                { date: '2026-06-08', points: 50, description: 'Asistencia al gimnasio' },
                { date: '2026-06-10', points: 150, description: 'Completar reto semanal de plancha' }
            ]
        },
        {
            id: 'staff_demo_1',
            name: 'Lucía Fernández',
            email: 'staff@alliance.com',
            password: 'staff123',
            role: 'staff',
            staffRole: 'Recepcionista',
            permissions: ['check_in', 'view_reviews', 'view_appointments']
        },
        {
            id: 'staff_demo_2',
            name: 'Entrenador Alex',
            email: 'coach@alliance.com',
            password: 'coach123',
            role: 'staff',
            staffRole: 'Entrenador Principal',
            permissions: ['view_reviews', 'view_appointments']
        },
        {
            id: 'admin_demo_1',
            name: 'Eduardo Gómez',
            email: 'admin@alliance.com',
            password: 'admin123',
            role: 'staff',
            staffRole: 'Gerente General',
            permissions: ['Acceso Total', 'Gestión de Empleados', 'Reportes Financieros', 'Validar Códigos QR', 'Modificaciones Web']
        }
    ];

    // Inicializar usuarios si no existen
    function initUsers() {
        if (!localStorage.getItem(STORAGE_USERS_KEY)) {
            localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(seedUsers));
        } else {
            const users = JSON.parse(localStorage.getItem(STORAGE_USERS_KEY));
            if (!users.some(u => u.email === 'admin@alliance.com')) {
                users.push({
                    id: 'admin_demo_1',
                    name: 'Eduardo Gómez',
                    email: 'admin@alliance.com',
                    password: 'admin123',
                    role: 'staff',
                    staffRole: 'Gerente General',
                    permissions: ['Acceso Total', 'Gestión de Empleados', 'Reportes Financieros', 'Validar Códigos QR', 'Modificaciones Web']
                });
                localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
            }
        }
    }

    // Obtener todos los usuarios
    function getUsers() {
        initUsers();
        return JSON.parse(localStorage.getItem(STORAGE_USERS_KEY));
    }

    // Guardar lista de usuarios
    function saveUsers(users) {
        localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
    }

    // Registrar un nuevo usuario (cliente)
    function register(name, email, password) {
        const users = getUsers();
        
        // Verificar si el correo ya existe
        if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
            return { success: false, message: 'El correo electrónico ya está registrado.' };
        }

        const newUser = {
            id: 'user_' + Date.now(),
            name: name,
            email: email,
            password: password,
            role: 'client',
            membership: {
                active: false,
                planName: 'Ninguno',
                price: 0,
                startDate: '',
                endDate: '',
                status: 'inactive'
            },
            qrCode: '',
            points: 0,
            paymentHistory: [],
            appointments: [],
            pointsHistory: []
        };

        users.push(newUser);
        saveUsers(users);

        return { success: true, user: newUser };
    }

    // Iniciar sesión
    function login(email, password) {
        const users = getUsers();
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

        if (!user) {
            return { success: false, message: 'Correo o contraseña incorrectos.' };
        }

        // Guardar sesión activa
        localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(user));
        return { success: true, user: user };
    }

    // Cerrar sesión
    function logout() {
        localStorage.removeItem(STORAGE_SESSION_KEY);
    }

    // Obtener el usuario logueado actualmente
    function getCurrentUser() {
        const userStr = localStorage.getItem(STORAGE_SESSION_KEY);
        if (!userStr) return null;
        
        // Mantener sincronizado con los cambios en localStorage.users
        const sessionUser = JSON.parse(userStr);
        const users = getUsers();
        const latestUser = users.find(u => u.id === sessionUser.id);
        
        if (latestUser) {
            // Actualizar la sesión guardada con los datos más recientes
            localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(latestUser));
            return latestUser;
        }
        
        return sessionUser;
    }

    // Procesar pago y asignación de membresía
    function purchaseMembership(userId, planName, price, cardDetails) {
        const users = getUsers();
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex === -1) {
            return { success: false, message: 'Usuario no encontrado.' };
        }

        const user = users[userIndex];
        const today = new Date();
        const nextMonth = new Date();
        nextMonth.setDate(today.getDate() + 30);

        // Formatear fechas
        const formatDate = (d) => d.toISOString().split('T')[0];

        // Generar código QR único
        const randomHash = Math.floor(1000 + Math.random() * 9000);
        const planSlug = planName.replace(/\s+/g, '-').toUpperCase();
        const qrCodeStr = `ALLIANCE-${user.name.split(' ')[0].toUpperCase()}-${planSlug}-${randomHash}`;

        // Asignar membresía
        user.membership = {
            active: true,
            planName: planName,
            price: price,
            startDate: formatDate(today),
            endDate: formatDate(nextMonth),
            status: 'active'
        };
        user.qrCode = qrCodeStr;

        // Sumar puntos de bienvenida o compra (Plan VIP da 1.5x)
        let purchasedPoints = planName.includes('VIP') ? 1000 : (planName.includes('Black') ? 600 : 400);
        user.points = (user.points || 0) + purchasedPoints;
        
        if (!user.pointsHistory) user.pointsHistory = [];
        user.pointsHistory.unshift({
            date: formatDate(today),
            points: purchasedPoints,
            description: `Compra de membresía - ${planName}`
        });

        // Registrar pago en historial
        if (!user.paymentHistory) user.paymentHistory = [];
        user.paymentHistory.unshift({
            id: 'pay_' + Date.now(),
            date: formatDate(today),
            amount: price,
            description: `Inscripción y Mensualidad - ${planName}`,
            status: 'Aprobado'
        });

        // Guardar cambios
        users[userIndex] = user;
        saveUsers(users);

        // Actualizar sesión activa
        const currentUser = getCurrentUser();
        if (currentUser && currentUser.id === userId) {
            localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(user));
        }

        return { success: true, user: user };
    }

    // Exponer API global de autenticación
    window.AllianceAuth = {
        getUsers,
        register,
        login,
        logout,
        getCurrentUser,
        purchaseMembership,
        initUsers
    };

    // Inicializar al cargar el script
    initUsers();
})();
