/* ================================================================
   VOLUNTARIO.JS — Painel do Voluntário
   Inclui Aprimoramento 5: Grid visual Manhã/Tarde/Noite com auto-save
   ================================================================ */

/* ================================================================ PAINEL */
function renderPainelVol() {
  const vol     = DB.getVoluntarios().find(v => v.id === usuarioSessao.id);
  const escalas = DB.getEscalas();
  const hoje    = new Date().toISOString().split('T')[0];

  const minhas = escalas.filter(e =>
    e.status === 'publicada' &&
    (e.voluntarioId === usuarioSessao.id ||
     e.voluntarioNome === usuarioSessao.nome ||
     e.professor      === usuarioSessao.nome ||
     e.nomeIntercessor=== usuarioSessao.nome ||
     e.auxiliar       === usuarioSessao.nome)
  );
  const proximas  = minhas.filter(e => e.data >= hoje).sort((a,b) => a.data>b.data?1:-1);
  const historico = minhas.filter(e => e.data < hoje).length;
  const totalSlots= Object.values(vol?.disponibilidade||{}).flat().length;

  document.getElementById('page-wrap').innerHTML =
    '<div class="vol-hero">' +
    '<div class="vol-hero-av">' + iniciais(usuarioSessao.nome) + '</div>' +
    '<div class="vol-hero-text">' +
    '<div class="saudacao">Bem-vindo(a) de volta</div>' +
    '<h2>' + usuarioSessao.nome + '</h2>' +
    '<span class="ministerio-pill">🔥 ' + (vol?.ministerio||usuarioSessao.ministerio||'—') + '</span>' +
    '</div></div>' +

    '<div class="stats-grid" style="grid-template-columns:repeat(3,1fr);">' +
    '<div class="stat-card brand"><div class="stat-top"><div class="stat-label">Próximas</div><div class="stat-icon">📋</div></div>' +
    '<div class="stat-number">' + proximas.length + '</div><div class="stat-sub">escalas à frente</div></div>' +
    '<div class="stat-card green"><div class="stat-top"><div class="stat-label">Disponível</div><div class="stat-icon">✅</div></div>' +
    '<div class="stat-number">' + totalSlots + '</div><div class="stat-sub">turnos configurados</div></div>' +
    '<div class="stat-card brand"><div class="stat-top"><div class="stat-label">Histórico</div><div class="stat-icon">📜</div></div>' +
    '<div class="stat-number">' + historico + '</div><div class="stat-sub">escalas realizadas</div></div>' +
    '</div>' +

    '<div class="card">' +
    '<div class="card-header"><h4>📅 Minhas Próximas Escalas</h4>' +
    '<button class="btn btn-ghost btn-sm" onclick="navegar(\'minhas-escalas\')">Ver todas →</button></div>' +
    '<div style="padding:12px 16px 4px;">' +
    (proximas.length === 0
      ? '<div class="empty-state" style="padding:30px;"><span class="es-icon">📋</span><p>Você não possui escalas publicadas no momento.</p></div>'
      : proximas.slice(0,4).map(e => {
          const {dia,mes} = parseDateParts(e.data);
          return '<div style="display:flex;align-items:center;gap:14px;padding:10px 4px;border-bottom:1px solid var(--border-subtle);">' +
            '<div style="background:var(--bg-elevated);border:1px solid var(--border-mid);border-radius:var(--r-sm);padding:8px 12px;text-align:center;min-width:54px;flex-shrink:0;">' +
            '<div style="font-family:var(--font-display);font-size:22px;font-weight:800;color:var(--brand-300);line-height:1;">' + dia + '</div>' +
            '<div style="font-size:9px;text-transform:uppercase;letter-spacing:1px;color:var(--text-muted);">' + mes + '</div>' +
            '</div><div style="flex:1;min-width:0;">' +
            '<div style="font-weight:700;color:var(--text-primary);">' + (e.culto||e.turma||'—') + '</div>' +
            '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;font-size:12px;color:var(--text-muted);">' +
            badgeMinisterio(e.tipo) + '<span>🕐 ' + e.horario + '</span>' +
            (e.funcao ? '<span>🎯 '+e.funcao+'</span>':'') +
            (e.local  ? '<span>📍 '+e.local +'</span>':'') +
            '</div></div></div>';
        }).join('')) +
    '</div></div>';
}

/* ================================================================ MINHAS ESCALAS */
function renderMinhasEscalas() {
  const escalas = DB.getEscalas().filter(e =>
    e.status === 'publicada' &&
    (e.voluntarioId   === usuarioSessao.id ||
     e.voluntarioNome === usuarioSessao.nome ||
     e.professor      === usuarioSessao.nome ||
     e.nomeIntercessor=== usuarioSessao.nome ||
     e.auxiliar       === usuarioSessao.nome)
  ).sort((a,b) => a.data>b.data?1:-1);

  const linhas = escalas.length === 0
    ? '<div class="card"><div class="empty-state"><span class="es-icon">📋</span><h5>Nenhuma escala publicada</h5><p>O administrador ainda não publicou escalas para você.</p></div></div>'
    : escalas.map(e => {
        const {dia,mes} = parseDateParts(e.data);
        return '<div class="escala-row" style="margin-bottom:8px;">' +
          '<div class="escala-date"><div class="ed-day">'+dia+'</div><div class="ed-mon">'+mes+'</div></div>' +
          '<div class="escala-info"><div class="escala-title">' + (e.culto||e.turma||e.nomeIntercessor||'—') + '</div>' +
          '<div class="escala-meta">' + badgeMinisterio(e.tipo) +
          '<span class="em-item">🕐 '+e.horario+'</span>' +
          (e.funcao?'<span class="em-item">🎯 '+e.funcao+'</span>':'') +
          (e.local ?'<span class="em-item">📍 '+e.local +'</span>':'') +
          (e.tema  ?'<span class="em-item">📖 '+e.tema  +'</span>':'') +
          '</div></div></div>';
      }).join('');

  document.getElementById('page-wrap').innerHTML =
    '<div class="page-header"><div class="page-header-text">' +
    '<div class="eyebrow">Pessoal</div><h2>Minhas Escalas</h2>' +
    '<p>' + escalas.length + ' escala(s) publicada(s) para você</p>' +
    '</div></div>' + linhas;
}

/* ================================================================ TODAS AS ESCALAS */
function renderTodasEscalas() {
  const escalas = DB.getEscalas().filter(e => e.status === 'publicada').sort((a,b) => a.data>b.data?1:-1);

  const linhas = escalas.length === 0
    ? '<div class="empty-state"><span class="es-icon">🗓</span><p>Nenhuma escala publicada ainda.</p></div>'
    : '<table class="table"><thead><tr><th>Data</th><th>Horário</th><th>Ministério</th><th>Evento</th><th>Voluntário(s)</th></tr></thead><tbody>' +
      escalas.map(e =>
        '<tr><td><strong>'+formatDate(e.data)+'</strong></td><td>'+e.horario+'</td>' +
        '<td>'+badgeMinisterio(e.tipo)+'</td>' +
        '<td>'+(e.culto||e.turma||e.nomeIntercessor||'—')+'</td>' +
        '<td>'+(e.voluntarioNome||e.professor||e.nomeIntercessor||'—') +
        (e.auxiliar?'<span style="color:var(--text-muted);font-size:11px;"> / '+e.auxiliar+'</span>':'')+'</td></tr>'
      ).join('') + '</tbody></table>';

  document.getElementById('page-wrap').innerHTML =
    '<div class="page-header"><div class="page-header-text">' +
    '<div class="eyebrow">Igreja</div><h2>Calendário Geral</h2>' +
    '<p>Escalas publicadas — visão geral da comunidade</p></div></div>' +
    '<div class="card"><div class="table-wrap">' + linhas + '</div></div>';
}

/* ================================================================
   MINHA DISPONIBILIDADE — Aprimoramento 5
   Grid visual de turnos com auto-save no clique (evento change)
   ================================================================ */
function renderMinhaDisp() {
  document.getElementById('topbar-right-actions').innerHTML = '';

  const vol    = DB.getVoluntarios().find(v => v.id === usuarioSessao.id);
  const disp   = vol?.disponibilidade || DIAS_SEMANA.reduce((acc,d) => { acc[d.id]=[]; return acc; }, {});
  const datas  = vol?.datasEspecificas || [];

  /* Grade semanal */
  const colunas = DIAS_SEMANA.map(d => {
    const slots = TURNOS.map(t => {
      const ativo = (disp[d.id]||[]).includes(t.id);
      return '<button class="disp-slot-btn ' + (ativo?'disponivel':'') + '" ' +
        'data-dia="' + d.id + '" data-turno="' + t.id + '" ' +
        'onclick="toggleTurno(this)">' +
        '<span class="slot-icon">' + t.icon + '</span>' +
        '<span class="slot-label">' + t.label + '</span>' +
        '</button>';
    }).join('');
    return '<div class="disp-day-col"><div class="disp-day-header">' + d.label + '</div>' +
      '<div class="disp-day-slots">' + slots + '</div></div>';
  }).join('');

  /* Datas específicas */
  const datasHtml = datas.length === 0
    ? '<p style="font-size:13px;color:var(--text-muted);">Nenhuma data específica. Use para marcar exceções pontuais.</p>'
    : datas.map(d =>
        '<div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border-subtle);">' +
        '<span>' + (d.tipo==='disponivel'?'✅':'🚫') + '</span>' +
        '<strong style="flex:1;">' + formatDate(d.data) + '</strong>' +
        '<span class="badge ' + (d.tipo==='disponivel'?'badge-green':'badge-red') + '">' + (d.tipo==='disponivel'?'Disponível':'Indisponível') + '</span>' +
        '<button class="btn btn-danger btn-xs" onclick="removerDataEsp(\'' + d.data + '\')">✕</button>' +
        '</div>'
      ).join('');

  document.getElementById('page-wrap').innerHTML =
    '<div class="page-header">' +
    '<div class="page-header-text"><div class="eyebrow">Preferências</div><h2>Minha Disponibilidade</h2>' +
    '<p>Clique nos turnos para ativar/desativar. <strong>A preferência é salva automaticamente.</strong></p></div>' +
    '</div>' +

    '<div style="background:var(--blue-info-bg);border:1px solid rgba(96,165,250,0.3);border-radius:var(--r-sm);' +
    'padding:12px 16px;margin-bottom:18px;font-size:13px;color:var(--blue-info);display:flex;align-items:center;gap:8px;">' +
    'ℹ <span>Turnos em <strong style="color:var(--green);">verde</strong> = disponível. ' +
    'Sem cor = não informado. O administrador verá um alerta se tentar escalá-lo em turno não marcado.</span>' +
    '</div>' +

    '<div class="card" style="margin-bottom:20px;">' +
    '<div class="card-header"><h4>📅 Disponibilidade Semanal</h4>' +
    '<span style="font-size:12px;color:var(--text-muted);">Salvo automaticamente ao clicar</span></div>' +
    '<div class="card-body"><div class="disp-week-grid">' + colunas + '</div></div>' +
    '</div>' +

    '<div class="card">' +
    '<div class="card-header"><h4>📌 Datas Específicas</h4>' +
    '<button class="btn btn-ghost btn-sm" onclick="abrirModalDataEsp()">+ Adicionar Data</button></div>' +
    '<div class="card-body">' + datasHtml + '</div>' +
    '</div>';
}

/**
 * Toggle de turno com AUTO-SAVE — Aprimoramento 5
 * O evento é o clique, que dispara o salvamento imediato no localStorage.
 */
function toggleTurno(btn) {
  const dia   = btn.dataset.dia;
  const turno = btn.dataset.turno;

  btn.classList.toggle('disponivel');
  const ativo = btn.classList.contains('disponivel');

  /* Auto-save imediato */
  const vols = DB.getVoluntarios();
  const idx  = vols.findIndex(v => v.id === usuarioSessao.id);
  if (idx === -1) return;

  if (!vols[idx].disponibilidade) {
    vols[idx].disponibilidade = DIAS_SEMANA.reduce((acc,d) => { acc[d.id]=[]; return acc; }, {});
  }
  if (!vols[idx].disponibilidade[dia]) vols[idx].disponibilidade[dia] = [];

  if (ativo) {
    if (!vols[idx].disponibilidade[dia].includes(turno))
      vols[idx].disponibilidade[dia].push(turno);
  } else {
    vols[idx].disponibilidade[dia] = vols[idx].disponibilidade[dia].filter(t => t !== turno);
  }

  DB.saveVoluntarios(vols);

  /* Feedback visual discreto (toast breve) */
  const nomeDia   = DIAS_SEMANA.find(d => d.id === dia)?.label;
  const nomeTurno = TURNOS.find(t => t.id === turno);
  showToast(
    (ativo ? '✅ Disponível' : '○ Removido') + ' — ' + nomeDia + ' ' + nomeTurno?.icon + ' ' + nomeTurno?.label,
    ativo ? 'success' : 'info',
    'Salvo automaticamente'
  );
}

/* Modal de data específica */
function abrirModalDataEsp() {
  const html =
    '<div class="modal-overlay" onclick="fecharModal(event)">' +
    '<div class="modal" onclick="event.stopPropagation()" style="max-width:420px;">' +
    '<div class="modal-header"><div class="modal-header-info"><h3>Adicionar Data Específica</h3>' +
    '<p>Marque uma data pontual como disponível ou bloqueada.</p></div>' +
    '<button class="btn btn-ghost btn-sm btn-icon" onclick="fecharModalDireto()">✕</button></div>' +
    '<div class="modal-body">' +
    '<div class="form-group"><label class="form-label">Data <span class="req">*</span></label>' +
    '<input type="date" id="md-data" class="form-control" /></div>' +
    '<div class="form-group"><label class="form-label">Disponibilidade</label>' +
    '<select id="md-tipo" class="form-control">' +
    '<option value="disponivel">✅ Disponível — posso servir neste dia</option>' +
    '<option value="indisponivel">🚫 Indisponível — não poderei servir</option>' +
    '</select></div>' +
    '</div>' +
    '<div class="modal-footer">' +
    '<button class="btn btn-ghost" onclick="fecharModalDireto()">Cancelar</button>' +
    '<button class="btn btn-primary" onclick="salvarDataEsp()">Salvar</button>' +
    '</div></div></div>';
  abrirModal(html);
}

function salvarDataEsp() {
  const data = document.getElementById('md-data')?.value;
  const tipo = document.getElementById('md-tipo')?.value;
  if (!data) { showToast('Selecione uma data.', 'danger'); return; }

  const vols = DB.getVoluntarios();
  const idx  = vols.findIndex(v => v.id === usuarioSessao.id);
  if (idx === -1) return;
  if (!vols[idx].datasEspecificas) vols[idx].datasEspecificas = [];
  vols[idx].datasEspecificas = vols[idx].datasEspecificas.filter(d => d.data !== data);
  vols[idx].datasEspecificas.push({ data, tipo });
  DB.saveVoluntarios(vols);
  fecharModalDireto();
  renderMinhaDisp();
  showToast('Data adicionada com sucesso!', 'success');
}

function removerDataEsp(data) {
  const vols = DB.getVoluntarios();
  const idx  = vols.findIndex(v => v.id === usuarioSessao.id);
  if (idx === -1) return;
  vols[idx].datasEspecificas = (vols[idx].datasEspecificas||[]).filter(d => d.data !== data);
  DB.saveVoluntarios(vols);
  renderMinhaDisp();
  showToast('Data removida.', 'info');
}
