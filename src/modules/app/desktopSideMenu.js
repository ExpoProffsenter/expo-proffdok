import './desktopSideMenu.css';

const DESKTOP_QUERY = '(min-width: 1181px)';
const BAR_ID = 'expo-desktop-menu-bar';
const HOME_ID = 'expo-desktop-home-button';
const HELP_ID = 'expo-desktop-help-button';
const DRAWER_ID = 'expo-desktop-menu-drawer';
const BACKDROP_ID = 'expo-desktop-menu-backdrop';
const NATIVE_HOME_MARKER = 'data-expo-native-home-source';
const SALES_NAV_PREFIX = 'expo-proffdok-sales-preview-requests-v1';

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

function findSourceNavButton(labels = []) {
  const sourceNav = findInternalAppNav();
  if (!(sourceNav instanceof HTMLElement)) return null;
  const accepted = new Set((Array.isArray(labels) ? labels : [labels]).map((label) => cleanLabel(label)));
  return Array.from(sourceNav.querySelectorAll(':scope > button')).find(
    (button) => accepted.has(cleanLabel(button.textContent))
  ) || null;
}

function findTopHeaderButton(label) {
  const normalizedLabel = cleanLabel(label).toLowerCase();

  return Array.from(document.querySelectorAll('button')).find((button) => {
    if (!(button instanceof HTMLButtonElement)) return false;
    if (button.id === HOME_ID || button.id === HELP_ID) return false;
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
    if (button.id === HOME_ID || button.id === HELP_ID) return false;
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

function clearRememberedSalesNavigation() {
  try {
    const storage = window.localStorage;
    const keys = [];
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (key?.startsWith(SALES_NAV_PREFIX) && key.endsWith(':navigation')) keys.push(key);
    }
    keys.forEach((key) => storage.removeItem(key));
  } catch {
    // Kun intern navigasjonsstate. Tilbud, kladder og serverdata røres ikke.
  }
}

function goToStartside() {
  clearRememberedSalesNavigation();

  // Prosjektarbeidsflate/new-project eier selv ulagret-varsel og må få førsteprioritet.
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

  // Uten aktiv prosjektarbeidsflate bruker vi React-appens ekte Startside-knapp.
  // Dette er viktig i Sales: samme URL kan ellers gi en no-op og brukeren blir stående.
  const sourceStart = findSourceNavButton(['Startside']);
  if (sourceStart instanceof HTMLButtonElement) {
    sourceStart.click();
    return;
  }

  // Kun fallback dersom intern nav ennå ikke finnes.
  window.location.assign(cleanStartsideUrl());
}

function goToHelp() {
  const sourceHelp = findSourceNavButton(['Hjelp']);
  if (sourceHelp instanceof HTMLButtonElement) {
    sourceHelp.click();
    return;
  }

  const nativeHelp = findNativeHeaderButton('Hjelp');
  if (nativeHelp instanceof HTMLButtonElement) nativeHelp.click();
}

function styleHeaderShortcut(button, text) {
  button.textContent = text;
  button.hidden = false;
  button.style.position = 'fixed';
  button.style.zIndex = '40';
  button.style.margin = '0';
  button.style.height = '40px';
  button.style.padding = '0 10px';
  button.style.fontSize = '13px';
  button.style.lineHeight = '1';
  button.style.borderRadius = '13px';
  button.style.boxShadow = 'none';
  button.style.whiteSpace = 'nowrap';
  button.style.visibility = 'hidden';
  button.style.left = '0';
  button.style.top = '0';
}

function styleBarHelpButton(helpButton) {
  if (!(helpButton instanceof HTMLButtonElement)) return;
  helpButton.textContent = '? Hjelp';
  helpButton.hidden = false;
  helpButton.style.position = 'static';
  helpButton.style.zIndex = 'auto';
  helpButton.style.margin = '0 0 0 auto';
  helpButton.style.height = '40px';
  helpButton.style.padding = '0 12px';
  helpButton.style.fontSize = '13px';
  helpButton.style.lineHeight = '1';
  helpButton.style.borderRadius = '13px';
  helpButton.style.boxShadow = 'none';
  helpButton.style.whiteSpace = 'nowrap';
  helpButton.style.visibility = 'visible';
  helpButton.style.left = '';
  helpButton.style.top = '';
  helpButton.style.flex = '0 0 auto';
}

function positionHeaderActions(homeButton) {
  if (!(homeButton instanceof HTMLButtonElement)) return;

  const logoutButton = findTopHeaderButton('Logg ut');
  const newProjectButton = findTopHeaderButton('+ Nytt prosjekt');

  if (!(logoutButton instanceof HTMLButtonElement) || !(newProjectButton instanceof HTMLButtonElement)) {
    homeButton.hidden = true;
    return;
  }

  styleHeaderShortcut(homeButton, '← Startside');

  const logoutRect = logoutButton.getBoundingClientRect();
  const newProjectRect = newProjectButton.getBoundingClientRect();
  const gap = 8;
  const leftEdge = logoutRect.right + gap;
  const rightEdge = newProjectRect.left - gap;
  const availableBetween = Math.max(0, rightEdge - leftEdge);

  const homeWidth = homeButton.offsetWidth;
  const top = newProjectRect.top + (newProjectRect.height - homeButton.offsetHeight) / 2;

  if (homeWidth <= availableBetween && availableBetween >= 72) {
    const left = leftEdge + Math.max(0, (availableBetween - homeWidth) / 2);
    homeButton.style.left = `${Math.round(left)}px`;
    homeButton.style.top = `${Math.round(top)}px`;
    homeButton.style.visibility = 'visible';
  } else {
    homeButton.hidden = true;
    homeButton.style.visibility = '';
  }
}

function buildMenuShell() {
  let bar = document.getElementById(BAR_ID);
  let homeButton = document.getElementById(HOME_ID);
  let helpButton = document.getElementById(HELP_ID);
  let drawer = document.getElementById(DRAWER_ID);
  let backdrop = document.getElementById(BACKDROP_ID);

  if (bar && homeButton && helpButton && drawer && backdrop) {
    if (helpButton.parentElement !== bar) bar.append(helpButton);
    styleBarHelpButton(helpButton);
    return { bar, homeButton, helpButton, drawer, backdrop };
  }

  bar?.remove();
  homeButton?.remove();
  helpButton?.remove();
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
  homeButton.className = 'secondary expoDesktopHeaderShortcut';
  homeButton.textContent = '← Startside';
  homeButton.addEventListener('click', goToStartside);

  helpButton = document.createElement('button');
  helpButton.id = HELP_ID;
  helpButton.type = 'button';
  helpButton.className = 'secondary expoDesktopHeaderShortcut';
  helpButton.textContent = '? Hjelp';
  helpButton.addEventListener('click', goToHelp);
  styleBarHelpButton(helpButton);

  const current = document.createElement('div');
  current.className = 'expoDesktopMenuCurrent';
  current.setAttribute('aria-live', 'polite');

  bar.append(toggle, current, helpButton);
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
  return { bar, homeButton, helpButton, drawer, backdrop };
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
  positionHeaderActions(shell.homeButton);
  styleBarHelpButton(shell.helpButton);

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
    document.getElementById(HELP_ID)?.remove();
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
