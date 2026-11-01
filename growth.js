/* WishingASR growth helpers: copy-ready messages and low-friction sharing. */
(() => {
  const toast = (message) => {
    const node = document.getElementById('growthToast') || document.getElementById('toast');
    if (!node) return;
    node.textContent = message;
    node.classList.add('show');
    window.clearTimeout(toast.timer);
    toast.timer = window.setTimeout(() => node.classList.remove('show'), 2600);
  };
  async function copyText(value) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      return;
    }
    const field = document.createElement('textarea');
    field.value = value; field.setAttribute('readonly','');
    field.style.position='fixed'; field.style.opacity='0'; field.style.pointerEvents='none';
    document.body.appendChild(field); field.select();
    const ok = document.execCommand('copy'); field.remove();
    if (!ok) throw new Error('Clipboard unavailable');
  }
  document.addEventListener('click', async (event) => {
    const sample = event.target.closest('[data-copy-text]');
    const link = event.target.closest('.copy-page-link');
    if (!sample && !link) return;
    const button = sample || link;
    const old = button.textContent;
    button.disabled = true;
    try {
      let value = sample ? sample.dataset.copyText : `${location.origin}${location.pathname}`;
      await copyText(value);
      button.textContent = sample ? 'Copied ✓' : 'Link copied ✓';
      toast(sample ? 'Message copied. Make it yours before sending.' : 'WishingASR link copied. Share it with someone.');
    } catch (error) {
      toast('Copy is not available in this browser. Select the text and copy it manually.');
    } finally {
      window.setTimeout(() => { button.textContent = old; button.disabled = false; }, 1800);
    }
  });
})();
