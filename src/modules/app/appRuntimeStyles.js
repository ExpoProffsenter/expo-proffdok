// FASE 27H APP-STILER: Flytter store inline CSS-strenger ut av main.jsx uten å endre DOM-plassering eller cascade.
// Ingen UI-redesign, funksjonsendring, state-, database-, RLS-, Storage-, Edge Function- eller e-postendring.

export const UNDERENTREPRENOR_RUNTIME_STYLES = `
          .collapsibleHelp { font-weight:800; background:#f8fafc; border:1px solid #dbe7ec; border-radius:14px; padding:10px 12px; }
          .collapsibleBlock { border:1px solid #dbe7ec; border-radius:16px; background:#ffffff; margin:12px 0; overflow:hidden; }
          .collapsibleBlock summary { list-style:none; cursor:pointer; padding:13px 14px; display:flex; align-items:center; justify-content:space-between; gap:10px; font-weight:900; color:#0f172a; background:#f8fafc; border-bottom:1px solid transparent; user-select:none; transition:background .15s ease, border-color .15s ease, box-shadow .15s ease; }
          .collapsibleBlock summary:hover { background:#eef7fa; box-shadow:inset 0 0 0 1px rgba(8,213,216,.18); }
          .collapsibleBlock[open] summary { border-bottom-color:#dbe7ec; background:#f1f8fb; }
          .collapsibleBlock summary::-webkit-details-marker { display:none; }
          .collapsibleBlock summary:after { content:'▼'; font-size:13px; color:#0f172a; transition:transform .15s ease; background:#ffffff; border:1px solid #cbd5e1; border-radius:999px; width:24px; height:24px; display:inline-flex; align-items:center; justify-content:center; flex:0 0 24px; }
          .collapsibleBlock:not([open]) summary:after { transform:rotate(-90deg); }
          .collapsibleBlockBody { padding:0 14px 14px; }
          @media screen and (max-width:700px) {
            .collapsibleHelp { font-size:13px !important; line-height:1.35 !important; padding:9px 11px !important; }
            .collapsibleBlock { border-radius:15px !important; margin:10px 0 !important; }
            .collapsibleBlock summary { min-height:46px; padding:11px 12px; font-size:15px; }
            .collapsibleBlockBody { padding:0 12px 12px; }
          }
        `;

export const APP_RUNTIME_STYLES = `

      .pdfSafeLink a { font-weight: 700; }
      .pdfSafeUrl { display:block; color:#334155; font-size:10px; line-height:1.25; overflow-wrap:anywhere; word-break:break-word; margin-top:2px; }
      .collapsibleHelp { font-weight:800; background:#f8fafc; border:1px solid #dbe7ec; border-radius:14px; padding:10px 12px; }
      .collapsibleBlock { border:1px solid #dbe7ec; border-radius:16px; background:#ffffff; margin:12px 0; overflow:hidden; }
      .collapsibleBlock summary { list-style:none; cursor:pointer; padding:13px 14px; display:flex; align-items:center; justify-content:space-between; gap:10px; font-weight:900; color:#0f172a; background:#f8fafc; border-bottom:1px solid transparent; user-select:none; transition:background .15s ease, border-color .15s ease, box-shadow .15s ease; }
      .collapsibleBlock summary:hover { background:#eef7fa; box-shadow:inset 0 0 0 1px rgba(8,213,216,.18); }
      .collapsibleBlock[open] summary { border-bottom-color:#dbe7ec; background:#f1f8fb; }
      .collapsibleBlock summary::-webkit-details-marker { display:none; }
      .collapsibleBlock summary:after { content:'▼'; font-size:13px; color:#0f172a; transition:transform .15s ease; background:#ffffff; border:1px solid #cbd5e1; border-radius:999px; width:24px; height:24px; display:inline-flex; align-items:center; justify-content:center; flex:0 0 24px; }
      .collapsibleBlock:not([open]) summary:after { transform:rotate(-90deg); }
      .collapsibleBlockBody { padding:0 14px 14px; }
      .mobileChatFab { display:none; }
      @media screen and (max-width:700px) {
        .collapsibleHelp { font-size:13px !important; line-height:1.35 !important; padding:9px 11px !important; }
        .collapsibleBlock { border-radius:15px !important; margin:10px 0 !important; }
        .collapsibleBlock summary { min-height:46px; padding:11px 12px; font-size:15px; }
        .collapsibleBlockBody { padding:0 12px 12px; }
        .mobileChatFab { display:inline-flex !important; position:fixed; right:14px; bottom:calc(18px + env(safe-area-inset-bottom)); z-index:90; align-items:center; justify-content:center; gap:7px; min-height:50px !important; padding:12px 16px !important; border-radius:999px !important; background:#082f3a !important; color:#fff !important; border:1px solid #082f3a !important; box-shadow:0 14px 34px rgba(15,23,42,.28); font-weight:900 !important; }
        .mobileChatFab.hasUnread { background:#b91c1c !important; border-color:#b91c1c !important; }
      }
      @media print {
        .pdfSafeLink a { color:#0645ad !important; text-decoration:underline !important; }
        .pdfSafeUrl { display:block !important; color:#334155 !important; font-size:9px !important; }
      }

      .mobileNav { display: none; }
      .mobileNavPanel { background:#ffffff; border:1px solid #dbe7ec; border-radius:18px; padding:12px; box-shadow:0 10px 24px rgba(15,23,42,0.08); }
      .mobileNavTop { display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:10px; }
      .mobileNavTitle { display:flex; flex-direction:column; gap:2px; min-width:0; }
      .mobileNavTitle b { font-size:14px; color:#0f172a; }
      .mobileNavTitle small { color:#64748b; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
      .mobileNavSelectWrap { position:relative; }
      .mobileNav select { width:100%; min-height:52px; border-radius:14px; font-size:17px; font-weight:800; padding:12px 44px 12px 14px; background:#f8fafc; border:1px solid #cbd5e1; color:#0f172a; appearance:auto; }
      .mobileNavQuick { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:10px; }
      .mobileNavQuick button { width:100%; min-height:44px; justify-content:center; }
      .mobileNavStatus { display:flex; gap:8px; flex-wrap:wrap; margin-top:10px; }
      .mobileNavPill { display:inline-flex; align-items:center; gap:6px; padding:6px 9px; border-radius:999px; background:#f8fafc; border:1px solid #dbe7ec; font-size:12px; font-weight:800; color:#334155; }
      .mobileSectionChips { display:none; }
      .projectListHeaderCards { margin-bottom:16px; }
      .projectListToolbar { display:flex; gap:12px; flex-wrap:wrap; margin:14px 0 16px; }
      .projectListCard { position:relative; overflow:hidden; }
      .projectListCardTop { display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap; align-items:flex-start; }
      .projectListBadges { display:flex; gap:8px; flex-wrap:wrap; justify-content:flex-end; }
      .projectListMetaCards { margin-top:12px; }
      .projectListActions { display:flex; gap:12px; flex-wrap:wrap; margin-top:12px; }
      .projectImageStrip { display:flex; gap:8px; overflow-x:auto; padding:8px 2px 4px; margin-top:10px; scrollbar-width:thin; }
      .projectImageThumb { flex:0 0 76px; width:76px; }
      .projectImageThumb img { width:76px; height:58px; object-fit:cover; border-radius:12px; border:1px solid #dbe7ec; background:#f8fafc; display:block; }
      .projectImageThumb small { display:block; margin-top:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-size:11px; }
      .projectImageCounts { display:flex; gap:8px; flex-wrap:wrap; margin-top:10px; }
      .projectMiniBadge { display:inline-flex; align-items:center; gap:5px; padding:5px 8px; border-radius:999px; border:1px solid #dbe7ec; background:#f8fafc; font-size:12px; font-weight:700; }
      .guideGrid { display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); gap:10px; margin-top:12px; }
      .guideCard { border:1px solid #dbe7ec; background:#f8fafc; border-radius:16px; padding:12px; }
      .guideCard b { display:block; font-size:18px; color:#0f172a; margin-bottom:3px; }
      .guideCard span { display:block; color:#64748b; font-size:13px; line-height:1.35; }
      .guideSteps { display:grid; gap:8px; margin-top:12px; }
      .guideStep { display:flex; align-items:center; justify-content:space-between; gap:10px; border:1px solid #dbe7ec; background:#ffffff; border-radius:14px; padding:10px; }
      .guideStepText { min-width:0; }
      .guideStepText b { display:block; font-size:14px; line-height:1.25; color:#0f172a; }
      .guideStepText small { display:block; color:#64748b; margin-top:2px; }
      .guideStep button { flex:0 0 auto; }

      @media screen and (max-width: 700px) {
        .guideGrid { grid-template-columns:1fr 1fr !important; gap:8px !important; }
        .guideCard { padding:10px !important; border-radius:14px !important; }
        .guideCard b { font-size:16px !important; }
        .guideCard span { font-size:12.5px !important; }
        .guideStep { display:grid !important; grid-template-columns:1fr !important; gap:8px !important; padding:10px !important; }
        .guideStep button { width:100% !important; justify-content:center !important; }
      }

      .imageLightboxOverlay { position:fixed; inset:0; z-index:9999; background:rgba(2, 6, 23, 0.86); display:flex; align-items:center; justify-content:center; padding:18px; }
      .imageLightboxInner { width:min(1100px, 100%); max-height:92vh; display:grid; gap:12px; }
      .imageLightboxTop { display:flex; justify-content:flex-end; }
      .imageLightboxClose { background:#ffffff; color:#0f172a; border:1px solid rgba(255,255,255,0.6); box-shadow:none; }
      .imageLightboxImage { width:100%; max-height:82vh; object-fit:contain; border-radius:16px; background:#ffffff; }
      .photo img, .projectImageThumb img { cursor: zoom-in; }
      @media screen and (max-width: 700px) {
        header nav { display: none !important; }
        .mobileNav { display: block !important; }
        .mobileNav { padding:0 12px 12px !important; }
        .mobileNavPanel { border-radius:16px; padding:10px; }
        .mobileNavTop { margin-bottom:8px; }
        .mobileNav select { min-height:54px; font-size:16px; }
        .projectListHeaderCards { display:grid !important; grid-template-columns:1fr 1fr; gap:8px; }
        .projectListHeaderCards .tile { min-height:auto; padding:10px !important; }
        .projectListHeaderCards .tile b { font-size:20px; }
        .projectListToolbar { position:sticky; top:0; z-index:5; background:#ffffff; border:1px solid #dbe7ec; border-radius:16px; padding:10px; box-shadow:0 8px 22px rgba(15,23,42,0.08); }
        .projectListToolbar button { flex:1 1 100%; width:100%; justify-content:center; }
        .projectListCard { padding:14px !important; border-radius:18px; }
        .projectListCardTop { display:block; }
        .projectListBadges { justify-content:flex-start; margin-top:10px; }
        .projectListMetaCards { display:grid !important; grid-template-columns:1fr; gap:8px; }
        .projectListMetaCards .tile { padding:10px !important; min-height:auto; }
        .projectListActions { display:grid !important; grid-template-columns:1fr; gap:8px; }
        .projectListActions button { width:100%; justify-content:center; }
        .projectImageThumb { flex-basis:84px; width:84px; }
        .projectImageThumb img { width:84px; height:64px; }
      }


      /* Mobile-first redesign v1 */
      .bottomAppNav { display:none; }
      @media screen and (max-width: 700px) {
        body { -webkit-text-size-adjust:100%; }
        header { position:sticky; top:0; z-index:20; background:rgba(255,255,255,0.96); backdrop-filter:blur(14px); border-bottom:1px solid #e2edf2; }
        header .head { padding:8px 12px !important; gap:8px !important; align-items:center !important; }
        header .head > div:first-child { width:122px !important; height:42px !important; flex:0 0 122px !important; }
        header .head h1 { font-size:18px !important; line-height:1.1 !important; margin:0 !important; }
        header .head p { font-size:12px !important; margin:2px 0 0 !important; max-width:170px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        header .head > button { display:none !important; }
        header .head > button:nth-of-type(2), header .head > button:nth-of-type(3) { display:inline-flex !important; min-height:34px !important; padding:7px 10px !important; font-size:12px !important; border-radius:12px !important; }
        main { padding:10px 10px calc(150px + env(safe-area-inset-bottom)) !important; }
        section { padding:14px !important; border-radius:18px !important; margin:10px auto !important; }
        section h2 { font-size:19px !important; margin-bottom:10px !important; gap:6px !important; }
        .mobileNav { padding:0 10px 8px !important; }
        .mobileNavPanel { box-shadow:none !important; border-radius:14px !important; padding:9px !important; }
        .mobileNavTop { display:flex !important; margin-bottom:6px !important; }
        .mobileNavTitle b { font-size:12px !important; letter-spacing:.02em; text-transform:uppercase; color:#64748b !important; }
        .mobileNavTitle small { font-size:13px !important; color:#0f172a !important; font-weight:800; }
        .mobileNavStatus, .mobileNavQuick { display:none !important; }
        .mobileNav select { min-height:44px !important; font-size:17px !important; border-radius:13px !important; padding:9px 12px !important; background:#f8fafc !important; }
        .mobileSectionChips { display:grid !important; grid-template-columns:repeat(4, minmax(0,1fr)); gap:6px; margin-top:8px; }
        .mobileSectionChips button { min-height:36px !important; padding:6px 5px !important; border-radius:12px !important; font-size:12px !important; font-weight:900 !important; }
        .bottomAppNav { position:fixed; left:12px; right:12px; bottom:calc(10px + env(safe-area-inset-bottom)); z-index:50; display:grid; grid-template-columns:repeat(5, 1fr); gap:5px; padding:7px; border:1px solid #dbe7ec; border-radius:20px; background:rgba(255,255,255,0.98); box-shadow:0 12px 34px rgba(15,23,42,0.16); backdrop-filter:blur(14px); }
        .bottomAppNav button { min-height:44px !important; padding:5px 3px !important; border-radius:14px !important; font-size:12px !important; font-weight:900 !important; display:flex !important; flex-direction:column !important; gap:1px !important; align-items:center !important; justify-content:center !important; line-height:1.05 !important; }
        .bottomAppNav button span:first-child { font-size:16px; line-height:1; }
        .bottomAppNav button.active { background:#082f3a !important; color:#fff !important; border-color:#082f3a !important; }
        .grid { grid-template-columns:1fr !important; gap:10px !important; }
        label span { font-size:12px !important; }
        input, textarea, select { min-height:42px !important; font-size:16px !important; border-radius:12px !important; }
        textarea { min-height:86px !important; }
        button, .upload { min-height:42px !important; border-radius:14px !important; padding:9px 12px !important; font-size:14px !important; }
        .cards { gap:8px !important; }
        .tile { padding:10px !important; border-radius:16px !important; min-height:auto !important; }
        .tile b { font-size:16px !important; }
        .tile span { font-size:12px !important; }
        .projectListHeaderCards { display:grid !important; grid-template-columns:repeat(4, minmax(0,1fr)) !important; gap:6px !important; overflow:visible !important; }
        .projectListHeaderCards .tile { padding:8px 6px !important; text-align:center !important; }
        .projectListHeaderCards .tile b { font-size:18px !important; }
        .projectListHeaderCards .tile span { font-size:10px !important; line-height:1.1 !important; }
        .projectListToolbar { position:static !important; display:grid !important; grid-template-columns:1fr 1fr 1fr !important; gap:6px !important; padding:0 !important; border:0 !important; box-shadow:none !important; background:transparent !important; margin:8px 0 10px !important; }
        .projectListToolbar button { width:100% !important; min-height:38px !important; padding:7px 6px !important; font-size:12px !important; border-radius:12px !important; }
        .projectListCard { padding:12px !important; border-radius:20px !important; margin:10px 0 !important; }
        .projectListCardTop { display:block !important; }
        .projectListCardTop b[style] { font-size:17px !important; line-height:1.15 !important; display:block; }
        .projectListCardTop p { font-size:14px !important; margin:4px 0 0 !important; }
        .projectListCardTop small { font-size:12px !important; }
        .projectListBadges { justify-content:flex-start !important; gap:6px !important; margin-top:8px !important; }
        .statusBadge, .projectMiniBadge { font-size:11px !important; padding:4px 7px !important; }
        .projectListMetaCards { display:grid !important; grid-template-columns:1fr 1fr !important; gap:6px !important; margin-top:8px !important; }
        .projectListMetaCards .tile { padding:8px !important; }
        .projectListMetaCards .tile:nth-child(3) { display:none !important; }
        .projectImageCounts { gap:5px !important; margin-top:8px !important; }
        .projectImageStrip { gap:6px !important; padding:6px 0 0 !important; margin-top:4px !important; }
        .projectImageThumb { flex:0 0 58px !important; width:58px !important; }
        .projectImageThumb img { width:58px !important; height:46px !important; border-radius:10px !important; }
        .projectImageThumb small { font-size:9px !important; }
        .projectImageThumb[style] { height:46px !important; min-width:58px !important; font-size:12px !important; }
        .projectListActions { display:grid !important; grid-template-columns:1fr 1fr 1fr !important; gap:6px !important; margin-top:10px !important; }
        .projectListActions button { width:100% !important; min-height:38px !important; padding:7px 6px !important; font-size:12px !important; border-radius:12px !important; }
        .note { font-size:13px !important; line-height:1.35 !important; }
        .photos { grid-template-columns:repeat(2, minmax(0,1fr)) !important; gap:8px !important; }
        .photo { border-radius:14px !important; padding:8px !important; }
        .photo img { border-radius:12px !important; }
        body:has(.bottomAppNav) > div { padding-bottom:0; }

        /* Mobile readability tuning v2 */
        section h2 { font-size:21px !important; line-height:1.22 !important; }
        h3 { font-size:18px !important; line-height:1.25 !important; }
        p, small, .out p, .item p { line-height:1.45 !important; }
        .note { font-size:14px !important; line-height:1.48 !important; }
        label span { font-size:13px !important; line-height:1.3 !important; }
        input, textarea, select { font-size:17px !important; line-height:1.35 !important; }
        button, .upload { font-size:15px !important; font-weight:800 !important; line-height:1.2 !important; }
        .bottomAppNav button { font-size:12px !important; }
        .bottomAppNav button span:first-child { font-size:20px !important; }
        .projectListCardTop b[style] { font-size:19px !important; line-height:1.24 !important; }
        .projectListCardTop p { font-size:15px !important; line-height:1.35 !important; }
        .projectListCardTop small { font-size:13px !important; line-height:1.35 !important; }
        .statusBadge, .projectMiniBadge { font-size:12.5px !important; line-height:1.15 !important; padding:6px 9px !important; }
        .projectListMetaCards .tile b { font-size:13px !important; line-height:1.2 !important; }
        .projectListMetaCards .tile span { font-size:12.5px !important; line-height:1.28 !important; }
        .projectListHeaderCards .tile b { font-size:20px !important; }
        .projectListHeaderCards .tile span { font-size:11.5px !important; line-height:1.18 !important; }
        .projectListToolbar button, .projectListActions button { font-size:13.5px !important; min-height:42px !important; }
        .tile b { font-size:17px !important; line-height:1.2 !important; }
        .tile span { font-size:13px !important; line-height:1.3 !important; }
        .check span { font-size:15px !important; }
        .checklistHeader b { font-size:15.5px !important; line-height:1.3 !important; }
        .checklistStatusButtons button { font-size:13px !important; }
        .photo b { font-size:14px !important; line-height:1.25 !important; }
        .photo small { font-size:12px !important; line-height:1.25 !important; }
        .projectImageThumb small { font-size:10.5px !important; line-height:1.15 !important; }
      }


      /* Mobile navigation cleanup v2: no fixed chrome on small screens */
      @media screen and (max-width: 700px) {
        header { position:static !important; top:auto !important; z-index:auto !important; backdrop-filter:none !important; border-bottom:0 !important; }
        main { padding:10px 10px 28px !important; }
        .bottomAppNav { display:none !important; }
        body:has(.bottomAppNav) > div { padding-bottom:0 !important; }
        .mobileNav { padding:0 10px 10px !important; }
        .mobileNavPanel { position:static !important; border-radius:16px !important; padding:10px !important; margin-bottom:8px !important; }
        .mobileNavTop { display:flex !important; align-items:flex-start !important; margin-bottom:8px !important; }
        .mobileNavTitle b { font-size:13px !important; letter-spacing:.04em !important; text-transform:uppercase !important; color:#64748b !important; }
        .mobileNavTitle small { font-size:18px !important; font-weight:900 !important; color:#0f172a !important; }
        .mobileNav select { min-height:46px !important; font-size:18px !important; font-weight:900 !important; }
        .mobileNavQuick { display:none !important; }
        .mobileNavStatus { display:grid !important; grid-template-columns:repeat(4, minmax(0, 1fr)) !important; gap:6px !important; margin-top:8px !important; }
        .mobileNavStatus .mobileNavPill { justify-content:center !important; min-height:38px !important; font-size:13px !important; padding:7px 6px !important; border-radius:14px !important; }
        .mobileNavStatus .mobileNavPill:nth-child(n+5) { display:none !important; }
        section { scroll-margin-top:12px !important; }
        .projectListToolbar { position:static !important; }
      }


      /* Mobile project chooser v5 - desktop-safe */
      .mobileProjectChooser,
      .mobileCurrentProjectBar { display:none !important; }
      .desktopOnlyWhenNoProject { display:block !important; }

      .desktopNoProjectWelcome { max-width:1180px; margin:28px auto; }
      .desktopNoProjectHero { background:linear-gradient(135deg,#12384a,#1f4e6a); border-radius:28px; padding:34px; color:#fff; }
      .desktopNoProjectHero h2 { color:#fff; font-size:34px; margin:10px 0 8px; }
      .desktopNoProjectHero .note { color:rgba(255,255,255,.82); font-size:16px; max-width:720px; }
      .desktopNoProjectHero .secondary { background:#fff; }
      @media screen and (min-width: 701px) {
        .mobileProjectChooser,
        .mobileCurrentProjectBar { display:none !important; }
        .desktopOnlyWhenNoProject { display:block !important; }
      }
      @media screen and (max-width: 700px) {
        .mobileProjectChooser { display:block !important; }
        .mobileCurrentProjectBar { display:block !important; }
        .desktopOnlyWhenNoProject { display:none !important; }
        .mobileProjectChooser { padding:16px !important; border-radius:22px !important; background:#fff !important; border:1px solid #dbe7ec !important; box-shadow:0 12px 30px rgba(15,23,42,0.08) !important; }
        .mobileProjectChooser h2 { font-size:24px !important; line-height:1.15 !important; margin-bottom:8px !important; }
        .mobileProjectChooserIntro { color:#64748b; font-size:15px; line-height:1.45; margin:0 0 14px; }
        .mobileProjectChooserActions { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin:12px 0; }
        .mobileProjectChooserActions button { width:100% !important; min-height:46px !important; justify-content:center !important; }
        .mobileProjectList { display:grid; gap:10px; margin-top:14px; }
        .mobileProjectPickCard { border:1px solid #dbe7ec; border-radius:18px; padding:12px; background:#f8fafc; }
        .mobileProjectPickCardTop { display:flex; justify-content:space-between; gap:8px; align-items:flex-start; }
        .mobileProjectPickCard b { font-size:17px; line-height:1.25; color:#0f172a; }
        .mobileProjectPickCard small { display:block; color:#64748b; font-size:13px; line-height:1.35; margin-top:3px; }
        .mobileProjectPickStatus { white-space:nowrap; font-size:12px; font-weight:900; border:1px solid #dbe7ec; border-radius:999px; padding:5px 8px; background:#fff; }
        .mobileProjectPickActions { display:grid !important; grid-template-columns:1fr 1fr !important; gap:6px; margin-top:10px; }
        .mobileProjectPickActions button { min-height:42px !important; padding:7px 6px !important; font-size:13px !important; border-radius:13px !important; width:100% !important; }
        .mobileCurrentProjectBar { margin:0 10px 10px !important; padding:12px !important; border:1px solid #dbe7ec !important; background:#ffffff !important; border-radius:18px !important; }
        .mobileCurrentProjectBar b { display:block; font-size:13px; text-transform:uppercase; color:#64748b; letter-spacing:.04em; margin-bottom:4px; }
        .mobileCurrentProjectBar span { display:block; font-size:17px; font-weight:900; color:#0f172a; line-height:1.25; }
        .mobileCurrentProjectActions { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:10px; }
        .mobileCurrentProjectActions button { min-height:44px !important; font-size:14px !important; }
      }



      /* FASE 10 Deploy 1.1: proff mobil åpningsside */
      @media screen and (max-width: 700px) {
        .mobileProjectChooser {
          background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%) !important;
          border: 1px solid #dbe7ec !important;
          box-shadow: 0 14px 36px rgba(15, 23, 42, 0.08) !important;
        }
        .mobileHomeHero {
          border-radius: 22px;
          padding: 18px;
          background: linear-gradient(135deg, #082f3a 0%, #0c4a6e 100%);
          color: #ffffff;
          box-shadow: 0 18px 42px rgba(8, 47, 58, 0.18);
        }
        .mobileHomeEyebrow {
          display: inline-flex;
          align-items: center;
          padding: 5px 9px;
          border-radius: 999px;
          background: rgba(255,255,255,0.14);
          border: 1px solid rgba(255,255,255,0.2);
          font-size: 12px;
          font-weight: 900;
          letter-spacing: .04em;
          text-transform: uppercase;
          margin-bottom: 10px;
        }
        .mobileHomeHero h2 {
          color: #ffffff !important;
          margin: 0 0 8px !important;
          font-size: 25px !important;
          line-height: 1.08 !important;
        }
        .mobileHomeHero p {
          color: rgba(255,255,255,0.86) !important;
          margin: 0 0 14px !important;
          font-size: 14px !important;
          line-height: 1.45 !important;
        }
        .mobileHomeActions {
          display: grid;
          grid-template-columns: 1.4fr .8fr;
          gap: 8px;
        }
        .mobileHomeActions button {
          width: 100% !important;
          min-height: 46px !important;
        }
        .mobileHomeStats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 7px;
          margin-top: 12px;
        }
        .mobileHomeStatCard {
          background: #ffffff !important;
          color: #0f172a !important;
          border: 1px solid #dbe7ec !important;
          border-radius: 16px !important;
          box-shadow: none !important;
          padding: 9px 5px !important;
          min-height: 64px !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 2px !important;
        }
        .mobileHomeStatCard b {
          font-size: 19px !important;
          line-height: 1 !important;
          color: #082f3a !important;
        }
        .mobileHomeStatCard span {
          font-size: 10.5px !important;
          line-height: 1.1 !important;
          color: #64748b !important;
          font-weight: 900 !important;
        }
        .mobileHomeSearchCard {
          margin-top: 12px;
          border: 1px solid #dbe7ec;
          background: #ffffff;
          border-radius: 18px;
          padding: 12px;
        }
        .mobileHomeSearchCard label {
          margin-bottom: 0 !important;
        }
        .mobileHomeFilterRow {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 7px;
          margin-top: 10px;
        }
        .mobileHomeFilterRow button {
          min-height: 38px !important;
          padding: 7px 5px !important;
          font-size: 13px !important;
        }
        .mobileProjectPickMeta {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-top: 10px;
        }
        .mobileProjectPickMeta span {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          padding: 5px 7px;
          border-radius: 999px;
          border: 1px solid #dbe7ec;
          background: #ffffff;
          color: #334155;
          font-size: 11px;
          font-weight: 900;
        }
        .mobileProjectPickMeta .mobileProjectPickAlert {
          border-color: #fecaca;
          background: #fef2f2;
          color: #991b1b;
        }
        .mobileProjectPickActions {
          grid-template-columns: 1.2fr 1fr 1fr 1fr !important;
        }
        .mobileProjectPickActions button {
          font-size: 12.5px !important;
          min-height: 40px !important;
        }
      }


      /* Mobile UX fase 4: feltapp-sjekklister */
      .checklistSummaryCard {
        border:1px solid #dbe7ec;
        background:#f8fafc;
        border-radius:18px;
        padding:14px;
        margin:12px 0 16px;
      }
      .checklistSummaryCard b { font-size:18px; color:#0f172a; }
      .checklistSummaryCard p { margin:4px 0 10px; color:#64748b; }
      .checklistProgress { height:10px; border-radius:999px; background:#e2e8f0; overflow:hidden; margin:10px 0; }
      .checklistProgress span { display:block; height:100%; border-radius:999px; background:#082f3a; transition:width .2s ease; }
      .checklistSummaryBadges { display:flex; gap:8px; flex-wrap:wrap; margin-top:10px; }
      .checklistSummaryBadges span { display:inline-flex; align-items:center; gap:4px; padding:6px 9px; border-radius:999px; border:1px solid #dbe7ec; background:#fff; font-size:13px; font-weight:800; color:#334155; }
      .checklistSummaryActions { display:flex; gap:8px; flex-wrap:wrap; margin-top:12px; }
      .checklistAccordion { display:grid; gap:12px; }
      .checklistGroup { padding:0 !important; overflow:hidden; border-radius:18px !important; }
      .checklistGroupHeader { width:100%; border:0 !important; background:#ffffff !important; color:#0f172a !important; box-shadow:none !important; display:grid !important; grid-template-columns:auto minmax(0,1fr) auto !important; align-items:center !important; gap:10px !important; padding:14px !important; text-align:left !important; min-height:64px !important; cursor:pointer; }
      .checklistGroupCaret { display:inline-flex; align-items:center; justify-content:center; width:30px; height:30px; border-radius:999px; background:#f8fafc; border:1px solid #dbe7ec; font-size:18px; font-weight:900; }
      .checklistGroupTitle { display:flex; flex-direction:column; gap:3px; min-width:0; }
      .checklistGroupTitle b { font-size:18px; line-height:1.2; }
      .checklistGroupTitle small { color:#64748b; font-weight:700; }
      .checklistGroupBadge { white-space:nowrap; border:1px solid #dbe7ec; border-radius:999px; padding:6px 9px; font-size:12px; font-weight:900; background:#f8fafc; }
      .checklistGroupBadge-done { background:#ecfdf5; color:#065f46; border-color:#bbf7d0; }
      .checklistGroupBadge-avvik { background:#fef2f2; color:#991b1b; border-color:#fecaca; }
      .checklistGroupBadge-progress { background:#fffbeb; color:#92400e; border-color:#fde68a; }
      .checklistGroupBadge-missing { background:#f8fafc; color:#475569; }
      .checklistGroupBody { padding:0 14px 14px; display:grid; gap:10px; }
      .checklistPoint { border:1px solid #dbe7ec; background:#fff; border-radius:16px; padding:12px; }
      .checklistPoint-avvik { border-color:#fecaca; background:#fff7f7; }
      .checklistPoint-done { border-color:#bbf7d0; }
      .checklistPointTitle { display:flex; flex-direction:column; gap:3px; min-width:0; }
      .checklistPointTitle small { color:#64748b; font-weight:700; }
      .checklistWarrantyPoint { border-color:#bfdbfe; background:#eff6ff; }
      .checklistWarrantyPoint.checklistPoint-done { border-color:#93c5fd; background:#eff6ff; }
      .warrantyPointBadge { display:inline-flex; align-items:center; width:max-content; gap:5px; padding:4px 8px; border-radius:999px; border:1px solid #bfdbfe; background:#dbeafe; color:#1e3a8a; font-size:11px; font-weight:900; letter-spacing:.02em; text-transform:uppercase; }
      .warrantyProgressCard { border-color:#bfdbfe !important; background:#eff6ff !important; }
      .warrantyProgress span { background:#1d4ed8 !important; }
      .warrantyMissingList { margin-top:12px; }
      .warrantyMissingButtons { display:grid; gap:8px; margin-top:8px; }
      .warrantyJumpButton { justify-content:flex-start !important; text-align:left !important; white-space:normal !important; }
      .checklistPointFocus { outline:4px solid #facc15; box-shadow:0 0 0 6px rgba(250,204,21,0.25); transition:outline .2s ease, box-shadow .2s ease; }

      @media screen and (max-width:700px) {
        .checklistSummaryCard { padding:12px !important; border-radius:16px !important; margin:10px 0 12px !important; }
        .checklistSummaryCard b { font-size:17px !important; }
        .checklistSummaryBadges { display:grid !important; grid-template-columns:1fr 1fr !important; gap:6px !important; }
        .checklistSummaryBadges span { justify-content:center !important; font-size:12.5px !important; padding:7px 6px !important; }
        .checklistSummaryActions { display:grid !important; grid-template-columns:1fr 1fr !important; gap:6px !important; }
        .checklistSummaryActions button { width:100% !important; font-size:13px !important; }
        .checklistGroupHeader { grid-template-columns:auto 1fr !important; padding:12px !important; min-height:64px !important; gap:8px !important; align-items:start !important; }
        .checklistGroupCaret { width:34px !important; height:34px !important; font-size:20px !important; margin-top:1px !important; }
        .checklistGroupBadge { grid-column:2 !important; justify-self:start !important; margin-top:4px !important; max-width:100% !important; white-space:normal !important; }
        .checklistGroupTitle b { font-size:16.5px !important; }
        .checklistGroupTitle small { font-size:12.5px !important; }
        .checklistGroupBadge { font-size:11.5px !important; padding:5px 7px !important; }
        .checklistGroupBody { padding:0 10px 10px !important; gap:8px !important; }
        .checklistPoint { padding:10px !important; border-radius:15px !important; }
        .warrantyPointBadge { font-size:10.5px !important; padding:4px 7px !important; }
        .warrantyMissingButtons { gap:6px !important; }
        .warrantyJumpButton { width:100% !important; }

        .checklistHeader { display:grid !important; gap:8px !important; }
        .checklistStatusButtons { display:grid !important; grid-template-columns:1fr 1fr 1fr !important; gap:6px !important; }
        .checklistStatusButtons button { width:100% !important; min-height:40px !important; padding:7px 4px !important; font-size:12.5px !important; }
        .checklistUpload { width:100% !important; justify-content:center !important; margin-top:8px !important; }
      }



      .deviationCloseBox, .deviationClosedBox { border:1px solid #dbe7ec; border-radius:14px; padding:12px; margin:10px 0; background:#f8fafc; }
      .deviationCloseBox { border-color:#fecaca; background:#fff7f7; }
      .deviationClosedBox { border-color:#bbf7d0; background:#ecfdf5; }
      .deviationClosedBox b { color:#065f46; }

      /* iPhone Safari safe-area: avoid bottom browser toolbar */
      @media screen and (max-width:700px) {
        .bottomPrevNext {
          padding-bottom:calc(110px + env(safe-area-inset-bottom)) !important;
          margin-bottom:0 !important;
        }
        main {
          padding-bottom:calc(120px + env(safe-area-inset-bottom)) !important;
        }
      }

      /* Mobile UX fase 3: sticky feltapp-meny */
      .mobileFieldBar { display:none; }
      @media screen and (max-width: 700px) {
        .mobileNav { display:none !important; }
        .mobileCurrentProjectBar { display:none !important; }
        .mobileFieldBar {
          display:block !important;
          position:sticky;
          top:0;
          z-index:60;
          padding:8px 10px 9px;
          background:rgba(248,250,252,0.96);
          backdrop-filter:blur(14px);
          border-bottom:1px solid #dbe7ec;
          box-shadow:0 8px 22px rgba(15,23,42,0.08);
        }
        .mobileFieldBarInner {
          max-width:1180px;
          margin:0 auto;
          display:grid;
          grid-template-columns:1fr;
          gap:8px;
          align-items:center;
        }
        .mobileFieldBarToggle {
          width:100%;
          min-height:44px !important;
          display:flex !important;
          align-items:center !important;
          justify-content:space-between !important;
          gap:10px !important;
          padding:8px 12px !important;
          border-radius:14px !important;
          background:#082f3a !important;
          border:1px solid #082f3a !important;
          color:#fff !important;
          font-size:16px !important;
          font-weight:900 !important;
        }
        .mobileFieldBarMenu {
          display:grid;
          grid-template-columns:1fr;
          gap:8px;
        }
        .mobileMenuQuickGrid {
          display:grid;
          grid-template-columns:repeat(2, minmax(0, 1fr));
          gap:8px;
        }
        .mobileMenuQuickButton {
          width:100%;
          min-height:52px !important;
          margin:0 !important;
          padding:9px 8px !important;
          display:flex !important;
          align-items:center !important;
          justify-content:center !important;
          gap:7px !important;
          border-radius:13px !important;
          font-size:14px !important;
          line-height:1.15 !important;
          box-shadow:none !important;
        }
        .mobileMenuQuickButton > span:first-child {
          font-size:17px;
          flex:0 0 auto;
        }
        .mobileAllFunctions {
          border:1px solid #cbd5e1;
          border-radius:14px;
          background:#fff;
          overflow:hidden;
        }
        .mobileAllFunctions > summary {
          min-height:44px;
          padding:10px 12px;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:10px;
          cursor:pointer;
          list-style:none;
          font-size:15px;
          font-weight:900;
          color:#0f172a;
          user-select:none;
        }
        .mobileAllFunctions > summary::-webkit-details-marker { display:none; }
        .mobileAllFunctionsCaret {
          transition:transform .16s ease;
          font-size:13px;
        }
        .mobileAllFunctions[open] .mobileAllFunctionsCaret { transform:rotate(180deg); }
        .mobileAllFunctionsGrid {
          display:grid;
          grid-template-columns:repeat(2, minmax(0, 1fr));
          gap:8px;
          padding:0 8px 8px;
          border-top:1px solid #e2e8f0;
        }
        .mobileMenuAllButton {
          width:100%;
          min-height:44px !important;
          margin:8px 0 0 !important;
          padding:8px 7px !important;
          border-radius:12px !important;
          font-size:13px !important;
          line-height:1.15 !important;
          box-shadow:none !important;
          white-space:normal !important;
        }
        .mobileProjectLine {
          grid-column:1 / -1;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:8px;
          min-width:0;
        }
        .mobileProjectLineText { min-width:0; }
        .mobileProjectLineText b {
          display:block;
          font-size:11px;
          letter-spacing:.05em;
          text-transform:uppercase;
          color:#64748b;
          line-height:1.1;
        }
        .mobileProjectLineText span {
          display:block;
          font-size:15px;
          font-weight:900;
          color:#0f172a;
          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
          max-width:70vw;
          line-height:1.25;
        }
        .mobileFieldBar select {
          width:100%;
          min-height:44px !important;
          border-radius:14px !important;
          font-size:16px !important;
          font-weight:900 !important;
          background:#fff !important;
          border:1px solid #cbd5e1 !important;
          padding:8px 12px !important;
        }
        section { scroll-margin-top:106px !important; }
        main { padding-top:10px !important; }
      }


      /* FASE 6 v2: mobile top actions - make all critical header buttons available in portrait */
      @media screen and (max-width: 700px) {
        header .head {
          display:grid !important;
          grid-template-columns:92px minmax(0, 1fr) !important;
          gap:8px !important;
          align-items:center !important;
          padding:8px 10px 10px !important;
        }
        header .head > div:first-child {
          grid-column:1 !important;
          width:92px !important;
          height:38px !important;
          flex:0 0 92px !important;
          min-width:0 !important;
        }
        header .head > div:nth-child(2) {
          grid-column:2 !important;
          min-width:0 !important;
        }
        header .head h1 {
          font-size:17px !important;
          line-height:1.1 !important;
          margin:0 !important;
          white-space:nowrap !important;
          overflow:hidden !important;
          text-overflow:ellipsis !important;
        }
        header .head p {
          max-width:100% !important;
          font-size:12px !important;
          margin:2px 0 0 !important;
          white-space:nowrap !important;
          overflow:hidden !important;
          text-overflow:ellipsis !important;
        }
        header .head > button,
        header .head > button:nth-of-type(1),
        header .head > button:nth-of-type(2),
        header .head > button:nth-of-type(3),
        header .head > button:nth-of-type(4),
        header .head > button:nth-of-type(5),
        header .head > button:nth-of-type(6),
        header .head > button:nth-of-type(7) {
          display:inline-flex !important;
          width:100% !important;
          min-height:38px !important;
          padding:7px 8px !important;
          border-radius:12px !important;
          font-size:12.5px !important;
          line-height:1.1 !important;
          justify-content:center !important;
          align-items:center !important;
          gap:5px !important;
          white-space:normal !important;
        }
        header .head > button svg {
          width:15px !important;
          height:15px !important;
          flex:0 0 auto !important;
        }
      }


      /* FASE 6.11 compact + chat-fokus: kun visuell komprimering */
      .customerChatFocusNote {
        margin: 8px 0 10px !important;
        padding: 9px 11px;
        border: 1px solid #dbe7ec;
        border-radius: 14px;
        background: #f8fafc;
        font-weight: 800;
      }
      .customerPortalActions button:first-child {
        font-weight: 900;
      }
      @media screen and (max-width:700px) {
        main { padding-top: 8px !important; }
        section { padding: 11px !important; margin: 8px auto !important; border-radius: 16px !important; }
        section h2 { font-size: 19px !important; margin-bottom: 8px !important; }
        h3 { font-size: 16px !important; margin: 8px 0 6px !important; }
        .note { font-size: 13px !important; line-height: 1.38 !important; margin: 6px 0 !important; }
        .grid { gap: 8px !important; }
        .item, .out { padding: 9px !important; margin: 7px 0 !important; border-radius: 14px !important; }
        .tile { padding: 8px !important; border-radius: 14px !important; }
        .cards { gap: 7px !important; }
        input, textarea, select { min-height: 40px !important; }
        textarea { min-height: 74px !important; }
        button, .upload { min-height: 39px !important; padding: 8px 10px !important; }
        .collapsibleBlock { margin: 7px 0 !important; }
        .collapsibleBlock summary { min-height: 42px !important; padding: 9px 11px !important; }
        .collapsibleBlockBody { padding: 0 10px 10px !important; }
        .projectListCard { padding: 10px !important; margin: 8px 0 !important; }
        .projectListActions { margin-top: 8px !important; }
        .projectListMetaCards { margin-top: 7px !important; }
        .customerPortalActions { display:grid !important; grid-template-columns:1fr 1fr !important; gap:7px !important; }
        .customerPortalActions button { width:100% !important; }
        .customerPortalActions button:first-child { grid-column:1 / -1; min-height:44px !important; }
        .customerChatFocusNote { font-size:13px !important; line-height:1.35 !important; }
      }

    

      /* FASE 7 Deploy 3B: mobiljustering av sjekklister */
      @media screen and (max-width: 700px) {
        html, body, #root {
          max-width: 100% !important;
          overflow-x: hidden !important;
        }

        main,
        section,
        .checklistList,
        .checklistAccordion,
        .checklistGroup,
        .checklistGroupBody,
        .checklistPoint,
        .checklistHeader,
        .checklistPointTitle,
        .checklistSummaryCard {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          box-sizing: border-box !important;
          overflow-x: hidden !important;
        }

        .checklistAccordion {
          display: block !important;
          padding: 0 !important;
          margin-left: 0 !important;
          margin-right: 0 !important;
        }

        .checklistGroup {
          margin-left: 0 !important;
          margin-right: 0 !important;
          padding: 0 !important;
          border-radius: 16px !important;
        }

        .checklistGroupHeader {
          width: 100% !important;
          max-width: 100% !important;
          display: grid !important;
          grid-template-columns: auto minmax(0, 1fr) !important;
          gap: 8px !important;
          align-items: start !important;
          text-align: left !important;
          white-space: normal !important;
          overflow: hidden !important;
        }

        .checklistGroupBadge {
          grid-column: 2 !important;
          justify-self: start !important;
          max-width: 100% !important;
          white-space: normal !important;
        }

        .checklistGroupTitle,
        .checklistGroupTitle b,
        .checklistGroupTitle small,
        .checklistPointTitle,
        .checklistPointTitle b,
        .checklistPointTitle small,
        .warrantyPointBadge {
          max-width: 100% !important;
          overflow-wrap: anywhere !important;
          word-break: break-word !important;
          white-space: normal !important;
        }

        .checklistGroupBody {
          padding: 8px !important;
        }

        .checklistPoint {
          padding: 12px !important;
          margin: 10px 0 !important;
          border-radius: 16px !important;
        }

        .checklistHeader {
          display: block !important;
        }

        .checklistStatusButtons {
          width: 100% !important;
          max-width: 100% !important;
          display: grid !important;
          grid-template-columns: 1fr 1fr !important;
          gap: 8px !important;
          margin-top: 10px !important;
          overflow: hidden !important;
        }

        .checklistStatusButtons button {
          width: 100% !important;
          min-width: 0 !important;
          max-width: 100% !important;
          white-space: normal !important;
          overflow-wrap: anywhere !important;
        }

        .checklistStatusButtons button:nth-child(3) {
          grid-column: 1 / -1 !important;
        }

        .checklistUpload {
          width: 100% !important;
          max-width: 100% !important;
          display: flex !important;
          justify-content: center !important;
          text-align: center !important;
          overflow: hidden !important;
        }

        .checklistPhotos,
        .checklistPhotos .photo,
        .checklistPhotos img,
        .checklistPhotos small {
          max-width: 100% !important;
          min-width: 0 !important;
          box-sizing: border-box !important;
          overflow-wrap: anywhere !important;
          word-break: break-word !important;
        }

        .checklistPhotos {
          display: grid !important;
          grid-template-columns: 1fr !important;
          gap: 8px !important;
          overflow-x: hidden !important;
        }

        .checklistPhotos .photo img {
          width: 100% !important;
          height: auto !important;
          object-fit: contain !important;
        }

        .deviationCloseBox,
        .deviationClosedBox {
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
          overflow-x: hidden !important;
        }
      }


      /* FASE 15.1.4A: CSS-only mobilfix for garanti/malprosjekt-tekstflyt. */
      @media screen and (max-width:700px) {
        .warrantyProjectSetup,
        .warrantyProjectSetup *,
        label.check:has(input[type="checkbox"]) {
          max-width:100% !important;
          box-sizing:border-box !important;
        }

        .warrantyProjectSetup {
          width:100% !important;
          min-width:0 !important;
          overflow:hidden !important;
        }

        .warrantyProjectSetup p,
        .warrantyProjectSetup .note,
        .warrantyProjectSetup span,
        .warrantyProjectSetup small,
        .warrantyProjectSetup b,
        label.check:has(input[type="checkbox"]) span,
        label.check:has(input[type="checkbox"]) small,
        label.check:has(input[type="checkbox"]) b {
          min-width:0 !important;
          white-space:normal !important;
          overflow-wrap:anywhere !important;
          word-break:break-word !important;
        }

        .warrantyProjectSetup select {
          width:100% !important;
          min-width:0 !important;
          max-width:100% !important;
          white-space:normal !important;
          text-overflow:ellipsis !important;
        }

        label.check:has(input[type="checkbox"]) {
          display:grid !important;
          grid-template-columns:34px minmax(0,1fr) !important;
          gap:10px !important;
          align-items:start !important;
          width:100% !important;
          min-width:0 !important;
          overflow:hidden !important;
        }

        label.check:has(input[type="checkbox"]) input[type="checkbox"] {
          width:24px !important;
          height:24px !important;
          min-width:24px !important;
          max-width:24px !important;
          min-height:24px !important;
          margin-top:3px !important;
          flex:0 0 24px !important;
        }
      }

`;
