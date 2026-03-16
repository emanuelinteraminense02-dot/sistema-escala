/* ================================================================
   APP.JS — Shell principal com novos módulos integrados
   ================================================================ */

function iniciarApp() {
  const u = usuarioSessao;

  document.getElementById('sb-avatar').textContent    = iniciais(u.nome);
  document.getElementById('sb-user-name').textContent = u.nome;
  document.getElementById('sb-user-role').textContent = u.perfil === 'admin' ? 'Administrador' : 'Voluntário';

  // Montar topbar com busca global + sino
  montarTopbarPermanente();

  const nav = document.getElementById('sidebar-nav');

  if (u.perfil === 'admin') {
    nav.innerHTML =
      '<div class="nav-section">Principal</div>' +
      '<div class="nav-item active" id="nav-dashboard" onclick="navegar(\'dashboard\')">' +
        '<span class="nav-ic">📊</span><span class="nav-txt">Dashboard</span></div>' +
      '<div class="nav-section">Escalas</div>' +
      '<div class="nav-item" id="nav-escalas" onclick="navegar(\'escalas\')">' +
        '<span class="nav-ic">📋</span><span class="nav-txt">Todas as Escalas</span></div>' +
      '<div class="nav-item" id="nav-calendario" onclick="navegar(\'calendario\')">' +
        '<span class="nav-ic">🗓</span><span class="nav-txt">Calendário</span></div>' +
      '<div class="nav-item" id="nav-conflitos" onclick="navegar(\'conflitos\')">' +
        '<span class="nav-ic">⚠</span><span class="nav-txt">Conflitos</span>' +
        '<span class="nav-count danger" id="badge-conflitos" style="display:none;">0</span></div>' +
      '<div class="nav-section">Equipe</div>' +
      '<div class="nav-item" id="nav-voluntarios" onclick="navegar(\'voluntarios\')">' +
        '<span class="nav-ic">👥</span><span class="nav-txt">Voluntários</span></div>' +
      '<div class="nav-item" id="nav-disponibilidades" onclick="navegar(\'disponibilidades\')">' +
        '<span class="nav-ic">📅</span><span class="nav-txt">Disponibilidades</span></div>' +
      '<div class="nav-section">Comunicação</div>' +
      '<div class="nav-item" id="nav-avisos" onclick="abrirModalAvisoGeral()">' +
        '<span class="nav-ic">📢</span><span class="nav-txt">Enviar Aviso</span></div>' +
      '<div class="nav-section">Sistema</div>' +
      '<div class="nav-item" id="nav-relatorios" onclick="navegar(\'relatorios\')">' +
        '<span class="nav-ic">📈</span><span class="nav-txt">Relatórios</span></div>' +
      '<div class="nav-item" id="nav-log" onclick="navegar(\'log\')">' +
        '<span class="nav-ic">📝</span><span class="nav-txt">Log de Atividades</span></div>' +
      '<div class="nav-item" id="nav-config" onclick="navegar(\'config\')">' +
        '<span class="nav-ic">⚙</span><span class="nav-txt">Configurações</span></div>';

    atualizarBadgeConflitos();
    navegar('dashboard');
  } else {
    nav.innerHTML =
      '<div class="nav-section">Meu Espaço</div>' +
      '<div class="nav-item active" id="nav-painel-vol" onclick="navegar(\'painel-vol\')">' +
        '<span class="nav-ic">🏠</span><span class="nav-txt">Meu Painel</span></div>' +
      '<div class="nav-section">Escalas</div>' +
      '<div class="nav-item" id="nav-minhas-escalas" onclick="navegar(\'minhas-escalas\')">' +
        '<span class="nav-ic">📋</span><span class="nav-txt">Minhas Escalas</span></div>' +
      '<div class="nav-item" id="nav-todas-escalas" onclick="navegar(\'todas-escalas\')">' +
        '<span class="nav-ic">🗓</span><span class="nav-txt">Calendário Geral</span></div>' +
      '<div class="nav-section">Preferências</div>' +
      '<div class="nav-item" id="nav-minha-disp" onclick="navegar(\'minha-disp\')">' +
        '<span class="nav-ic">✅</span><span class="nav-txt">Minha Disponibilidade</span></div>';
    navegar('painel-vol');
  }

  atualizarBadgeNotif();
}

/* ----------------------------------------------------------------
   Topbar permanente com busca + sino
   ---------------------------------------------------------------- */
function montarTopbarPermanente() {
  // Inserir busca e sino no topbar-right (área permanente)
  const existente = document.getElementById('topbar-permanente');
  if (existente) return;

  const topbarRight = document.querySelector('.topbar');
  if (!topbarRight) return;

  const perm = document.createElement('div');
  perm.id = 'topbar-permanente';
  perm.style.cssText = 'display:flex;align-items:center;gap:10px;flex:1;justify-content:flex-end;';

  perm.innerHTML =
    (usuarioSessao.perfil === 'admin'
      ? '<div class="busca-global-wrap" id="busca-global-wrap"></div>'
      : '') +
    '<div class="notif-btn" onclick="togglePainelNotif()" title="Notificações">' +
    '🔔<span class="notif-dot" id="badge-notif" style="display:none;">0</span>' +
    '</div>' +
    '<div id="topbar-right-actions" style="display:flex;gap:8px;"></div>';

  topbarRight.appendChild(perm);

  if (usuarioSessao.perfil === 'admin') {
    setTimeout(initBuscaGlobal, 100);
  }
}

/* ----------------------------------------------------------------
   Roteador de páginas (estendido)
   ---------------------------------------------------------------- */
function navegar(pagina) {
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  const navEl = document.getElementById('nav-' + pagina);
  if (navEl) navEl.classList.add('active');

  const titulos = {
    dashboard:        { icon: '📊', txt: 'Dashboard',           sub: 'Visão geral do sistema' },
    escalas:          { icon: '📋', txt: 'Escalas',             sub: 'Gerencie todas as escalas' },
    calendario:       { icon: '🗓', txt: 'Calendário',          sub: 'Visualização mensal' },
    conflitos:        { icon: '⚠',  txt: 'Conflitos',           sub: 'Escale com segurança' },
    voluntarios:      { icon: '👥', txt: 'Voluntários',         sub: 'Equipe ministerial' },
    disponibilidades: { icon: '📅', txt: 'Disponibilidades',    sub: 'Horários da equipe' },
    relatorios:       { icon: '📈', txt: 'Relatórios',          sub: 'Exportar e analisar dados' },
    log:              { icon: '📝', txt: 'Log de Atividades',   sub: 'Auditoria do sistema' },
    config:           { icon: '⚙',  txt: 'Configurações',       sub: 'Preferências do sistema' },
    'painel-vol':     { icon: '🏠', txt: 'Meu Painel',          sub: 'Resumo pessoal' },
    'minhas-escalas': { icon: '📋', txt: 'Minhas Escalas',      sub: 'Suas próximas escalas' },
    'todas-escalas':  { icon: '🗓', txt: 'Calendário Geral',    sub: 'Escalas da igreja' },
    'minha-disp':     { icon: '✅', txt: 'Minha Disponibilidade', sub: 'Configure seus horários' },
  };

  const t = titulos[pagina] || { icon: '◈', txt: pagina, sub: '' };
  const topbarLeft = document.getElementById('topbar-left');
  if (topbarLeft) {
    topbarLeft.innerHTML =
      '<div class="topbar-icon">' + t.icon + '</div>' +
      '<div><div class="topbar-title">' + t.txt + '</div>' +
      '<div class="topbar-subtitle">' + t.sub + '</div></div>';
  }

  // Limpar ações do topbar (mas manter permanentes)
  const actionsEl = document.getElementById('topbar-right-actions');
  if (actionsEl) actionsEl.innerHTML = '';

  document.getElementById('page-wrap').innerHTML = '';

  const renders = {
    dashboard:        renderDashboard,
    escalas:          renderEscalas,
    calendario:       renderCalendario,
    conflitos:        renderConflitos,
    voluntarios:      renderVoluntarios,
    disponibilidades: renderDisponibilidades,
    relatorios:       renderRelatorios,
    log:              renderLog,
    config:           renderConfig,
    'painel-vol':     renderPainelVol,
    'minhas-escalas': renderMinhasEscalas,
    'todas-escalas':  renderTodasEscalas,
    'minha-disp':     renderMinhaDisp,
  };
  if (renders[pagina]) renders[pagina]();
}

/* ----------------------------------------------------------------
   Relatórios (nova página)
   ---------------------------------------------------------------- */
function renderRelatorios() {
  const escalas = DB.getEscalas();
  const vols    = DB.getVoluntarios();

  // Estatísticas por ministério
  const porMin = MINISTERIOS.map(m => ({
    nome:  m.nome,
    total: escalas.filter(e => e.tipo === m.id).length,
    pub:   escalas.filter(e => e.tipo === m.id && e.status === 'publicada').length,
  })).filter(m => m.total > 0);

  // Voluntários com mais escalas
  const ranking = vols.map(v => ({
    nome: v.nome,
    min:  v.ministerio,
    total: escalas.filter(e =>
      e.voluntarioId === v.id ||
      e.voluntarioNome === v.nome ||
      e.professor === v.nome ||
      e.nomeIntercessor === v.nome
    ).length,
  })).sort((a,b) => b.total - a.total).slice(0, 10);

  document.getElementById('page-wrap').innerHTML =
    '<div class="page-header">' +
    '<div class="page-header-text"><div class="eyebrow">Análise</div><h2>Relatórios</h2>' +
    '<p>Estatísticas e exportação de dados</p></div>' +
    '<div class="page-header-actions">' +
    '<button class="btn btn-ghost btn-sm" onclick="exportarEscalasCSV()">⬇ Exportar Escalas CSV</button>' +
    '<button class="btn btn-ghost btn-sm" onclick="exportarVoluntariosCSV()">⬇ Exportar Voluntários CSV</button>' +
    '</div></div>' +

    '<div class="grid-2">' +
    '<div class="card">' +
    '<div class="card-header"><h4>📊 Escalas por Ministério</h4></div>' +
    '<div class="card-body" style="padding-top:12px;">' +
    porMin.map(m => {
      const pct = m.total > 0 ? Math.round((m.pub/m.total)*100) : 0;
      return '<div style="margin-bottom:14px;">' +
        '<div style="display:flex;justify-content:space-between;margin-bottom:4px;">' +
        '<span style="font-size:13px;font-weight:600;">' + m.nome + '</span>' +
        '<span style="font-size:12px;color:var(--text-muted);">' + m.pub + '/' + m.total + ' publicadas</span>' +
        '</div>' +
        '<div style="background:var(--bg-elevated);border-radius:4px;height:6px;overflow:hidden;">' +
        '<div style="height:100%;width:' + pct + '%;background:var(--brand-500);border-radius:4px;transition:width 0.5s;"></div>' +
        '</div></div>';
    }).join('') +
    (porMin.length === 0 ? '<p class="text-muted text-sm">Nenhuma escala cadastrada.</p>' : '') +
    '</div></div>' +

    '<div class="card">' +
    '<div class="card-header"><h4>🏆 Voluntários mais escalados</h4></div>' +
    '<div class="table-wrap"><table class="table"><thead>' +
    '<tr><th>#</th><th>Voluntário</th><th>Ministério</th><th>Escalas</th></tr></thead><tbody>' +
    (ranking.length === 0
      ? '<tr><td colspan="4" style="text-align:center;color:var(--text-muted);">Nenhum dado.</td></tr>'
      : ranking.map((v,i) =>
          '<tr><td><strong>#' + (i+1) + '</strong></td><td>' + v.nome + '</td>' +
          '<td><span style="font-size:11px;color:var(--text-muted);">' + v.min + '</span></td>' +
          '<td><span class="badge badge-brand">' + v.total + '</span></td></tr>'
        ).join('')) +
    '</tbody></table></div></div>' +
    '</div>';
}
