/* ================================================================
   LOGIN.JS
   ================================================================ */

let perfilAtivo    = 'admin';
let usuarioSessao  = null;

function selecionarPerfil(p) {
  perfilAtivo = p;
  document.getElementById('tab-admin').classList.toggle('active', p === 'admin');
  document.getElementById('tab-vol').classList.toggle('active',   p === 'voluntario');
}

function fazerLogin() {
  const usuario = document.getElementById('f-usuario').value.trim();
  const senha   = document.getElementById('f-senha').value.trim();

  if (!usuario || !senha) {
    showToast('Preencha seu usuário e senha.', 'warning');
    return;
  }

  const u = DB.getUsuarios().find(x =>
    x.usuario === usuario && x.senha === senha && x.perfil === perfilAtivo
  );

  if (!u) {
    showToast('Usuário, senha ou perfil incorretos. Verifique e tente novamente.', 'danger', 'Acesso negado');
    document.getElementById('f-senha').value = '';
    document.getElementById('f-senha').focus();
    return;
  }

  usuarioSessao = u;
  document.getElementById('tela-login').style.display = 'none';
  document.getElementById('app').style.display        = 'block';
  iniciarApp();
}

function logout() {
  usuarioSessao = null;
  document.getElementById('app').style.display         = 'none';
  document.getElementById('tela-login').style.display  = 'flex';
  document.getElementById('f-usuario').value = '';
  document.getElementById('f-senha').value   = '';
  document.getElementById('f-usuario').focus();
}

// Enter para logar
document.addEventListener('DOMContentLoaded', () => {
  ['f-usuario','f-senha'].forEach(id => {
    document.getElementById(id)?.addEventListener('keydown', e => {
      if (e.key === 'Enter') fazerLogin();
    });
  });
});
