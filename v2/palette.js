(() => {
  const requested = new URLSearchParams(location.search).get('theme');
  let saved;
  try { saved = localStorage.getItem('labyrinth-palette'); } catch {}
  document.documentElement.dataset.palette = ['warm', 'blue'].includes(requested) ? requested : saved === 'warm' ? 'warm' : 'blue';
})();
