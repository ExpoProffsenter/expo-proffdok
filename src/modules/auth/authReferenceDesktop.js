import './authReferenceDesktop.css';
import { AUTH_REFERENCE_IMAGE } from './reference/authReferenceImage.js';

const SHOWCASE_ID = 'expo-proffdok-auth-showcase';
const REFERENCE_CLASS = 'authReferenceStatic';
const DESKTOP_QUERY = '(min-width: 761px)';

const applyReference = () => {
  const showcase = document.getElementById(SHOWCASE_ID);
  if (!showcase) return false;

  if (!window.matchMedia(DESKTOP_QUERY).matches) {
    showcase.classList.remove(REFERENCE_CLASS);
    showcase.style.removeProperty('background');
    showcase.style.removeProperty('box-shadow');
    return true;
  }

  showcase.classList.add(REFERENCE_CLASS);
  showcase.style.setProperty(
    'background',
    `url("${AUTH_REFERENCE_IMAGE}") center center / 100% 100% no-repeat`,
    'important'
  );
  showcase.style.setProperty('box-shadow', 'none', 'important');
  return true;
};

export function installAuthReferenceDesktop() {
  let scheduled = false;
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(() => {
      scheduled = false;
      applyReference();
    });
  };

  schedule();
  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('resize', schedule);
  window.addEventListener('pageshow', schedule);

  return () => {
    observer.disconnect();
    window.removeEventListener('resize', schedule);
    window.removeEventListener('pageshow', schedule);
    const showcase = document.getElementById(SHOWCASE_ID);
    showcase?.classList.remove(REFERENCE_CLASS);
    showcase?.style.removeProperty('background');
    showcase?.style.removeProperty('box-shadow');
  };
}
