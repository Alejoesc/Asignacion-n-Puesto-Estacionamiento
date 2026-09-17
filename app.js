document.addEventListener('DOMContentLoaded', () => {
    // Referencias DOM
    const loginScreen = document.getElementById('login-screen');
    const mainApp = document.getElementById('main-app');
    const userDisplay = document.getElementById('user-display');
    const dashboard = document.getElementById('dashboard');
    const searchInput = document.getElementById('search-input');
    const floorTabsContainer = document.getElementById('floor-tabs');
    const floorSelectorBox = document.getElementById('floor-selector-container');
    
    // Modales
    const modalGestion = document.getElementById('modal-gestion');
    const modalDir = document.getElementById('modal-dir');
    const modalUsuarios = document.getElementById('modal-usuarios');
    const modalNuevoPuesto = document.getElementById('modal-nuevo-puesto');
    const modalMovimientos = document.getElementById('modal-movimientos');
    const modalNotificaciones = document.getElementById('modal-notificaciones');

    // Base de Datos Local - MIGRACIÓN A V12 (Motor Vehicular Opcional Integrado)
    let bcvDepartamentos = JSON.parse(localStorage.getItem('bcvDepartamentosV10'));
    let asignaciones = JSON.parse(localStorage.getItem('bcvPuestosV12')); // <--- Nueva BD
    let sistemaUsuarios = JSON.parse(localStorage.getItem('bcvUsersV2'));
    let registroMovimientos = JSON.parse(localStorage.getItem('bcvMovimientosV1')) || [];
    let solicitudes = JSON.parse(localStorage.getItem('bcvSolicitudesV1')) || [];
    let notificaciones = JSON.parse(localStorage.getItem('bcvNotifsV1')) || [];
    let currentUser = null;
    let currentFloor = 'E1';

    // --- MIGRACIÓN SILENCIOSA DE DATOS VIEJOS ---
    if (!asignaciones) {
        const oldData = JSON.parse(localStorage.getItem('bcvPuestosV11'));
        if (oldData) {
            asignaciones = oldData;
        } else {
            asignaciones = { "E1": {}, "E2": {}, "E3": {}, "E4": {}, "E5": {}, "E6": {} };
            function pad(n) { return n.toString().padStart(3, '0'); }
            for(let i=1; i<=30; i++) { asignaciones["E1"][`E1-${pad(i)}`] = null; }
            for(let i=31; i<=157; i++) { asignaciones["E2"][`E2-${pad(i)}`] = null; }
            for(let i=158; i<=317; i++) { asignaciones["E3"][`E3-${pad(i)}`] = null; }
            for(let i=318; i<=488; i++) { asignaciones["E4"][`E4-${pad(i)}`] = null; }
            for(let i=489; i<=659; i++) { asignaciones["E5"][`E5-${pad(i)}`] = null; }
            for(let i=660; i<=807; i++) { asignaciones["E6"][`E6-${pad(i)}`] = null; }
        }
        guardarDatos();
    }

    // --- SISTEMA DE DIÁLOGOS PERSONALIZADOS ---
    function customDialog({ title, message, type = 'alert', inputType = 'text', icon = 'ℹ️' }) {
        return new Promise((resolve) => {
            const overlay = document.getElementById('dialog-overlay');
            const titleEl = document.getElementById('dialog-title');
            const msgEl = document.getElementById('dialog-message');
            const iconEl = document.getElementById('dialog-icon');
            const inputCont = document.getElementById('dialog-input-container');
            const inputEl = document.getElementById('dialog-input');
            const btnOk = document.getElementById('btn-dialog-ok');
            const btnCancel = document.getElementById('btn-dialog-cancel');

            titleEl.textContent = title;
            msgEl.innerHTML = message.replace(/\n/g, '<br>'); 
            iconEl.textContent = icon;

            inputCont.style.display = 'none';
            inputEl.value = '';
            btnCancel.style.display = 'none';

            if (type === 'confirm' || type === 'prompt') {
                btnCancel.style.display = 'inline-flex';
            }

            if (type === 'prompt') {
                inputCont.style.display = 'block';
                inputEl.type = inputType;
                setTimeout(() => inputEl.focus(), 100);
            }

            overlay.style.display = 'block';

            const cleanup = () => {
                overlay.style.display = 'none';
                btnOk.onclick = null;
                btnCancel.onclick = null;
            };

            btnOk.onclick = () => {
                cleanup();
                if (type === 'prompt') resolve(inputEl.value);
                else resolve(true);
            };

            btnCancel.onclick = () => {
                cleanup();
                resolve(type === 'prompt' ? null : false);
            };
        });
    }

    // --- INICIALIZACIÓN DE DATOS ---
    if (!sistemaUsuarios) {
        sistemaUsuarios = { "admin": { password: "admin", role: "admin", hasLogged: false } };
        localStorage.setItem('bcvUsersV2', JSON.stringify(sistemaUsuarios));
    }

    if (!bcvDepartamentos) {
        bcvDepartamentos = [
            "Directorio", "Presidencia", "Vicepresidencia de Auditoría Interna", "Gerencia de Auditorías", "Oficina de Control Fiscal", 
            "Gerencia de Seguimiento y Otras Actuaciones de Control", "Consultoría Jurídica", "Consultoría Jurídica Adjunta p/ Asuntos Estratégicos y de Riesgos", 
            "Consultoría Jurídica Adjunta p/ Asuntos Transaccionales", "Consultoría Jurídica Adjunta p/ Asuntos de Apoyo a la Gestión", "Asesoría de la Presidencia", 
            "Oficina de Planificación", "Oficina de Cumplimiento", "Oficina de Seguimiento y Control del Proceso Kimberley", "Gerencia de Comunicaciones Institucionales", 
            "Gerencia de Seguridad", "Gerencia de Sistemas e Informática", "Departamento de Ingeniería de Procesos", "Gerencia de Innovación y Tecnologías Aplicadas", 
            "Gerencia de Relaciones Internacionales", "Primera Vicepresidencia Gerencia", "Vicepresidencia de Estudios", "Oficina de Investigaciones Económicas", 
            "Oficina de Apoyo a la Cooperación y los Estudios", "Gerencia de Programación y Análisis Macroeconómico", "Gerencia de Estadísticas Económicas", 
            "Vicepresidencia de Operaciones Nacionales", "Unidad de Análisis del Mercado Financiero", "Gerencia de Operaciones Monetarias", "Gerencia de Tesorería", 
            "Vicepresidencia de Operaciones Internacionales", "Oficina de Estudios Internacionales", "Gerencia de Adm. de Reservas Internacionales", 
            "Gerencia de Obligaciones Internacionales", "Gerencia de Operaciones Cambiarias", "Gerencia General Casa de la Moneda", "Gerencia Técnica", 
            "Segunda Vicepresidencia Gerencia", "Vicepresidencia de Administración", "Gerencia de Finanzas", "Departamento de Presupuesto", "Departamento de Contabilidad", 
            "Departamento de Pagos y Tributos", "Unidad de Fideicomiso", "Gerencia de Servicios Administrativos", "Departamento de Compras y Suministros", 
            "Departamento de Documentación Correspondencia y Archivo", "División de Asistencia Técnica y Micrografía", "División de Correspondencia", 
            "División de Archivo Central", "Departamento de Otros Servicios", "División de Activos y Seguros", "División de Comedores", "División de Servicios Varios", 
            "Departamento de Operación y Mantenimiento Técnico", "División Administrativa", "División de Técnica de Mantenimiento", "División de Diseño y Apoyo a Oficinas", 
            "Gerencia de Recursos Humanos", "Oficina de Consultoría y Modelos del Factor Humano", "Oficina de Asistencia al Personal Ejecutivo", 
            "Departamento de Captación y Desarrollo del Factor Humano", "Departamento de Relaciones del Factor Humano", "Departamento de Beneficios Socioeconómicos", 
            "Departamento de Nómina y Egresos", "Centro de Educación Inicial BCV", "Gerencia Subsede Maracaibo", "Departamento de Operaciones", 
            "Departamento de Administración", "Departamento de Relaciones Institucionales", "Departamento de Recursos Humanos (Subsede Maracaibo)", 
            "Departamento de Seguridad y Salud en el Trabajo - Subsede Maracaibo", "Gerencia de Seguridad y Salud en el Trabajo", 
            "Departamento de Programación y Control de Seg. y Salud en el Trabajo", "Departamento de Prevención y Promoción de Seg. y Salud en el Trabajo", 
            "Departamento de Asistencia Médica y Emergencias", "Departamento de Administración del Servicio de Seg. y Salud en el Trabajo"
        ];
        localStorage.setItem('bcvDepartamentosV10', JSON.stringify(bcvDepartamentos));
    }

    // =========================================================================
    // MOTOR DE INTELIGENCIA: REORDENAMIENTO GLOBAL DINÁMICO
    // =========================================================================
    function recalcularNumeracion() {
        let todosLosPuestos = [];
        const pisosOrder = ['E1', 'E2', 'E3', 'E4', 'E5', 'E6'];

        pisosOrder.forEach(piso => {
            if(!asignaciones[piso]) return;
            const keys = Object.keys(asignaciones[piso]).sort((a, b) => {
                const numA = parseInt(a.split('-')[1] || 0, 10);
                const numB = parseInt(b.split('-')[1] || 0, 10);
                return numA - numB;
            });
            keys.forEach(key => {
                todosLosPuestos.push({ piso: piso, oldKey: key, data: asignaciones[piso][key] });
            });
        });

        let nuevasAsignaciones = { "E1": {}, "E2": {}, "E3": {}, "E4": {}, "E5": {}, "E6": {} };
        let mapaCambios = {}; 
        let contadorGlobal = 1;

        todosLosPuestos.forEach(puesto => {
            const numeroFormateado = contadorGlobal.toString().padStart(3, '0');
            const nuevaKey = `${puesto.piso}-${numeroFormateado}`;
            nuevasAsignaciones[puesto.piso][nuevaKey] = puesto.data;
            mapaCambios[puesto.oldKey] = nuevaKey;
            contadorGlobal++;
        });

        asignaciones = nuevasAsignaciones;
        guardarDatos();

        solicitudes.forEach(sol => {
            if (sol.estado === 'pendiente' && sol.puesto && mapaCambios[sol.puesto]) {
                sol.puesto = mapaCambios[sol.puesto]; 
            }
        });
        localStorage.setItem('bcvSolicitudesV1', JSON.stringify(solicitudes));
    }

    // --- FUNCIONES CORE ---
    function registrarMovimiento(accion, detalle) {
        const ahora = new Date();
        const fecha = ahora.toISOString().split('T')[0];
        const hora = ahora.toTimeString().split(' ')[0].substring(0, 5);
        registroMovimientos.push({ fecha, hora, usuario: currentUser ? currentUser.username : 'sistema', accion, detalle });
        localStorage.setItem('bcvMovimientosV1', JSON.stringify(registroMovimientos));
    }

    function enviarNotificacion(userTo, msj) {
        notificaciones.push({ id: Date.now(), to: userTo, msj: msj, leida: false, fecha: new Date().toLocaleString() });
        localStorage.setItem('bcvNotifsV1', JSON.stringify(notificaciones));
        actualizarCampanita();
    }

    function actualizarCampanita() {
        if (!currentUser) return;
        let sinLeer = 0;
        if (currentUser.role === 'admin') sinLeer += solicitudes.filter(s => s.estado === 'pendiente').length;
        sinLeer += notificaciones.filter(n => n.to === currentUser.username && !n.leida).length;
        const badge = document.getElementById('notif-badge');
        badge.style.display = sinLeer > 0 ? 'block' : 'none';
        badge.textContent = sinLeer;
    }

    // --- TEMA CLARO/OSCURO ---
    const themeBtnMain = document.getElementById('theme-toggle');
    const themeBtnLogin = document.getElementById('theme-toggle-login');
    function setIconTheme(isDark) {
        if(themeBtnMain) themeBtnMain.textContent = isDark ? '☀️ Claro' : '🌙 Oscuro';
        if(themeBtnLogin) themeBtnLogin.textContent = isDark ? '☀️ Claro' : '🌙 Oscuro';
    }
    if (localStorage.getItem('theme') === 'dark') { document.body.classList.add('dark-mode'); setIconTheme(true); }
    function toggleTheme() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        setIconTheme(isDark);
    }
    if(themeBtnMain) themeBtnMain.addEventListener('click', toggleTheme);
    if(themeBtnLogin) themeBtnLogin.addEventListener('click', toggleTheme);

    // --- AUTENTICACIÓN ---
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const userInput = document.getElementById('login-user').value.trim().toLowerCase();
        const pass = document.getElementById('login-pass').value;
        const errorMsg = document.getElementById('login-error');
        const userKey = Object.keys(sistemaUsuarios).find(k => k.toLowerCase() === userInput);

        if (userKey && sistemaUsuarios[userKey].password === pass) {
            let role = sistemaUsuarios[userKey].role;
            if (role === 'standard') role = 'lector'; 
            
            currentUser = { username: userKey, role: role };
            errorMsg.textContent = '';
            registrarMovimiento('Inicio de Sesión', 'Acceso al sistema concedido');
            iniciarSesion();
        } else {
            errorMsg.textContent = 'Credenciales inválidas. Verifique y reintente.';
        }
    });

    document.getElementById('btn-logout').addEventListener('click', () => {
        registrarMovimiento('Cierre de Sesión', 'Usuario cerró sesión');
        currentUser = null;
        document.body.className = '';
        if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark-mode');
        mainApp.style.display = 'none';
        loginScreen.style.display = 'flex';
        document.getElementById('login-form').reset();
    });

    function iniciarSesion() {
        loginScreen.style.display = 'none';
        mainApp.style.display = 'block';
        
        let roleName = "Lector";
        document.body.classList.remove('role-admin', 'role-analista', 'role-lector');
        
        if (currentUser.role === 'lector') {
            document.body.classList.add('role-lector');
            document.getElementById('aviso-lector').style.display = 'block';
            document.getElementById('aviso-lector').innerHTML = '⚠️ <b>Modo Lector:</b> El sistema está en modo Solo Lectura. No puedes editar la información.';
        } else if (currentUser.role === 'analista') {
            document.body.classList.add('role-analista');
            document.getElementById('aviso-lector').style.display = 'none';
            roleName = "Analista";
        } else {
            document.body.classList.add('role-admin');
            document.getElementById('aviso-lector').style.display = 'none';
            roleName = "Admin";
        }
        
        userDisplay.textContent = `${currentUser.username} (${roleName})`;
        
        if (!sistemaUsuarios[currentUser.username].hasLogged) {
            document.getElementById('modal-welcome').style.display = 'block';
            sistemaUsuarios[currentUser.username].hasLogged = true;
            localStorage.setItem('bcvUsersV2', JSON.stringify(sistemaUsuarios));
        }

        actualizarCampanita();
        renderTabs();
        renderDashboard();
    }

    document.getElementById('btn-close-welcome').addEventListener('click', () => { document.getElementById('modal-welcome').style.display = 'none'; });

    // --- RENDERIZADO POR PISOS ---
    function renderTabs() {
        floorTabsContainer.innerHTML = '';
        Object.keys(asignaciones).forEach(piso => {
            const btn = document.createElement('button');
            btn.className = `floor-tab ${piso === currentFloor ? 'active' : ''}`;
            btn.textContent = `Piso ${piso}`;
            btn.onclick = () => {
                currentFloor = piso;
                renderTabs();
                renderDashboard();
            };
            floorTabsContainer.appendChild(btn);
        });
    }

    function renderDashboard() {
        dashboard.innerHTML = '';
        const card = document.createElement('div');
        card.className = 'direccion-card';
        card.innerHTML = `
            <div class="dir-header">
                <h3>VISTA GENERAL - PISO ${currentFloor}</h3>
                <div class="dir-actions">
                    <button class="btn btn-sm btn-gold require-edit" onclick="window.abrirModalNuevoPuesto('${currentFloor}')">+ Añadir Puesto Extra</button>
                </div>
            </div>
        `;

        const grid = document.createElement('div');
        grid.className = 'puestos-grid';
        
        const puestosDelPiso = asignaciones[currentFloor];
        const keys = Object.keys(puestosDelPiso).sort((a,b) => a.localeCompare(b, undefined, {numeric: true}));

        for (const key of keys) {
            const data = puestosDelPiso[key];
            const isOcupado = data !== null;
            const puestoDiv = document.createElement('div');
            puestoDiv.className = `puesto ${isOcupado ? 'ocupado' : 'disponible'}`;
            
            // Añadimos marca y placa a la cadena de búsqueda invisible
            const searchData = `${currentFloor} ${key} ${isOcupado ? data.nombre + ' ' + data.departamento + ' ' + (data.marca||'') + ' ' + (data.placa||'') : 'disponible'}`.toLowerCase();
            puestoDiv.setAttribute('data-search', searchData);

            let tiempoHtml = '';
            let vehiculoHtml = '';

            if (isOcupado) {
                if (data.tipo === 'Fijo') tiempoHtml = `<div class="puesto-tiempo">Fijo</div>`;
                else if (data.tipo === 'Temporal') tiempoHtml = `<div class="puesto-tiempo">Temp (al ${formatearFecha(data.fin)})</div>`;
                else if (data.tipo === 'Por Horas') tiempoHtml = `<div class="puesto-tiempo">${data.horas}h (${formatearFecha(data.inicio)})</div>`;
                
                // Muestra la placa discretamente si está registrada
                if (data.placa) {
                    vehiculoHtml = `<div style="font-size: 0.65rem; color: var(--text-muted); margin-top: 5px; font-weight: bold; background: var(--bg-body); padding: 2px 8px; border-radius: 12px; border: 1px solid var(--border-color); display: inline-block;">🚗 ${data.placa}</div>`;
                }
            }

            puestoDiv.innerHTML = `
                <div class="estado-indicador"></div>
                <div class="puesto-numero">${key}</div>
                ${isOcupado ? `<div class="puesto-dept">${data.departamento}</div>` : ''}
                <div class="puesto-nombre">${isOcupado ? data.nombre : '<span>Libre</span>'}</div>
                ${vehiculoHtml}
                ${tiempoHtml}
            `;
            puestoDiv.addEventListener('click', () => abrirModalGestion(currentFloor, key, data));
            grid.appendChild(puestoDiv);
        }
        card.appendChild(grid);
        dashboard.appendChild(card);
    }

    // --- BUSCADOR MULTI-PISO ---
    searchInput.addEventListener('input', (e) => {
        const text = e.target.value.toLowerCase().trim();
        if (text === '') {
            floorSelectorBox.style.display = 'block';
            renderDashboard();
            return;
        }

        floorSelectorBox.style.display = 'none';
        dashboard.innerHTML = '';

        Object.keys(asignaciones).forEach(piso => {
            const card = document.createElement('div');
            card.className = 'direccion-card';
            card.innerHTML = `<div class="dir-header"><h3>Resultados en Piso ${piso}</h3></div>`;
            const grid = document.createElement('div');
            grid.className = 'puestos-grid';
            
            let hasVisiblePuesto = false;
            const puestosDelPiso = asignaciones[piso];
            const keys = Object.keys(puestosDelPiso).sort((a,b) => a.localeCompare(b, undefined, {numeric: true}));

            keys.forEach(key => {
                const data = puestosDelPiso[key];
                const isOcupado = data !== null;
                const searchString = `${piso} ${key} ${isOcupado ? data.nombre + ' ' + data.departamento + ' ' + (data.marca||'') + ' ' + (data.placa||'') : 'disponible'}`.toLowerCase();
                
                if (searchString.includes(text)) {
                    hasVisiblePuesto = true;
                    const puestoDiv = document.createElement('div');
                    puestoDiv.className = `puesto ${isOcupado ? 'ocupado' : 'disponible'}`;
                    
                    let tiempoHtml = '';
                    let vehiculoHtml = '';

                    if (isOcupado) {
                        if (data.tipo === 'Fijo') tiempoHtml = `<div class="puesto-tiempo">Fijo</div>`;
                        else if (data.tipo === 'Temporal') tiempoHtml = `<div class="puesto-tiempo">Temp (al ${formatearFecha(data.fin)})</div>`;
                        else if (data.tipo === 'Por Horas') tiempoHtml = `<div class="puesto-tiempo">${data.horas}h (${formatearFecha(data.inicio)})</div>`;
                        
                        if (data.placa) {
                            vehiculoHtml = `<div style="font-size: 0.65rem; color: var(--text-muted); margin-top: 5px; font-weight: bold; background: var(--bg-body); padding: 2px 8px; border-radius: 12px; border: 1px solid var(--border-color); display: inline-block;">🚗 ${data.placa}</div>`;
                        }
                    }

                    puestoDiv.innerHTML = `
                        <div class="estado-indicador"></div>
                        <div class="puesto-numero">${key}</div>
                        ${isOcupado ? `<div class="puesto-dept">${data.departamento}</div>` : ''}
                        <div class="puesto-nombre">${isOcupado ? data.nombre : '<span>Libre</span>'}</div>
                        ${vehiculoHtml}
                        ${tiempoHtml}
                    `;
                    puestoDiv.addEventListener('click', () => abrirModalGestion(piso, key, data));
                    grid.appendChild(puestoDiv);
                }
            });

            if (hasVisiblePuesto) {
                card.appendChild(grid);
                dashboard.appendChild(card);
            }
        });
    });

    // --- CREAR SOLICITUDES (Analistas) ---
    async function crearSolicitud(tipoAccion, piso, id) {
        const existePendiente = solicitudes.some(s => 
            s.estado === 'pendiente' && s.tipo === tipoAccion && s.puesto === id
        );

        if (existePendiente) {
            await customDialog({ title: 'Acción Denegada', message: `Ya existe una solicitud en proceso para el puesto ${id}.`, icon: '⛔' });
            return;
        }

        solicitudes.push({ id: Date.now(), tipo: tipoAccion, dir: piso, puesto: id, analista: currentUser.username, estado: 'pendiente' });
        localStorage.setItem('bcvSolicitudesV1', JSON.stringify(solicitudes));
        
        registrarMovimiento('Emisión de Solicitud', `El analista solicitó ${tipoAccion.replace('_', ' ')} en el puesto ${id}`);
        Object.keys(sistemaUsuarios).forEach(u => {
            if(sistemaUsuarios[u].role === 'admin') enviarNotificacion(u, `⚠️ Solicitud de <b>${tipoAccion.replace('_', ' ')}</b> en el puesto ${id} por ${currentUser.username}.`);
        });

        await customDialog({ title: 'Solicitud Enviada', message: 'Tu petición ha sido enviada a los administradores.', icon: '✅' });
    }

    // --- GESTIÓN DE PUESTOS ---
    function abrirModalGestion(piso, idPuesto, data) {
        document.getElementById('modal-title').textContent = `Expediente - ${idPuesto}`;
        document.getElementById('modal-piso-actual').value = piso;
        document.getElementById('modal-puesto-original').value = idPuesto;
        document.getElementById('modal-puesto-num').value = idPuesto;
        
        const depSelect = document.getElementById('modal-dir-select');
        depSelect.innerHTML = bcvDepartamentos.map(d => `<option value="${d}">${d}</option>`).join('');

        const isOcupado = data !== null;
        document.getElementById('modal-personal').value = isOcupado ? data.nombre : '';
        if(isOcupado && bcvDepartamentos.includes(data.departamento)) depSelect.value = data.departamento;
        
        // Novedad: Carga de Datos Vehiculares
        document.getElementById('modal-vehiculo-marca').value = (isOcupado && data.marca) ? data.marca : '';
        document.getElementById('modal-vehiculo-placa').value = (isOcupado && data.placa) ? data.placa : '';

        document.getElementById('modal-tipo').value = isOcupado ? data.tipo : 'Fijo';
        document.getElementById('modal-horas').value = (isOcupado && data.tipo === 'Por Horas') ? data.horas : '';
        document.getElementById('modal-fecha-inicio').value = isOcupado ? data.inicio : obtenerFechaHoy();
        document.getElementById('modal-fecha-fin').value = (isOcupado && data.tipo === 'Temporal') ? data.fin : '';
        toggleCamposExtras();

        const btnAsignar = document.getElementById('btn-asignar');
        const btnEgresar = document.getElementById('btn-egresar');
        const btnEliminar = document.getElementById('btn-eliminar-puesto');
        const estadoText = document.getElementById('estado-actual-text');

        if (currentUser.role === 'analista') {
            btnEgresar.textContent = "Solicitar Liberación";
            if (btnEliminar) btnEliminar.textContent = "Solicitar Eliminación Física";
        } else {
            btnEgresar.textContent = "Liberar Espacio";
            if (btnEliminar) btnEliminar.textContent = "Eliminar Puesto Física";
        }

        if (isOcupado) {
            estadoText.innerHTML = `Estado en Sistema: <span style="color: var(--danger);">OCUPADO</span>`;
            btnAsignar.textContent = "Actualizar Expediente";
            btnEgresar.style.display = "block";
        } else {
            estadoText.innerHTML = `Estado en Sistema: <span style="color: var(--success);">DISPONIBLE</span>`;
            btnAsignar.textContent = "Formalizar Asignación";
            btnEgresar.style.display = "none";
        }
        modalGestion.style.display = 'block';
    }

    const tipoSelect = document.getElementById('modal-tipo');
    tipoSelect.addEventListener('change', toggleCamposExtras);
    function toggleCamposExtras() {
        const tipo = tipoSelect.value;
        document.getElementById('group-fecha-fin').style.display = tipo === 'Temporal' ? 'block' : 'none';
        document.getElementById('group-horas').style.display = tipo === 'Por Horas' ? 'block' : 'none';
    }

    document.getElementById('assignment-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        if (currentUser.role === 'lector') return;

        const piso = document.getElementById('modal-piso-actual').value;
        const id = document.getElementById('modal-puesto-original').value;
        
        const nom = document.getElementById('modal-personal').value.trim();
        const dept = document.getElementById('modal-dir-select').value;
        
        // Recolección de Datos Vehiculares
        const marca = document.getElementById('modal-vehiculo-marca').value.trim();
        const placa = document.getElementById('modal-vehiculo-placa').value.trim().toUpperCase();

        const tipo = document.getElementById('modal-tipo').value;
        const horas = document.getElementById('modal-horas').value;
        const inicio = document.getElementById('modal-fecha-inicio').value;
        const fin = document.getElementById('modal-fecha-fin').value;

        let puestoData = null;
        if (nom) {
            if (tipo === 'Temporal' && !fin) return await customDialog({ title: 'Faltan Datos', message: 'Requiere fecha de culminación.', icon: '⚠️' });
            if (tipo === 'Por Horas' && !horas) return await customDialog({ title: 'Faltan Datos', message: 'Requiere especificar horas.', icon: '⚠️' });
            
            puestoData = { nombre: nom, departamento: dept, marca: marca, placa: placa, tipo: tipo, inicio: inicio, fin: fin, horas: horas };
        }

        asignaciones[piso][id] = puestoData;

        if (nom) registrarMovimiento('Asignación', `Puesto ${id} asignado a ${nom} (${dept})`);
        
        guardarDatos();
        modalGestion.style.display = 'none';
        renderDashboard();
    });

    document.getElementById('btn-egresar').addEventListener('click', async () => {
        if (currentUser.role === 'lector') return;
        const piso = document.getElementById('modal-piso-actual').value;
        const id = document.getElementById('modal-puesto-original').value;
        
        if (currentUser.role === 'analista') {
            const conf = await customDialog({ type: 'confirm', title: 'Solicitud', message: '¿Solicitar al administrador la LIBERACIÓN de este puesto?', icon: '🛡️' });
            if(conf) { await crearSolicitud('liberar_puesto', piso, id); modalGestion.style.display = 'none'; }
            return;
        }
        
        const conf = await customDialog({ type: 'confirm', title: 'Liberar', message: '¿Proceder a liberar el puesto y retirar al funcionario?', icon: '🔓' });
        if (conf) {
            registrarMovimiento('Liberación', `Puesto ${id} liberado.`);
            asignaciones[piso][id] = null;
            guardarDatos(); modalGestion.style.display = 'none'; renderDashboard();
        }
    });

    const btnEliminar = document.getElementById('btn-eliminar-puesto');
    if (btnEliminar) {
        btnEliminar.addEventListener('click', async () => {
            if (currentUser.role === 'lector') return;
            const piso = document.getElementById('modal-piso-actual').value;
            const id = document.getElementById('modal-puesto-original').value;
            
            if (currentUser.role === 'analista') {
                const conf = await customDialog({ type: 'confirm', title: 'Solicitud', message: '¿Solicitar la ELIMINACIÓN FÍSICA de este espacio del sistema?', icon: '🛡️' });
                if(conf) { await crearSolicitud('eliminar_puesto', piso, id); modalGestion.style.display = 'none'; }
                return;
            }

            const conf = await customDialog({ type: 'confirm', title: 'Peligro', message: 'Esta acción ELIMINARÁ permanentemente el espacio y reordenará los puestos. ¿Continuar?', icon: '🗑️' });
            if (conf) {
                registrarMovimiento('Baja de Puesto', `Puesto ${id} eliminado físicamente.`);
                delete asignaciones[piso][id];
                recalcularNumeracion(); 
                modalGestion.style.display = 'none'; 
                renderDashboard();
            }
        });
    }

    window.abrirModalNuevoPuesto = function(piso) {
        document.getElementById('nuevo-puesto-dir').value = piso;
        document.getElementById('nuevo-puesto-dir-display').value = `Piso ${piso}`;
        document.getElementById('nuevo-puesto-num').value = '';
        modalNuevoPuesto.style.display = 'block';
    }

    document.getElementById('form-nuevo-puesto').addEventListener('submit', async (e) => {
        e.preventDefault();
        const piso = document.getElementById('nuevo-puesto-dir').value;
        const nuevoNum = document.getElementById('nuevo-puesto-num').value.trim().toUpperCase();

        if (asignaciones[piso][nuevoNum] !== undefined) {
            return await customDialog({ title: 'Conflicto', message: `El puesto "${nuevoNum}" ya existe.`, icon: '❌' });
        }
        
        registrarMovimiento('Creación de Puesto', `Puesto Extra ${nuevoNum} añadido en ${piso}`);
        asignaciones[piso][nuevoNum] = null;
        recalcularNumeracion(); 
        modalNuevoPuesto.style.display = 'none'; 
        renderDashboard();
    });

    document.getElementById('btn-add-dir').addEventListener('click', () => modalDir.style.display = 'block');
    document.getElementById('dir-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const newDir = document.getElementById('new-dir-name').value.trim();
        if (newDir && !bcvDepartamentos.includes(newDir)) {
            registrarMovimiento('Creación de Unidad', `Registrado nuevo departamento: ${newDir}`);
            bcvDepartamentos.push(newDir);
            bcvDepartamentos.sort();
            localStorage.setItem('bcvDepartamentosV10', JSON.stringify(bcvDepartamentos));
            modalDir.style.display = 'none'; document.getElementById('dir-form').reset(); 
            await customDialog({ title: 'Éxito', message: 'Dirección añadida al organigrama general.', icon: '✅' });
        } else { 
            await customDialog({ title: 'Error', message: 'El departamento ya existe o el nombre es inválido.', icon: '❌' }); 
        }
    });

    // --- NOTIFICACIONES Y APROBACIONES ---
    document.getElementById('btn-notificaciones').addEventListener('click', () => {
        renderCentroNotificaciones();
        modalNotificaciones.style.display = 'block';
    });

    function renderCentroNotificaciones() {
        let html = '';

        if (currentUser.role === 'admin') {
            const pendientes = solicitudes.filter(s => s.estado === 'pendiente');
            html += `<h4 class="section-title">Solicitudes Pendientes de Aprobación</h4>`;
            html += `<ul class="solicitudes-list mb-0" style="margin-bottom: 2rem;">`;
            if (pendientes.length === 0) {
                html += `<li>No hay solicitudes pendientes de los analistas.</li>`;
            } else {
                pendientes.forEach(s => {
                    const accionNombre = s.tipo.replace('_', ' ').toUpperCase();
                    html += `<li>
                        <div>El analista <b style="color:var(--text-accent);">${s.analista}</b> solicita <b>${accionNombre}</b> para el puesto <b>${s.puesto}</b></div>
                        <div class="solicitud-actions">
                            <button class="btn btn-sm btn-blue" onclick="resolverSolicitud(${s.id}, 'aprobar')">Aprobar ✔️</button>
                            <button class="btn btn-sm btn-outline-danger" onclick="resolverSolicitud(${s.id}, 'rechazar')">Rechazar ❌</button>
                        </div>
                    </li>`;
                });
            }
            html += `</ul>`;
        }

        html += `<h4 class="section-title">Avisos Recientes</h4>`;
        html += `<ul class="notifs-list">`;
        const misNotifs = notificaciones.filter(n => n.to === currentUser.username).reverse();
        
        if (misNotifs.length === 0) {
            html += `<li>Bandeja de avisos vacía.</li>`;
        } else {
            misNotifs.forEach(n => {
                html += `<li>
                    <span class="notif-fecha">${n.fecha}</span>
                    <span>${n.msj}</span>
                </li>`;
                n.leida = true;
            });
            localStorage.setItem('bcvNotifsV1', JSON.stringify(notificaciones));
        }
        html += `</ul>`;

        document.getElementById('notificaciones-content').innerHTML = html;
        actualizarCampanita();
    }

    window.resolverSolicitud = function(idSolicitud, decision) {
        const sol = solicitudes.find(s => s.id === idSolicitud);
        if (!sol) return;

        if (decision === 'aprobar') {
            if (sol.tipo === 'eliminar_puesto' && asignaciones[sol.dir] && asignaciones[sol.dir][sol.puesto] !== undefined) {
                delete asignaciones[sol.dir][sol.puesto];
                recalcularNumeracion(); 
                registrarMovimiento('Baja Aprobada', `Puesto ${sol.puesto} eliminado (Sol. de ${sol.analista})`);
            } else if (sol.tipo === 'liberar_puesto' && asignaciones[sol.dir] && asignaciones[sol.dir][sol.puesto] !== undefined) {
                asignaciones[sol.dir][sol.puesto] = null;
                registrarMovimiento('Liberación Aprobada', `Puesto ${sol.puesto} liberado (Sol. de ${sol.analista})`);
            }
            enviarNotificacion(sol.analista, `✅ Tu solicitud para ${sol.tipo.replace('_', ' ')} en el puesto ${sol.puesto} fue APROBADA.`);
            renderDashboard();
        } else {
            enviarNotificacion(sol.analista, `❌ Tu solicitud para ${sol.tipo.replace('_', ' ')} en el puesto ${sol.puesto} fue RECHAZADA.`);
            registrarMovimiento('Solicitud Rechazada', `Admin rechazó solicitud de ${sol.tipo.replace('_', ' ')} para ${sol.puesto}`);
        }

        sol.estado = decision === 'aprobar' ? 'aprobada' : 'rechazada';
        localStorage.setItem('bcvSolicitudesV1', JSON.stringify(solicitudes));
        renderCentroNotificaciones(); 
    }

    // --- AUDITORÍA (PDF y Tabla) ---
    const filtroFechaMov = document.getElementById('filtro-fecha-movimientos');
    const listaMovimientos = document.getElementById('lista-movimientos');

    document.getElementById('btn-movimientos').addEventListener('click', () => {
        filtroFechaMov.value = obtenerFechaHoy();
        renderListaMovimientos();
        modalMovimientos.style.display = 'block';
    });

    filtroFechaMov.addEventListener('change', renderListaMovimientos);

    function renderListaMovimientos() {
        const fecha = filtroFechaMov.value;
        const filtrados = registroMovimientos.filter(m => m.fecha === fecha).reverse();
        listaMovimientos.innerHTML = '';
        if (filtrados.length === 0) {
            listaMovimientos.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 25px; color: var(--text-muted);">Sin registros de auditoría para la fecha seleccionada.</td></tr>`;
            return;
        }
        filtrados.forEach(m => {
            listaMovimientos.innerHTML += `
                <tr>
                    <td style="font-weight:700; color:var(--text-accent);">${m.hora}</td>
                    <td><span class="badge-role badge-std">${m.usuario}</span></td>
                    <td style="font-weight:600;">${m.accion}</td>
                    <td>${m.detalle}</td>
                </tr>
            `;
        });
    }

    document.getElementById('btn-pdf-movimientos').addEventListener('click', async () => {
        const fecha = filtroFechaMov.value;
        const filtrados = registroMovimientos.filter(m => m.fecha === fecha).reverse();
        if (filtrados.length === 0) return await customDialog({ title: 'Aviso', message: 'No hay datos para exportar en esta fecha.', icon: 'ℹ️' });

        const printDiv = document.createElement('div');
        printDiv.style.backgroundColor = '#ffffff'; 
        printDiv.style.padding = '30px';
        printDiv.style.fontFamily = "'Segoe UI', Helvetica, Arial, sans-serif";
        printDiv.style.color = '#000000';

        let html = `
            <div style="text-align: center; margin-bottom: 25px; border-bottom: 4px solid #C5A059; padding-bottom: 15px;">
                <h1 style="color: #002856; margin:0; font-size:24px; text-transform:uppercase;">Banco Central de Venezuela</h1>
                <h3 style="color: #333333; margin:8px 0; font-size:16px;">Libro de Auditoría del Sistema</h3>
                <p style="font-size: 11px; color: #555555; margin:0;">Fecha: <b>${formatearFecha(fecha)}</b> &nbsp;|&nbsp; Emitido por: <b>${currentUser.username}</b></p>
            </div>
            <table style="width:100%; border-collapse:collapse; font-size:11px; color:#000000;">
                <thead>
                    <tr style="background:#002856; color:#ffffff; text-align:left;">
                        <th style="padding:10px; width:12%; border: 1px solid #002856;">Hora</th>
                        <th style="padding:10px; width:18%; border: 1px solid #002856;">Operador</th>
                        <th style="padding:10px; width:25%; border: 1px solid #002856;">Clasificación</th>
                        <th style="padding:10px; width:45%; border: 1px solid #002856;">Descripción del Evento</th>
                    </tr>
                </thead>
                <tbody>`;

        filtrados.forEach((m, index) => {
            const bgRow = index % 2 === 0 ? '#ffffff' : '#f8f9fa';
            html += `<tr style="background-color: ${bgRow};">
                <td style="border:1px solid #cccccc; padding:8px; font-weight:bold; color:#000000;">${m.hora}</td>
                <td style="border:1px solid #cccccc; padding:8px; color:#000000;">${m.usuario}</td>
                <td style="border:1px solid #cccccc; padding:8px; font-weight:bold; color:#002856;">${m.accion}</td>
                <td style="border:1px solid #cccccc; padding:8px; color:#000000;">${m.detalle}</td>
            </tr>`;
        });
        html += `</tbody></table>`;

        printDiv.innerHTML = html;
        const opt = {
            margin: 10, filename: `Auditoria_BCV_${fecha}.pdf`, image: { type: 'jpeg', quality: 1 },
            html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(printDiv).save();
    });

    // --- GESTIÓN DE USUARIOS ---
    document.getElementById('btn-users').addEventListener('click', () => {
        renderListaUsuarios();
        modalUsuarios.style.display = 'block';
    });

    function renderListaUsuarios() {
        const list = document.getElementById('users-list');
        list.innerHTML = '';
        for (const [user, data] of Object.entries(sistemaUsuarios)) {
            const li = document.createElement('li');
            const badgeClass = data.role === 'admin' ? 'badge-admin' : 'badge-std';
            const roleName = data.role === 'admin' ? 'Administrador' : data.role === 'analista' ? 'Analista' : 'Lector';
            li.innerHTML = `
                <span><b style="color:var(--text-accent); font-size: 1.05rem;">${user}</b> <span class="badge-role ${badgeClass}">${roleName}</span></span>
                ${user !== 'admin' ? `<button class="btn-del-user" onclick="borrarUsuario('${user}')">Revocar</button>` : '<span style="font-size:0.75rem; color:var(--text-muted);">Inamovible</span>'}
            `;
            list.appendChild(li);
        }
    }

    document.getElementById('form-user').addEventListener('submit', async (e) => {
        e.preventDefault();
        const newUser = document.getElementById('new-username').value.trim();
        const newPass = document.getElementById('new-password').value;
        const newRole = document.getElementById('new-role').value;
        
        if (sistemaUsuarios[newUser]) {
            return await customDialog({ title: 'Error', message: 'Este identificador de usuario ya existe en el sistema.', icon: '❌' });
        }
        
        registrarMovimiento('Emisión de Credencial', `Registrada nueva cuenta: ${newUser} (Rol: ${newRole})`);
        sistemaUsuarios[newUser] = { password: newPass, role: newRole, hasLogged: false };
        localStorage.setItem('bcvUsersV2', JSON.stringify(sistemaUsuarios));
        document.getElementById('form-user').reset();
        renderListaUsuarios();
    });

    window.borrarUsuario = async function(user) {
        const conf = await customDialog({ type: 'confirm', title: 'Peligro', message: `¿Revocar acceso y eliminar la cuenta corporativa de ${user}?`, icon: '🗑️' });
        if (conf) {
            registrarMovimiento('Revocación de Cuenta', `Cuenta eliminada: ${user}`);
            delete sistemaUsuarios[user];
            localStorage.setItem('bcvUsersV2', JSON.stringify(sistemaUsuarios));
            renderListaUsuarios();
        }
    };

    // --- MANUAL INTELIGENTE PDF ---
    document.getElementById('btn-manual').addEventListener('click', () => {
        registrarMovimiento('Descarga de Documento', 'El usuario descargó su Manual del Sistema.');
        
        const printDiv = document.createElement('div');
        printDiv.style.backgroundColor = '#ffffff'; 
        printDiv.style.padding = '40px';
        printDiv.style.fontFamily = "'Segoe UI', Helvetica, Arial, sans-serif";
        printDiv.style.color = '#000000';

        let manualContent = `
            <div style="text-align: center; margin-bottom: 30px; border-bottom: 4px solid #C5A059; padding-bottom: 20px;">
                <h1 style="color: #002856; margin:0; font-size:28px; text-transform:uppercase;">Banco Central de Venezuela</h1>
                <h2 style="color: #333333; margin:10px 0; font-size:20px;">Manual de Usuario: Rol ${currentUser.role.toUpperCase()}</h2>
                <p style="font-size: 12px; color: #555555; margin:0;">Generado el <b>${formatearFecha(obtenerFechaHoy())}</b> para el usuario <b>${currentUser.username}</b></p>
            </div>
            
            <h3 style="color:#002856; border-bottom: 2px solid #eeeeee; padding-bottom:5px;">1. Descripción General</h3>
            <p style="font-size:12px; line-height:1.6; margin-bottom:20px;">El Sistema de Gestión de Estacionamiento del BCV es una herramienta centralizada para controlar y auditar las plazas asignadas al personal de la institución. Este documento detalla las funciones específicas autorizadas de forma exclusiva para tu nivel de acceso actual.</p>

            <h3 style="color:#002856; border-bottom: 2px solid #eeeeee; padding-bottom:5px;">2. Funcionalidades de tu Rol</h3>
        `;

        if (currentUser.role === 'admin') {
            manualContent += `
            <div style="margin-bottom: 15px; padding: 15px; background-color: #f8f9fa; border-left: 4px solid #C5A059;">
                <h4 style="margin:0 0 10px 0; color:#002856;">A. Administrador (Control Total)</h4>
                <ul style="font-size:12px; line-height:1.6; padding-left: 20px; margin:0;">
                    <li><b>Gestión de Usuarios:</b> Puede crear, modificar y revocar el acceso de cualquier usuario.</li>
                    <li><b>Aprobaciones:</b> Recibe notificaciones (🔔) y es el único con capacidad de aprobar o rechazar las solicitudes enviadas por los analistas.</li>
                    <li><b>Auditoría:</b> Acceso exclusivo al Libro de Auditoría (Movimientos) del sistema para investigar cambios.</li>
                    <li><b>Infraestructura:</b> Puede registrar nuevos departamentos al organigrama y forzar la eliminación física de registros. Tenga en cuenta que al eliminar un puesto, el motor de inteligencia artificial renumerará automáticamente el resto del edificio.</li>
                    <li><b>Reportes:</b> Exportación del reporte institucional de puestos ocupados en PDF.</li>
                </ul>
            </div>`;
        } else if (currentUser.role === 'analista') {
            manualContent += `
            <div style="margin-bottom: 15px; padding: 15px; background-color: #f8f9fa; border-left: 4px solid #004080;">
                <h4 style="margin:0 0 10px 0; color:#002856;">A. Analista (Operador)</h4>
                <ul style="font-size:12px; line-height:1.6; padding-left: 20px; margin:0;">
                    <li><b>Asignaciones:</b> Puede asignar puestos libres a nuevos funcionarios y adscribirlos a un departamento/dirección existente, especificando el tipo de asignación.</li>
                    <li><b>Datos del Vehículo:</b> Al asignar un puesto, puede registrar opcionalmente la placa y marca del vehículo.</li>
                    <li><b>Apertura de Puestos Extras:</b> Puede crear nuevos números de puestos adicionales en cualquier piso.</li>
                    <li><b>Restricción de Borrado:</b> <i>No puede eliminar ni liberar puestos directamente.</i> Al intentarlo, el sistema enviará una Solicitud formal que los Administradores evaluarán (Aprobar/Rechazar).</li>
                    <li><b>Notificaciones:</b> Recibirá un aviso en la campanita superior (🔔) cuando su solicitud haya sido respondida por la gerencia.</li>
                    <li><b>Reportes:</b> Tiene habilitada la opción para descargar el documento general de puestos asignados.</li>
                </ul>
            </div>`;
        } else if (currentUser.role === 'lector') {
            manualContent += `
            <div style="margin-bottom: 25px; padding: 15px; background-color: #f8f9fa; border-left: 4px solid #94a3b8;">
                <h4 style="margin:0 0 10px 0; color:#002856;">A. Lector (Solo Visualización)</h4>
                <ul style="font-size:12px; line-height:1.6; padding-left: 20px; margin:0;">
                    <li><b>Consultas de Información:</b> Puede buscar, visualizar y explorar todos los pisos y puestos actuales del sistema.</li>
                    <li><b>Buscador Inteligente:</b> Herramienta disponible para ubicar rápidamente a un funcionario, departamento, placa vehicular o identificador de puesto.</li>
                    <li><b>Reportes:</b> Tiene habilitada la opción de "Exportar Reporte" para generar los PDFs de ocupación general de la institución.</li>
                    <li><b>Limitaciones de Seguridad:</b> Todos los formularios, campos de texto y botones de edición/eliminación se encuentran bloqueados por defecto para prevenir alteraciones accidentales de la base de datos.</li>
                </ul>
            </div>`;
        }

        manualContent += `
            <div style="margin-top: 40px; font-size: 10px; text-align: center; color: #555555; border-top: 1px solid #cccccc; padding-top: 10px;">
                Documento Oficial Institucional. Banco Central de Venezuela.
            </div>
        `;
        
        printDiv.innerHTML = manualContent;

        const opt = {
            margin: 10,
            filename: `Manual_Usuario_${currentUser.role.toUpperCase()}_BCV.pdf`,
            image: { type: 'jpeg', quality: 1 },
            html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(printDiv).save();
    });

    // --- CERRAR MODALES NORMALES ---
    const modales = [modalGestion, modalDir, modalUsuarios, modalNuevoPuesto, modalMovimientos, modalNotificaciones, document.getElementById('modal-welcome')];
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.onclick = function() { modales.forEach(m => m.style.display = 'none'); }
    });
    window.onclick = (e) => {
        modales.forEach(m => { if (e.target === m && m.id !== 'dialog-overlay' && m.id !== 'modal-welcome') m.style.display = 'none'; });
    };

    function guardarDatos() { localStorage.setItem('bcvPuestosV12', JSON.stringify(asignaciones)); } 
    function obtenerFechaHoy() { return new Date().toISOString().split('T')[0]; }
    function formatearFecha(fechaStr) {
        if (!fechaStr) return '';
        const [y, m, d] = fechaStr.split('-');
        return `${d}/${m}/${y}`;
    }

    // --- EXPORTAR PDF REPORTES DE OCUPACIÓN ---
    document.getElementById('btn-generar-pdf').addEventListener('click', () => {
        registrarMovimiento('Exportación Institucional', 'Generación de reporte maestro de asignaciones');
        const printDiv = document.createElement('div');
        printDiv.style.backgroundColor = '#ffffff'; printDiv.style.padding = '30px';
        printDiv.style.fontFamily = "'Segoe UI', Helvetica, Arial, sans-serif"; printDiv.style.color = '#000000';

        let html = `
            <div style="text-align: center; margin-bottom: 25px; border-bottom: 4px solid #C5A059; padding-bottom: 15px;">
                <h1 style="color: #002856; margin:0; font-size:26px; text-transform:uppercase;">Banco Central de Venezuela</h1>
                <h3 style="color: #333333; margin:8px 0; font-size:16px;">Reporte Institucional de Asignación de Puestos</h3>
                <p style="font-size: 11px; color: #555555; margin:0;">Generado el <b>${formatearFecha(obtenerFechaHoy())}</b> por: <b>${currentUser.username}</b></p>
            </div>
        `;
        let totalOcupados = 0;
        
        for (const [piso, puestos] of Object.entries(asignaciones)) {
            const puestosOcupados = Object.keys(puestos).filter(k => puestos[k] !== null).sort((a, b) => a.localeCompare(b, undefined, {numeric: true}));
            if (puestosOcupados.length > 0) {
                totalOcupados += puestosOcupados.length;
                html += `<h4 style="background:#002856; color:#ffffff; padding:10px 12px; margin-top:25px; margin-bottom:0; font-size:13px; text-transform:uppercase;">PISO ${piso}</h4>`;
                html += `<table style="width:100%; border-collapse:collapse; font-size:11px; margin-bottom:15px; color:#000000;">
                            <thead>
                                <tr style="background:#eeeeee; text-align:left;">
                                    <th style="border:1px solid #cccccc; padding:8px 12px; width:12%; color:#000000;">PUESTO</th>
                                    <th style="border:1px solid #cccccc; padding:8px 12px; width:35%; color:#000000;">FUNCIONARIO / UNIDAD</th>
                                    <th style="border:1px solid #cccccc; padding:8px 12px; width:15%; color:#000000;">TIPO</th>
                                    <th style="border:1px solid #cccccc; padding:8px 12px; width:38%; color:#000000;">CONDICIONES DE USO</th>
                                </tr>
                            </thead>
                            <tbody>`;
                for (const key of puestosOcupados) {
                    const p = puestos[key];
                    let tiempo = '';
                    if (p.tipo === 'Fijo') tiempo = `Permanente (Ingreso: ${formatearFecha(p.inicio)})`;
                    else if (p.tipo === 'Temporal') tiempo = `Del ${formatearFecha(p.inicio)} al ${formatearFecha(p.fin)}`;
                    else if (p.tipo === 'Por Horas') tiempo = `${p.horas} Horas (Día: ${formatearFecha(p.inicio)})`;
                    
                    let vehiculoInfo = '';
                    if (p.marca || p.placa) {
                        vehiculoInfo = `<br><span style="font-size:9px; color:#002856;">🚗 ${p.marca || 'N/A'} | Placa: ${p.placa || 'N/A'}</span>`;
                    }

                    html += `<tr>
                        <td style="border:1px solid #cccccc; padding:8px 12px; font-weight:bold; color:#000000; text-align:center;">${key}</td>
                        <td style="border:1px solid #cccccc; padding:8px 12px; color:#000000;"><b>${p.nombre}</b><br><span style="font-size:9px; color:#555;">${p.departamento}</span>${vehiculoInfo}</td>
                        <td style="border:1px solid #cccccc; padding:8px 12px; color:#000000;">${p.tipo}</td>
                        <td style="border:1px solid #cccccc; padding:8px 12px; color:#000000;">${tiempo}</td>
                    </tr>`;
                }
                html += `</tbody></table>`;
            }
        }
        
        if (totalOcupados === 0) html += `<p style="text-align:center; color:#555555; margin-top:40px; font-style:italic;">No existen registros de personal asignado.</p>`;
        
        html += `<div style="margin-top: 40px; font-size: 10px; text-align: center; color: #555555; border-top: 1px solid #cccccc; padding-top: 10px;">
            Documento de uso interno. Banco Central de Venezuela.
        </div>`;
        
        printDiv.innerHTML = html;
        const opt = {
            margin: [15, 10, 15, 10], filename: 'Reporte_Institucional_Puestos_BCV.pdf', image: { type: 'jpeg', quality: 1 },
            html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
        };
        html2pdf().set(opt).from(printDiv).save();
    });
});