/* Check-ride form: today's date in the date field, print / save as PDF. */
(function () {
  const field = document.getElementById('dateTimeField');
  if (field) {
    const now = new Date();
    field.value = now.toLocaleDateString('tr-TR') + ' - ' + now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  }
  document.getElementById('printBtn')?.addEventListener('click', () => window.print());
})();
