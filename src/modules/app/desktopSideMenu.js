import './desktopSideMenu.css';

const DESKTOP_QUERY = '(min-width: 1181px)';
const BAR_ID = 'expo-desktop-menu-bar';
const HOME_ID = 'expo-desktop-home-button';
const DRAWER_ID = 'expo-desktop-menu-drawer';
const BACKDROP_ID = 'expo-desktop-menu-backdrop';
const NATIVE_HOME_MARKER = 'data-expo-native-home-source';

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

function findTopHeaderButton(label) {
  const normalizedLabel = cleanLabel(label).toLowerCase();

  return Array.from(document.querySelectorAll('button')).find((button) => {
    if (!(button instanceof HTMLButtonElement)) return false;
    if (button.id === HOME_ID) return false;
    if (cleanLabel(button.textContent).toLowerCase() !== normalizedLabel) return false;

    const parent = button.parentElement;
    if (!(parent instanceof HTMLElement)) return false;

    return Array.from(parent.children).some(
      (candidate) => candidate instanceof HTMLButtonElement && cleanLabel(candidate.textContent) === 'Logg ut'
    );
  }) || null;
}

function findNativeHeaderButton(label) {
  const normalizedLabel = cleanLabel(label).toLowerCase();
  return Array.from(document.querySelectorAll('button')).find((button) => {
    if (!(button instanceof HTMLButtonElement)) return false;
    if (button.id === HOME_ID) return false;
    return cleanLabel(button.textContent).toLowerCase() === normalizedLabel;
  }) || null;
}

function restoreNativeHomeSourceButtons() {
  document.querySelectorAll(`[${NATIVE_HOME_MARKER}="1"]`).forEach((button) => {
    if (!(button instanceof HTMLButtonElement)) return;
    button.style.removeProperty('display');
    button.removeAttribute(NATIVE_HOME_MARKER);
  });
}

function hideNativeWorkspaceHomeButton() {
  restoreNativeHomeSourceButtons();
  const nativeLeaveWorkspace = findNativeHeaderButton('← Til startside');
  if (!(nativeLeaveWorkspace instanceof HTMLButtonElement)) return;

  nativeLeaveWorkspace.setAttribute(NATIVE_HOME_MARKER, '1');
  nativeLeaveWorkspace.style.display = 'none';
}

function cleanStartsideUrl() {
  const current = new URL(window.location.href);
  const next = new URL(`${current.origin}${current.pathname}`);
  const progressTest = current.searchParams.get('progressTest');
  if (progressTest) next.searchParams.set('progressTest', progressTest);
  return next.toString();
}

function goToStartside() {
  // Reuse the application's native guarded actions whenever a project workspace
  // or a new-project draft is active. Those actions own unsaved-change handling.
  const nativeLeaveWorkspace = findNativeHeaderButton('← Til startside');
  if (nativeLeaveWorkspace instanceof HTMLButtonElement) {
    nativeLeaveWorkspace.click();
    return;
  }

  const nativeCancelNewProject = findNativeHeaderButton('← Avbryt nytt prosjekt');
  if (nativeCancelNewProject instanceof HTMLButtonElement) {
    nativeCancelNewProject.click();
    return;
  }

  // Outside a project workspace there is no unsaved project state to preserve.
  window.location.assign(cleanStartsideUrl());
}

function positionHomeAction(homeButton) {
  if (!(homeButton instanceof HTMLButtonElement)) return;

  const logoutButton = findTopHeaderButton('Logg ut');
  const newProjectButton = findTopHeaderButton('+ Nytt prosjekt');

  if (!(logoutButton instanceof HTMLButtonElement) || !(newProjectButton instanceof HTMLButtonElement)) {
    homeButton.hidden = true;
    return;
  }

  homeButton.hidden = false;
  homeButton.textContent = '← Til Startside';
  homeButton.style.position = 'fixed';
  homeButton.style.zIndex = '40';
  homeButton.style.margin = '0';
  homeButton.style.height = '40px';
  homeButton.style.padding = '0 10px';
  homeButton.style.fontSize = '13px';
  homeButton.style.lineHeight = '1';
  homeButton.style.borderRadius = '13px';
  homeButton.style.boxShadow = 'none';
  homeButton.style.whiteSpace = 'nowrap';
  homeButton.style.visibility = 'hidden';
  homeButton.style.left = '0';
  homeButton.style.top = '0';

  const logoutRect = logoutButton.getBoundingClientRect();
  const newProjectRect = newProjectButton.getBoundingClientRect();
  const gap = 8;
  const leftEdge = logoutRect.right + gap;
  const rightEdge = newProjectRect.left - gap;
  const availableWidth = Math.max(0, rightEdge - leftEdge);

  let homeWidth = homeButton.offsetWidth;
  if (homeWidth > availableWidth) {
    homeButton.textContent = '← Startside';
    homeWidth = homeButton.offsetWidth;
  }

  if (homeWidth > availableWidth || availableWidth < 72) {
    homeButton.hidden = true;
    homeButton.style.visibility = '';
    return;
  }

  const homeHeight = homeButton.offsetHeight;
  const left = leftEdge + Math.max(0, (availableWidth - homeWidth) / 2);
  const top = newProjectRect.top + (newProjectRect.height - homeHeight) / 2;

  homeButton.style.left = `${Math.round(left)}px`;
  homeButton.style.top = `${Math.round(top)}px`;
  homeButton.style.visibility = 'visible';
}

function buildMenuShell() {
  let bar = document.getElementById(BAR_ID);
  let homeButton = document.getElementById(HOME_ID);
  let drawer = document.getElementById(DRAWER_ID);
  let backdrop = document.getElementById(BACKDROP_ID);

  if (bar && homeButton && drawer && backdrop) return { bar, homeButton, drawer, backdrop };

  bar?.remove();
  homeButton?.remove();
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

  homeButton = document.createElement('button');
  homeButton.id = HOME_ID;
  homeButton.type = 'button';
  homeButton.className = 'secondary expoDesktopHomeButton';
  homeButton.textContent = '← Til Startside';
  homeButton.addEventListener('click', goToStartside);

  const current = document.createElement('div');
  current.className = 'expoDesktopMenuCurrent';
  current.setAttribute('aria-live', 'polite');

  bar.append(toggle, current);
  document.body.append(homeButton);

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
  return { bar, homeButton, drawer, backdrop };
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
  if (!(drawerNav instanceof HTMLElement) || !(current instanceof HTMLElement)) return;

  hideNativeWorkspaceHomeButton();
  positionHomeAction(shell.homeButton);

  const signature = sourceButtons
    .map((button) => `${cleanLabel(button.textContent)}:${button.classList.contains('on') ? '1' : '0'}`)
    .join('|');

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
      const liveNav = findInternalAppNav();
      const target = liveNav instanceof HTMLElement
        ? Array.from(liveNav.querySelectorAll(':scope > button')).find(
            (candidate) => cleanLabel(candidate.textContent) === label
          )
        : null;
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
    restoreNativeHomeSourceButtons();
    sourceNav?.classList.remove('expoDesktopSourceNavHidden');
    sourceNav = null;
    document.getElementById(BAR_ID)?.remove();
    document.getElementById(HOME_ID)?.remove();
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
  window.addEventListener('scroll', scheduleEnsure, { passive: true });

  scheduleEnsure();
}
