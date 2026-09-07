import './desktopSideMenu.css';

const DESKTOP_QUERY = '(min-width: 1181px)';
const BAR_ID = 'expo-desktop-menu-bar';
const DRAWER_ID = 'expo-desktop-menu-drawer';
const BACKDROP_ID = 'expo-desktop-menu-backdrop';

const cleanLabel = (value = '') => String(value || '').replace(/\s+/g, ' ').trim();

function findInternalAppNav() {
  if (!window.matchMedia(DESKTOP_QUERY).matches) return null;

  return Array.from(document.querySelectorAll('nav')).find((nav) => {
    if (!(nav instanceof HTMLElement)) return false;
    if (nav.closest('[data-expo-auth-shell]')) return false;

    const labels = Array.from(nav.querySelectorAll(':scope > button')).map((button) =>
      cleanLabel(button.textContent)
    );

    return labels.includes('Befaring/Tilbud') &&
      labels.some((label) => label === 'Startside' || label === 'Prosjektoversikt') &&
      labels.includes('Hjelp');
  }) || null;
}

function buildMenuShell() {
  let bar = document.getElementById(BAR_ID);
  let drawer = document.getElementById(DRAWER_ID);
  let backdrop = document.getElementById(BACKDROP_ID);

  if (bar && drawer && backdrop) return { bar, drawer, backdrop };

  bar?.remove();
  drawer?.remove();
  backdrop?.remove();

  bar = document.createElement('div');
  bar.id = BAR_ID;
  bar.className = 'expoDesktopMenuBar';

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'expoDesktopMenuToggle';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', DRAWER_ID);
  toggle.innerHTML = `
    <span class="expoDesktopMenuIcon" aria-hidden="true"><span></span><span></span><span></span></span>
    <span>Meny</span>
  `;

  const homeButton = document.createElement('button');
  homeButton.type = 'button';
  homeButton.className = 'expoDesktopHomeButton';
  homeButton.textContent = '← Til Startside';
  homeButton.hidden = true;

  const current = document.createElement('div');
  current.className = 'expoDesktopMenuCurrent';
  current.setAttribute('aria-live', 'polite');

  bar.append(toggle, homeButton, current);

  backdrop = document.createElement('div');
  backdrop.id = BACKDROP_ID;
  backdrop.className = 'expoDesktopMenuBackdrop';
  backdrop.hidden = true;

  drawer = document.createElement('aside');
  drawer.id = DRAWER_ID;
  drawer.className = 'expoDesktopMenuDrawer';
  drawer.setAttribute('aria-hidden', 'true');

  const header = document.createElement('div');
  header.className = 'expoDesktopDrawerHeader';

  const title = document.createElement('div');
  title.className = 'expoDesktopDrawerTitle';
  title.innerHTML = '<strong>Expo ProffDok</strong><span>Navigasjon</span>';

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'expoDesktopDrawerClose';
  closeButton.setAttribute('aria-label', 'Lukk meny');
  closeButton.textContent = '×';

  const navList = document.createElement('div');
  navList.className = 'expoDesktopDrawerNav';
  navList.setAttribute('role', 'navigation');
  navList.setAttribute('aria-label', 'Hovedmeny');

  header.append(title, closeButton);
  drawer.append(header, navList);
  document.body.append(backdrop, drawer);

  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    drawer.setAttribute('aria-hidden', open ? 'false' : 'true');

    if (open) {
      backdrop.hidden = false;
      requestAnimationFrame(() => {
        backdrop.classList.add('isOpen');
        drawer.classList.add('isOpen');
        closeButton.focus();
      });
    } else {
      backdrop.classList.remove('isOpen');
      drawer.classList.remove('isOpen');
      window.setTimeout(() => {
        if (!backdrop.classList.contains('isOpen')) backdrop.hidden = true;
      }, 180);
    }
  };

  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });
  closeButton.addEventListener('click', () => setOpen(false));
  backdrop.addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });

  drawer._expoSetOpen = setOpen;
  return { bar, drawer, backdrop };
}

function syncDrawerWithSource(sourceNav, shell) {
  if (!(sourceNav instanceof HTMLElement)) return;

  sourceNav.classList.add('expoDesktopSourceNavHidden');

  if (shell.bar.previousElementSibling !== sourceNav && shell.bar.nextElementSibling !== sourceNav) {
    sourceNav.parentNode?.insertBefore(shell.bar, sourceNav);
  }

  const sourceButtons = Array.from(sourceNav.querySelectorAll(':scope > button'));
  const drawerNav = shell.drawer.querySelector('.expoDesktopDrawerNav');
  const current = shell.bar.querySelector('.expoDesktopMenuCurrent');
  const homeButton = shell.bar.querySelector('.expoDesktopHomeButton');
  if (!(drawerNav instanceof HTMLElement) || !(current instanceof HTMLElement)) return;

  const signature = sourceButtons
    .map((button) => `${cleanLabel(button.textContent)}:${button.classList.contains('on') ? '1' : '0'}`)
    .join('|');

  const startsideSource = sourceButtons.find(
    (button) => cleanLabel(button.textContent) === 'Startside'
  );
  const startsideActive = Boolean(
    startsideSource instanceof HTMLButtonElement && startsideSource.classList.contains('on')
  );

  if (homeButton instanceof HTMLButtonElement) {
    homeButton.hidden = !(startsideSource instanceof HTMLButtonElement) || startsideActive;
    homeButton.onclick = startsideSource instanceof HTMLButtonElement
      ? () => startsideSource.click()
      : null;
  }

  if (drawerNav.dataset.sourceSignature === signature) return;
  drawerNav.dataset.sourceSignature = signature;
  drawerNav.replaceChildren();

  let activeLabel = '';

  sourceButtons.forEach((sourceButton) => {
    const label = cleanLabel(sourceButton.textContent);
    if (!label) return;

    const isActive = sourceButton.classList.contains('on');
    if (isActive) activeLabel = label;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = `expoDesktopDrawerButton${isActive ? ' isActive' : ''}`;
    button.textContent = label;
    if (isActive) button.setAttribute('aria-current', 'page');

    button.addEventListener('click', () => {
      const target = Array.from(sourceNav.querySelectorAll(':scope > button')).find(
        (candidate) => cleanLabel(candidate.textContent) === label
      );
      if (target instanceof HTMLButtonElement) target.click();
      shell.drawer._expoSetOpen?.(false);
    });

    drawerNav.append(button);
  });

  current.textContent = activeLabel || 'Expo ProffDok';
}

export function installDesktopSideMenu() {
  let sourceNav = null;
  let sourceObserver = null;
  let scheduled = false;

  const detachSourceObserver = () => {
    sourceObserver?.disconnect();
    sourceObserver = null;
  };

  const disable = () => {
    detachSourceObserver();
    sourceNav?.classList.remove('expoDesktopSourceNavHidden');
    sourceNav = null;
    document.getElementById(BAR_ID)?.remove();
    document.getElementById(DRAWER_ID)?.remove();
    document.getElementById(BACKDROP_ID)?.remove();
  };

  const ensure = () => {
    scheduled = false;

    if (!window.matchMedia(DESKTOP_QUERY).matches) {
      disable();
      return;
    }

    const nextNav = findInternalAppNav();
    if (!nextNav) {
      disable();
      return;
    }

    const shell = buildMenuShell();

    if (nextNav !== sourceNav) {
      detachSourceObserver();
      sourceNav?.classList.remove('expoDesktopSourceNavHidden');
      sourceNav = nextNav;

      sourceObserver = new MutationObserver(() => scheduleEnsure());
      sourceObserver.observe(sourceNav, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ['class']
      });
    }

    syncDrawerWithSource(sourceNav, shell);
  };

  const scheduleEnsure = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(ensure);
  };

  const documentObserver = new MutationObserver(scheduleEnsure);
  documentObserver.observe(document.documentElement, { childList: true, subtree: true });

  const media = window.matchMedia(DESKTOP_QUERY);
  media.addEventListener?.('change', scheduleEnsure);
  window.addEventListener('resize', scheduleEnsure, { passive: true });

  scheduleEnsure();
}
