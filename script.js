document.addEventListener('DOMContentLoaded', () => {
    // --- ESTADO DE LA APLICACIÓN ---
    let appState = {
        balance: 0,
        activePlans: [], // Ahora es un array para almacenar múltiples planes
        transactions: [], // NUEVO: Array para guardar el historial de movimientos
        lastEarningDate: new Date().toDateString(), // NUEVO: Para simular ganancias diarias (simula 1 ciclo de 24h)
        user: {
            name: 'Carlos López',
            email: 'carlos.lopez@email.com',
            phone: '3001234567'
        }
    };

    // --- ELEMENTOS DEL DOM ---
    const pages = document.querySelectorAll('.page');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const recoverForm = document.getElementById('recover-form');
    const depositForm = document.getElementById('deposit-form');
    const withdrawForm = document.getElementById('withdraw-form');
    const logoutButton = document.getElementById('logout-button');
    const loginEmailInput = document.getElementById('login-email');
    const loginPasswordInput = document.getElementById('login-password');
    const editProfileForm = document.getElementById('edit-profile-form');
    const changePasswordForm = document.getElementById('change-password-form'); // NUEVO
    const plansContainer = document.getElementById('plans-container');
    const activePlansContainer = document.getElementById('active-plans-container');
    const noActivePlansMsg = document.getElementById('no-active-plans-msg');
    const historyList = document.getElementById('history-list'); 

    // Elementos de la UI que necesitan actualización
    const totalBalanceEl = document.getElementById('total-balance');
    const userNameHeaderEl = document.getElementById('user-name-header');
    const userNameProfileEl = document.getElementById('user-name-profile');
    const userEmailProfileEl = document.getElementById('user-email-profile');
    const userNequiNumberEl = document.getElementById('user-nequi-number');
    const minWithdrawalDisplayEl = document.getElementById('min-withdrawal-display');
    const withdrawAmountInput = document.getElementById('withdraw-amount');
    const depositAmountInput = document.getElementById('deposit-amount');
    
    // --- ELEMENTOS DEL MODAL ---
    const modal = document.getElementById('notification-modal');
    const modalCard = document.getElementById('modal-card');
    const modalIcon = document.getElementById('modal-icon');
    const modalMessage = document.getElementById('modal-message');

    // --- FUNCIONES AUXILIARES ---
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0
        }).format(value);
    };
    
    // NUEVO: Función para registrar transacciones
    const logTransaction = (type, amount, description) => {
        appState.transactions.unshift({ // Añadir al principio para que el más reciente esté arriba
            id: Date.now(),
            date: new Date().toLocaleString('es-CO', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
            type: type, // 'Deposit', 'Withdrawal', 'Purchase', 'Earning'
            amount: amount,
            description: description
        });
    };
    
    // NUEVO: Función para simular ganancias diarias (se ejecuta solo una vez al día simulado)
    const simulateDailyEarnings = () => {
        const today = new Date().toDateString();
        // Solo simular si la última fecha no es hoy (para simular un ciclo de 24h)
        if (appState.lastEarningDate !== today) {
            let totalDailyEarning = 0;
            appState.activePlans.forEach(plan => {
                // Log de ganancia por plan
                logTransaction('Earning', plan.dailyROI, `Ganancia diaria por ${plan.machineName}`);
                totalDailyEarning += plan.dailyROI;
            });

            if (totalDailyEarning > 0) {
                appState.balance += totalDailyEarning;
            }
            appState.lastEarningDate = today; // Actualizar la fecha de la última ganancia simulada
        }
    };

    const renderActivePlans = () => {
        // Limpiar contenedor
        activePlansContainer.innerHTML = '';

        if (appState.activePlans.length === 0) {
            activePlansContainer.innerHTML = `<p id="no-active-plans-msg" class="text-center text-gray-500 dark:text-gray-400 py-4">No tienes planes activos.</p>`;
        } else {
            appState.activePlans.forEach(plan => {
                const planCardHTML = `
                    <div class="bg-gray-200 dark:bg-gray-800 rounded-lg p-4 flex justify-between items-center">
                        <div>
                            <p class="font-bold text-base">${plan.machineName}</p>
                            <p class="text-sm text-gray-600 dark:text-gray-400">${formatCurrency(plan.price)} - Comprado: ${plan.purchaseDate}</p>
                        </div>
                        <div class="text-right">
                            <p class="font-bold text-green-500 text-base">+${formatCurrency(plan.dailyROI)}</p>
                            <p class="text-xs text-gray-500">Ganancia Diaria</p>
                        </div>
                    </div>
                `;
                activePlansContainer.innerHTML += planCardHTML;
            });
        }
    };
    
    // NUEVO: Función para renderizar el historial de transacciones
    const renderHistory = () => {
        if (!historyList) return; 

        historyList.innerHTML = '';
        if (appState.transactions.length === 0) {
            historyList.innerHTML = `<p class="text-center text-gray-500 dark:text-gray-400 py-8">Aún no hay movimientos registrados.</p>`;
            return;
        }

        appState.transactions.forEach(tx => {
            let icon, colorClass, sign;

            switch (tx.type) {
                case 'Deposit':
                    icon = 'south';
                    colorClass = 'text-green-500';
                    sign = '+';
                    break;
                case 'Earning':
                    icon = 'trending_up';
                    colorClass = 'text-green-400';
                    sign = '+';
                    break;
                case 'Withdrawal':
                    icon = 'north';
                    colorClass = 'text-red-500';
                    sign = '-';
                    break;
                case 'Purchase':
                    icon = 'shopping_cart';
                    colorClass = 'text-cyan-500';
                    sign = '-';
                    break;
                default:
                    icon = 'sync';
                    colorClass = 'text-gray-500';
                    sign = '';
            }

            const txHTML = `
                <div class="flex items-center space-x-4 p-4 border-b dark:border-gray-700">
                    <span class="material-symbols-outlined ${colorClass} text-2xl">${icon}</span>
                    <div class="flex-1">
                        <p class="font-semibold">${tx.description}</p>
                        <p class="text-xs text-gray-500">${tx.date}</p>
                    </div>
                    <div class="text-right">
                        <p class="font-bold ${colorClass}">${sign}${formatCurrency(tx.amount)}</p>
                        <p class="text-xs text-gray-500">${tx.type}</p>
                    </div>
                </div>
            `;
            historyList.innerHTML += txHTML;
        });
    };

    const updateUI = () => {
        // Simular ganancias diarias *antes* de actualizar el balance
        simulateDailyEarnings(); 

        // Actualizar balance
        totalBalanceEl.textContent = formatCurrency(appState.balance);

        // Actualizar datos de usuario en la UI
        userNameHeaderEl.textContent = appState.user.name;
        userNameProfileEl.textContent = appState.user.name;
        userEmailProfileEl.textContent = appState.user.email;
        userNequiNumberEl.textContent = `+57 ${appState.user.phone}`;

        // Actualizar mínimo de retiro basado en el plan de mayor valor
        let minWithdrawal = 10000;
        if (appState.activePlans.length > 0) {
            // Encontrar el minWithdrawal más alto entre los planes activos
            minWithdrawal = Math.max(...appState.activePlans.map(plan => plan.minWithdrawal));
        }
        minWithdrawalDisplayEl.textContent = formatCurrency(minWithdrawal);
        withdrawAmountInput.min = minWithdrawal;
        
        // Renderizar los planes activos en el dashboard
        renderActivePlans();
    };
    
    // --- ESTADO INICIAL ---
    if (localStorage.getItem('theme') === 'dark') {
        document.documentElement.classList.add('dark');
        darkModeToggle.checked = true;
    }

    // --- FUNCIÓN DEL MODAL ---
    const showModal = (type, message) => {
        if (type === 'success') {
            modalIcon.innerHTML = `<span class="material-symbols-outlined text-6xl text-green-500">check_circle</span>`;
        } else if (type === 'error') {
            modalIcon.innerHTML = `<span class="material-symbols-outlined text-6xl text-red-500">cancel</span>`;
        } else if (type === 'loading') {
            modalIcon.innerHTML = `<div class="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-cyan-500 mx-auto"></div>`;
        }
        modalMessage.textContent = message;

        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.add('opacity-100');
            modalCard.classList.remove('scale-95');
        }, 10); 

        if (type !== 'loading') {
            setTimeout(() => {
                modal.classList.remove('opacity-100');
                modalCard.classList.add('scale-95');
                setTimeout(() => {
                    modal.classList.add('hidden');
                    // Se elimina la lógica de navegación general, ahora solo se usa en login y en depósitos/retiros exitosos
                    // para permitir que el login maneje su propia navegación después del éxito.
                    if (type === 'success' && (window.location.hash === '#depositar' || window.location.hash === '#retirar')) {
                        window.location.hash = '#dashboard';
                    }
                     // Añadido para el cambio de contraseña
                    if (type === 'success' && window.location.hash === '#seguridad') {
                        window.location.hash = '#perfil';
                    }
                }, 300); 
            }, 1500);
        }
    };
    
    const hideModal = () => {
        modal.classList.remove('opacity-100');
        modalCard.classList.add('scale-95');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    };

    // --- LÓGICA DE NAVEGACIÓN ---
    const navigateTo = (hash) => {
        // Se añade 'seguridad' a la lista de hashes que necesitan el estilo flex-col
        const targetPageId = (hash.substring(1) || 'login') + '-page';
        pages.forEach(page => page.classList.add('hidden'));
        const targetPage = document.getElementById(targetPageId);
        if (targetPage) {
            targetPage.classList.remove('hidden');
            if (['login-page', 'registro-page', 'recuperar-page', 'depositar-page', 'retirar-page', 'editar-perfil-page', 'historial-page', 'seguridad-page'].includes(targetPageId) || targetPage.classList.contains('flex-col')) { 
                 targetPage.classList.add('flex');
            }
        }
        
        // NUEVO: Cargar el historial si vamos a la página de historial
        if (hash === '#historial') {
            renderHistory();
        }

        updateNav(hash);
    };

    // --- MENÚ DE NAVEGACIÓN ---
    const createNav = () => {
        const navHTML = `
            <div class="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 flex justify-around p-2">
                <a href="#dashboard" class="nav-link flex flex-col items-center text-gray-500 dark:text-gray-400 p-2"><span class="material-symbols-outlined">home</span><span class="text-xs">Inicio</span></a>
                <a href="#planes" class="nav-link flex flex-col items-center text-gray-500 dark:text-gray-400 p-2"><span class="material-symbols-outlined">analytics</span><span class="text-xs">Planes</span></a>
                <a href="#perfil" class="nav-link flex flex-col items-center text-gray-500 dark:text-gray-400 p-2"><span class="material-symbols-outlined">person</span><span class="text-xs">Perfil</span></a>
            </div>`;
        document.querySelectorAll('.app-nav').forEach(nav => { nav.innerHTML = navHTML; });
    };

    const updateNav = (hash) => {
        // Se añade 'seguridad' para que el nav no se marque en esa página
        const authPages = ['', '#login', '#registro', '#recuperar', '#depositar', '#retirar', '#editar-perfil', '#historial', '#seguridad'];
        const activeHash = authPages.includes(hash) ? '#dashboard' : hash;
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === activeHash) { link.classList.add('active'); }
        });
    };
    
    createNav();
    window.addEventListener('hashchange', () => navigateTo(window.location.hash));
    navigateTo(window.location.hash || '#login');

    // --- LÓGICA DE AUTENTICACIÓN Y FORMULARIOS ---
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = loginEmailInput.value;
        const password = loginPasswordInput.value;
        
        showModal('loading', 'Verificando credenciales...');

        setTimeout(() => {
            hideModal(); // Ocultar el modal de carga
            if (email === 'prueba@correo.com' && password === '12345') {
                showModal('success', '¡Inicio de sesión exitoso!');
                updateUI();
                // Navegar al dashboard inmediatamente después del éxito
                setTimeout(() => { 
                    window.location.hash = '#dashboard';
                }, 300); // Pequeño retraso para que el usuario vea el modal de éxito
            } else {
                showModal('error', 'Correo o contraseña incorrectos.');
            }
        }, 1000); // Se mantiene este setTimeout para simular el tiempo de respuesta del servidor (1 segundo).
    });
    
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        showModal('success', '¡Registro completado!');
        setTimeout(() => { window.location.hash = '#login'; }, 1500);
    });
    
    recoverForm.addEventListener('submit', (e) => {
        e.preventDefault();
        showModal('success', 'Enlace de recuperación enviado.');
         setTimeout(() => { window.location.hash = '#login'; }, 1500);
    });
    
    // Manejador del NUEVO formulario de cambio de contraseña
    if (changePasswordForm) {
         changePasswordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const currentPass = document.getElementById('current-password').value;
            const newPass = document.getElementById('new-password').value;
            const confirmPass = document.getElementById('confirm-password').value;
            
            // Simulación de validación
            if (newPass !== confirmPass) {
                showModal('error', 'La nueva contraseña y la confirmación no coinciden.');
                return;
            }
            if (newPass.length < 5) {
                showModal('error', 'La nueva contraseña debe tener al menos 5 caracteres.');
                return;
            }
            // Aquí se simularía la verificación de la contraseña actual con el backend
            if (currentPass !== '12345') { 
                showModal('error', 'Contraseña actual incorrecta.');
                return;
            }

            // Simulación de éxito
            showModal('loading', 'Cambiando contraseña...');
            setTimeout(() => {
                // En una app real, aquí se actualizaría la contraseña en el servidor
                showModal('success', 'Contraseña actualizada con éxito.');
                changePasswordForm.reset();
            }, 1500);
        });
    }
    
    // --- LÓGICA FINANCIERA ---
    depositForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const amount = parseFloat(depositAmountInput.value);
        if (isNaN(amount) || amount <= 0) {
            showModal('error', 'Por favor, ingresa un monto válido.');
            return;
        }
        appState.balance += amount;
        logTransaction('Deposit', amount, 'Depósito confirmado vía Nequi'); // NUEVO: Log de depósito
        updateUI();
        showModal('success', 'Depósito confirmado. El saldo ha sido actualizado.');
        depositForm.reset();
    });
    
    withdrawForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const amount = parseFloat(withdrawAmountInput.value);
        let minWithdrawal = 10000;
        if (appState.activePlans.length > 0) {
            minWithdrawal = Math.max(...appState.activePlans.map(p => p.minWithdrawal));
        }

        if (isNaN(amount) || amount <= 0) {
            showModal('error', 'Por favor, ingresa un monto válido.');
            return;
        }
        if (amount < minWithdrawal) {
             showModal('error', `El monto mínimo para retirar es ${formatCurrency(minWithdrawal)}.`);
             return;
        }
        if (amount > appState.balance) {
            showModal('error', 'No tienes saldo suficiente para este retiro.');
            return;
        }
        appState.balance -= amount;
        logTransaction('Withdrawal', amount, 'Retiro solicitado a Nequi'); // NUEVO: Log de retiro
        updateUI();
        showModal('success', 'Retiro solicitado con éxito.');
        withdrawForm.reset();
    });

    plansContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('buy-plan-btn')) {
            const button = e.target;
            const newPlan = {
                price: parseFloat(button.dataset.price),
                name: button.dataset.name,
                machineName: button.dataset.machineName,
                dailyROI: parseFloat(button.dataset.dailyRoi),
                minWithdrawal: parseFloat(button.dataset.minWithdrawal),
                purchaseDate: new Date().toLocaleDateString('es-CO')
            };

            if (newPlan.price > appState.balance) {
                showModal('error', 'Saldo insuficiente para comprar este plan.');
                return;
            }

            appState.balance -= newPlan.price;
            appState.activePlans.push(newPlan);
            logTransaction('Purchase', newPlan.price, `Compra del plan ${newPlan.machineName}`); // NUEVO: Log de compra
            updateUI();
            showModal('success', `¡Plan ${newPlan.name} comprado con éxito!`);
        }
    });

    if (editProfileForm) {
        editProfileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showModal('success', 'Información actualizada con éxito.');
            setTimeout(() => { window.location.hash = '#perfil'; }, 1500);
        });
    }

    logoutButton.addEventListener('click', () => {
        loginEmailInput.value = '';
        loginPasswordInput.value = '';
        appState.balance = 0;
        appState.activePlans = [];
        appState.transactions = []; // Limpiar historial al cerrar sesión
        window.location.hash = '#login';
    });

    // --- MODO OSCURO ---
    darkModeToggle.addEventListener('change', () => {
        if (darkModeToggle.checked) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    });
});