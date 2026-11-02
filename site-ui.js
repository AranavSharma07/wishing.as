/* WishingASR v65 shared page controls. Kept same-origin for a strict script-src CSP. */
(() => {
  'use strict';

  const currentYear = String(new Date().getFullYear());
  ['yearNow', 'y', 'aaYear', 'errorYear'].forEach((id) => {
    const node = document.getElementById(id);
    if (node) node.textContent = currentYear;
  });

  const toggle = document.getElementById('menuToggle');
  const nav = document.getElementById('mainNav');
  const mainCreatorOwnsNavigation = Boolean(document.getElementById('wishForm'));
  if (toggle && nav && !mainCreatorOwnsNavigation) {
    const closeMenu = () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.textContent = '☰';
    };

    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.textContent = isOpen ? '×' : '☰';
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });

    document.addEventListener('click', (event) => {
      if (
        nav.classList.contains('open') &&
        !nav.contains(event.target) &&
        !toggle.contains(event.target)
      ) {
        closeMenu();
      }
    });
  }

  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const name = document.getElementById('name')?.value.trim() || '';
      const email = document.getElementById('email')?.value.trim() || '';
      const message = document.getElementById('message')?.value.trim() || '';
      if (!name || !message) {
        contactForm.reportValidity?.();
        return;
      }
      const subject = encodeURIComponent('WishingASR website enquiry');
      const body = encodeURIComponent(
        `Name: ${name}\nReply email: ${email || 'Not provided'}\n\n${message}`
      );
      window.location.href =
        `mailto:asarnavsharma04@gmail.com?subject=${subject}&body=${body}`;
    });
  }

  // Retain the previous tools-page horizontal-position guard without inline JS.
  const path = window.location.pathname.replace(/\/+$/, '');
  if (path === '/tools' || path.endsWith('/tools.html')) {
    const resetHorizontalScroll = () => {
      if (window.scrollX !== 0) window.scrollTo(0, window.scrollY);
      document.documentElement.scrollLeft = 0;
      if (document.body) document.body.scrollLeft = 0;
    };
    window.addEventListener('pageshow', resetHorizontalScroll, { passive: true });
    window.addEventListener('load', resetHorizontalScroll, { once: true, passive: true });
  }
})();
