/* ================================================================
   VALIDACOES.JS — Funções puras de validação (Aprimoramento 4)
   
   Princípio: estas funções NÃO tocam o DOM nem exibem mensagens.
   Recebem dados, retornam { valido: Boolean, erros: String[] }.
   A responsabilidade de exibir feedback é do módulo que as chama.
   
   Uso: const resultado = validarNovaEscala(escalas, novaEscala, voluntario);
        if (!resultado.valido) showToast(resultado.erros[0], 'danger');
   ================================================================ */

/**
 * Verifica conflitos de uma escala em relação a todas as outras.
 * Função pura: não altera estado, não toca o DOM.
 * 
 * @param {Object[]} todasEscalas - Array completo de escalas do banco
 * @param {Object}   novaEscala   - Escala sendo criada/editada { data, horario, voluntarioId, id? }
 * @param {Object}   voluntario   - Objeto voluntário completo
 * @returns {{ valido: Boolean, conflitos: { tipo: String, msg: String, gravidade: String }[] }}
 */
function verificarConflitosEscala(todasEscalas, novaEscala, voluntario) {
  if (!voluntario) return { valido: true, conflitos: [] };

  const conflitos = [];
  const { data, horario, id: editandoId } = novaEscala;

  /* ---- 1. Indisponibilidade por turno semanal ---- */
  if (data && horario) {
    const diaJS = new Date(data + 'T12:00:00').getDay(); // 0=dom, 6=sab
    const diaId = DIA_IDX[diaJS];
    const turno = horario < '12:30' ? 'manha' : horario < '18:00' ? 'tarde' : 'noite';

    // Verifica se tem disponibilidade por grade semanal (novo formato)
    const dispDia = voluntario.disponibilidade?.[diaId] || [];
    const indispLegado = voluntario.indisponibilidade || [];

    const chave = `${diaId}-${turno}`;
    const naoDisponivel = !dispDia.includes(turno) && dispDia.length > 0;
    const bloqueioLegado = indispLegado.includes(chave);

    if (naoDisponivel || bloqueioLegado) {
      const nomeDia = DIAS_SEMANA.find(d => d.id === diaId)?.label || diaId;
      const nomeTurno = TURNOS.find(t => t.id === turno)?.label || turno;
      conflitos.push({
        tipo: 'indisponibilidade',
        gravidade: 'alta',
        msg: `${voluntario.nome} não está disponível na ${nomeTurno} de ${nomeDia}.`
      });
    }
  }

  /* ---- 2. Data específica bloqueada ---- */
  if (data && (voluntario.datasEspecificas || []).some(d => d.data === data && d.tipo === 'indisponivel')) {
    conflitos.push({
      tipo: 'data-especifica',
      gravidade: 'alta',
      msg: `${voluntario.nome} registrou ${formatDate(data)} como indisponível.`
    });
  }

  /* ---- 3. Conflito de horário (dupla escala) ---- */
  if (data && horario) {
    const dupla = todasEscalas.find(e => {
      if (e.id === editandoId) return false;
      if (e.data !== data || e.horario !== horario) return false;
      return (
        e.voluntarioId === voluntario.id ||
        e.voluntarioNome === voluntario.nome ||
        e.professor === voluntario.nome ||
        e.nomeIntercessor === voluntario.nome ||
        e.auxiliar === voluntario.nome
      );
    });
    if (dupla) {
      const minNome = MIN_BY_ID[dupla.tipo]?.nome || dupla.tipo;
      conflitos.push({
        tipo: 'horario-duplo',
        gravidade: 'media',
        msg: `${voluntario.nome} já está escalado(a) em ${minNome} às ${horario}.`
      });
    }
  }

  return {
    valido: conflitos.length === 0,
    conflitos,
  };
}

/**
 * Valida os campos obrigatórios de uma escala antes de salvar.
 * Função pura — não toca o DOM.
 * 
 * @param {Object} escala - Dados do formulário
 * @returns {{ valido: Boolean, erros: String[] }}
 */
function validarCamposEscala(escala) {
  const erros = [];
  if (!escala.tipo)    erros.push('Selecione o tipo de ministério.');
  if (!escala.data)    erros.push('A data é obrigatória.');
  if (!escala.horario) erros.push('O horário é obrigatório.');

  if (escala.tipo === 'EBD' && !escala.turma)
    erros.push('Informe a turma da EBD.');

  return { valido: erros.length === 0, erros };
}

/**
 * Valida campos de voluntário antes de salvar.
 * Função pura — não toca o DOM.
 */
function validarCamposVoluntario(dados, editandoId = null) {
  const erros = [];
  if (!dados.nome?.trim())     erros.push('O nome é obrigatório.');
  if (!dados.ministerio)       erros.push('Selecione o ministério.');
  if (!dados.usuario?.trim())  erros.push('O usuário (login) é obrigatório.');
  if (!dados.senha?.trim())    erros.push('A senha é obrigatória.');
  if (dados.senha && dados.senha.length < 4) erros.push('A senha deve ter ao menos 4 caracteres.');

  // Verificar usuário único
  const existe = DB.getUsuarios().find(u => u.usuario === dados.usuario && u.id !== editandoId);
  if (existe) erros.push(`O usuário "${dados.usuario}" já está em uso.`);

  return { valido: erros.length === 0, erros };
}

/**
 * Levanta todos os conflitos existentes no banco atual.
 * Usado pelo dashboard e pela tela de conflitos.
 * 
 * @returns {{ escala: Object, tipo: String, msg: String, gravidade: String }[]}
 */
function levantarTodosConflitos() {
  const escalas     = DB.getEscalas();
  const voluntarios = DB.getVoluntarios();
  const resultado   = [];

  escalas.forEach(e => {
    if (!e.voluntarioId) return;
    const vol = voluntarios.find(v => v.id === e.voluntarioId);
    if (!vol) return;
    const { conflitos } = verificarConflitosEscala(escalas, e, vol);
    conflitos.forEach(c => resultado.push({ ...c, escala: e, voluntario: vol }));
  });

  return resultado;
}
