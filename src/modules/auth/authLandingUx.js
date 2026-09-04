import './authLanding.css';

const SHOWCASE_ID = 'expo-proffdok-auth-showcase';
const BODY_CLASS = 'authLandingActive';
const LOGIN_CLASS = 'authLandingLogin';
const SIGNUP_CLASS = 'authLandingSignup';

const normalizeText = (value = '') =>
  String(value || '').replace(/\s+/g, ' ').trim();

const buttonByText = (text) =>
  Array.from(document.querySelectorAll('button')).find(
    (button) => normalizeText(button.textContent) === text
  );

const svgIcon = (name) => {
  const icons = {
    offer: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l3 3v15H6z"/><path d="M15 3v4h4M9 11h6M9 15h6"/></svg>',
    contract: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20c4-6 6-7 9-9l3-3 3 3-3 3c-2 2-4 4-10 6z"/><path d="M13 11l3 3"/></svg>',
    progress: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19V9h4v10zM10 19V5h4v14zM15 19v-7h4v7z"/></svg>',
    survey: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="8" cy="7" r="2.5"/><path d="M3.5 19v-3a4.5 4.5 0 0 1 9 0v3M15 5h5M15 9h5M15 13h5"/></svg>',
    project: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16v13H4zM8 7V4h8v3"/><path d="M4 12h16"/></svg>',
    docs: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l3 3v15H6z"/><path d="M9 11h6M9 15h6"/></svg>',
    checklist: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h14v16H5z"/><path d="M8 9l1.5 1.5L12 8M8 15l1.5 1.5L12 14M14 9h2M14 15h2"/></svg>',
    deviation: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 21 20H3z"/><path d="M12 9v5M12 17h.01"/></svg>',
    images: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m5 17 5-5 3 3 2-2 4 4"/></svg>',
    warranty: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 19 6v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/><path d="m9 12 2 2 4-4"/></svg>',
    eye: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"/><circle cx="12" cy="12" r="2.5"/></svg>',
    eyeOff: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18M10.6 6.1A9.8 9.8 0 0 1 12 6c6 0 9.5 6 9.5 6a14.4 14.4 0 0 1-2.4 3.1M6.1 6.1C3.7 8 2.5 12 2.5 12s3.5 6 9.5 6c1 0 2-.2 2.8-.5"/><path d="M9.9 9.9A3 3 0 0 0 14.1 14.1"/></svg>'
  };
  return icons[name] || icons.docs;
};

const primaryCard = ({ icon, title, text, preview }) => `
  <article class="authShowcaseCard">
    <div class="authShowcaseCardIcon">${svgIcon(icon)}</div>
    <h3>${title}</h3>
    <p>${text}</p>
    <div class="authShowcasePreview authShowcasePreview--${preview}">
      <span class="authPreviewLabel">${title.toUpperCase()}</span>
      <span class="authPreviewLine authPreviewLine--wide"></span>
      <span class="authPreviewLine"></span>
      <span class="authPreviewLine authPreviewLine--short"></span>
      ${preview === 'progress' ? '<span class="authPreviewProgress"><i></i></span>' : ''}
      ${preview === 'contract' ? '<span class="authPreviewSignature">sign.</span>' : ''}
    </div>
  </article>`;

const buildShowcase = () => {
  const showcase = document.createElement('aside');
  showcase.id = SHOWCASE_ID;
  showcase.className = 'authLandingShowcase';
  showcase.setAttribute('aria-label', 'Expo ProffDok – prosjektdokumentasjon for fagfolk');
  showcase.innerHTML = `
    <div class="authShowcaseShade"></div>
    <div class="authShowcaseContent">
      <div class="authShowcaseTop">
        <div class="authShowcaseBrand"><img src="/expo-logo.png" alt="EXPO Proffsenter – en del av Ringside"></div>
        <div class="authShowcasePromise"><span>ENKLERE</span><span>MER EFFEKTIVT</span><span>TRYGGERE SAMMEN</span></div>
      </div>

      <div class="authShowcaseCopy">
        <h1><span>Expo</span> <strong>ProffDok</strong></h1>
        <h2>Prosjektdokumentasjon laget for fagfolk</h2>
        <p>Fra befaring og tilbud til kontrakt, fremdrift, dokumentasjon, avvik og garanti – samlet i ett system.</p>
      </div>

      <div class="authShowcasePrimary">
        ${primaryCard({ icon: 'offer', title: 'Tilbud', text: 'Profesjonelle tilbud i enkle steg', preview: 'offer' })}
        ${primaryCard({ icon: 'contract', title: 'Kontrakt', text: 'Trygge avtaler og god flyt', preview: 'contract' })}
        ${primaryCard({ icon: 'progress', title: 'Fremdrift', text: 'Full oversikt gjennom hele prosjektet', preview: 'progress' })}
      </div>

      <div class="authShowcaseTools" aria-label="Funksjoner i Expo ProffDok">
        <div>${svgIcon('survey')}<span>Befaring &amp;<br>tilbud</span></div>
        <div>${svgIcon('project')}<span>Prosjekt-<br>styring</span></div>
        <div>${svgIcon('docs')}<span>Dokumentasjon</span></div>
        <div>${svgIcon('checklist')}<span>Sjekklister</span></div>
        <div>${svgIcon('deviation')}<span>Avvik</span></div>
        <div>${svgIcon('images')}<span>Bilder</span></div>
        <div>${svgIcon('warranty')}<span>Garanti</span></div>
      </div>

      <div class="authShowcasePillars">
        <div><b>Prosjektgjennomføring</b><span>Effektiv planlegging og oppfølging</span></div>
        <div><b>Kvalitetssikring</b><span>Sjekklister, avvik og dokumentasjon</span></div>
        <div><b>Dokumentasjon &amp; garanti</b><span>Alt på plass – også etter levering</span></div>
      </div>
    </div>
  `;
  return showcase;
};

const removeShowcase = () => {
  document.getElementById(SHOWCASE_ID)?.remove();
};

const markActionButtons = (mode) => {
  const loginButton = buttonByText('Logg inn');
  const signupButton = buttonByText('Opprett bruker');
  const resetButton = buttonByText('Glemt passord?');
  const signupSubmit = buttonByText('Send registrering');
  const signupCancel = buttonByText('Jeg har allerede en konto');

  [loginButton, signupButton, resetButton, signupSubmit, signupCancel].forEach((button) => {
    button?.classList.remove(
      'authActionLogin',
      'authActionSignup',
      'authActionReset',
      'authActionSignupSubmit',
      'authActionSignupCancel'
    );
  });

  loginButton?.classList.add('authActionLogin');
  signupButton?.classList.add('authActionSignup');
  resetButton?.classList.add('authActionReset');
  signupSubmit?.classList.add('authActionSignupSubmit');
  signupCancel?.classList.add('authActionSignupCancel');

  const primary = mode === 'signup' ? signupSubmit : loginButton;
  primary?.parentElement?.classList.add('authActionRow');
};

const markAuxiliaryContent = () => {
  Array.from(document.querySelectorAll('p.note')).forEach((paragraph) => {
    const text = normalizeText(paragraph.textContent);
    paragraph.classList.toggle('authNewUserNote', text.startsWith('Ny bruker? Klikk Opprett bruker'));
    paragraph.classList.toggle('authSecurityNote', text.startsWith('E-post huskes på denne enheten'));
    paragraph.classList.toggle('authPortalNote', text.startsWith('Delingslenker fungerer fortsatt'));
  });

  Array.from(document.querySelectorAll('.item')).forEach((item) => {
    const heading = normalizeText(item.querySelector('h3')?.textContent);
    item.classList.toggle('authInstallGuide', heading.includes('Legg Expo ProffDok på hjemskjermen'));
  });
};

const decoratePasswordFields = () => {
  Array.from(document.querySelectorAll('input[type="password"], input[data-auth-password="true"]')).forEach((input) => {
    if (!(input instanceof HTMLInputElement)) return;
    input.dataset.authPassword = 'true';
    const label = input.closest('label');
    if (!label) return;
    label.classList.add('authPasswordLabel');
    if (label.querySelector('.authPasswordToggle')) return;

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'authPasswordToggle';
    toggle.setAttribute('aria-label', 'Vis passord');
    toggle.innerHTML = svgIcon('eye');
    toggle.addEventListener('click', () => {
      const showing = input.type === 'text';
      input.type = showing ? 'password' : 'text';
      toggle.setAttribute('aria-label', showing ? 'Vis passord' : 'Skjul passord');
      toggle.innerHTML = svgIcon(showing ? 'eye' : 'eyeOff');
      input.focus({ preventScroll: true });
    });
    label.append(toggle);
  });
};

const detectAuthMode = () => {
  const login = buttonByText('Logg inn');
  const signup = buttonByText('Send registrering');
  const heading = Array.from(document.querySelectorAll('h1')).find(
    (element) => normalizeText(element.textContent) === 'Expo ProffDok'
  );
  const hasNav = document.querySelector('nav');
  if (!heading || hasNav || (!login && !signup)) return '';
  return signup ? 'signup' : 'login';
};

const applyAuthLanding = () => {
  const mode = detectAuthMode();
  if (!mode) {
    document.body.classList.remove(BODY_CLASS, LOGIN_CLASS, SIGNUP_CLASS);
    removeShowcase();
    return false;
  }

  document.body.classList.add(BODY_CLASS);
  document.body.classList.toggle(LOGIN_CLASS, mode === 'login');
  document.body.classList.toggle(SIGNUP_CLASS, mode === 'signup');

  if (!document.getElementById(SHOWCASE_ID)) {
    document.body.prepend(buildShowcase());
  }

  markActionButtons(mode);
  markAuxiliaryContent();
  decoratePasswordFields();
  return true;
};

export function installAuthLandingUx() {
  let scheduled = false;
  const scheduleApply = () => {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(() => {
      scheduled = false;
      applyAuthLanding();
    });
  };

  scheduleApply();
  const observer = new MutationObserver(scheduleApply);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  window.addEventListener('pageshow', scheduleApply);
  return () => {
    observer.disconnect();
    window.removeEventListener('pageshow', scheduleApply);
    document.body.classList.remove(BODY_CLASS, LOGIN_CLASS, SIGNUP_CLASS);
    removeShowcase();
  };
}
