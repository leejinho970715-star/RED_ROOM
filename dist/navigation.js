export function createNavigation() {
  const sidebar = document.querySelector('#side-menu');
  const shell = document.querySelector('.app-shell');
  const toggle = document.querySelector('#menu-toggle');
  const close = document.querySelector('#menu-close');
  const backdrop = document.querySelector('#menu-backdrop');
  const mobile = window.matchMedia('(max-width: 760px)');
  const storageKey = 'red-room-menu-open';
  let desktopOpen = true;
  try { desktopOpen = localStorage.getItem(storageKey) !== 'false'; } catch {}
  let open = mobile.matches ? false : desktopOpen;

  function update() {
    document.body.classList.toggle('menu-open', open);
    document.body.classList.toggle('menu-drawer-open', mobile.matches && open);
    sidebar.hidden = !open;
    sidebar.inert = !open;
    shell.inert = mobile.matches && open;
    backdrop.hidden = !(mobile.matches && open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (mobile.matches && open) {
      sidebar.setAttribute('role', 'dialog');
      sidebar.setAttribute('aria-modal', 'true');
    } else {
      sidebar.removeAttribute('role');
      sidebar.removeAttribute('aria-modal');
    }
  }

  function setOpen(next, restoreFocus = true) {
    open = next;
    if (!mobile.matches) {
      desktopOpen = open;
      try { localStorage.setItem(storageKey, String(open)); } catch {}
    }
    update();
    if (open && mobile.matches) close.focus();
    else if (!open && restoreFocus) toggle.focus();
  }

  toggle.addEventListener('click', () => setOpen(!open));
  close.addEventListener('click', () => setOpen(false));
  backdrop.addEventListener('click', () => setOpen(false));
  sidebar.addEventListener('click', event => {
    if (mobile.matches && event.target.closest('[data-nav], .brand, [data-action="help"]')) setOpen(false);
  });
  document.addEventListener('keydown', event => {
    if (!open || document.querySelector('#modal').open) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === 'Tab' && mobile.matches) {
      const focusable = [...sidebar.querySelectorAll('a[href], button:not(:disabled)')].filter(element => element.getClientRects().length);
      const first = focusable[0], last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  mobile.addEventListener('change', () => {
    const hadMenuFocus = sidebar.contains(document.activeElement);
    open = mobile.matches ? false : desktopOpen;
    update();
    if (!open && hadMenuFocus) toggle.focus();
  });
  update();
}
