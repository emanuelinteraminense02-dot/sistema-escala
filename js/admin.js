/* ================================================================
   ADMIN.JS — Painel Administrativo Shekinah IAD
   ================================================================ */

function navegar(pagina) {
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  const navEl = document.getElementById('nav-' + pagina);
  if (navEl) navEl.classList.add('active');

  const titulos = {
    dashboard:       { icon: '📊', txt: 'Dashboard',         sub: 'Visão geral do sistema' },
    escalas:         { icon: '📋', txt: 'Escalas',           sub: 'Gerencie todas as escalas' },
    conflitos:       { icon: '⚠',  txt: 'Conflitos',         sub: 'Escale com segurança' },
    voluntarios:     { icon: '👥', txt: 'Voluntários',       sub: 'Equipe ministerial' },
    disponibilidades:{ icon: '📅', txt: 'Disponibilidades',  sub: 'Horários da equipe' },
    'painel-vol':    { icon: '🏠', txt: 'Meu Painel',        sub: 'Bem-vindo' },
    'minhas-escalas':{ icon: '📋', txt: 'Minhas Escalas',    sub: 'Suas próximas escalas' },
    'todas-escalas': { icon: '🗓', txt: 'Calendário Geral',  sub: 'Todas as escalas' },
    'minha-disp':    { icon: '✅', txt: 'Minha Disponibilidade', sub: 'Configure seus horários' },
  };

  const t = titulos[pagina] || { icon: '◈', txt: pagina, sub: '' };
  const topbarLeft = document.getElementById('topbar-left');
  if (topbarLeft) {
    topbarLeft.innerHTML =
      '<div class="topbar-icon">' + t.icon + '</div>' +
      '<div><div class="topbar-title">' + t.txt + '</div>' +
      '<div class="topbar-subtitle">' + t.sub + '</div></div>';
  }

  document.getElementById('topbar-right-actions').innerHTML = '';
  document.getElementById('page-wrap').innerHTML = '';

  const renders = {
    dashboard: renderDashboard, escalas: renderEscalas,
    conflitos: renderConflitos, voluntarios: renderVoluntarios,
    disponibilidades: renderDisponibilidades,
    'painel-vol': renderPainelVol, 'minhas-escalas': renderMinhasEscalas,
    'todas-escalas': renderTodasEscalas, 'minha-disp': renderMinhaDisp,
  };
  if (renders[pagina]) renders[pagina]();
}

function atualizarBadgeConflitos() {
  const n  = levantarTodosConflitos().length;
  const el = document.getElementById('badge-conflitos');
  if (!el) return;
  el.textContent   = n;
  el.style.display = n > 0 ? '' : 'none';
}

/* ================================================================ DASHBOARD */
function renderDashboard() {
  const escalas   = DB.getEscalas();
  const vols      = DB.getVoluntarios();
  const conflitos = levantarTodosConflitos();
  const publicadas = escalas.filter(e => e.status === 'publicada').length;
  const rascunhos  = escalas.filter(e => e.status !== 'publicada').length;

  const hoje    = new Date();
  const diasAte = (7 - hoje.getDay()) % 7 || 7;
  const proxDom = new Date(hoje); proxDom.setDate(hoje.getDate() + diasAte);
  const proxDomStr = proxDom.toISOString().split('T')[0];
  const escalasDom = escalas.filter(e => e.data === proxDomStr && e.status === 'publicada').length;
  const proxEscalas = [...escalas].sort((a,b) => a.data > b.data ? 1 : -1).slice(0,6);

  const minPorMin = vols.reduce((acc,v) => { acc[v.ministerio]=(acc[v.ministerio]||0)+1; return acc; }, {});

  let conflitosHtml = '';
  if (conflitos.length > 0) {
    const rows = conflitos.slice(0,3).map(c =>
      '<div class="inline-alert danger"><span class="inline-alert-icon">⚠</span>' +
      '<div class="inline-alert-body"><strong>' + (c.escala.culto||c.escala.turma||'Escala') + '</strong> — ' + c.msg + '</div></div>'
    ).join('');
    conflitosHtml =
      '<div class="card" style="margin-bottom:20px;border-color:var(--red-border);">' +
      '<div class="card-header" style="background:var(--red-bg);">' +
      '<h4 style="color:var(--red);">⚠ Conflitos que precisam de atenção</h4>' +
      '<button class="btn btn-danger btn-sm" onclick="navegar(\'conflitos\')">Ver todos (' + conflitos.length + ')</button>' +
      '</div><div style="padding:12px 20px;display:flex;flex-direction:column;gap:8px;">' +
      rows + (conflitos.length>3 ? '<p class="text-sm text-muted">E mais '+(conflitos.length-3)+' conflito(s)…</p>' : '') +
      '</div></div>';
  }

  let tabelaEscalas = proxEscalas.length === 0
    ? '<div class="empty-state"><span class="es-icon">📋</span><p>Nenhuma escala cadastrada ainda.</p></div>'
    : '<table class="table"><thead><tr><th>Data</th><th>Ministério</th><th>Voluntário</th><th>Status</th></tr></thead><tbody>' +
      proxEscalas.map(e =>
        '<tr><td><strong>' + formatDate(e.data) + '</strong></td><td>' + badgeMinisterio(e.tipo) + '</td><td>' +
        (e.voluntarioNome||e.professor||e.nomeIntercessor||'—') + '</td><td>' + badgeStatus(e.status) + '</td></tr>'
      ).join('') + '</tbody></table>';

  let minRows = Object.entries(minPorMin).map(([m,n]) =>
    '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border-subtle);">' +
    '<span style="font-size:13px;font-weight:600;color:var(--text-secondary);">' + m + '</span>' +
    '<span class="badge badge-brand">' + n + ' vol.</span></div>'
  ).join('');
  if (!minRows) minRows = '<p class="text-muted text-sm">Nenhum voluntário cadastrado.</p>';

  document.getElementById('page-wrap').innerHTML =
    '<div class="page-header">' +
    '<div class="page-header-text"><div class="eyebrow">Shekinah IAD</div><h2>Dashboard</h2>' +
    '<p>Resumo geral da gestão ministerial</p></div>' +
    '<div class="page-header-actions">' +
    (conflitos.length>0 ? '<button class="btn btn-ghost btn-sm" onclick="navegar(\'conflitos\')">Conflitos <span class="badge badge-red">'+conflitos.length+'</span></button>' : '') +
    '<button class="btn btn-primary" onclick="abrirModalEscala()">+ Nova Escala</button>' +
    '</div></div>' +

    '<div class="stats-grid">' +
    '<div class="stat-card brand"><div class="stat-top"><div class="stat-label">Voluntários</div><div class="stat-icon">👥</div></div><div class="stat-number">' + vols.length + '</div><div class="stat-sub">cadastrados</div></div>' +
    '<div class="stat-card brand"><div class="stat-top"><div class="stat-label">Publicadas</div><div class="stat-icon">📋</div></div><div class="stat-number">' + publicadas + '</div><div class="stat-sub">' + rascunhos + ' em rascunho</div></div>' +
    '<div class="stat-card green"><div class="stat-top"><div class="stat-label">Próx. Domingo</div><div class="stat-icon">✝</div></div><div class="stat-number">' + escalasDom + '</div><div class="stat-sub">' + formatDate(proxDomStr) + '</div></div>' +
    '<div class="stat-card ' + (conflitos.length>0 ? 'red' : 'green') + '"><div class="stat-top"><div class="stat-label">Conflitos</div><div class="stat-icon">' + (conflitos.length>0?'⚠':'✓') + '</div></div><div class="stat-number">' + conflitos.length + '</div><div class="stat-sub">' + (conflitos.length>0?'requerem revisão':'tudo consistente') + '</div></div>' +
    '</div>' +

    conflitosHtml +

    '<div class="grid-2">' +
    '<div class="card"><div class="card-header"><h4>📅 Próximas Escalas</h4><button class="btn btn-ghost btn-sm" onclick="navegar(\'escalas\')">Ver todas →</button></div><div class="table-wrap">' + tabelaEscalas + '</div></div>' +
    '<div class="card"><div class="card-header"><h4>👥 Equipe por Ministério</h4><button class="btn btn-ghost btn-sm" onclick="navegar(\'voluntarios\')">Gerenciar →</button></div><div class="card-body" style="padding-top:12px;">' + minRows + '</div></div>' +
    '</div>';
}

/* ================================================================ ESCALAS */
function renderEscalas(filtroTipo, filtroData, filtroStatus, busca) {
  filtroTipo   = filtroTipo   || '';
  filtroData   = filtroData   || '';
  filtroStatus = filtroStatus || '';
  busca        = busca        || '';

  document.getElementById('topbar-right-actions').innerHTML =
    '<button class="btn btn-primary btn-sm" onclick="abrirModalEscala()">+ Nova Escala</button>';

  let escalas = DB.getEscalas();
  if (filtroTipo)   escalas = escalas.filter(e => e.tipo    === filtroTipo);
  if (filtroData)   escalas = escalas.filter(e => e.data    === filtroData);
  if (filtroStatus) escalas = escalas.filter(e => e.status  === filtroStatus);
  if (busca) { const b = busca.toLowerCase(); escalas = escalas.filter(e =>
    (e.culto||'').toLowerCase().includes(b)||(e.voluntarioNome||'').toLowerCase().includes(b)||
    (e.professor||'').toLowerCase().includes(b)||(e.nomeIntercessor||'').toLowerCase().includes(b)); }
  escalas.sort((a,b) => a.data > b.data ? 1 : -1);

  const total = DB.getEscalas();
  const publ  = total.filter(e => e.status === 'publicada').length;
  const rasc  = total.filter(e => e.status !== 'publicada').length;

  const minOpts = MINISTERIOS.map(m =>
    '<option value="'+m.id+'" '+(filtroTipo===m.id?'selected':'')+'>'+m.nome+'</option>'
  ).join('');

  const limpar = (filtroTipo||filtroData||filtroStatus||busca)
    ? '<button class="btn btn-ghost btn-sm" onclick="renderEscalas()">✕ Limpar</button>' : '';

  const linhas = escalas.length === 0
    ? '<div class="card"><div class="empty-state"><span class="es-icon">📋</span><h5>Nenhuma escala encontrada</h5>' +
      '<p>Ajuste os filtros ou crie uma nova escala.</p>' +
      '<button class="btn btn-primary" onclick="abrirModalEscala()">+ Criar escala</button></div></div>'
    : escalas.map(e => renderEscalaRow(e)).join('');

  document.getElementById('page-wrap').innerHTML =
    '<div class="page-header">' +
    '<div class="page-header-text"><div class="eyebrow">Gestão</div><h2>Escalas</h2>' +
    '<p>' + escalas.length + ' resultado(s) · <span style="color:var(--green)">' + publ + ' publicadas</span> · <span style="color:var(--amber)">' + rasc + ' rascunhos</span></p></div></div>' +

    '<div class="filter-bar">' +
    '<span class="filter-label">Filtrar:</span>' +
    '<input type="text" class="form-control" placeholder="🔍 Buscar…" value="' + busca + '" oninput="renderEscalas(\''+filtroTipo+'\',\''+filtroData+'\',\''+filtroStatus+'\',this.value)" style="flex:1;min-width:160px;" />' +
    '<select class="form-control" style="width:auto;" onchange="renderEscalas(this.value,\''+filtroData+'\',\''+filtroStatus+'\',\''+busca+'\')">' +
    '<option value="">Todos ministérios</option>' + minOpts + '</select>' +
    '<select class="form-control" style="width:auto;" onchange="renderEscalas(\''+filtroTipo+'\',\''+filtroData+'\',this.value,\''+busca+'\')">' +
    '<option value="">Todos status</option>' +
    '<option value="publicada" '+(filtroStatus==='publicada'?'selected':'')+'>Publicadas</option>' +
    '<option value="rascunho"  '+(filtroStatus==='rascunho'?'selected':'')+'>Rascunhos</option>' +
    '</select>' +
    '<input type="date" class="form-control" style="width:auto;" value="' + filtroData + '" onchange="renderEscalas(\''+filtroTipo+'\',this.value,\''+filtroStatus+'\',\''+busca+'\')" />' +
    limpar + '</div>' +
    '<div id="lista-escalas">' + linhas + '</div>';
}

function renderEscalaRow(e) {
  const { dia, mes } = parseDateParts(e.data);
  const vol = DB.getVoluntarios().find(v => v.id === e.voluntarioId);
  const { conflitos } = e.voluntarioId ? verificarConflitosEscala(DB.getEscalas(), e, vol) : { conflitos: [] };
  const conflitoHtml = conflitos.length > 0
    ? '<div style="margin-top:6px;font-size:11px;color:var(--red);">⚠ ' + conflitos[0].msg + (conflitos.length>1?' +'+(conflitos.length-1):'') + '</div>'
    : '';
  const statusBtn = e.status !== 'publicada'
    ? '<button class="btn btn-publish btn-xs" onclick="mudarStatusEscala('+e.id+',\'publicada\')" title="Publicar">✓ Publicar</button>'
    : '<button class="btn btn-draft btn-xs" onclick="mudarStatusEscala('+e.id+',\'rascunho\')" title="Rascunho">✎ Rascunho</button>';

  return '<div class="escala-row ' + (conflitos.length>0?'conflict':'') + '">' +
    '<div class="escala-date"><div class="ed-day">' + dia + '</div><div class="ed-mon">' + mes + '</div></div>' +
    '<div class="escala-info">' +
    '<div class="escala-title">' + (e.culto||e.turma||e.nomeIntercessor||'—') + '</div>' +
    '<div class="escala-meta">' +
    '<span class="em-item">🕐 ' + e.horario + '</span>' +
    '<span class="em-item">' + badgeMinisterio(e.tipo) + '</span>' +
    '<span class="em-item">👤 ' + (e.voluntarioNome||e.professor||e.nomeIntercessor||'—') + '</span>' +
    (e.local?'<span class="em-item">📍 '+e.local+'</span>':'') +
    '<span class="em-item">' + badgeStatus(e.status) + '</span>' +
    '</div>' + conflitoHtml + '</div>' +
    '<div class="escala-actions">' +
    statusBtn +
    '<button class="btn btn-ghost btn-sm btn-icon" onclick="abrirModalEscala(' + e.id + ')" title="Editar">✎</button>' +
    '<button class="btn btn-ghost btn-sm btn-icon" onclick="abrirModalCopiar(' + e.id + ')" title="Copiar para outra data">⧉</button>' +
    '<button class="btn btn-ghost btn-sm btn-icon" onclick="abrirModalRecorrente(' + e.id + ')" title="Repetir semanalmente">↺</button>' +
    '<button class="btn btn-ghost btn-sm btn-icon" onclick="imprimirEscala(' + e.id + ')" title="Imprimir">🖨</button>' +
    '<button class="btn btn-danger btn-sm btn-icon" onclick="confirmarExcluirEscala(' + e.id + ')" title="Excluir">✕</button>' +
    '</div></div>';
}

function mudarStatusEscala(id, novoStatus) {
  const escalas = DB.getEscalas();
  const idx = escalas.findIndex(e => e.id === id);
  if (idx === -1) return;
  escalas[idx].status = novoStatus;
  DB.saveEscalas(escalas);
  const msg = novoStatus === 'publicada'
    ? 'Escala publicada! Voluntários já podem visualizá-la.'
    : 'Escala movida para rascunho.';
  showToast(msg, novoStatus === 'publicada' ? 'success' : 'info');
  atualizarBadgeConflitos();
  renderEscalas();
}

/* ================================================================ CONFLITOS */
function renderConflitos() {
  const conflitos = levantarTodosConflitos();

  let html = '<div class="page-header"><div class="page-header-text"><div class="eyebrow">Análise</div><h2>Conflitos</h2>' +
    '<p>' + (conflitos.length === 0 ? 'Sem conflitos — tudo consistente!' : conflitos.length + ' conflito(s) para revisar') + '</p></div></div>';

  if (conflitos.length === 0) {
    html += '<div class="card"><div class="empty-state"><span class="es-icon">✅</span><h5>Sem conflitos!</h5>' +
      '<p>Todas as escalas estão íntegras e compatíveis com as disponibilidades.</p></div></div>';
  } else {
    html += conflitos.map(c => {
      const gravBadge = c.gravidade === 'alta' ? 'badge-red' : 'badge-amber';
      const tipoLabel = c.tipo === 'horario-duplo' ? 'Dupla escala' : c.tipo === 'data-especifica' ? 'Data bloqueada' : 'Indisponível';
      return '<div class="card" style="margin-bottom:12px;border-color:var(--red-border);">' +
        '<div class="card-header" style="background:var(--red-bg);">' +
        '<div style="display:flex;align-items:center;gap:10px;flex:1;">' +
        badgeMinisterio(c.escala.tipo) + '<strong>' + (c.escala.culto||c.escala.turma||c.escala.nomeIntercessor||'Escala') + '</strong>' +
        '<span class="badge ' + gravBadge + '">' + tipoLabel + '</span></div>' +
        '<button class="btn btn-ghost btn-sm" onclick="abrirModalEscala(' + c.escala.id + ')">Corrigir →</button>' +
        '</div><div class="card-body" style="padding:14px 20px;">' +
        '<div class="inline-alert danger"><span class="inline-alert-icon">⚠</span><div class="inline-alert-body">' + c.msg + '</div></div>' +
        '<div style="display:flex;gap:20px;margin-top:12px;font-size:12px;color:var(--text-muted);">' +
        '<span>📅 ' + formatDate(c.escala.data) + '</span><span>🕐 ' + c.escala.horario + '</span>' +
        '<span>👤 ' + (c.escala.voluntarioNome||c.escala.professor||c.escala.nomeIntercessor||'—') + '</span>' +
        '</div></div></div>';
    }).join('');
  }

  document.getElementById('page-wrap').innerHTML = html;
}

/* ================================================================ VOLUNTÁRIOS */
function renderVoluntarios(busca) {
  busca = busca || '';
  document.getElementById('topbar-right-actions').innerHTML =
    '<button class="btn btn-primary btn-sm" onclick="abrirModalVoluntario()">+ Cadastrar Voluntário</button>';

  let vols = DB.getVoluntarios();
  if (busca) { const b = busca.toLowerCase(); vols = vols.filter(v =>
    v.nome.toLowerCase().includes(b) || v.ministerio.toLowerCase().includes(b)); }

  const cards = vols.length === 0
    ? '<div class="card"><div class="empty-state"><span class="es-icon">👥</span><h5>Nenhum voluntário</h5>' +
      '<button class="btn btn-primary" onclick="abrirModalVoluntario()">+ Cadastrar agora</button></div></div>'
    : '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px;">' +
      vols.map(v => {
        const slots = Object.entries(v.disponibilidade||{}).flatMap(([dia,turnos]) =>
          turnos.map(t => {
            const dl = DIAS_SEMANA.find(d=>d.id===dia)?.label||dia;
            const ti = TURNOS.find(x=>x.id===t)?.icon||'';
            return '<span class="badge badge-brand" style="font-size:9px;">' + dl + ' ' + ti + '</span>';
          })
        );
        const slotsHtml = slots.slice(0,4).join('') + (slots.length>4 ? '<span class="badge badge-muted" style="font-size:9px;">+' + (slots.length-4) + '</span>' : '');
        return '<div class="vol-card">' +
          '<div class="vol-av">' + iniciais(v.nome) + '</div>' +
          '<div class="vol-info"><div class="vol-name">' + v.nome + '</div><div class="vol-min">' + v.ministerio + '</div>' +
          '<div class="vol-slots">' + slotsHtml + '</div></div>' +
          '<div class="vol-actions">' +
          '<button class="btn btn-ghost btn-sm btn-icon" onclick="abrirModalVoluntario(' + v.id + ')" title="Editar">✎</button>' +
          '<button class="btn btn-danger btn-sm btn-icon" onclick="confirmarExcluirVoluntario(' + v.id + ')" title="Excluir">✕</button>' +
          '</div></div>';
      }).join('') + '</div>';

  document.getElementById('page-wrap').innerHTML =
    '<div class="page-header"><div class="page-header-text"><div class="eyebrow">Equipe</div><h2>Voluntários</h2>' +
    '<p>' + vols.length + ' voluntário(s)</p></div></div>' +
    '<div class="filter-bar"><span class="filter-label">Buscar:</span>' +
    '<input type="text" class="form-control" placeholder="🔍 Nome ou ministério…" value="' + busca + '" oninput="renderVoluntarios(this.value)" style="flex:1;" /></div>' +
    cards;
}

/* ================================================================ DISPONIBILIDADES (admin) */
function renderDisponibilidades() {
  const vols = DB.getVoluntarios();
  const diasHead = DIAS_SEMANA.map(d => '<th style="text-align:center;">' + d.label + '</th>').join('');

  const linhas = vols.map(v => {
    const cels = DIAS_SEMANA.map(d => {
      const turnos = (v.disponibilidade||{})[d.id] || [];
      const pills  = TURNOS.filter(t => turnos.includes(t.id)).map(t =>
        '<span class="badge badge-green" style="font-size:9px;margin:1px;">' + t.icon + ' ' + t.label + '</span>'
      ).join('');
      return '<td style="text-align:center;">' + (pills||'<span style="color:var(--text-muted);font-size:11px;">—</span>') + '</td>';
    }).join('');
    return '<tr><td><strong>' + v.nome + '</strong></td><td><span class="text-muted text-sm">' + v.ministerio + '</span></td>' + cels + '</tr>';
  }).join('');

  document.getElementById('page-wrap').innerHTML =
    '<div class="page-header"><div class="page-header-text"><div class="eyebrow">Informações</div><h2>Disponibilidades</h2>' +
    '<p>Visão consolidada dos horários da equipe</p></div></div>' +
    '<div class="card"><div class="table-wrap"><table class="table">' +
    '<thead><tr><th>Voluntário</th><th>Ministério</th>' + diasHead + '</tr></thead>' +
    '<tbody>' + linhas + '</tbody></table></div></div>';
}

/* ================================================================ MODAL ESCALA */
function abrirModalEscala(editarId) {
  editarId = editarId || null;
  const escala = editarId ? DB.getEscalas().find(e => e.id === editarId) : null;
  const vols   = DB.getVoluntarios();
  const volOpts = '<option value="">Selecione o voluntário…</option>' +
    vols.map(v => '<option value="' + v.id + '">' + v.nome + ' — ' + v.ministerio + '</option>').join('');
  const minOpts = MINISTERIOS.map(m =>
    '<option value="' + m.id + '" ' + (escala&&escala.tipo===m.id?'selected':'') + '>' + m.nome + '</option>'
  ).join('');

  const html =
    '<div class="modal-overlay" onclick="fecharModal(event)">' +
    '<div class="modal modal-lg" onclick="event.stopPropagation()">' +
    '<div class="modal-header">' +
    '<div class="modal-header-info">' +
    '<h3>' + (editarId ? 'Editar Escala' : 'Nova Escala') + '</h3>' +
    '<p>' + (editarId ? 'Altere os dados e salve as alterações.' : 'Preencha os dados para criar uma nova escala ministerial.') + '</p>' +
    '</div>' +
    '<button class="btn btn-ghost btn-sm btn-icon" onclick="fecharModalDireto()">✕</button>' +
    '</div>' +
    '<div class="modal-body">' +
    '<div class="form-row">' +
    '<div class="form-group"><label class="form-label">Ministério <span class="req">*</span></label>' +
    '<select id="me-tipo" class="form-control" onchange="atualizarCamposMin(' + JSON.stringify(escala) + ')">' +
    '<option value="">Selecione…</option>' + minOpts + '</select></div>' +
    '<div class="form-group"><label class="form-label">Status da Escala</label>' +
    '<select id="me-status" class="form-control">' +
    '<option value="rascunho" ' + (!escala||escala.status!=='publicada'?'selected':'') + '>✎ Rascunho</option>' +
    '<option value="publicada" ' + (escala&&escala.status==='publicada'?'selected':'') + '>✓ Publicada</option>' +
    '</select></div>' +
    '</div>' +
    '<div class="form-row">' +
    '<div class="form-group"><label class="form-label">Data <span class="req">*</span></label>' +
    '<input type="date" id="me-data" class="form-control" value="' + (escala?.data||'') + '" oninput="checarConflitosModal()" /></div>' +
    '<div class="form-group"><label class="form-label">Horário <span class="req">*</span></label>' +
    '<input type="time" id="me-horario" class="form-control" value="' + (escala?.horario||'') + '" oninput="checarConflitosModal()" /></div>' +
    '</div>' +
    '<div class="form-group"><label class="form-label">Culto / Evento</label>' +
    '<input type="text" id="me-culto" class="form-control" placeholder="Ex: Culto da Família" value="' + (escala?.culto||'') + '" /></div>' +
    '<div id="campos-min"></div>' +
    '<div id="alerta-modal"></div>' +
    '</div>' +
    '<div class="modal-footer">' +
    '<button class="btn btn-ghost" onclick="fecharModalDireto()">Cancelar</button>' +
    '<button class="btn btn-draft" onclick="salvarEscala(' + (editarId||'null') + ',\'rascunho\')">✎ Salvar Rascunho</button>' +
    '<button class="btn btn-primary" onclick="salvarEscala(' + (editarId||'null') + ',\'publicada\')">✓ Publicar Escala</button>' +
    '</div></div></div>';

  abrirModal(html);
  if (escala) setTimeout(() => { atualizarCamposMin(escala); }, 10);
}

function atualizarCamposMin(dadosExist) {
  const tipo  = document.getElementById('me-tipo')?.value;
  const vols  = DB.getVoluntarios();
  const volOp = '<option value="">Selecione o voluntário…</option>' +
    vols.map(v => '<option value="' + v.id + '">' + v.nome + ' — ' + v.ministerio + '</option>').join('');

  let html = '';
  if (['Diaconos','Recepcao','Louvor','Midia'].includes(tipo)) {
    html = '<div class="form-row">' +
      '<div class="form-group"><label class="form-label">Voluntário</label><select id="me-vol" class="form-control" onchange="checarConflitosModal()">' + volOp + '</select></div>' +
      '<div class="form-group"><label class="form-label">Função</label><input type="text" id="me-funcao" class="form-control" placeholder="Portaria, Recepção…" /></div>' +
      '</div><div class="form-group"><label class="form-label">Local</label><input type="text" id="me-local" class="form-control" placeholder="Entrada principal…" /></div>';
  } else if (tipo === 'EBD') {
    html = '<div class="form-row">' +
      '<div class="form-group"><label class="form-label">Turma <span class="req">*</span></label><input type="text" id="me-turma" class="form-control" placeholder="Adultos, Jovens…" /></div>' +
      '<div class="form-group"><label class="form-label">Tema da Aula</label><input type="text" id="me-tema" class="form-control" placeholder="Ex: Frutos do Espírito" /></div>' +
      '</div><div class="form-row">' +
      '<div class="form-group"><label class="form-label">Professor</label><select id="me-professor" class="form-control" onchange="checarConflitosModal()">' + volOp + '</select></div>' +
      '<div class="form-group"><label class="form-label">Auxiliar</label><select id="me-auxiliar" class="form-control"><option value="">Selecione…</option>' + vols.map(v=>'<option value="'+v.id+'">'+v.nome+'</option>').join('') + '</select></div>' +
      '</div><div class="form-group"><label class="form-label">Resp. pelo Lanche</label><input type="text" id="me-lanche" class="form-control" placeholder="Nome do responsável" /></div>';
  } else if (tipo === 'Intercessao') {
    html = '<div class="form-row">' +
      '<div class="form-group"><label class="form-label">Intercessor</label><select id="me-intercessor" class="form-control" onchange="checarConflitosModal()">' + volOp + '</select></div>' +
      '<div class="form-group"><label class="form-label">Local</label><input type="text" id="me-local" class="form-control" placeholder="Sala de oração…" /></div>' +
      '</div><div class="form-group"><label class="form-label">Foco da Oração</label><input type="text" id="me-foco" class="form-control" placeholder="Reunião de líderes, missões…" /></div>';
  }

  if (document.getElementById('campos-min')) document.getElementById('campos-min').innerHTML = html;

  if (dadosExist && typeof dadosExist === 'object') {
    setTimeout(() => {
      const sel = (id, val) => { const el = document.getElementById(id); if (el && val) el.value = val; };
      sel('me-vol', dadosExist.voluntarioId);
      sel('me-funcao', dadosExist.funcao);
      sel('me-local', dadosExist.local);
      sel('me-turma', dadosExist.turma);
      sel('me-tema', dadosExist.tema);
      sel('me-lanche', dadosExist.responsavelLanche);
      sel('me-foco', dadosExist.focoPrayer);
      if (dadosExist.professor) {
        const v = DB.getVoluntarios().find(x => x.nome === dadosExist.professor);
        sel('me-professor', v?.id);
      }
      if (dadosExist.nomeIntercessor) {
        const v = DB.getVoluntarios().find(x => x.nome === dadosExist.nomeIntercessor);
        sel('me-intercessor', v?.id);
      }
      checarConflitosModal();
    }, 30);
  }
}

function checarConflitosModal() {
  const data    = document.getElementById('me-data')?.value;
  const horario = document.getElementById('me-horario')?.value;
  let   volId   = null;
  if (document.getElementById('me-vol'))         volId = parseInt(document.getElementById('me-vol').value);
  if (document.getElementById('me-professor'))   volId = parseInt(document.getElementById('me-professor').value);
  if (document.getElementById('me-intercessor')) volId = parseInt(document.getElementById('me-intercessor').value);

  const container = document.getElementById('alerta-modal');
  if (!container || !volId || !data || !horario) { if (container) container.innerHTML = ''; return; }

  const vol = DB.getVoluntarios().find(v => v.id === volId);
  if (!vol) return;
  const editandoId = null;
  const { conflitos } = verificarConflitosEscala(DB.getEscalas(), { data, horario, id: editandoId }, vol);

  if (conflitos.length === 0) {
    container.innerHTML = '<div class="inline-alert success"><span class="inline-alert-icon">✓</span><div class="inline-alert-body">Voluntário disponível para este horário.</div></div>';
  } else {
    container.innerHTML = conflitos.map(c =>
      '<div class="inline-alert ' + (c.gravidade==='alta'?'danger':'warning') + '">' +
      '<span class="inline-alert-icon">⚠</span>' +
      '<div class="inline-alert-body"><strong>' + (c.tipo==='horario-duplo'?'Conflito de horário':c.tipo==='data-especifica'?'Data bloqueada':'Indisponibilidade') + '</strong> — ' + c.msg + '</div></div>'
    ).join('');
  }
}

function salvarEscala(editarId, statusOverride) {
  const tipo    = document.getElementById('me-tipo')?.value;
  const data    = document.getElementById('me-data')?.value;
  const horario = document.getElementById('me-horario')?.value;
  const culto   = document.getElementById('me-culto')?.value || '';
  const status  = statusOverride || document.getElementById('me-status')?.value || 'rascunho';

  const camposEscala = { tipo, data, horario };
  const valCampos = validarCamposEscala({ ...camposEscala, turma: document.getElementById('me-turma')?.value });
  if (!valCampos.valido) { showToast(valCampos.erros[0], 'danger'); return; }

  const vols    = DB.getVoluntarios();
  const escalas = DB.getEscalas();
  let   nova    = { tipo, data, horario, culto, status, obs: '' };

  if (['Diaconos','Recepcao','Louvor','Midia'].includes(tipo)) {
    const vid = parseInt(document.getElementById('me-vol')?.value || 0);
    const vol = vols.find(v => v.id === vid);
    nova.voluntarioId = vid || null;
    nova.voluntarioNome = vol?.nome || '';
    nova.funcao = document.getElementById('me-funcao')?.value || '';
    nova.local  = document.getElementById('me-local')?.value  || '';
  } else if (tipo === 'EBD') {
    const pid = parseInt(document.getElementById('me-professor')?.value || 0);
    const aid = parseInt(document.getElementById('me-auxiliar')?.value  || 0);
    const prof = vols.find(v => v.id === pid);
    const aux  = vols.find(v => v.id === aid);
    nova.voluntarioId   = pid || null;
    nova.voluntarioNome = prof?.nome || '';
    nova.professor       = prof?.nome || '';
    nova.auxiliar        = aux?.nome  || '';
    nova.turma = document.getElementById('me-turma')?.value || '';
    nova.tema  = document.getElementById('me-tema')?.value  || '';
    nova.responsavelLanche = document.getElementById('me-lanche')?.value || '';
  } else if (tipo === 'Intercessao') {
    const iid = parseInt(document.getElementById('me-intercessor')?.value || 0);
    const int = vols.find(v => v.id === iid);
    nova.voluntarioId    = iid || null;
    nova.voluntarioNome  = int?.nome || '';
    nova.nomeIntercessor = int?.nome || '';
    nova.local      = document.getElementById('me-local')?.value || '';
    nova.focoPrayer = document.getElementById('me-foco')?.value  || '';
  }

  if (editarId && editarId !== 'null') {
    const idx = escalas.findIndex(e => e.id === editarId);
    if (idx !== -1) escalas[idx] = { ...escalas[idx], ...nova };
    DB.saveEscalas(escalas);
    showToast(status==='publicada' ? 'Escala atualizada e publicada!' : 'Escala salva como rascunho.', 'success');
  } else {
    nova.id = gerarId();
    escalas.push(nova);
    DB.saveEscalas(escalas);
    showToast(status==='publicada' ? 'Escala criada e publicada com sucesso!' : 'Escala salva como rascunho.', 'success');
  // Notificar voluntário ao publicar
  if (status === 'publicada' && nova.voluntarioId) {
    const vol = DB.getVoluntarios().find(v => v.id === nova.voluntarioId);
    if (vol) {
      criarNotificacao(nova.voluntarioId, 'escalado',
        'Você foi escalado(a)!',
        'Nova escala: ' + (nova.culto||nova.turma||MIN_BY_ID[nova.tipo]?.nome||'') + ' em ' + formatDate(nova.data) + ' às ' + nova.horario + '.'
      );
    }
  }
  }

  fecharModalDireto();
  atualizarBadgeConflitos();
  renderEscalas();
}

function confirmarExcluirEscala(id) {
  const e = DB.getEscalas().find(x => x.id === id);
  if (!e) return;
  const html =
    '<div class="modal-overlay" onclick="fecharModal(event)">' +
    '<div class="modal" onclick="event.stopPropagation()" style="max-width:420px;">' +
    '<div class="modal-header"><div class="modal-header-info"><h3>Excluir Escala</h3><p>Esta ação não pode ser desfeita.</p></div>' +
    '<button class="btn btn-ghost btn-sm btn-icon" onclick="fecharModalDireto()">✕</button></div>' +
    '<div class="modal-body">' +
    '<div class="inline-alert danger"><span class="inline-alert-icon">⚠</span>' +
    '<div class="inline-alert-body"><strong>' + (e.culto||e.turma||'Escala') + '</strong>' +
    '<span style="display:block;font-size:12px;margin-top:2px;">' + formatDate(e.data) + ' às ' + e.horario + '</span></div></div>' +
    '</div>' +
    '<div class="modal-footer"><button class="btn btn-ghost" onclick="fecharModalDireto()">Cancelar</button>' +
    '<button class="btn btn-danger" onclick="excluirEscala(' + id + ')">Sim, excluir</button>' +
    '</div></div></div>';
  abrirModal(html);
}

function excluirEscala(id) {
  DB.saveEscalas(DB.getEscalas().filter(e => e.id !== id));
  showToast('Escala removida.', 'info');
  fecharModalDireto();
  atualizarBadgeConflitos();
  renderEscalas();
}

/* ================================================================ MODAL VOLUNTÁRIO */
function abrirModalVoluntario(editarId) {
  editarId   = editarId || null;
  const vol  = editarId ? DB.getVoluntarios().find(v => v.id === editarId) : null;
  const user = editarId ? DB.getUsuarios().find(u => u.id === editarId) : null;
  const minOpts = MINISTERIOS.map(m =>
    '<option value="' + m.nome + '" ' + (vol&&vol.ministerio===m.nome?'selected':'') + '>' + m.nome + '</option>'
  ).join('');

  const html =
    '<div class="modal-overlay" onclick="fecharModal(event)">' +
    '<div class="modal" onclick="event.stopPropagation()">' +
    '<div class="modal-header"><div class="modal-header-info">' +
    '<h3>' + (editarId ? 'Editar Voluntário' : 'Cadastrar Voluntário') + '</h3>' +
    '<p>Preencha os dados do membro da equipe.</p></div>' +
    '<button class="btn btn-ghost btn-sm btn-icon" onclick="fecharModalDireto()">✕</button></div>' +
    '<div class="modal-body">' +
    '<div class="form-group"><label class="form-label">Nome Completo <span class="req">*</span></label>' +
    '<input type="text" id="mv-nome" class="form-control" placeholder="Nome completo" value="' + (vol?.nome||'') + '" /></div>' +
    '<div class="form-row">' +
    '<div class="form-group"><label class="form-label">Ministério <span class="req">*</span></label>' +
    '<select id="mv-min" class="form-control"><option value="">Selecione…</option>' + minOpts + '</select></div>' +
    '<div class="form-group"><label class="form-label">Telefone</label>' +
    '<input type="text" id="mv-tel" class="form-control" placeholder="(11) 99999-9999" value="' + (vol?.telefone||'') + '" /></div>' +
    '</div><div class="form-row">' +
    '<div class="form-group"><label class="form-label">Usuário (login) <span class="req">*</span></label>' +
    '<input type="text" id="mv-user" class="form-control" placeholder="login único" value="' + (user?.usuario||'') + '" /></div>' +
    '<div class="form-group"><label class="form-label">Senha <span class="req">*</span></label>' +
    '<input type="password" id="mv-senha" class="form-control" placeholder="mín. 4 caracteres" value="' + (user?.senha||'') + '" /></div>' +
    '</div><div class="form-group"><label class="form-label">E-mail</label>' +
    '<input type="email" id="mv-email" class="form-control" placeholder="email@exemplo.com" value="' + (vol?.email||'') + '" /></div>' +
    '</div>' +
    '<div class="modal-footer"><button class="btn btn-ghost" onclick="fecharModalDireto()">Cancelar</button>' +
    '<button class="btn btn-primary" onclick="salvarVoluntario(' + (editarId||'null') + ')">' + (editarId?'✓ Salvar':'+ Cadastrar') + '</button>' +
    '</div></div></div>';

  abrirModal(html);
}

function salvarVoluntario(editarId) {
  const dados = {
    nome:      document.getElementById('mv-nome')?.value.trim(),
    ministerio:document.getElementById('mv-min')?.value,
    telefone:  document.getElementById('mv-tel')?.value.trim(),
    email:     document.getElementById('mv-email')?.value.trim(),
    usuario:   document.getElementById('mv-user')?.value.trim(),
    senha:     document.getElementById('mv-senha')?.value.trim(),
  };

  const idNum = editarId && editarId !== 'null' ? editarId : null;
  const val   = validarCamposVoluntario(dados, idNum);
  if (!val.valido) { showToast(val.erros[0], 'danger'); return; }

  const vols    = DB.getVoluntarios();
  const usuarios = DB.getUsuarios();

  if (idNum) {
    const iv = vols.findIndex(v => v.id === idNum);
    if (iv !== -1) vols[iv] = { ...vols[iv], nome: dados.nome, ministerio: dados.ministerio, telefone: dados.telefone, email: dados.email };
    DB.saveVoluntarios(vols);
    const iu = usuarios.findIndex(u => u.id === idNum);
    if (iu !== -1) usuarios[iu] = { ...usuarios[iu], nome: dados.nome, usuario: dados.usuario, senha: dados.senha, ministerio: dados.ministerio };
    DB.saveUsuarios(usuarios);
    showToast('Voluntário atualizado com sucesso!', 'success');
  } else {
    const nid = gerarId();
    const dispVazio = DIAS_SEMANA.reduce((acc,d) => { acc[d.id] = []; return acc; }, {});
    vols.push({ id: nid, nome: dados.nome, ministerio: dados.ministerio, telefone: dados.telefone, email: dados.email,
      status: 'ativo', disponibilidade: dispVazio, indisponibilidade: [], datasEspecificas: [] });
    usuarios.push({ id: nid, usuario: dados.usuario, senha: dados.senha, perfil: 'voluntario', nome: dados.nome, ministerio: dados.ministerio });
    DB.saveVoluntarios(vols);
    DB.saveUsuarios(usuarios);
    showToast('Voluntário cadastrado com sucesso!', 'success');
  }

  fecharModalDireto();
  renderVoluntarios();
}

function confirmarExcluirVoluntario(id) {
  const v = DB.getVoluntarios().find(x => x.id === id);
  if (!v) return;
  const html =
    '<div class="modal-overlay" onclick="fecharModal(event)">' +
    '<div class="modal" onclick="event.stopPropagation()" style="max-width:420px;">' +
    '<div class="modal-header"><div class="modal-header-info"><h3>Excluir Voluntário</h3><p>Esta ação não pode ser desfeita.</p></div>' +
    '<button class="btn btn-ghost btn-sm btn-icon" onclick="fecharModalDireto()">✕</button></div>' +
    '<div class="modal-body"><div class="inline-alert danger"><span class="inline-alert-icon">⚠</span>' +
    '<div class="inline-alert-body"><strong>' + v.nome + '</strong> será removido permanentemente do sistema.</div></div></div>' +
    '<div class="modal-footer"><button class="btn btn-ghost" onclick="fecharModalDireto()">Cancelar</button>' +
    '<button class="btn btn-danger" onclick="excluirVoluntario(' + id + ')">Sim, excluir</button>' +
    '</div></div></div>';
  abrirModal(html);
}

function excluirVoluntario(id) {
  DB.saveVoluntarios(DB.getVoluntarios().filter(v => v.id !== id));
  DB.saveUsuarios(DB.getUsuarios().filter(u => u.id !== id));
  showToast('Voluntário removido.', 'info');
  fecharModalDireto();
  renderVoluntarios();
}
