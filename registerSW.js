// Registra o service worker e mantém o app em dia no iPad: procura versão nova sempre que o app
// volta para a tela; quando a versão nova assume, recarrega na hora se o app acabou de abrir,
// ou na próxima vez que ele voltar para a tela (nunca no meio de uma atividade).
if ('serviceWorker' in navigator) {
  const abertoEm = Date.now();
  const tinhaVersao = !!navigator.serviceWorker.controller;
  let pendente = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!tinhaVersao) return;
    if (Date.now() - abertoEm < 15000) location.reload();
    else pendente = true;
  });
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).then((reg) => {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState !== 'visible') return;
        if (pendente) return location.reload();
        reg.update().catch(() => {});
      });
    });
  });
}
