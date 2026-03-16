/* ================================================================
   DADOS.JS — Banco local, constantes e utilitários
   ================================================================ */

/* ----------------------------------------------------------------
   VERSÍCULOS ROTATIVOS (um novo a cada carregamento)
   ---------------------------------------------------------------- */
const VERSICULOS = [
  { texto: "Cada um coloque ao serviço dos outros o dom que recebeu, como bons administradores da multiforme graça de Deus.", ref: "1 Pedro 4:10" },
  { texto: "Tudo o que fizerem, façam de todo o coração, como para o Senhor, e não para os homens.", ref: "Colossenses 3:23" },
  { texto: "O maior entre vocês deverá ser servo de todos.", ref: "Mateus 23:11" },
  { texto: "Não nos cansemos de fazer o bem, porque a seu tempo colheremos, se não desanimarmos.", ref: "Gálatas 6:9" },
  { texto: "Servindo ao Senhor com toda humildade e com lágrimas.", ref: "Atos 20:19" },
  { texto: "Como corpo uno com muitos membros, e todos os membros, apesar de muitos, formam um só corpo, assim é Cristo.", ref: "1 Coríntios 12:12" },
  { texto: "Que a paz de Cristo reine em seus corações, uma vez que foram chamados à paz.", ref: "Colossenses 3:15" },
  { texto: "Sejam sempre humildes e gentis; sejam pacientes, suportando uns aos outros com amor.", ref: "Efésios 4:2" },
  { texto: "Tudo posso naquele que me fortalece.", ref: "Filipenses 4:13" },
  { texto: "Mas os que esperam no Senhor renovam as suas forças. Voam alto como águias.", ref: "Isaías 40:31" },
  { texto: "Busquem primeiro o Reino de Deus e a sua justiça, e todas essas coisas lhes serão acrescentadas.", ref: "Mateus 6:33" },
  { texto: "Louvai o Senhor porque ele é bom; a sua benignidade dura para sempre.", ref: "Salmos 107:1" },
  { texto: "Porque somos feitura de Deus, criados em Cristo Jesus para boas obras.", ref: "Efésios 2:10" },
  { texto: "O fruto do Espírito é amor, alegria, paz, paciência, amabilidade, bondade, fidelidade.", ref: "Gálatas 5:22" },
  { texto: "Amados, amemo-nos uns aos outros, porque o amor é de Deus.", ref: "1 João 4:7" },
  { texto: "Confia no Senhor de todo o teu coração e não te estribes no teu próprio entendimento.", ref: "Provérbios 3:5" },
  { texto: "O Senhor é o meu pastor e nada me faltará.", ref: "Salmos 23:1" },
  { texto: "Esforça-te e tem bom ânimo! Não te atemorizes porque o Senhor, teu Deus, é contigo.", ref: "Josué 1:9" },
  { texto: "Deem graças em tudo, porque esta é a vontade de Deus em Cristo Jesus para vocês.", ref: "1 Tessalonicenses 5:18" },
  { texto: "Clama a mim e responder-te-ei e anunciar-te-ei coisas grandes e ocultas que não sabes.", ref: "Jeremias 33:3" },
];

function sortearVersiculo() {
  const q    = document.getElementById('vrs-texto');
  const cite = document.getElementById('vrs-ref');
  if (!q || !cite) return;
  const v = VERSICULOS[Math.floor(Math.random() * VERSICULOS.length)];
  q.style.opacity = '0';
  cite.style.opacity = '0';
  requestAnimationFrame(() => {
    q.textContent    = v.texto;
    cite.textContent = `— ${v.ref}`;
    q.style.transition    = 'opacity 0.7s ease';
    cite.style.transition = 'opacity 0.7s ease 0.15s';
    requestAnimationFrame(() => { q.style.opacity = '1'; cite.style.opacity = '1'; });
  });
}

/* ----------------------------------------------------------------
   TEMA CLARO / ESCURO
   ---------------------------------------------------------------- */
function initTema() {
  const saved = localStorage.getItem('ei_tema') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  atualizarToggleTema();
}
function toggleTema() {
  const atual = document.documentElement.getAttribute('data-theme') || 'dark';
  const novo  = atual === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', novo);
  localStorage.setItem('ei_tema', novo);
  atualizarToggleTema();
}
function atualizarToggleTema() {
  const tema = document.documentElement.getAttribute('data-theme') || 'dark';
  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.innerHTML = tema === 'dark'
      ? '<span>☀️</span> <span>Modo Claro</span>'
      : '<span>🌙</span> <span>Modo Escuro</span>';
  });
}

/* ----------------------------------------------------------------
   BANCO DE DADOS LOCAL (localStorage)
   ---------------------------------------------------------------- */
const KEYS = {
  usuarios:    'shk_usuarios',
  voluntarios: 'shk_voluntarios',
  escalas:     'shk_escalas',
};

const SEED = {
  usuarios: [
    { id: 1,   usuario: 'admin', senha: 'admin123', perfil: 'admin',     nome: 'Administrador',   ministerio: null },
    { id: 101, usuario: 'joao',  senha: '123456',   perfil: 'voluntario',nome: 'João Silva',      ministerio: 'Diáconos' },
    { id: 102, usuario: 'maria', senha: '123456',   perfil: 'voluntario',nome: 'Maria Oliveira',  ministerio: 'EBD' },
    { id: 103, usuario: 'pedro', senha: '123456',   perfil: 'voluntario',nome: 'Pedro Santos',    ministerio: 'Intercessão' },
    { id: 104, usuario: 'ana',   senha: '123456',   perfil: 'voluntario',nome: 'Ana Costa',       ministerio: 'Recepção' },
    { id: 105, usuario: 'luis',  senha: '123456',   perfil: 'voluntario',nome: 'Luís Ferreira',   ministerio: 'Louvor' },
  ],
  voluntarios: [
    { id: 101, nome: 'João Silva',    ministerio: 'Diáconos',    telefone: '(11) 99111-0001', email: 'joao@email.com',
      status: 'ativo',
      disponibilidade: { dom: ['manha','noite'], seg: [], ter: [], qua: ['noite'], qui: [], sex: [], sab: [] },
      indisponibilidade: ['sab-noite','ter-noite'],
      datasEspecificas: [] },
    { id: 102, nome: 'Maria Oliveira',ministerio: 'EBD',         telefone: '(11) 99111-0002', email: 'maria@email.com',
      status: 'ativo',
      disponibilidade: { dom: ['manha'], seg: [], ter: [], qua: ['noite'], qui: [], sex: [], sab: ['manha'] },
      indisponibilidade: ['dom-noite'],
      datasEspecificas: [] },
    { id: 103, nome: 'Pedro Santos',  ministerio: 'Intercessão', telefone: '(11) 99111-0003', email: 'pedro@email.com',
      status: 'ativo',
      disponibilidade: { dom: ['manha','noite'], seg: [], ter: [], qua: ['noite'], qui: [], sex: [], sab: ['manha'] },
      indisponibilidade: [],
      datasEspecificas: [] },
    { id: 104, nome: 'Ana Costa',     ministerio: 'Recepção',    telefone: '(11) 99111-0004', email: 'ana@email.com',
      status: 'ativo',
      disponibilidade: { dom: ['manha','noite'], seg: [], ter: [], qua: [], qui: [], sex: [], sab: [] },
      indisponibilidade: ['qua-noite'],
      datasEspecificas: [] },
    { id: 105, nome: 'Luís Ferreira', ministerio: 'Louvor',      telefone: '(11) 99111-0005', email: 'luis@email.com',
      status: 'ativo',
      disponibilidade: { dom: ['manha','noite'], seg: [], ter: [], qua: [], qui: [], sex: [], sab: ['manha','noite'] },
      indisponibilidade: [],
      datasEspecificas: [] },
  ],
  escalas: [
    { id: 1001, tipo: 'Diaconos',    data: '2026-03-15', horario: '09:00', culto: 'Culto da Manhã',
      voluntarioId: 101, voluntarioNome: 'João Silva', local: 'Entrada principal', funcao: 'Recepção',
      status: 'publicada', obs: '' },
    { id: 1002, tipo: 'EBD',         data: '2026-03-15', horario: '09:00', culto: '',
      voluntarioId: 102, voluntarioNome: 'Maria Oliveira',
      turma: 'Adultos', professor: 'Maria Oliveira', auxiliar: 'Ana Costa',
      tema: 'Frutos do Espírito Santo', responsavelLanche: 'Ana Costa',
      status: 'publicada', obs: '' },
    { id: 1003, tipo: 'Intercessao', data: '2026-03-22', horario: '08:00', culto: '',
      voluntarioId: 103, voluntarioNome: 'Pedro Santos',
      nomeIntercessor: 'Pedro Santos', local: 'Sala de oração', focoPrayer: 'Reunião de líderes',
      status: 'rascunho', obs: '' },
    { id: 1004, tipo: 'Diaconos',    data: '2026-03-22', horario: '19:00', culto: 'Culto da Família',
      voluntarioId: 101, voluntarioNome: 'João Silva', local: 'Entrada lateral', funcao: 'Portaria',
      status: 'publicada', obs: '' },
    { id: 1005, tipo: 'Recepcao',    data: '2026-03-29', horario: '09:00', culto: 'Culto Geral',
      voluntarioId: 104, voluntarioNome: 'Ana Costa', local: 'Hall de entrada', funcao: 'Recepcionista',
      status: 'rascunho', obs: '' },
    { id: 1006, tipo: 'Louvor',      data: '2026-03-29', horario: '09:00', culto: 'Culto Geral',
      voluntarioId: 105, voluntarioNome: 'Luís Ferreira', funcao: 'Violão', local: '',
      status: 'publicada', obs: '' },
  ]
};

function initDados() {
  if (!localStorage.getItem(KEYS.usuarios)) {
    localStorage.setItem(KEYS.usuarios,    JSON.stringify(SEED.usuarios));
    localStorage.setItem(KEYS.voluntarios, JSON.stringify(SEED.voluntarios));
    localStorage.setItem(KEYS.escalas,     JSON.stringify(SEED.escalas));
  }
}

const DB = {
  getUsuarios:    () => JSON.parse(localStorage.getItem(KEYS.usuarios)    || '[]'),
  getVoluntarios: () => JSON.parse(localStorage.getItem(KEYS.voluntarios) || '[]'),
  getEscalas:     () => JSON.parse(localStorage.getItem(KEYS.escalas)     || '[]'),
  saveUsuarios:    d  => localStorage.setItem(KEYS.usuarios,    JSON.stringify(d)),
  saveVoluntarios: d  => localStorage.setItem(KEYS.voluntarios, JSON.stringify(d)),
  saveEscalas:     d  => localStorage.setItem(KEYS.escalas,     JSON.stringify(d)),
};

/* ----------------------------------------------------------------
   CONSTANTES DE DOMÍNIO
   ---------------------------------------------------------------- */
const MINISTERIOS = [
  { id: 'Diaconos',    nome: 'Diáconos',        badge: 'badge-blue' },
  { id: 'EBD',         nome: 'EBD',              badge: 'badge-green' },
  { id: 'Intercessao', nome: 'Intercessão',      badge: 'badge-brand' },
  { id: 'Recepcao',    nome: 'Recepção',         badge: 'badge-amber' },
  { id: 'Louvor',      nome: 'Louvor',           badge: 'badge-muted' },
  { id: 'Midia',       nome: 'Mídia / Data Show',badge: 'badge-red' },
];
const MIN_BY_ID = {};
MINISTERIOS.forEach(m => { MIN_BY_ID[m.id] = m; });

// Grade semanal de turnos (Aprimoramento 5)
const DIAS_SEMANA = [
  { id: 'dom', label: 'Dom' },
  { id: 'seg', label: 'Seg' },
  { id: 'ter', label: 'Ter' },
  { id: 'qua', label: 'Qua' },
  { id: 'qui', label: 'Qui' },
  { id: 'sex', label: 'Sex' },
  { id: 'sab', label: 'Sáb' },
];
const TURNOS = [
  { id: 'manha', label: 'Manhã',  icon: '🌅' },
  { id: 'tarde', label: 'Tarde',  icon: '☀️' },
  { id: 'noite', label: 'Noite',  icon: '🌙' },
];

// Mapeamento dia da semana JS → id
const DIA_IDX = ['dom','seg','ter','qua','qui','sex','sab'];

/* ----------------------------------------------------------------
   UTILITÁRIOS GERAIS
   ---------------------------------------------------------------- */
function gerarId() { return Date.now() + Math.floor(Math.random() * 9999); }

function iniciais(nome) {
  if (!nome) return '?';
  return nome.split(' ').map(p => p[0]).slice(0,2).join('').toUpperCase();
}

function formatDate(d) {
  if (!d) return '—';
  const [a,m,dia] = d.split('-');
  return `${dia}/${m}/${a}`;
}

function parseDateParts(d) {
  if (!d) return { dia:'--', mes:'---', ano:'----' };
  const [a,m,dia] = d.split('-');
  const meses = ['','Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  return { dia, mes: meses[parseInt(m)] || m, ano: a };
}

function badgeMinisterio(tipo) {
  const m = MIN_BY_ID[tipo];
  if (!m) return `<span class="badge badge-muted">${tipo}</span>`;
  return `<span class="badge ${m.badge}">${m.nome}</span>`;
}

function badgeStatus(status) {
  if (status === 'publicada')
    return `<span class="badge badge-publicada">✓ Publicada</span>`;
  return `<span class="badge badge-rascunho">✎ Rascunho</span>`;
}

/* ----------------------------------------------------------------
   TOAST SYSTEM — showToast(mensagem, tipo, titulo?)
   Aprimoramento 2: substitui todos os alert()
   tipos: 'success' | 'danger' | 'warning' | 'info'
   ---------------------------------------------------------------- */
function showToast(mensagem, tipo = 'info', titulo = null) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = { success: '✓', danger: '✕', warning: '⚠', info: 'ℹ' };
  const titulos = { success: 'Sucesso', danger: 'Erro', warning: 'Atenção', info: 'Informação' };

  const el = document.createElement('div');
  el.className = `toast toast-${tipo}`;
  el.innerHTML = `
    <span class="toast-icon">${icons[tipo] || 'ℹ'}</span>
    <div class="toast-body">
      <div class="toast-title">${titulo || titulos[tipo] || tipo}</div>
      <div class="toast-msg">${mensagem}</div>
    </div>
    <button class="toast-close" onclick="fecharToast(this)">✕</button>
  `;
  container.appendChild(el);

  // Remove após 3.5s com animação
  const timer = setTimeout(() => removerToast(el), 3500);
  el._timer = timer;
}

function fecharToast(btn) {
  const el = btn.closest('.toast');
  if (el) { clearTimeout(el._timer); removerToast(el); }
}

function removerToast(el) {
  el.classList.add('removing');
  setTimeout(() => el.remove(), 320);
}

/* ----------------------------------------------------------------
   MODAL HELPERS
   ---------------------------------------------------------------- */
function abrirModal(html) { document.getElementById('modal-root').innerHTML = html; }
function fecharModal(e)   {
  if (e && e.target !== e.currentTarget) return;
  document.getElementById('modal-root').innerHTML = '';
}
function fecharModalDireto() { document.getElementById('modal-root').innerHTML = ''; }

/* ----------------------------------------------------------------
   ATALHO TECLADO — ESC fecha modal
   ---------------------------------------------------------------- */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') fecharModalDireto();
});

/* ================================================================
   EXTENSÕES DE BANCO — Novos módulos
   ================================================================ */

// Novas chaves
const KEYS_EXT = {
  notificacoes: 'shk_notificacoes',
  config:       'shk_config',
  log:          'shk_log',
};

// Estender DB com novos stores
DB.getNotificacoes  = () => JSON.parse(localStorage.getItem(KEYS_EXT.notificacoes) || '[]');
DB.saveNotificacoes = d  => localStorage.setItem(KEYS_EXT.notificacoes, JSON.stringify(d));
DB.getConfig        = () => JSON.parse(localStorage.getItem(KEYS_EXT.config) || 'null') || {
  nomeIgreja:  'Shekinah IAD',
  subtitulo:   'Um Projeto de Deus',
  pastor:      '',
  endereco:    '',
  telefone:    '',
  email:       '',
};
DB.saveConfig       = d  => localStorage.setItem(KEYS_EXT.config, JSON.stringify(d));
DB.getLog           = () => JSON.parse(localStorage.getItem(KEYS_EXT.log) || '[]');
DB.saveLog          = d  => localStorage.setItem(KEYS_EXT.log, JSON.stringify(d));

/* ----------------------------------------------------------------
   SISTEMA DE NOTIFICAÇÕES INTERNAS
   ---------------------------------------------------------------- */

/**
 * Cria uma notificação para um voluntário específico (ou todos).
 * @param {number|'todos'} destinatarioId
 * @param {string} tipo  — 'escalado'|'editado'|'cancelado'|'aviso'
 * @param {string} titulo
 * @param {string} corpo
 */
function criarNotificacao(destinatarioId, tipo, titulo, corpo) {
  const notifs = DB.getNotificacoes();
  notifs.push({
    id:            gerarId(),
    destinatario:  destinatarioId,   // id do usuário ou 'todos'
    tipo,
    titulo,
    corpo,
    lida:          false,
    criadaEm:      new Date().toISOString(),
  });
  DB.saveNotificacoes(notifs);
  atualizarBadgeNotif();
}

function getNotificacoesUsuario(userId) {
  return DB.getNotificacoes().filter(n =>
    n.destinatario === userId || n.destinatario === 'todos'
  ).sort((a,b) => b.criadaEm > a.criadaEm ? 1 : -1);
}

function marcarNotifLida(id) {
  const n = DB.getNotificacoes();
  const i = n.findIndex(x => x.id === id);
  if (i !== -1) { n[i].lida = true; DB.saveNotificacoes(n); }
  atualizarBadgeNotif();
}

function marcarTodasLidas(userId) {
  const n = DB.getNotificacoes().map(x =>
    (x.destinatario === userId || x.destinatario === 'todos') ? { ...x, lida: true } : x
  );
  DB.saveNotificacoes(n);
  atualizarBadgeNotif();
}

function atualizarBadgeNotif() {
  const el = document.getElementById('badge-notif');
  if (!el || !usuarioSessao) return;
  const n = getNotificacoesUsuario(usuarioSessao.id).filter(x => !x.lida).length;
  el.textContent   = n;
  el.style.display = n > 0 ? '' : 'none';
}

/* ----------------------------------------------------------------
   LOG DE ATIVIDADES
   ---------------------------------------------------------------- */
function registrarLog(acao, detalhe) {
  if (!usuarioSessao) return;
  const log = DB.getLog();
  log.unshift({
    id:       gerarId(),
    usuario:  usuarioSessao.nome,
    perfil:   usuarioSessao.perfil,
    acao,
    detalhe,
    em:       new Date().toISOString(),
  });
  // Manter só os últimos 200 registros
  DB.saveLog(log.slice(0, 200));
}

/* ----------------------------------------------------------------
   EXPORTAR CSV
   ---------------------------------------------------------------- */
function exportarCSV(dados, nomeArquivo) {
  if (!dados || dados.length === 0) { showToast('Nenhum dado para exportar.', 'warning'); return; }
  const cabecalho = Object.keys(dados[0]).join(',');
  const linhas    = dados.map(row =>
    Object.values(row).map(v => '"' + String(v||'').replace(/"/g,'""') + '"').join(',')
  ).join('\n');
  const blob = new Blob(['\uFEFF' + cabecalho + '\n' + linhas], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = nomeArquivo + '.csv';
  a.click();
  URL.revokeObjectURL(url);
  showToast('Arquivo CSV exportado com sucesso!', 'success');
}

/* ----------------------------------------------------------------
   BACKUP / RESTORE JSON
   ---------------------------------------------------------------- */
function exportarBackup() {
  const backup = {
    versao:      '2.0',
    exportadoEm: new Date().toISOString(),
    usuarios:    DB.getUsuarios(),
    voluntarios: DB.getVoluntarios(),
    escalas:     DB.getEscalas(),
    config:      DB.getConfig(),
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'backup-escalas-' + new Date().toISOString().split('T')[0] + '.json';
  a.click();
  URL.revokeObjectURL(url);
  registrarLog('backup', 'Backup completo exportado');
  showToast('Backup exportado com sucesso!', 'success');
}

function importarBackup(arquivo) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (!data.usuarios || !data.escalas || !data.voluntarios)
        throw new Error('Formato inválido');
      DB.saveUsuarios(data.usuarios);
      DB.saveVoluntarios(data.voluntarios);
      DB.saveEscalas(data.escalas);
      if (data.config) DB.saveConfig(data.config);
      showToast('Backup restaurado! Faça login novamente.', 'success');
      setTimeout(() => logout(), 1500);
    } catch(err) {
      showToast('Arquivo inválido ou corrompido.', 'danger');
    }
  };
  reader.readAsText(arquivo);
}

/* ----------------------------------------------------------------
   IMPRESSÃO DE ESCALA
   ---------------------------------------------------------------- */
function imprimirEscala(escalaId) {
  const e   = DB.getEscalas().find(x => x.id === escalaId);
  const cfg = DB.getConfig();
  if (!e) return;
  const { dia, mes, ano } = parseDateParts(e.data);
  const minNome = MIN_BY_ID[e.tipo]?.nome || e.tipo;

  const conteudo = `
    <!DOCTYPE html><html lang="pt-BR"><head>
    <meta charset="UTF-8">
    <title>Escala — ${minNome}</title>
    <style>
      body { font-family: 'Segoe UI', sans-serif; margin: 40px; color: #1B1F55; }
      .header { text-align: center; border-bottom: 3px solid #1B1F55; padding-bottom: 16px; margin-bottom: 24px; }
      .church { font-size: 22px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; }
      .sub    { font-size: 12px; color: #4C4F75; letter-spacing: 1px; margin-top: 2px; }
      .titulo { font-size: 18px; font-weight: 700; margin: 16px 0 4px; color: #131B80; }
      .campo  { display: flex; gap: 12px; padding: 8px 0; border-bottom: 1px solid #e8eaf7; font-size: 14px; }
      .campo-label { font-weight: 700; min-width: 160px; color: #4C4F75; }
      .footer { margin-top: 40px; font-size: 11px; color: #aaa; text-align: center; }
      @media print { body { margin: 20px; } }
    </style></head><body>
    <div class="header">
      <div class="church">${cfg.nomeIgreja}</div>
      <div class="sub">${cfg.subtitulo}</div>
    </div>
    <div class="titulo">Escala de ${minNome}</div>
    <div class="campo"><span class="campo-label">Data:</span><span>${dia}/${mes}/${ano}</span></div>
    <div class="campo"><span class="campo-label">Horário:</span><span>${e.horario}</span></div>
    ${e.culto ? `<div class="campo"><span class="campo-label">Culto/Evento:</span><span>${e.culto}</span></div>` : ''}
    ${e.voluntarioNome||e.professor||e.nomeIntercessor ? `<div class="campo"><span class="campo-label">Voluntário:</span><span>${e.voluntarioNome||e.professor||e.nomeIntercessor}</span></div>` : ''}
    ${e.funcao  ? `<div class="campo"><span class="campo-label">Função:</span><span>${e.funcao}</span></div>` : ''}
    ${e.local   ? `<div class="campo"><span class="campo-label">Local:</span><span>${e.local}</span></div>` : ''}
    ${e.turma   ? `<div class="campo"><span class="campo-label">Turma:</span><span>${e.turma}</span></div>` : ''}
    ${e.tema    ? `<div class="campo"><span class="campo-label">Tema:</span><span>${e.tema}</span></div>` : ''}
    ${e.auxiliar? `<div class="campo"><span class="campo-label">Auxiliar:</span><span>${e.auxiliar}</span></div>` : ''}
    ${e.focoPrayer?`<div class="campo"><span class="campo-label">Foco da Oração:</span><span>${e.focoPrayer}</span></div>` : ''}
    ${e.obs     ? `<div class="campo"><span class="campo-label">Observações:</span><span>${e.obs}</span></div>` : ''}
    <div class="footer">Gerado em ${new Date().toLocaleString('pt-BR')} · ${cfg.nomeIgreja} · Sistema de Escalas</div>
    </body></html>`;

  const janela = window.open('', '_blank');
  janela.document.write(conteudo);
  janela.document.close();
  janela.focus();
  setTimeout(() => janela.print(), 400);
}

/* ----------------------------------------------------------------
   ESCALA RECORRENTE — gera N semanas
   ---------------------------------------------------------------- */
function gerarEscalaRecorrente(escalaBase, semanas) {
  const escalas  = DB.getEscalas();
  const geradas  = [];
  const baseDate = new Date(escalaBase.data + 'T12:00:00');

  for (let i = 1; i <= semanas; i++) {
    const novaData = new Date(baseDate);
    novaData.setDate(baseDate.getDate() + i * 7);
    const novaEscala = {
      ...escalaBase,
      id:     gerarId(),
      data:   novaData.toISOString().split('T')[0],
      status: 'rascunho',
    };
    escalas.push(novaEscala);
    geradas.push(novaEscala);
  }
  DB.saveEscalas(escalas);
  return geradas;
}

/* ----------------------------------------------------------------
   COPIAR ESCALA
   ---------------------------------------------------------------- */
function copiarEscala(id, novaData) {
  const original = DB.getEscalas().find(e => e.id === id);
  if (!original) return null;
  const copia = { ...original, id: gerarId(), data: novaData, status: 'rascunho' };
  const escalas = DB.getEscalas();
  escalas.push(copia);
  DB.saveEscalas(escalas);
  return copia;
}
