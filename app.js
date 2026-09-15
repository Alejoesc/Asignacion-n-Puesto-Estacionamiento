document.addEventListener('DOMContentLoaded', () => {
    // Referencias DOM
    const loginScreen = document.getElementById('login-screen');
    const mainApp = document.getElementById('main-app');
    const userDisplay = document.getElementById('user-display');
    const dashboard = document.getElementById('dashboard');
    const searchInput = document.getElementById('search-input');
    
    // Modales
    const modalGestion = document.getElementById('modal-gestion');
    const modalDir = document.getElementById('modal-dir');
    const modalUsuarios = document.getElementById('modal-usuarios');
    const modalNuevoPuesto = document.getElementById('modal-nuevo-puesto');
    const modalMovimientos = document.getElementById('modal-movimientos');
    const modalNotificaciones = document.getElementById('modal-notificaciones');

    // Base de Datos Local
    let asignaciones = JSON.parse(localStorage.getItem('bcvPuestosV9'));
    let sistemaUsuarios = JSON.parse(localStorage.getItem('bcvUsersV2'));
    let registroMovimientos = JSON.parse(localStorage.getItem('bcvMovimientosV1')) || [];
    let solicitudes = JSON.parse(localStorage.getItem('bcvSolicitudesV1')) || [];
    let notificaciones = JSON.parse(localStorage.getItem('bcvNotifsV1')) || [];
    let currentUser = null;

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

    // --- INICIALIZACIÓN ---
    if (!sistemaUsuarios) {
        sistemaUsuarios = { "admin": { password: "admin", role: "admin" } };
        localStorage.setItem('bcvUsersV2', JSON.stringify(sistemaUsuarios));
    }

    if (!asignaciones) {
        asignaciones = {
            "Directorio": { "1": null, "2": null },
            "Presidencia": { "1": null, "2": null },
            "Vicepresidencia de Auditoría Interna": { "1": null, "2": null },
            "Gerencia de Auditorías": { "1": null, "2": null },
            "Oficina de Control Fiscal": { "1": null, "2": null },
            "Gerencia de Seguimiento y Otras Actuaciones de Control": { "1": null, "2": null },
            "Consultoría Jurídica": { "1": null, "2": null },
            "Consultoría Jurídica Adjunta p/ Asuntos Estratégicos y de Riesgos": { "1": null, "2": null },
            "Consultoría Jurídica Adjunta p/ Asuntos Transaccionales": { "1": null, "2": null },
            "Consultoría Jurídica Adjunta p/ Asuntos de Apoyo a la Gestión": { "1": null, "2": null },
            "Asesoría de la Presidencia": { "1": null, "2": null },
            "Oficina de Planificación": { "1": null, "2": null },
            "Oficina de Cumplimiento": { "1": null, "2": null },
            "Oficina de Seguimiento y Control del Proceso Kimberley": { "1": null, "2": null },
            "Gerencia de Comunicaciones Institucionales": { "1": null, "2": null },
            "Gerencia de Seguridad": { "1": null, "2": null },
            "Gerencia de Sistemas e Informática": { "1": null, "2": null },
            "Departamento de Ingeniería de Procesos": { "1": null, "2": null },
            "Gerencia de Innovación y Tecnologías Aplicadas": { "1": null, "2": null },
            "Gerencia de Relaciones Internacionales": { "1": null, "2": null },
            "Primera Vicepresidencia Gerencia": { "1": null, "2": null },
            "Vicepresidencia de Estudios": { "1": null, "2": null },
            "Oficina de Investigaciones Económicas": { "1": null, "2": null },
            "Oficina de Apoyo a la Cooperación y los Estudios": { "1": null, "2": null },
            "Gerencia de Programación y Análisis Macroeconómico": { "1": null, "2": null },
            "Gerencia de Estadísticas Económicas": { "1": null, "2": null },
            "Vicepresidencia de Operaciones Nacionales": { "1": null, "2": null },
            "Unidad de Análisis del Mercado Financiero": { "1": null, "2": null },
            "Gerencia de Operaciones Monetarias": { "1": null, "2": null },
            "Gerencia de Tesorería": { "1": null, "2": null },
            "Vicepresidencia de Operaciones Internacionales": { "1": null, "2": null },
            "Oficina de Estudios Internacionales": { "1": null, "2": null },
            "Gerencia de Adm. de Reservas Internacionales": { "1": null, "2": null },
            "Gerencia de Obligaciones Internacionales": { "1": null, "2": null },
            "Gerencia de Operaciones Cambiarias": { "1": null, "2": null },
            "Gerencia General Casa de la Moneda": { "1": null, "2": null },
            "Gerencia Técnica": { "1": null, "2": null },
            "Segunda Vicepresidencia Gerencia": { "1": null, "2": null },
            "Vicepresidencia de Administración": { "1": null, "2": null },
            "Gerencia de Finanzas": { "1": null, "2": null },
            "Departamento de Presupuesto": { "1": null, "2": null },
            "Departamento de Contabilidad": { "1": null, "2": null },
            "Departamento de Pagos y Tributos": { "1": null, "2": null },
            "Unidad de Fideicomiso": { "1": null, "2": null },
            "Gerencia de Servicios Administrativos": { "1": null, "2": null },
            "Departamento de Compras y Suministros": { "1": null, "2": null },
            "Departamento de Documentación Correspondencia y Archivo": { "1": null, "2": null },
            "División de Asistencia Técnica y Micrografía": { "1": null, "2": null },
            "División de Correspondencia": { "1": null, "2": null },
            "División de Archivo Central": { "1": null, "2": null },
            "Departamento de Otros Servicios": { "1": null, "2": null },
            "División de Activos y Seguros": { "1": null, "2": null },
            "División de Comedores": { "1": null, "2": null },
            "División de Servicios Varios": { "1": null, "2": null },
            "Departamento de Operación y Mantenimiento Técnico": { "1": null, "2": null },
            "División Administrativa": { "1": null, "2": null },
            "División de Técnica de Mantenimiento": { "1": null, "2": null },
            "División de Diseño y Apoyo a Oficinas": { "1": null, "2": null },
            "Gerencia de Recursos Humanos": { "1": null, "2": null },
            "Oficina de Consultoría y Modelos del Factor Humano": { "1": null, "2": null },
            "Oficina de Asistencia al Personal Ejecutivo": { "1": null, "2": null },
            "Departamento de Captación y Desarrollo del Factor Humano": { "1": null, "2": null },
            "Departamento de Relaciones del Factor Humano": { "1": null, "2": null },
            "Departamento de Beneficios Socioeconómicos": { "1": null, "2": null },
            "Departamento de Nómina y Egresos": { "1": null, "2": null },
            "Centro de Educación Inicial BCV": { "1": null, "2": null },
            "Gerencia Subsede Maracaibo": { "1": null, "2": null },
            "Departamento de Operaciones": { "1": null, "2": null },
            "Departamento de Administración": { "1": null, "2": null },
            "Departamento de Relaciones Institucionales": { "1": null, "2": null },
            "Departamento de Recursos Humanos (Subsede Maracaibo)": { "1": null, "2": null },
            "Departamento de Seguridad y Salud en el Trabajo - Subsede Maracaibo": { "1": null, "2": null },
            "Gerencia de Seguridad y Salud en el Trabajo": { "1": null, "2": null },
            "Departamento de Programación y Control de Seg. y Salud en el Trabajo": { "1": null, "2": null },
            "Departamento de Prevención y Promoción de Seg. y Salud en el Trabajo": { "1": null, "2": null },
            "Departamento de Asistencia Médica y Emergencias": { "1": null, "2": null },
            "Departamento de Administración del Servicio de Seg. y Salud en el Trabajo": { "1": null, "2": null }
        };
        guardarDatos();
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
        
        if (currentUser.role === 'admin') {
            const pendientes = solicitudes.filter(s => s.estado === 'pendiente').length;
            sinLeer += pendientes;
        }
        
        const misNoLeidas = notificaciones.filter(n => n.to === currentUser.username && !n.leida).length;
        sinLeer += misNoLeidas;
        
        const badge = document.getElementById('notif-badge');
        if (sinLeer > 0) {
            badge.style.display = 'block';
            badge.textContent = sinLeer;
        } else {
            badge.style.display = 'none';
        }
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
        
        // --- LOGICA DEL MODAL DE BIENVENIDA ---
        if (!sistemaUsuarios[currentUser.username].hasLogged) {
            document.getElementById('modal-welcome').style.display = 'block';
            sistemaUsuarios[currentUser.username].hasLogged = true;
            localStorage.setItem('bcvUsersV2', JSON.stringify(sistemaUsuarios));
        }

        actualizarCampanita();
        renderDashboard();
    }

    // Botón para cerrar el modal de Bienvenida
    document.getElementById('btn-close-welcome').addEventListener('click', () => {
        document.getElementById('modal-welcome').style.display = 'none';
    });

    // --- DASHBOARD ---
    function renderDashboard() {
        dashboard.innerHTML = '';
        for (const [direccion, puestos] of Object.entries(asignaciones)) {
            const card = document.createElement('div');
            card.className = 'direccion-card';
            card.innerHTML = `
                <div class="dir-header">
                    <h3>${direccion}</h3>
                    <div class="dir-actions">
                        <button class="btn btn-sm btn-gold require-edit" onclick="window.abrirModalNuevoPuesto('${direccion}')">+ Añadir Puesto</button>
                        <button class="btn btn-sm btn-outline-danger require-edit" onclick="window.eliminarDireccion('${direccion}')" title="Eliminar Dirección">Eliminar Unidad</button>
                    </div>
                </div>
            `;

            const grid = document.createElement('div');
            grid.className = 'puestos-grid';
            const keys = Object.keys(puestos).sort((a,b) => a.localeCompare(b, undefined, {numeric: true}));

            for (const key of keys) {
                const data = puestos[key];
                const isOcupado = data !== null;
                const puestoDiv = document.createElement('div');
                puestoDiv.className = `puesto ${isOcupado ? 'ocupado' : 'disponible'}`;
                
                puestoDiv.setAttribute('data-search', `${direccion} ${key} ${isOcupado ? data.nombre : 'disponible'}`.toLowerCase());

                let tiempoHtml = '';
                if (isOcupado) {
                    if (data.tipo === 'Fijo') tiempoHtml = `<div class="puesto-tiempo">Fijo</div>`;
                    else if (data.tipo === 'Temporal') tiempoHtml = `<div class="puesto-tiempo">Temp (al ${formatearFecha(data.fin)})</div>`;
                    else if (data.tipo === 'Por Horas') tiempoHtml = `<div class="puesto-tiempo">${data.horas}h (${formatearFecha(data.inicio)})</div>`;
                }

                puestoDiv.innerHTML = `
                    <div class="estado-indicador"></div>
                    <div class="puesto-numero">${key}</div>
                    <div class="puesto-nombre">${isOcupado ? data.nombre : '<span>Libre</span>'}</div>
                    ${tiempoHtml}
                `;
                puestoDiv.addEventListener('click', () => abrirModalGestion(direccion, key, data));
                grid.appendChild(puestoDiv);
            }
            card.appendChild(grid);
            dashboard.appendChild(card);
        }
    }

    // --- BUSCADOR ---
    searchInput.addEventListener('input', (e) => {
        const text = e.target.value.toLowerCase().trim();
        
        document.querySelectorAll('.direccion-card').forEach(card => {
            let hasVisiblePuesto = false;
            const puestos = card.querySelectorAll('.puesto');
            const dirNameMatch = card.querySelector('h3').textContent.toLowerCase().includes(text);

            puestos.forEach(puesto => {
                const match = puesto.getAttribute('data-search').includes(text);
                if (match) {
                    puesto.style.display = 'flex';
                    hasVisiblePuesto = true;
                } else {
                    puesto.style.display = 'none';
                }
            });

            if (hasVisiblePuesto || dirNameMatch) {
                card.style.display = 'block';
                if (dirNameMatch) {
                    puestos.forEach(p => p.style.display = 'flex');
                }
            } else {
                card.style.display = 'none'; 
            }
        });
    });

    // --- CREAR SOLICITUDES (Analistas) ---
    async function crearSolicitud(tipoAccion, dir, id) {
        const existePendiente = solicitudes.some(s => 
            s.estado === 'pendiente' && s.tipo === tipoAccion && s.dir === dir && s.puesto === id
        );

        if (existePendiente) {
            await customDialog({
                title: 'Acción Denegada',
                message: `Ya existe una solicitud en proceso para realizar esta misma acción en ${id ? 'este puesto' : 'esta dirección'}.\n\nEspera a que un administrador apruebe o rechace la solicitud anterior.`,
                icon: '⛔'
            });
            return;
        }

        solicitudes.push({ id: Date.now(), tipo: tipoAccion, dir: dir, puesto: id, analista: currentUser.username, estado: 'pendiente' });
        localStorage.setItem('bcvSolicitudesV1', JSON.stringify(solicitudes));
        
        let detalleAuditoria = `El analista solicitó ${tipoAccion.replace('_', ' ')} en la unidad "${dir}"`;
        if (id) detalleAuditoria += ` (Identificador de puesto: ${id})`;
        registrarMovimiento('Emisión de Solicitud', detalleAuditoria);

        Object.keys(sistemaUsuarios).forEach(u => {
            if(sistemaUsuarios[u].role === 'admin') {
                enviarNotificacion(u, `⚠️ El analista <b>${currentUser.username}</b> ha solicitado <b>${tipoAccion.replace('_', ' ')}</b> en la dirección ${dir}.`);
            }
        });

        await customDialog({ title: 'Solicitud Enviada', message: 'Tu petición ha sido enviada a los administradores para su revisión y aprobación.', icon: '✅' });
    }

    // --- GESTIÓN DE DIRECCIONES ---
    window.eliminarDireccion = async function(direccion) {
        if (currentUser.role === 'lector') return;
        
        if (currentUser.role === 'analista') {
            const conf = await customDialog({
                type: 'confirm', title: 'Permiso Requerido', icon: '🔒',
                message: `Al ser Analista, no puedes eliminar direcciones directamente.\n\n¿Deseas enviar una SOLICITUD AL ADMINISTRADOR para eliminar la unidad "${direccion}"?`
            });
            if (conf) await crearSolicitud('eliminar_direccion', direccion, null);
            return;
        }
        
        const puestos = asignaciones[direccion];
        const ocupados = Object.values(puestos).filter(p => p !== null).length;
        
        if (ocupados > 0) {
            await customDialog({
                title: 'Sistema Bloqueado', icon: '⚠️',
                message: `La dirección "${direccion}" tiene ${ocupados} puesto(s) asignado(s).\nEl sistema impide eliminar unidades con personal registrado.`
            });
            
            const passPrompt = await customDialog({
                type: 'prompt', inputType: 'password', title: 'Autorización Gerencial', icon: '🔐',
                message: `Para FORZAR la eliminación de "${direccion}", ingrese su clave de administrador:`
            });
            
            if (passPrompt === null) return;
            if (passPrompt === sistemaUsuarios[currentUser.username].password) {
                delete asignaciones[direccion];
                registrarMovimiento('Eliminación Forzada', `Eliminada la dirección "${direccion}" con ${ocupados} puestos ocupados.`);
                guardarDatos(); renderDashboard();
                await customDialog({ title: 'Operación Exitosa', message: 'Dirección eliminada del sistema.', icon: '✅' });
            } else {
                await customDialog({ title: 'Error de Autenticación', message: 'Credencial incorrecta. Operación denegada.', icon: '❌' });
            }
        } else {
            const conf = await customDialog({
                type: 'confirm', title: 'Confirmación', icon: '🗑️',
                message: `¿Confirma la eliminación definitiva de la unidad vacía:\n"${direccion}"?`
            });
            if (conf) {
                delete asignaciones[direccion];
                registrarMovimiento('Eliminación de Dirección', `Eliminada dirección vacía: "${direccion}"`);
                guardarDatos(); renderDashboard();
            }
        }
    };

    // --- GESTIÓN DE PUESTOS ---
    function abrirModalGestion(direccion, idPuesto, data) {
        document.getElementById('modal-title').textContent = `${direccion} - Expediente`;
        document.getElementById('modal-direccion').value = direccion;
        document.getElementById('modal-puesto-original').value = idPuesto;
        document.getElementById('modal-puesto-num').value = idPuesto;
        
        const isOcupado = data !== null;
        document.getElementById('modal-personal').value = isOcupado ? data.nombre : '';
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
            btnEliminar.textContent = "Solicitar Eliminación";
        } else {
            btnEgresar.textContent = "Liberar Espacio";
            btnEliminar.textContent = "Eliminar Puesto";
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

        const dir = document.getElementById('modal-direccion').value;
        const oldId = document.getElementById('modal-puesto-original').value;
        const newId = document.getElementById('modal-puesto-num').value.trim().toUpperCase();
        
        const nom = document.getElementById('modal-personal').value.trim();
        const tipo = document.getElementById('modal-tipo').value;
        const horas = document.getElementById('modal-horas').value;
        const inicio = document.getElementById('modal-fecha-inicio').value;
        const fin = document.getElementById('modal-fecha-fin').value;

        if (!newId) return await customDialog({ title: 'Validación', message: 'El identificador del puesto es obligatorio.', icon: '⚠️' });
        if (oldId !== newId && asignaciones[dir][newId] !== undefined) return await customDialog({ title: 'Validación', message: `El identificador "${newId}" ya existe en la unidad.`, icon: '⚠️' });

        let puestoData = null;
        if (nom) {
            if (tipo === 'Temporal' && !fin) return await customDialog({ title: 'Faltan Datos', message: 'Requiere fecha de culminación.', icon: '⚠️' });
            if (tipo === 'Por Horas' && !horas) return await customDialog({ title: 'Faltan Datos', message: 'Requiere especificar horas.', icon: '⚠️' });
            puestoData = { nombre: nom, tipo, inicio, fin, horas };
        }

        if (oldId !== newId) delete asignaciones[dir][oldId];
        asignaciones[dir][newId] = puestoData;

        if (nom) registrarMovimiento('Asignación', `Puesto ${newId} (${dir}) asignado a ${nom} por ${currentUser.username}`);
        else if (oldId !== newId) registrarMovimiento('Renombre', `Puesto ${oldId} -> ${newId} en ${dir}`);

        guardarDatos();
        modalGestion.style.display = 'none';
        renderDashboard();
    });

    document.getElementById('btn-egresar').addEventListener('click', async () => {
        if (currentUser.role === 'lector') return;
        const dir = document.getElementById('modal-direccion').value;
        const id = document.getElementById('modal-puesto-original').value;
        
        if (currentUser.role === 'analista') {
            const conf = await customDialog({ type: 'confirm', title: 'Solicitud', message: '¿Solicitar al administrador la LIBERACIÓN de este puesto?', icon: '🛡️' });
            if(conf) { await crearSolicitud('liberar_puesto', dir, id); modalGestion.style.display = 'none'; }
            return;
        }
        
        const conf = await customDialog({ type: 'confirm', title: 'Liberar', message: '¿Proceder a liberar el puesto y retirar al funcionario?', icon: '🔓' });
        if (conf) {
            registrarMovimiento('Liberación', `Puesto ${id} (${dir}) liberado.`);
            asignaciones[dir][id] = null;
            guardarDatos(); modalGestion.style.display = 'none'; renderDashboard();
        }
    });

    document.getElementById('btn-eliminar-puesto').addEventListener('click', async () => {
        if (currentUser.role === 'lector') return;
        const dir = document.getElementById('modal-direccion').value;
        const id = document.getElementById('modal-puesto-original').value;
        
        if (currentUser.role === 'analista') {
            const conf = await customDialog({ type: 'confirm', title: 'Solicitud', message: '¿Solicitar al administrador la ELIMINACIÓN de este espacio?', icon: '🛡️' });
            if(conf) { await crearSolicitud('eliminar_puesto', dir, id); modalGestion.style.display = 'none'; }
            return;
        }

        const conf = await customDialog({ type: 'confirm', title: 'Peligro', message: 'Esta acción ELIMINARÁ permanentemente el espacio. ¿Continuar?', icon: '🗑️' });
        if (conf) {
            registrarMovimiento('Baja de Puesto', `Puesto ${id} (${dir}) dado de baja.`);
            delete asignaciones[dir][id];
            guardarDatos(); modalGestion.style.display = 'none'; renderDashboard();
        }
    });

    window.abrirModalNuevoPuesto = function(direccion) {
        document.getElementById('nuevo-puesto-dir').value = direccion;
        document.getElementById('nuevo-puesto-dir-display').value = direccion;
        document.getElementById('nuevo-puesto-num').value = '';
        modalNuevoPuesto.style.display = 'block';
    }

    document.getElementById('form-nuevo-puesto').addEventListener('submit', async (e) => {
        e.preventDefault();
        const dir = document.getElementById('nuevo-puesto-dir').value;
        const nuevoNum = document.getElementById('nuevo-puesto-num').value.trim().toUpperCase();

        if (asignaciones[dir][nuevoNum] !== undefined) {
            return await customDialog({ title: 'Conflicto', message: `El puesto "${nuevoNum}" ya existe.`, icon: '❌' });
        }
        
        registrarMovimiento('Creación de Puesto', `Puesto ${nuevoNum} creado en ${dir} por ${currentUser.username}`);
        asignaciones[dir][nuevoNum] = null;
        guardarDatos(); modalNuevoPuesto.style.display = 'none'; renderDashboard();
    });

    document.getElementById('btn-add-dir').addEventListener('click', () => modalDir.style.display = 'block');
    document.getElementById('dir-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const newDir = document.getElementById('new-dir-name').value.trim();
        if (newDir && !asignaciones[newDir]) {
            registrarMovimiento('Creación de Unidad', `Registrada unidad: ${newDir}`);
            asignaciones[newDir] = { "1": null, "2": null };
            guardarDatos(); modalDir.style.display = 'none'; document.getElementById('dir-form').reset(); renderDashboard();
        } else { 
            await customDialog({ title: 'Error', message: 'La dirección ya existe o el nombre es inválido.', icon: '❌' }); 
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
                        <div>El analista <b style="color:var(--text-accent);">${s.analista}</b> solicita <b>${accionNombre}</b> en: <br>
                        <i>${s.dir}</i> ${s.puesto ? `(Puesto: ${s.puesto})` : ''}</div>
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
            if (sol.tipo === 'eliminar_direccion' && asignaciones[sol.dir]) {
                delete asignaciones[sol.dir];
                registrarMovimiento('Eliminación Aprobada', `Dirección ${sol.dir} eliminada por admin (Solicitud originada por el analista: ${sol.analista})`);
            } else if (sol.tipo === 'eliminar_puesto' && asignaciones[sol.dir] && asignaciones[sol.dir][sol.puesto] !== undefined) {
                delete asignaciones[sol.dir][sol.puesto];
                registrarMovimiento('Baja Aprobada', `Puesto ${sol.puesto} de ${sol.dir} eliminado (Solicitud originada por el analista: ${sol.analista})`);
            } else if (sol.tipo === 'liberar_puesto' && asignaciones[sol.dir] && asignaciones[sol.dir][sol.puesto] !== undefined) {
                asignaciones[sol.dir][sol.puesto] = null;
                registrarMovimiento('Liberación Aprobada', `Puesto ${sol.puesto} liberado en ${sol.dir} (Solicitud originada por el analista: ${sol.analista})`);
            }
            enviarNotificacion(sol.analista, `✅ Tu solicitud para ${sol.tipo.replace('_', ' ')} en ${sol.dir} fue APROBADA.`);
            guardarDatos();
            renderDashboard();
        } else {
            enviarNotificacion(sol.analista, `❌ Tu solicitud para ${sol.tipo.replace('_', ' ')} en ${sol.dir} fue RECHAZADA.`);
            registrarMovimiento('Solicitud Rechazada', `El administrador rechazó la solicitud de ${sol.tipo.replace('_', ' ')} en ${sol.dir} enviada por el analista ${sol.analista}`);
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
                    <li><b>Infraestructura:</b> Puede crear nuevas Direcciones/Unidades y forzar la eliminación de registros existentes mediante su clave de seguridad gerencial.</li>
                    <li><b>Reportes:</b> Exportación del reporte institucional de puestos ocupados en PDF.</li>
                </ul>
            </div>`;
        } else if (currentUser.role === 'analista') {
            manualContent += `
            <div style="margin-bottom: 15px; padding: 15px; background-color: #f8f9fa; border-left: 4px solid #004080;">
                <h4 style="margin:0 0 10px 0; color:#002856;">A. Analista (Operador)</h4>
                <ul style="font-size:12px; line-height:1.6; padding-left: 20px; margin:0;">
                    <li><b>Asignaciones:</b> Puede asignar puestos libres a nuevos funcionarios, especificando el tipo de asignación (Fijo, Temporal, Por Horas).</li>
                    <li><b>Apertura de Puestos:</b> Puede crear nuevos números o IDs de puestos dentro de direcciones ya existentes.</li>
                    <li><b>Restricción de Borrado:</b> <i>No puede eliminar ni liberar puestos o direcciones directamente.</i> Al intentarlo, el sistema enviará una Solicitud formal que los Administradores evaluarán (Aprobar/Rechazar).</li>
                    <li><b>Notificaciones:</b> Recibirá un aviso en la campanita superior (🔔) cuando su solicitud haya sido respondida por la gerencia.</li>
                    <li><b>Reportes:</b> Tiene habilitada la opción para descargar el documento general de puestos asignados.</li>
                </ul>
            </div>`;
        } else if (currentUser.role === 'lector') {
            manualContent += `
            <div style="margin-bottom: 25px; padding: 15px; background-color: #f8f9fa; border-left: 4px solid #94a3b8;">
                <h4 style="margin:0 0 10px 0; color:#002856;">A. Lector (Solo Visualización)</h4>
                <ul style="font-size:12px; line-height:1.6; padding-left: 20px; margin:0;">
                    <li><b>Consultas de Información:</b> Puede buscar, visualizar y explorar todas las direcciones y puestos actuales del sistema.</li>
                    <li><b>Buscador Inteligente:</b> Herramienta disponible para ubicar rápidamente a un funcionario, unidad o número de puesto usando la barra superior.</li>
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

    function guardarDatos() { localStorage.setItem('bcvPuestosV9', JSON.stringify(asignaciones)); } 
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
        
        for (const [dir, puestos] of Object.entries(asignaciones)) {
            const puestosOcupados = Object.keys(puestos).filter(k => puestos[k] !== null).sort((a, b) => a.localeCompare(b, undefined, {numeric: true}));
            if (puestosOcupados.length > 0) {
                totalOcupados += puestosOcupados.length;
                html += `<h4 style="background:#002856; color:#ffffff; padding:10px 12px; margin-top:25px; margin-bottom:0; font-size:13px; text-transform:uppercase;">${dir}</h4>`;
                html += `<table style="width:100%; border-collapse:collapse; font-size:11px; margin-bottom:15px; color:#000000;">
                            <thead>
                                <tr style="background:#eeeeee; text-align:left;">
                                    <th style="border:1px solid #cccccc; padding:8px 12px; width:12%; color:#000000;">IDENTIFICADOR</th>
                                    <th style="border:1px solid #cccccc; padding:8px 12px; width:45%; color:#000000;">FUNCIONARIO ASIGNADO</th>
                                    <th style="border:1px solid #cccccc; padding:8px 12px; width:15%; color:#000000;">TIPO</th>
                                    <th style="border:1px solid #cccccc; padding:8px 12px; width:28%; color:#000000;">CONDICIONES DE USO</th>
                                </tr>
                            </thead>
                            <tbody>`;
                for (const key of puestosOcupados) {
                    const p = puestos[key];
                    let tiempo = '';
                    if (p.tipo === 'Fijo') tiempo = `Permanente (Ingreso: ${formatearFecha(p.inicio)})`;
                    else if (p.tipo === 'Temporal') tiempo = `Del ${formatearFecha(p.inicio)} al ${formatearFecha(p.fin)}`;
                    else if (p.tipo === 'Por Horas') tiempo = `${p.horas} Horas (Día: ${formatearFecha(p.inicio)})`;
                    html += `<tr>
                        <td style="border:1px solid #cccccc; padding:8px 12px; font-weight:bold; color:#000000; text-align:center;">${key}</td>
                        <td style="border:1px solid #cccccc; padding:8px 12px; color:#000000;">${p.nombre}</td>
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