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
            phone: '3001234567',
            // --- CAMBIO CLAVE PARA LA PERSISTENCIA ---
            // Cargar la URL guardada en localStorage si existe. Si no, usar la URL por defecto.
            avatarUrl: localStorage.getItem('userAvatarUrl') || 'https://i.pravatar.cc/150?u=carlos' 
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
    
    // NUEVO: Elementos de Avatar
    const userAvatarProfileEl = document.getElementById('user-avatar-profile');
    const avatarFileInput = document.getElementById('avatar-file-input');
    
    // NUEVO: Elementos de Referidos
    const referralLinkInput = document.getElementById('referral-link-input');
    const copyReferralLinkButton = document.getElementById('copy-referral-link');
    
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
    
    // NUEVO: Función para asignar avatar por defecto según el género (CAMBIO SOLICITADO)
    const getAvatarUrlByGender = (gender) => {
        // Usamos semillas determinísticas para avatares por defecto de pravatar.cc
        if (gender === 'female') {
            // Seed para avatar femenino
            return 'https://i.pravatar.cc/150?u=user_female_default_seed'; 
        }
        // Por defecto o si es 'male'
        return 'https://i.pravatar.cc/150?u=user_male_default_seed'; 
    };

    // --- MEJORA SOLICITADA: SUMATORIA DE GANANCIAS ---
    const simulateDailyEarnings = () => {
        const today = new Date().toDateString();
        // Solo simular si la última fecha no es hoy (para simular un ciclo de 24h)
        if (appState.lastEarningDate !== today) {
            let totalDailyEarning = 0;
            
            // 1. Sumar las ganancias diarias de todos los planes activos
            appState.activePlans.forEach(plan => {
                totalDailyEarning += plan.dailyROI;
            });

            if (totalDailyEarning > 0) {
                // 2. Reflejar la suma total en el balance
                appState.balance += totalDailyEarning;
                
                // 3. Registrar una sola transacción con la sumatoria total en el Historial
                logTransaction('Earning', totalDailyEarning, `Ganancia diaria total de ${appState.activePlans.length} plan(es)`);
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
        
        // NUEVO: Actualizar imagen de perfil usando appState.user.avatarUrl (que ya incluye el valor de localStorage)
        if (userAvatarProfileEl) {
            userAvatarProfileEl.src = appState.user.avatarUrl; 
        }

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
    // Llamar a updateUI aquí para que la foto se cargue desde el localStorage antes de cualquier navegación
    updateUI(); 

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
                    // NUEVO: Añadido para el cambio de foto de perfil
                    if (type === 'success' && window.location.hash === '#perfil' && modalMessage.textContent.includes('Foto de perfil')) {
                         // No navegar, solo ocultar modal
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
        // Se añade 'seguridad' y 'referidos' a la lista de hashes que necesitan el estilo flex-col
        const targetPageId = (hash.substring(1) || 'login') + '-page';
        pages.forEach(page => page.classList.add('hidden'));
        const targetPage = document.getElementById(targetPageId);
        if (targetPage) {
            targetPage.classList.remove('hidden');
            if (['login-page', 'registro-page', 'recuperar-page', 'depositar-page', 'retirar-page', 'editar-perfil-page', 'historial-page', 'seguridad-page', 'referidos-page'].includes(targetPageId) || targetPage.classList.contains('flex-col')) {
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
                <a href="#planes" class="nav-link flex flex-col items-center text-gray-500 dark:text-gray-400 p-2"><span class="material-symbols-outlined">handshake</span><span class="text-xs">Planes</span></a>
                <a href="#depositar" class="nav-link flex flex-col items-center text-gray-500 dark:text-gray-400 p-2"><span class="material-symbols-outlined">account_balance_wallet</span><span class="text-xs">Depositar</span></a>
                <a href="#retirar" class="nav-link flex flex-col items-center text-gray-500 dark:text-gray-400 p-2"><span class="material-symbols-outlined">payments</span><span class="text-xs">Retirar</span></a>
                <a href="#perfil" class="nav-link flex flex-col items-center text-gray-500 dark:text-gray-400 p-2"><span class="material-symbols-outlined">person</span><span class="text-xs">Perfil</span></a>
            </div>
        `;
        document.querySelector('.app-nav').innerHTML = navHTML;
    };
    
    const updateNav = (currentHash) => {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === currentHash) {
                link.classList.add('active');
            }
        });
    };

    // Inicializar navegación y escuchar cambios de hash
    createNav();
    window.addEventListener('hashchange', () => navigateTo(window.location.hash));
    navigateTo(window.location.hash); 


    // --- MANEJADORES DE FORMULARIOS Y EVENTOS ---

    // Manejador de Login (Simulado)
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = loginEmailInput.value;
        const password = loginPasswordInput.value;

        if (email === 'prueba@correo.com' && password === '12345') {
            showModal('loading', 'Iniciando sesión...');
            
            // Simulación de carga de datos de usuario (Mantener el avatar si ya está en localStorage)
            setTimeout(() => {
                appState.user.name = 'Carlos López';
                appState.user.email = 'prueba@correo.com';
                appState.user.phone = '3001234567';
                appState.balance = 150000;
                appState.transactions = [
                    { id: 1, date: "25/10/2025, 10:30", type: "Deposit", amount: 100000, description: "Depósito inicial" },
                    { id: 2, date: "26/10/2025, 12:00", type: "Purchase", amount: 30000, description: "Compra Plan Principiante" },
                    { id: 3, date: "27/10/2025, 18:00", type: "Earning", amount: 1050, description: "Ganancia diaria total de 1 plan(es)" },
                ];
                appState.activePlans = [{
                    price: 30000,
                    name: 'Principiante',
                    machineName: 'Máquina de Snacks I',
                    dailyROI: 1050,
                    minWithdrawal: 15000,
                    purchaseDate: '26/10/2025',
                    endDate: '03/02/2026' // 100 días después
                }];

                updateUI();
                hideModal();
                showModal('success', '¡Bienvenido de nuevo!');
                window.location.hash = '#dashboard';
            }, 1000); 

        } else {
             showModal('error', 'Credenciales incorrectas.');
        }
    });

    // --- MANEJADOR DEL FORMULARIO DE REGISTRO (CAMBIO SOLICITADO) ---
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Muestra modal de carga
            showModal('loading', 'Registrando nuevo usuario...');

            // Obtener valores del formulario de registro usando los IDs que añadimos en index.html
            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const phone = document.getElementById('register-phone').value;
            const password = document.getElementById('register-password').value; 
            // Obtener el género seleccionado
            const selectedGenderEl = document.querySelector('input[name="gender"]:checked');
            const gender = selectedGenderEl ? selectedGenderEl.value : 'male'; 

            // Simulación de registro exitoso después de un pequeño retraso
            setTimeout(() => {
                // 1. ASIGNAR AVATAR SEGÚN GÉNERO
                const defaultAvatar = getAvatarUrlByGender(gender);
                localStorage.setItem('userAvatarUrl', defaultAvatar); 
                
                // 2. ACTUALIZAR ESTADO DE LA APLICACIÓN
                appState.user.name = name;
                appState.user.email = email;
                appState.user.phone = phone;
                appState.user.avatarUrl = defaultAvatar;
                
                // Resetear el estado de inversión para el nuevo usuario
                appState.balance = 0;
                appState.activePlans = [];
                appState.transactions = [];
                appState.lastEarningDate = new Date().toDateString();

                // 3. Feedback y navegación
                updateUI(); 
                registerForm.reset();
                hideModal(); // Oculta el modal de carga
                showModal('success', `¡Registro exitoso! Bienvenido(a) ${name}.`); // Muestra modal de éxito
                window.location.hash = '#dashboard';
            }, 1000); // Simula un retraso de 1 segundo para la "operación" de registro
        });
    }

    // Manejador de Recuperar Contraseña (Simulado)
    recoverForm.addEventListener('submit', (e) => {
        e.preventDefault();
        showModal('loading', 'Enviando enlace...');
        setTimeout(() => {
            recoverForm.reset();
            showModal('success', '¡Enlace de recuperación enviado a su correo!');
        }, 1500);
    });

    // Manejador de Depositar Fondos (Simulado)
    depositForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const amount = parseInt(depositAmountInput.value);
        const receipt = document.getElementById('deposit-receipt').files[0];

        if (amount < 10000) {
             showModal('error', 'El monto mínimo de depósito es $10.000');
             return;
        }

        if (!receipt) {
             showModal('error', 'Debe adjuntar el comprobante de pago.');
             return;
        }

        showModal('loading', 'Confirmando depósito...');
        
        // Simulación de procesamiento de depósito
        setTimeout(() => {
            // Asumiendo que el depósito es aprobado inmediatamente
            appState.balance += amount;
            logTransaction('Deposit', amount, 'Depósito de fondos');
            updateUI();
            depositForm.reset();
            hideModal();
            showModal('success', `¡Depósito de ${formatCurrency(amount)} confirmado con éxito!`);
            // La navegación al dashboard ocurre dentro de showModal en caso de éxito
        }, 2000); 
    });
    
     // Manejador de Retirar Fondos (Simulado)
    withdrawForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const amount = parseInt(withdrawAmountInput.value);
        let minWithdrawal = 10000;
        if (appState.activePlans.length > 0) {
            minWithdrawal = Math.max(...appState.activePlans.map(plan => plan.minWithdrawal));
        }

        if (amount < minWithdrawal) {
             showModal('error', `El monto mínimo de retiro es ${formatCurrency(minWithdrawal)}.`);
             return;
        }
        
         if (amount > appState.balance) {
             showModal('error', 'Saldo insuficiente para realizar el retiro.');
             return;
        }

        showModal('loading', 'Procesando retiro...');
        
        // Simulación de procesamiento de retiro
        setTimeout(() => {
            // Simulación de que el retiro es aprobado
            appState.balance -= amount;
            logTransaction('Withdrawal', amount, 'Solicitud de retiro');
            updateUI();
            withdrawForm.reset();
            hideModal();
            showModal('success', `¡Retiro de ${formatCurrency(amount)} solicitado! Recibirás el pago en Nequi pronto.`);
            // La navegación al dashboard ocurre dentro de showModal en caso de éxito
        }, 2000); 
    });

    // Manejador de Compra de Plan (Simulado)
    plansContainer.addEventListener('click', (e) => {
        const button = e.target.closest('.buy-plan-btn');
        if (!button) return;

        const price = parseInt(button.dataset.price);
        const name = button.dataset.name;
        const machineName = button.dataset.machineName;
        const dailyRoi = parseInt(button.dataset.dailyRoi);
        const minWithdrawal = parseInt(button.dataset.minWithdrawal);

        if (appState.balance < price) {
            showModal('error', `Saldo insuficiente. Necesitas ${formatCurrency(price)} para comprar el plan ${name}.`);
            return;
        }
        
        showModal('loading', `Comprando plan ${name}...`);

        setTimeout(() => {
            // Proceso de compra exitoso
            appState.balance -= price;
            
            const newPlan = {
                price: price,
                name: name,
                machineName: machineName,
                dailyROI: dailyRoi,
                minWithdrawal: minWithdrawal,
                purchaseDate: new Date().toLocaleDateString('es-CO'),
                // No se incluye endDate por simplicidad en la simulación
            };
            appState.activePlans.push(newPlan);
            logTransaction('Purchase', price, `Compra de plan ${name}`);
            
            updateUI();
            hideModal();
            showModal('success', `¡Felicidades! Has comprado el plan ${name}.`);
            window.location.hash = '#dashboard';
        }, 1000);
    });
    
    // Manejador para Editar Perfil (Simulado)
    editProfileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const newName = document.getElementById('edit-name').value;
        const newEmail = document.getElementById('edit-email').value;
        const newPhone = document.getElementById('edit-phone').value;
        
        showModal('loading', 'Guardando cambios...');

        setTimeout(() => {
            appState.user.name = newName;
            appState.user.email = newEmail;
            appState.user.phone = newPhone;
            
            updateUI();
            editProfileForm.reset();
            hideModal();
            showModal('success', 'Información actualizada con éxito.');
            window.location.hash = '#perfil';
        }, 1000);
    });

    // Manejador para Cambiar Contraseña (Simulado)
    changePasswordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmNewPassword = document.getElementById('confirm-new-password').value;

        if (currentPassword !== '12345') { // Simulación de validación
             showModal('error', 'Contraseña actual incorrecta.');
             return;
        }

        if (newPassword.length < 5) {
             showModal('error', 'La nueva contraseña debe tener al menos 5 caracteres.');
             return;
        }
        
        if (newPassword !== confirmNewPassword) {
             showModal('error', 'La nueva contraseña y la confirmación no coinciden.');
             return;
        }
        
        showModal('loading', 'Cambiando contraseña...');

        setTimeout(() => {
            // En un sistema real, aquí se actualizaría la contraseña del usuario
            changePasswordForm.reset();
            hideModal();
            showModal('success', 'Contraseña cambiada con éxito.');
            // La navegación se maneja dentro de showModal
        }, 1000);
    });

    // Manejador para cambiar la foto de perfil (Simulado)
    avatarFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            showModal('loading', 'Subiendo foto de perfil...');
            const reader = new FileReader();
            reader.onload = function(e) {
                // Simulación de carga y guardado
                setTimeout(() => {
                    const newAvatarUrl = e.target.result;
                    localStorage.setItem('userAvatarUrl', newAvatarUrl);
                    appState.user.avatarUrl = newAvatarUrl;
                    updateUI(); 
                    hideModal();
                    showModal('success', 'Foto de perfil actualizada con éxito.');
                }, 1000);
            };
            reader.readAsDataURL(file);
        }
    });

    if (copyReferralLinkButton && referralLinkInput) {
        copyReferralLinkButton.addEventListener('click', () => {
             // Intenta usar la API moderna de portapapeles
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(referralLinkInput.value).then(() => {
                    showModal('success', '¡Enlace copiado al portapapeles!');
                }).catch(err => {
                    // Fallback para navegadores antiguos o si hay error de permiso
                    referralLinkInput.select();
                    document.execCommand('copy');
                    showModal('success', '¡Enlace copiado al portapapeles! (Método de respaldo)');
                });
            } else {
                 // Fallback completo
                referralLinkInput.select();
                document.execCommand('copy');
                showModal('success', '¡Enlace copiado al portapapeles! (Método de respaldo)');
            }
        });
    }

    logoutButton.addEventListener('click', () => {
        loginEmailInput.value = '';
        loginPasswordInput.value = '';
        appState.balance = 0;
        appState.activePlans = [];
        appState.transactions = []; // Limpiar historial al cerrar sesión
        // Opcional: limpiar el avatar guardado al cerrar sesión
        localStorage.removeItem('userAvatarUrl');
        appState.user.avatarUrl = 'https://i.pravatar.cc/150?u=carlos'; // Restaurar por defecto
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

