/* ================================================================
   MODULOS.JS — Módulos avançados do sistema
   Calendário · Notificações · Config · Log · Busca Global
   Escala recorrente · Copiar · Aniversariantes
   ================================================================ */

/* ================================================================
   BUSCA GLOBAL
   ================================================================ */
let buscaTimeout = null;

function initBuscaGlobal() {
  const wrap = document.getElementById('busca-global-wrap');
  if (!wrap) return;
  wrap.innerHTML =
    '<span class="busca-global-icon">🔍</span>' +
    '<input type="text" class="busca-global-input" placeholder="Buscar escalas, voluntários…" ' +
    'oninput="debouncesBusca(this.value)" onblur="fecharBuscaDropdown()" ' +
    'onfocus="if(this.value) debouncesBusca(this.value)" autocomplete="off" />';
}

function debouncesBusca(q) {
  clearTimeout(buscaTimeout);
  buscaTimeout = setTimeout(() => executarBusca(q), 220);
}

function executarBusca(q) {
  const wrap = document.getElementById('busca-global-wrap');
  if (!wrap) return;
  let dropdown = wrap.querySelector('.busca-dropdown');

  if (!q || q.trim().length < 2) {
    if (dropdown) dropdown.remove();
    return;
  }

  const b   = q.toLowerCase();
  const esc = DB.getEscalas().filter(e =>
    (e.culto||'').toLowerCase().includes(b) ||
    (e.voluntarioNome||'').toLowerCase().includes(b) ||
    (e.professor||'').toLowerCase().includes(b) ||
    (e.nomeIntercessor||'').toLowerCase().includes(b)
  ).slice(0, 5);

  const vols = DB.getVoluntarios().filter(v =>
    v.nome.toLowerCase().includes(b) ||
    v.ministerio.toLowerCase().includes(b)
  ).slice(0, 4);

  if (!dropdown) {
    dropdown = document.createElement('div');
    dropdown.className = 'busca-dropdown';
    wrap.appendChild(dropdown);
  }

  let html = '';
  if (esc.length > 0) {
    html += '<div class="busca-section-title">📋 Escalas</div>';
    html += esc.map(e =>
      '<div class="busca-item" onmousedown="irParaEscala(' + e.id + ')">' +
      '<div class="bi-icon">📋</div>' +
      '<div class="bi-text">' +
      '<div class="bi-title">' + (e.culto||e.turma||e.nomeIntercessor||'—') + '</div>' +
      '<div class="bi-sub">' + formatDate(e.data) + ' · ' + (MIN_BY_ID[e.tipo]?.nome||e.tipo) + '</div>' +
      '</div></div>'
    ).join('');
  }
  if (vols.length > 0) {
    html += '<div class="busca-section-title">👥 Voluntários</div>';
    html += vols.map(v =>
      '<div class="busca-item" onmousedown="irParaVoluntario(' + v.id + ')">' +
      '<div class="bi-icon">👤</div>' +
      '<div class="bi-text">' +
      '<div class="bi-title">' + v.nome + '</div>' +
      '<div class="bi-sub">' + v.ministerio + '</div>' +
      '</div></div>'
    ).join('');
  }
  if (!html) html = '<div class="busca-vazio">Nenhum resultado para "' + q + '"</div>';

  dropdown.innerHTML = html;
}

function fecharBuscaDropdown() {
  setTimeout(() => {
    const d = document.querySelector('.busca-dropdown');
    if (d) d.remove();
  }, 200);
}

function irParaEscala(id) {
  fecharBuscaDropdown();
  navegar('escalas');
  setTimeout(() => {
    const el = document.querySelector('[data-escala-id="' + id + '"]');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 400);
}

function irParaVoluntario(id) {
  fecharBuscaDropdown();
  if (usuarioSessao.perfil === 'admin') navegar('voluntarios');
}

/* ================================================================
   NOTIFICAÇÕES — painel dropdown
   ================================================================ */
let painelNotifAberto = false;

function togglePainelNotif() {
  const existente = document.getElementById('painel-notif');
  if (existente) { existente.remove(); painelNotifAberto = false; return; }
  painelNotifAberto = true;
  renderPainelNotif();
}

function renderPainelNotif() {
  const notifs    = getNotificacoesUsuario(usuarioSessao.id);
  const naoLidas  = notifs.filter(n => !n.lida).length;
  const icones    = { escalado: '📋', editado: '✎', cancelado: '🚫', aviso: 'ℹ' };

  function tempo(iso) {
    const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
    if (diff < 60)   return 'Agora';
    if (diff < 3600) return Math.floor(diff/60) + 'min atrás';
    if (diff < 86400)return Math.floor(diff/3600) + 'h atrás';
    return Math.floor(diff/86400) + 'd atrás';
  }

  const itens = notifs.length === 0
    ? '<div class="notif-vazio"><span style="font-size:32px;opacity:.2;">🔔</span><p class="text-muted text-sm" style="margin-top:8px;">Nenhuma notificação.</p></div>'
    : notifs.slice(0, 20).map(n =>
        '<div class="notif-item ' + (n.lida?'':'nao-lida') + '" onclick="clicarNotif(' + n.id + ')">' +
        '<div class="notif-ic ' + n.tipo + '">' + (icones[n.tipo]||'🔔') + '</div>' +
        '<div class="notif-body">' +
        '<div class="notif-titulo">' + n.titulo + '</div>' +
        '<div class="notif-corpo">'  + n.corpo   + '</div>' +
        '<div class="notif-tempo">'  + tempo(n.criadaEm) + '</div>' +
        '</div></div>'
      ).join('');

  const div = document.createElement('div');
  div.id        = 'painel-notif';
  div.className = 'notif-panel';
  div.innerHTML =
    '<div class="notif-header">' +
    '<h4>🔔 Notificações ' + (naoLidas>0 ? '<span class="badge badge-red">'+naoLidas+'</span>' : '') + '</h4>' +
    (naoLidas>0 ? '<button class="btn btn-ghost btn-xs" onclick="marcarTodasLidas('+usuarioSessao.id+');renderPainelNotif()">Marcar lidas</button>' : '') +
    '</div>' +
    '<div class="notif-list">' + itens + '</div>';

  document.body.appendChild(div);
  // Fechar ao clicar fora
  setTimeout(() => {
    document.addEventListener('click', function handler(e) {
      if (!div.contains(e.target) && !e.target.closest('.notif-btn')) {
        div.remove(); painelNotifAberto = false;
        document.removeEventListener('click', handler);
      }
    });
  }, 50);
}

function clicarNotif(id) {
  marcarNotifLida(id);
  renderPainelNotif();
}

/* ================================================================
   CALENDÁRIO MENSAL
   ================================================================ */
let calMes = new Date().getMonth();
let calAno = new Date().getFullYear();

function renderCalendario() {
  document.getElementById('topbar-right-actions').innerHTML =
    '<button class="btn btn-primary btn-sm" onclick="abrirModalEscala()">+ Nova Escala</button>';

  document.getElementById('page-wrap').innerHTML =
    '<div class="page-header">' +
    '<div class="page-header-text"><div class="eyebrow">Visualização</div><h2>Calendário</h2>' +
    '<p>Visualize todas as escalas publicadas no mês</p></div></div>' +
    '<div class="card"><div class="card-body" id="cal-body"></div></div>';

  renderCalBody();
}

function renderCalBody() {
  const hoje     = new Date();
  const meses    = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const dow      = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
  const escalas  = DB.getEscalas().filter(e => {
    const d = new Date(e.data + 'T12:00:00');
    return d.getMonth() === calMes && d.getFullYear() === calAno && e.status === 'publicada';
  });

  // Primeiro dia do mês e quantos dias tem
  const primeiroDia = new Date(calAno, calMes, 1).getDay();
  const diasNoMes   = new Date(calAno, calMes + 1, 0).getDate();
  const diasMesAnt  = new Date(calAno, calMes, 0).getDate();

  // Mapa data -> escalas
  const mapaEscalas = {};
  escalas.forEach(e => {
    const k = e.data;
    if (!mapaEscalas[k]) mapaEscalas[k] = [];
    mapaEscalas[k].push(e);
  });

  // Header
  let html =
    '<div class="cal-nav">' +
    '<button class="btn btn-ghost btn-sm" onclick="calMes--; if(calMes<0){calMes=11;calAno--;} renderCalBody()">‹ Anterior</button>' +
    '<div class="cal-mes-titulo">' + meses[calMes] + ' ' + calAno + '</div>' +
    '<button class="btn btn-ghost btn-sm" onclick="calMes++; if(calMes>11){calMes=0;calAno++;} renderCalBody()">Próximo ›</button>' +
    '</div>';

  // Dias da semana
  html += '<div class="cal-grid">';
  dow.forEach(d => { html += '<div class="cal-dow">' + d + '</div>'; });

  // Células anteriores ao mês
  for (let i = 0; i < primeiroDia; i++) {
    const dia = diasMesAnt - primeiroDia + 1 + i;
    html += '<div class="cal-cell outro-mes"><div class="cal-num">' + dia + '</div></div>';
  }

  // Dias do mês atual
  for (let d = 1; d <= diasNoMes; d++) {
    const dataStr = calAno + '-' + String(calMes+1).padStart(2,'0') + '-' + String(d).padStart(2,'0');
    const eHoje   = hoje.getDate()===d && hoje.getMonth()===calMes && hoje.getFullYear()===calAno;
    const evts    = mapaEscalas[dataStr] || [];
    const max     = 3;
    const evHtml  = evts.slice(0,max).map(e =>
      '<div class="cal-evento ' + e.tipo + '" title="' + (e.culto||e.turma||MIN_BY_ID[e.tipo]?.nome||'') + '" ' +
      'onclick="abrirModalEscala(' + e.id + ')">' +
      (e.culto||e.turma||MIN_BY_ID[e.tipo]?.nome||'Escala') +
      '</div>'
    ).join('');
    const maisHtml = evts.length > max ? '<div class="cal-mais">+' + (evts.length-max) + ' mais</div>' : '';

    html += '<div class="cal-cell ' + (eHoje?'hoje':'') + '">' +
      '<div class="cal-num">' + d + '</div>' +
      evHtml + maisHtml + '</div>';
  }

  // Células do próximo mês para completar a grade
  const totalCelulas = primeiroDia + diasNoMes;
  const resto = totalCelulas % 7 === 0 ? 0 : 7 - (totalCelulas % 7);
  for (let i = 1; i <= resto; i++) {
    html += '<div class="cal-cell outro-mes"><div class="cal-num">' + i + '</div></div>';
  }

  html += '</div>'; // cal-grid
  document.getElementById('cal-body').innerHTML = html;
}

/* ================================================================
   CONFIGURAÇÕES DA IGREJA
   ================================================================ */
function renderConfig() {
  document.getElementById('topbar-right-actions').innerHTML = '';
  const cfg = DB.getConfig();

  document.getElementById('page-wrap').innerHTML =
    '<div class="page-header">' +
    '<div class="page-header-text"><div class="eyebrow">Sistema</div><h2>Configurações</h2>' +
    '<p>Personalize as informações da igreja e do sistema</p></div></div>' +

    // Dados da Igreja
    '<div class="config-section">' +
    '<div class="config-section-header">⛪ Dados da Igreja</div>' +
    '<div class="config-section-body">' +
    '<div class="form-row">' +
    '<div class="form-group"><label class="form-label">Nome da Igreja</label>' +
    '<input type="text" id="cfg-nome" class="form-control" value="' + (cfg.nomeIgreja||'') + '" /></div>' +
    '<div class="form-group"><label class="form-label">Subtítulo</label>' +
    '<input type="text" id="cfg-sub" class="form-control" value="' + (cfg.subtitulo||'') + '" /></div>' +
    '</div>' +
    '<div class="form-row">' +
    '<div class="form-group"><label class="form-label">Pastor Responsável</label>' +
    '<input type="text" id="cfg-pastor" class="form-control" value="' + (cfg.pastor||'') + '" /></div>' +
    '<div class="form-group"><label class="form-label">Telefone</label>' +
    '<input type="text" id="cfg-tel" class="form-control" value="' + (cfg.telefone||'') + '" /></div>' +
    '</div>' +
    '<div class="form-row">' +
    '<div class="form-group"><label class="form-label">Endereço</label>' +
    '<input type="text" id="cfg-end" class="form-control" value="' + (cfg.endereco||'') + '" /></div>' +
    '<div class="form-group"><label class="form-label">E-mail</label>' +
    '<input type="email" id="cfg-email" class="form-control" value="' + (cfg.email||'') + '" /></div>' +
    '</div>' +
    '<div style="display:flex;justify-content:flex-end;">' +
    '<button class="btn btn-primary" onclick="salvarConfig()">💾 Salvar Configurações</button>' +
    '</div></div></div>' +

    // Backup / Restore
    '<div class="config-section">' +
    '<div class="config-section-header">💾 Backup & Restauração</div>' +
    '<div class="config-section-body">' +
    '<p style="font-size:13px;margin-bottom:16px;">Exporte todos os dados do sistema em JSON para guardar uma cópia ou migrar para outro dispositivo.</p>' +
    '<div style="display:flex;gap:12px;flex-wrap:wrap;">' +
    '<button class="btn btn-primary" onclick="exportarBackup()">⬇ Exportar Backup JSON</button>' +
    '<label class="btn btn-ghost" style="cursor:pointer;">' +
    '⬆ Importar Backup' +
    '<input type="file" accept=".json" style="display:none;" onchange="importarBackup(this.files[0])" />' +
    '</label>' +
    '</div>' +
    '<div class="inline-alert warning" style="margin-top:14px;">' +
    '<span class="inline-alert-icon">⚠</span>' +
    '<div class="inline-alert-body"><strong>Atenção:</strong> Importar um backup substitui <em>todos</em> os dados atuais permanentemente.</div>' +
    '</div></div></div>' +

    // Reset
    '<div class="config-section" style="border-color:var(--red-border);">' +
    '<div class="config-section-header" style="background:var(--red-bg);color:var(--red);">⚠ Zona de Perigo</div>' +
    '<div class="config-section-body">' +
    '<p style="font-size:13px;margin-bottom:14px;">Limpar todos os dados e restaurar o sistema ao estado inicial com dados de demonstração.</p>' +
    '<button class="btn btn-danger" onclick="resetarSistema()">🗑 Resetar Sistema</button>' +
    '</div></div>';
}

function salvarConfig() {
  const cfg = {
    nomeIgreja: document.getElementById('cfg-nome')?.value.trim() || 'Shekinah IAD',
    subtitulo:  document.getElementById('cfg-sub')?.value.trim()  || '',
    pastor:     document.getElementById('cfg-pastor')?.value.trim()||'',
    telefone:   document.getElementById('cfg-tel')?.value.trim()  ||'',
    endereco:   document.getElementById('cfg-end')?.value.trim()  ||'',
    email:      document.getElementById('cfg-email')?.value.trim()||'',
  };
  DB.saveConfig(cfg);
  registrarLog('config', 'Configurações da igreja atualizadas');
  showToast('Configurações salvas com sucesso!', 'success');
}

function resetarSistema() {
  fecharModalDireto();
  const html =
    '<div class="modal-overlay" onclick="fecharModal(event)">' +
    '<div class="modal" onclick="event.stopPropagation()" style="max-width:420px;">' +
    '<div class="modal-header"><div class="modal-header-info"><h3 style="color:var(--red);">⚠ Resetar Sistema</h3>' +
    '<p>Esta ação apagará TODOS os dados.</p></div>' +
    '<button class="btn btn-ghost btn-sm btn-icon" onclick="fecharModalDireto()">✕</button></div>' +
    '<div class="modal-body">' +
    '<div class="inline-alert danger"><span class="inline-alert-icon">⚠</span>' +
    '<div class="inline-alert-body">Todos os voluntários, escalas e configurações serão <strong>apagados permanentemente</strong>. ' +
    'Os dados de demonstração serão restaurados.</div></div></div>' +
    '<div class="modal-footer">' +
    '<button class="btn btn-ghost" onclick="fecharModalDireto()">Cancelar</button>' +
    '<button class="btn btn-danger" onclick="confirmarReset()">Sim, resetar tudo</button>' +
    '</div></div></div>';
  abrirModal(html);
}

function confirmarReset() {
  Object.values(KEYS).forEach(k => localStorage.removeItem(k));
  Object.values(KEYS_EXT).forEach(k => localStorage.removeItem(k));
  fecharModalDireto();
  showToast('Sistema resetado. Redirecionando…', 'info');
  setTimeout(() => logout(), 1200);
}

/* ================================================================
   AVISO DE ANIVERSARIANTES (widget do dashboard)
   ================================================================ */
function bannerAniversariantes() {
  // Verifica voluntários com aniversário no mês atual
  // (campo dataNascimento no voluntário, formato YYYY-MM-DD)
  const hoje = new Date();
  const vols = DB.getVoluntarios().filter(v => {
    if (!v.dataNascimento) return false;
    const [,m] = v.dataNascimento.split('-');
    return parseInt(m) === hoje.getMonth() + 1;
  });
  if (vols.length === 0) return '';
  const nomes = vols.map(v => v.nome.split(' ')[0]).join(', ');
  return '<div class="aniversario-banner">' +
    '<span class="ab-icon">🎂</span>' +
    '<div class="ab-txt">' +
    '<div class="ab-titulo">Aniversariantes do mês!</div>' +
    '<div class="ab-nomes">' + nomes + ' fazem aniversário este mês. Não esqueça de parabenizá-los! 🎉</div>' +
    '</div></div>';
}

/* ================================================================
   LOG DE ATIVIDADES (página)
   ================================================================ */
function renderLog() {
  const logs  = DB.getLog();
  const icones = { escala: '📋', voluntario: '👤', config: '⚙', backup: '💾', login: '🔑', default: '📝' };

  document.getElementById('page-wrap').innerHTML =
    '<div class="page-header">' +
    '<div class="page-header-text"><div class="eyebrow">Auditoria</div><h2>Log de Atividades</h2>' +
    '<p>Registro das últimas ' + logs.length + ' ações no sistema</p></div>' +
    '<button class="btn btn-ghost btn-sm" onclick="DB.saveLog([]);renderLog()">🗑 Limpar log</button>' +
    '</div>' +
    '<div class="card"><div class="card-body" style="padding:0 20px;">' +
    (logs.length === 0
      ? '<div class="empty-state"><span class="es-icon">📝</span><p>Nenhuma atividade registrada ainda.</p></div>'
      : logs.map(l => {
          const ic = icones[l.acao] || icones.default;
          const dt = new Date(l.em).toLocaleString('pt-BR');
          return '<div class="log-item">' +
            '<div class="log-ic">' + ic + '</div>' +
            '<div class="log-body">' +
            '<div class="log-acao">' + l.usuario + ' — ' + l.acao + '</div>' +
            '<div class="log-det">'  + l.detalhe + '</div>' +
            '<div class="log-tempo">' + dt + '</div>' +
            '</div></div>';
        }).join('')) +
    '</div></div>';
}

/* ================================================================
   ESCALA RECORRENTE — modal
   ================================================================ */
function abrirModalRecorrente(escalaId) {
  const e = DB.getEscalas().find(x => x.id === escalaId);
  if (!e) return;
  const html =
    '<div class="modal-overlay" onclick="fecharModal(event)">' +
    '<div class="modal" onclick="event.stopPropagation()" style="max-width:440px;">' +
    '<div class="modal-header"><div class="modal-header-info">' +
    '<h3>Repetir Escala</h3>' +
    '<p>Gerar cópias desta escala nas próximas semanas.</p></div>' +
    '<button class="btn btn-ghost btn-sm btn-icon" onclick="fecharModalDireto()">✕</button></div>' +
    '<div class="modal-body">' +
    '<div class="inline-alert info"><span class="inline-alert-icon">ℹ</span>' +
    '<div class="inline-alert-body">Cada cópia será criada como <strong>Rascunho</strong> para você revisar antes de publicar.</div></div>' +
    '<div class="form-group" style="margin-top:16px;"><label class="form-label">Escala base</label>' +
    '<div style="font-weight:600;color:var(--text-primary);">' + (e.culto||e.turma||'—') + '</div>' +
    '<div style="font-size:12px;color:var(--text-muted);">' + formatDate(e.data) + ' · ' + e.horario + '</div></div>' +
    '<div class="form-group"><label class="form-label">Repetir por quantas semanas? <span class="req">*</span></label>' +
    '<input type="number" id="rec-semanas" class="form-control" min="1" max="52" value="4" />' +
    '<div class="form-hint">Máximo 52 semanas (1 ano)</div></div>' +
    '</div>' +
    '<div class="modal-footer">' +
    '<button class="btn btn-ghost" onclick="fecharModalDireto()">Cancelar</button>' +
    '<button class="btn btn-primary" onclick="confirmarRecorrente(' + escalaId + ')">Gerar cópias</button>' +
    '</div></div></div>';
  abrirModal(html);
}

function confirmarRecorrente(escalaId) {
  const semanas = parseInt(document.getElementById('rec-semanas')?.value || 4);
  if (!semanas || semanas < 1 || semanas > 52) { showToast('Informe entre 1 e 52 semanas.', 'danger'); return; }
  const e = DB.getEscalas().find(x => x.id === escalaId);
  const geradas = gerarEscalaRecorrente(e, semanas);
  fecharModalDireto();
  registrarLog('escala', 'Escala recorrente: ' + semanas + ' cópias geradas para "' + (e.culto||'Escala') + '"');
  showToast(geradas.length + ' cópias criadas como rascunho!', 'success');
  renderEscalas();
}

/* ================================================================
   COPIAR ESCALA — modal
   ================================================================ */
function abrirModalCopiar(escalaId) {
  const e = DB.getEscalas().find(x => x.id === escalaId);
  if (!e) return;
  const html =
    '<div class="modal-overlay" onclick="fecharModal(event)">' +
    '<div class="modal" onclick="event.stopPropagation()" style="max-width:420px;">' +
    '<div class="modal-header"><div class="modal-header-info">' +
    '<h3>Copiar Escala</h3>' +
    '<p>Duplicar esta escala para outra data.</p></div>' +
    '<button class="btn btn-ghost btn-sm btn-icon" onclick="fecharModalDireto()">✕</button></div>' +
    '<div class="modal-body">' +
    '<div style="font-weight:600;color:var(--text-primary);margin-bottom:14px;">' + (e.culto||e.turma||'—') + ' · ' + formatDate(e.data) + '</div>' +
    '<div class="form-group"><label class="form-label">Nova data <span class="req">*</span></label>' +
    '<input type="date" id="copia-data" class="form-control" /></div>' +
    '</div>' +
    '<div class="modal-footer">' +
    '<button class="btn btn-ghost" onclick="fecharModalDireto()">Cancelar</button>' +
    '<button class="btn btn-primary" onclick="confirmarCopiar(' + escalaId + ')">Copiar</button>' +
    '</div></div></div>';
  abrirModal(html);
}

function confirmarCopiar(escalaId) {
  const novaData = document.getElementById('copia-data')?.value;
  if (!novaData) { showToast('Selecione a nova data.', 'danger'); return; }
  const copia = copiarEscala(escalaId, novaData);
  fecharModalDireto();
  registrarLog('escala', 'Escala copiada para ' + formatDate(novaData));
  showToast('Escala copiada para ' + formatDate(novaData) + '!', 'success');
  renderEscalas();
}

/* ================================================================
   AVISO GERAL (admin envia para todos voluntários)
   ================================================================ */
function abrirModalAvisoGeral() {
  const html =
    '<div class="modal-overlay" onclick="fecharModal(event)">' +
    '<div class="modal" onclick="event.stopPropagation()" style="max-width:460px;">' +
    '<div class="modal-header"><div class="modal-header-info">' +
    '<h3>📢 Enviar Aviso Geral</h3>' +
    '<p>Todos os voluntários receberão esta notificação.</p></div>' +
    '<button class="btn btn-ghost btn-sm btn-icon" onclick="fecharModalDireto()">✕</button></div>' +
    '<div class="modal-body">' +
    '<div class="form-group"><label class="form-label">Título <span class="req">*</span></label>' +
    '<input type="text" id="av-titulo" class="form-control" placeholder="Ex: Reunião especial esta semana" /></div>' +
    '<div class="form-group"><label class="form-label">Mensagem <span class="req">*</span></label>' +
    '<textarea id="av-corpo" class="form-control" rows="4" placeholder="Escreva o conteúdo do aviso…"></textarea></div>' +
    '</div>' +
    '<div class="modal-footer">' +
    '<button class="btn btn-ghost" onclick="fecharModalDireto()">Cancelar</button>' +
    '<button class="btn btn-primary" onclick="enviarAvisoGeral()">📢 Enviar</button>' +
    '</div></div></div>';
  abrirModal(html);
}

function enviarAvisoGeral() {
  const titulo = document.getElementById('av-titulo')?.value.trim();
  const corpo  = document.getElementById('av-corpo')?.value.trim();
  if (!titulo || !corpo) { showToast('Preencha título e mensagem.', 'danger'); return; }
  criarNotificacao('todos', 'aviso', titulo, corpo);
  registrarLog('notificacao', 'Aviso geral enviado: "' + titulo + '"');
  fecharModalDireto();
  showToast('Aviso enviado para todos os voluntários!', 'success');
}

/* ================================================================
   EXPORTAR CSV DE ESCALAS
   ================================================================ */
function exportarEscalasCSV() {
  const escalas = DB.getEscalas();
  const dados   = escalas.map(e => ({
    ID:          e.id,
    Tipo:        MIN_BY_ID[e.tipo]?.nome || e.tipo,
    Data:        formatDate(e.data),
    Horario:     e.horario,
    Culto:       e.culto || '',
    Voluntario:  e.voluntarioNome||e.professor||e.nomeIntercessor||'',
    Local:       e.local   || '',
    Funcao:      e.funcao  || '',
    Status:      e.status  || '',
  }));
  exportarCSV(dados, 'escalas-' + new Date().toISOString().split('T')[0]);
}

function exportarVoluntariosCSV() {
  const dados = DB.getVoluntarios().map(v => ({
    ID:          v.id,
    Nome:        v.nome,
    Ministerio:  v.ministerio,
    Telefone:    v.telefone || '',
    Email:       v.email    || '',
    Status:      v.status   || 'ativo',
  }));
  exportarCSV(dados, 'voluntarios-' + new Date().toISOString().split('T')[0]);
}
