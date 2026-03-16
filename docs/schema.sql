-- ================================================================
-- SCHEMA SQL — Shekinah IAD · Sistema de Escalas
-- Aprimoramento 3: Modelagem Relacional
-- 
-- Este script DDL documenta a estrutura de banco de dados que
-- substituiria o localStorage em uma implementação back-end real.
-- Compatível com: PostgreSQL 14+ / MySQL 8+
-- ================================================================

-- ----------------------------------------------------------------
-- Limpar e recriar (ambiente de desenvolvimento)
-- ----------------------------------------------------------------
DROP TABLE IF EXISTS Disponibilidade  CASCADE;
DROP TABLE IF EXISTS EscalaVoluntario CASCADE;
DROP TABLE IF EXISTS Escalas          CASCADE;
DROP TABLE IF EXISTS Voluntarios      CASCADE;
DROP TABLE IF EXISTS Ministerios      CASCADE;
DROP TABLE IF EXISTS Usuarios         CASCADE;

-- ----------------------------------------------------------------
-- TABELA: Usuarios
-- Controla autenticação e perfis de acesso
-- ----------------------------------------------------------------
CREATE TABLE Usuarios (
  id          SERIAL        PRIMARY KEY,
  nome        VARCHAR(120)  NOT NULL,
  usuario     VARCHAR(50)   NOT NULL UNIQUE,
  senha_hash  VARCHAR(255)  NOT NULL,          -- bcrypt/argon2, nunca texto puro
  perfil      VARCHAR(20)   NOT NULL           -- 'admin' | 'voluntario'
              CHECK (perfil IN ('admin', 'voluntario')),
  ativo       BOOLEAN       NOT NULL DEFAULT TRUE,
  criado_em   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------
-- TABELA: Ministerios
-- Catálogo de ministérios da igreja (gerenciável pelo admin)
-- ----------------------------------------------------------------
CREATE TABLE Ministerios (
  id        SERIAL       PRIMARY KEY,
  nome      VARCHAR(80)  NOT NULL UNIQUE,
  descricao TEXT,
  ativo     BOOLEAN      NOT NULL DEFAULT TRUE,
  ordem     INT          NOT NULL DEFAULT 0    -- para ordenação no UI
);

-- Dados iniciais
INSERT INTO Ministerios (nome, ordem) VALUES
  ('Diáconos',          1),
  ('EBD',               2),
  ('Intercessão',       3),
  ('Recepção',          4),
  ('Louvor',            5),
  ('Mídia / Data Show', 6);

-- ----------------------------------------------------------------
-- TABELA: Voluntarios
-- Perfil estendido de cada voluntário
-- ----------------------------------------------------------------
CREATE TABLE Voluntarios (
  id            SERIAL       PRIMARY KEY,
  usuario_id    INT          NOT NULL UNIQUE
                REFERENCES Usuarios(id) ON DELETE CASCADE,
  ministerio_id INT          NOT NULL
                REFERENCES Ministerios(id),
  telefone      VARCHAR(20),
  email         VARCHAR(120),
  status        VARCHAR(20)  NOT NULL DEFAULT 'ativo'
                CHECK (status IN ('ativo', 'afastado', 'ferias', 'inativo')),
  criado_em     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índice para busca por ministério
CREATE INDEX idx_vol_ministerio ON Voluntarios(ministerio_id);

-- ----------------------------------------------------------------
-- TABELA: Disponibilidade
-- Registra os turnos disponíveis/bloqueados por voluntário.
-- Abordagem: uma linha por (voluntario, dia_semana, turno).
-- ----------------------------------------------------------------
CREATE TABLE Disponibilidade (
  id            SERIAL      PRIMARY KEY,
  voluntario_id INT         NOT NULL
                REFERENCES Voluntarios(id) ON DELETE CASCADE,
  tipo          VARCHAR(15) NOT NULL
                CHECK (tipo IN ('disponivel', 'indisponivel', 'data_especifica')),
  dia_semana    VARCHAR(3),   -- 'dom'|'seg'|'ter'|'qua'|'qui'|'sex'|'sab'  (NULL se data_especifica)
  turno         VARCHAR(10),  -- 'manha'|'tarde'|'noite'  (NULL se data_especifica)
  data_especifica DATE,        -- Preenchido apenas quando tipo = 'data_especifica'
  obs           TEXT,
  -- Regra: (dia_semana, turno) OR data_especifica deve ser fornecido
  CHECK (
    (tipo IN ('disponivel','indisponivel') AND dia_semana IS NOT NULL AND turno IS NOT NULL)
    OR
    (tipo = 'data_especifica' AND data_especifica IS NOT NULL)
  ),
  -- Unicidade por voluntário + slot
  UNIQUE (voluntario_id, dia_semana, turno),
  UNIQUE (voluntario_id, data_especifica)
);

CREATE INDEX idx_disp_vol  ON Disponibilidade(voluntario_id);
CREATE INDEX idx_disp_data ON Disponibilidade(data_especifica);

-- ----------------------------------------------------------------
-- TABELA: Escalas
-- Representa uma escala ministerial com status de ciclo de vida.
-- ----------------------------------------------------------------
CREATE TABLE Escalas (
  id             SERIAL       PRIMARY KEY,
  ministerio_id  INT          NOT NULL
                 REFERENCES Ministerios(id),
  data           DATE         NOT NULL,
  horario        TIME         NOT NULL,
  culto_evento   VARCHAR(150),
  status         VARCHAR(15)  NOT NULL DEFAULT 'rascunho'
                 CHECK (status IN ('rascunho', 'publicada', 'cancelada')),
  -- Campos genéricos (usados conforme ministério)
  local          VARCHAR(120),
  funcao         VARCHAR(80),
  obs            TEXT,
  -- Campos EBD
  turma          VARCHAR(80),
  tema           VARCHAR(150),
  auxiliar_nome  VARCHAR(120),
  resp_lanche    VARCHAR(120),
  -- Campos Intercessão
  foco_oracao    VARCHAR(200),
  -- Metadados
  criado_por     INT          REFERENCES Usuarios(id),
  criado_em      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_escala_data        ON Escalas(data);
CREATE INDEX idx_escala_ministerio  ON Escalas(ministerio_id);
CREATE INDEX idx_escala_status      ON Escalas(status);

-- ----------------------------------------------------------------
-- TABELA: EscalaVoluntario
-- Relacionamento N:N entre Escala e Voluntário (um evento pode
-- ter múltiplos voluntários e um voluntário pode ter N escalas).
-- ----------------------------------------------------------------
CREATE TABLE EscalaVoluntario (
  id            SERIAL      PRIMARY KEY,
  escala_id     INT         NOT NULL REFERENCES Escalas(id)     ON DELETE CASCADE,
  voluntario_id INT         NOT NULL REFERENCES Voluntarios(id) ON DELETE CASCADE,
  papel         VARCHAR(60),    -- 'professor', 'auxiliar', 'intercessor', 'recepcao'…
  confirmado    BOOLEAN     NOT NULL DEFAULT FALSE,
  UNIQUE (escala_id, voluntario_id)
);

CREATE INDEX idx_ev_escala     ON EscalaVoluntario(escala_id);
CREATE INDEX idx_ev_voluntario ON EscalaVoluntario(voluntario_id);

-- ================================================================
-- QUERIES DQL AVANÇADAS — Exemplos de consulta
-- ================================================================

-- ----------------------------------------------------------------
-- QUERY 1: Voluntários escalados no Próximo Domingo (publicadas)
-- Retorna: Nome do Voluntário, Ministério, Horário, Culto, Papel
-- ----------------------------------------------------------------
SELECT
  u.nome                AS voluntario,
  m.nome                AS ministerio,
  e.horario             AS horario,
  e.culto_evento        AS culto,
  ev.papel              AS funcao,
  e.status              AS status_escala
FROM
  EscalaVoluntario ev
  INNER JOIN Escalas     e  ON e.id  = ev.escala_id
  INNER JOIN Voluntarios v  ON v.id  = ev.voluntario_id
  INNER JOIN Usuarios    u  ON u.id  = v.usuario_id
  INNER JOIN Ministerios m  ON m.id  = e.ministerio_id
WHERE
  e.data   = (CURRENT_DATE + ((7 - EXTRACT(DOW FROM CURRENT_DATE)::INT) % 7) * INTERVAL '1 day')::DATE
  AND e.status = 'publicada'
ORDER BY
  e.horario, m.nome, u.nome;

-- ----------------------------------------------------------------
-- QUERY 2: Verificação de conflito de horário para um voluntário
-- (Substitui a lógica JS em validacoes.js em contexto back-end)
-- ----------------------------------------------------------------
SELECT
  e.id            AS escala_conflito_id,
  m.nome          AS ministerio,
  e.culto_evento,
  e.horario
FROM
  EscalaVoluntario ev
  INNER JOIN Escalas     e ON e.id = ev.escala_id
  INNER JOIN Ministerios m ON m.id = e.ministerio_id
WHERE
  ev.voluntario_id = :voluntario_id_param   -- parâmetro da aplicação
  AND e.data       = :data_param
  AND e.horario    = :horario_param
  AND e.id        <> :escala_atual_param    -- excluir a escala sendo editada
  AND e.status    <> 'cancelada';

-- ----------------------------------------------------------------
-- QUERY 3: Relatório mensal de participação por voluntário
-- ----------------------------------------------------------------
SELECT
  u.nome                        AS voluntario,
  m.nome                        AS ministerio,
  COUNT(ev.id)                  AS total_escalas,
  SUM(CASE WHEN ev.confirmado THEN 1 ELSE 0 END) AS confirmadas,
  DATE_TRUNC('month', e.data)   AS mes
FROM
  EscalaVoluntario ev
  INNER JOIN Escalas     e ON e.id = ev.escala_id
  INNER JOIN Voluntarios v ON v.id = ev.voluntario_id
  INNER JOIN Usuarios    u ON u.id = v.usuario_id
  INNER JOIN Ministerios m ON m.id = e.ministerio_id
WHERE
  e.status = 'publicada'
  AND e.data >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '3 months')
GROUP BY
  u.nome, m.nome, DATE_TRUNC('month', e.data)
ORDER BY
  mes DESC, total_escalas DESC;

-- ----------------------------------------------------------------
-- QUERY 4: Detectar indisponibilidades violadas (todas as escalas)
-- (Equivalente ao levantarTodosConflitos() do JS)
-- ----------------------------------------------------------------
SELECT
  u.nome          AS voluntario,
  m.nome          AS ministerio,
  e.data,
  e.horario,
  e.culto_evento,
  d.tipo          AS tipo_conflito,
  CASE d.tipo
    WHEN 'indisponivel'       THEN 'Período marcado como indisponível'
    WHEN 'data_especifica'    THEN 'Data específica bloqueada'
  END AS descricao_conflito
FROM
  EscalaVoluntario ev
  INNER JOIN Escalas        e ON e.id = ev.escala_id
  INNER JOIN Voluntarios    v ON v.id = ev.voluntario_id
  INNER JOIN Usuarios       u ON u.id = v.usuario_id
  INNER JOIN Ministerios    m ON m.id = e.ministerio_id
  INNER JOIN Disponibilidade d ON d.voluntario_id = ev.voluntario_id
WHERE
  e.status = 'publicada'
  AND (
    -- Conflito por turno semanal
    (d.tipo = 'indisponivel'
     AND d.dia_semana = LOWER(TO_CHAR(e.data, 'Dy'))  -- 'Mon' -> 'mon' etc.
     AND d.turno = CASE
       WHEN EXTRACT(HOUR FROM e.horario) < 12 THEN 'manha'
       WHEN EXTRACT(HOUR FROM e.horario) < 18 THEN 'tarde'
       ELSE 'noite' END)
    OR
    -- Conflito por data específica
    (d.tipo = 'data_especifica' AND d.data_especifica = e.data)
  )
ORDER BY
  e.data, u.nome;
