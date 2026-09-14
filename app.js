document.addEventListener('DOMContentLoaded', () => {
    const dashboard = document.getElementById('dashboard');
    const searchInput = document.getElementById('search-input');
    const themeToggle = document.getElementById('theme-toggle');
    
    const modalGestion = document.getElementById('modal-gestion');
    const modalDir = document.getElementById('modal-dir');
    
    const formGestion = document.getElementById('assignment-form');
    const formDir = document.getElementById('dir-form');
    const tipoSelect = document.getElementById('modal-tipo');
    const groupFechaFin = document.getElementById('group-fecha-fin');
    const groupHoras = document.getElementById('group-horas');
    
    let asignaciones = JSON.parse(localStorage.getItem('bcvPuestosV4'));
    if (!asignaciones) {
        asignaciones = {
            "Telémática y Software": {},
            "Redes y Servidores": {},
            "Operaciones": {}
        };
        guardarDatos();
    }

    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.textContent = '☀️ Modo Claro';
    }
    
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        themeToggle.textContent = isDark ? '☀️ Modo Claro' : '🌙 Modo Oscuro';
    });

    function renderDashboard() {
        dashboard.innerHTML = '';
        for (const [direccion, puestos] of Object.entries(asignaciones)) {
            const card = document.createElement('div');
            card.className = 'direccion-card';
            card.innerHTML = `<h3>${direccion}</h3>`;

            const grid = document.createElement('div');
            grid.className = 'puestos-grid';

            // El dashboard en web siempre muestra un mínimo de 10 puestos para visualizar el espacio
            let maxPuestos = 10;
            const numeros = Object.keys(puestos).map(Number);
            if (numeros.length > 0) maxPuestos = Math.max(maxPuestos, ...numeros);

            for (let i = 1; i <= maxPuestos; i++) {
                const data = puestos[i];
                const isOcupado = !!data;
                
                const puestoDiv = document.createElement('div');
                puestoDiv.className = `puesto ${isOcupado ? 'ocupado' : 'disponible'}`;
                puestoDiv.setAttribute('data-search', `${direccion} P${i} ${isOcupado ? data.nombre : 'disponible'}`.toLowerCase());

                let tiempoHtml = '';
                if (isOcupado) {
                    if (data.tipo === 'Fijo') tiempoHtml = `<div class="puesto-tiempo">Fijo (Desde ${formatearFecha(data.inicio)})</div>`;
                    else if (data.tipo === 'Temporal') tiempoHtml = `<div class="puesto-tiempo">Temp (Hasta ${formatearFecha(data.fin)})</div>`;
                    else if (data.tipo === 'Por Horas') tiempoHtml = `<div class="puesto-tiempo">${data.horas} Horas (Día: ${formatearFecha(data.inicio)})</div>`;
                }

                puestoDiv.innerHTML = `
                    <div class="estado-indicador"></div>
                    <div class="puesto-numero">P${i}</div>
                    <div class="puesto-nombre"><b>${isOcupado ? data.nombre : 'Disponible'}</b></div>
                    ${tiempoHtml}
                `;

                puestoDiv.addEventListener('click', () => abrirModalGestion(direccion, i, data));
                grid.appendChild(puestoDiv);
            }
            card.appendChild(grid);
            dashboard.appendChild(card);
        }
    }

    searchInput.addEventListener('input', (e) => {
        const text = e.target.value.toLowerCase();
        document.querySelectorAll('.puesto').forEach(puesto => {
            const match = puesto.getAttribute('data-search').includes(text);
            puesto.style.display = match ? 'block' : 'none';
        });
    });

    function abrirModalGestion(direccion, numero, data) {
        document.getElementById('modal-title').textContent = `${direccion} - Puesto ${numero}`;
        document.getElementById('modal-direccion').value = direccion;
        document.getElementById('modal-puesto').value = numero;
        
        const isOcupado = !!data;
        document.getElementById('modal-personal').value = isOcupado ? data.nombre : '';
        document.getElementById('modal-tipo').value = isOcupado ? data.tipo : 'Fijo';
        document.getElementById('modal-horas').value = (isOcupado && data.tipo === 'Por Horas') ? data.horas : '';
        document.getElementById('modal-fecha-inicio').value = isOcupado ? data.inicio : obtenerFechaHoy();
        document.getElementById('modal-fecha-fin').value = (isOcupado && data.tipo === 'Temporal') ? data.fin : '';
        
        toggleCamposExtras();

        const btnAsignar = document.getElementById('btn-asignar');
        const btnEgresar = document.getElementById('btn-egresar');
        const estadoText = document.getElementById('estado-actual-text');

        if (isOcupado) {
            estadoText.innerHTML = `<span style="color: var(--danger); font-weight:bold;">Estado: Ocupado</span>`;
            btnAsignar.textContent = "Actualizar Datos";
            btnEgresar.style.display = "block";
        } else {
            estadoText.innerHTML = `<span style="color: var(--success); font-weight:bold;">Estado: Disponible</span>`;
            btnAsignar.textContent = "Asignar Puesto";
            btnEgresar.style.display = "none";
        }

        modalGestion.style.display = 'block';
    }

    tipoSelect.addEventListener('change', toggleCamposExtras);
    function toggleCamposExtras() {
        const tipo = tipoSelect.value;
        groupFechaFin.style.display = tipo === 'Temporal' ? 'block' : 'none';
        groupHoras.style.display = tipo === 'Por Horas' ? 'block' : 'none';
    }

    formGestion.addEventListener('submit', (e) => {
        e.preventDefault();
        const dir = document.getElementById('modal-direccion').value;
        const num = document.getElementById('modal-puesto').value;
        const nom = document.getElementById('modal-personal').value.trim();
        const tipo = document.getElementById('modal-tipo').value;
        const horas = document.getElementById('modal-horas').value;
        const inicio = document.getElementById('modal-fecha-inicio').value;
        const fin = document.getElementById('modal-fecha-fin').value;

        if (!nom) return alert('Ingresa el nombre del personal.');
        if (tipo === 'Temporal' && !fin) return alert('Ingresa la fecha de culminación.');
        if (tipo === 'Por Horas' && !horas) return alert('Ingresa la cantidad de horas.');

        asignaciones[dir][num] = { nombre: nom, tipo, inicio, fin, horas };
        guardarDatos();
        modalGestion.style.display = 'none';
        renderDashboard();
    });

    document.getElementById('btn-egresar').addEventListener('click', () => {
        const dir = document.getElementById('modal-direccion').value;
        const num = document.getElementById('modal-puesto').value;
        if (confirm('¿Liberar este puesto?')) {
            delete asignaciones[dir][num];
            guardarDatos();
            modalGestion.style.display = 'none';
            renderDashboard();
        }
    });

    document.getElementById('btn-add-dir').addEventListener('click', () => modalDir.style.display = 'block');

    formDir.addEventListener('submit', (e) => {
        e.preventDefault();
        const newDir = document.getElementById('new-dir-name').value.trim();
        if (newDir && !asignaciones[newDir]) {
            asignaciones[newDir] = {};
            guardarDatos();
            modalDir.style.display = 'none';
            formDir.reset();
            renderDashboard();
        } else {
            alert('La dirección ya existe o el nombre es inválido.');
        }
    });

    document.getElementById('close-gestion').onclick = () => modalGestion.style.display = 'none';
    document.getElementById('close-dir').onclick = () => modalDir.style.display = 'none';
    window.onclick = (e) => {
        if (e.target === modalGestion) modalGestion.style.display = 'none';
        if (e.target === modalDir) modalDir.style.display = 'none';
    };

    function guardarDatos() { localStorage.setItem('bcvPuestosV4', JSON.stringify(asignaciones)); }
    function obtenerFechaHoy() { return new Date().toISOString().split('T')[0]; }
    function formatearFecha(fechaStr) {
        if (!fechaStr) return '';
        const [y, m, d] = fechaStr.split('-');
        return `${d}/${m}/${y}`;
    }

    // --- REPORTE PDF CORREGIDO ---
    document.getElementById('btn-generar-pdf').addEventListener('click', () => {
        const printDiv = document.createElement('div');
        printDiv.style.padding = '20px';
        printDiv.style.fontFamily = 'Arial, sans-serif';

        let html = `
            <div style="text-align: center; margin-bottom: 20px; border-bottom: 3px solid #C5A059; padding-bottom: 10px;">
                <h1 style="color: #002856; margin:0;">Banco Central de Venezuela</h1>
                <h3 style="color: #555; margin:5px 0;">Reporte de Asignación de Puestos</h3>
                <p style="font-size: 12px; color: #888;">Generado: ${formatearFecha(obtenerFechaHoy())}</p>
            </div>
        `;

        for (const [dir, puestos] of Object.entries(asignaciones)) {
            html += `<h4 style="background:#002856; color:white; padding:8px; margin-top:20px;">${dir}</h4>`;
            html += `<table style="width:100%; border-collapse:collapse; font-size:12px; margin-bottom:10px;">
                        <tr style="background:#f4f4f4; text-align:left;">
                            <th style="border:1px solid #ddd; padding:6px; width:15%;">Puesto</th>
                            <th style="border:1px solid #ddd; padding:6px; width:15%;">Estado</th>
                            <th style="border:1px solid #ddd; padding:6px; width:30%;">Personal</th>
                            <th style="border:1px solid #ddd; padding:6px; width:15%;">Tipo</th>
                            <th style="border:1px solid #ddd; padding:6px; width:25%;">Duración / Horas</th>
                        </tr>`;
            
            const nums = Object.keys(puestos).map(Number);
            
            // Corrección: Si no hay puestos asignados, no renderiza 10 filas vacías.
            if (nums.length === 0) {
                html += `<tr><td colspan="5" style="border:1px solid #ddd; padding:10px; text-align:center; color:#666;">Sin personal asignado actualmente.</td></tr>`;
            } else {
                // Solo renderiza hasta el puesto máximo ocupado en esa dirección
                const maxP = Math.max(...nums);
                for (let i = 1; i <= maxP; i++) {
                    const p = puestos[i];
                    if (p) {
                        let tiempo = '';
                        if (p.tipo === 'Fijo') tiempo = `Desde: ${formatearFecha(p.inicio)}`;
                        else if (p.tipo === 'Temporal') tiempo = `${formatearFecha(p.inicio)} al ${formatearFecha(p.fin)}`;
                        else if (p.tipo === 'Por Horas') tiempo = `${p.horas} Horas (Día: ${formatearFecha(p.inicio)})`;

                        html += `<tr>
                            <td style="border:1px solid #ddd; padding:6px;">Puesto ${i}</td>
                            <td style="border:1px solid #ddd; padding:6px; color:#c0392b; font-weight:bold;">Ocupado</td>
                            <td style="border:1px solid #ddd; padding:6px;">${p.nombre}</td>
                            <td style="border:1px solid #ddd; padding:6px;">${p.tipo}</td>
                            <td style="border:1px solid #ddd; padding:6px;">${tiempo}</td>
                        </tr>`;
                    } else {
                        html += `<tr>
                            <td style="border:1px solid #ddd; padding:6px;">Puesto ${i}</td>
                            <td style="border:1px solid #ddd; padding:6px; color:#27ae60; font-weight:bold;">Disponible</td>
                            <td style="border:1px solid #ddd; padding:6px;">-</td>
                            <td style="border:1px solid #ddd; padding:6px;">-</td>
                            <td style="border:1px solid #ddd; padding:6px;">-</td>
                        </tr>`;
                    }
                }
            }
            html += `</table>`;
        }

        printDiv.innerHTML = html;
        const opt = {
            margin: 10,
            filename: 'Reporte_Puestos_BCV.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
        };

        html2pdf().set(opt).from(printDiv).save();
    });

    renderDashboard();
});