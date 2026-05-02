import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import { Camera, FileText, Plus, Trash2, Download, Building2, ClipboardCheck, BadgeCheck } from 'lucide-react';
import './style.css';

const supabase = createClient(
  'https://dqffxflaoyarbxyiyhop.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxZmZ4Zmxhb3lhcmJ4eWl5aG9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NzcxNTEsImV4cCI6MjA5MzA1MzE1MX0.5fkVNPooHGlayw4NgYM3fUVrAiv0XbUyTixkfeToMSE'
);

const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

const productSections = [
  { title: 'Avretting / støpeprodukter', items: ['Sopro VS582 Avretting','Sopro 3.50 Avretting','Sopro HF-S 563 Avretting','Sopro FS 5® Avretting','Sopro RDS 960 - Ekspansjonsbånd','Sopro Classic EM Hurtigstøp','Sopro RAM 3® reparasjon og støpemørtel','Sopro RS 462 reparasjonsmørtel','Sopro Rapidur M5® hurtigstøp'] },
  { title: 'Primer / forsterkningsduk', items: ['Sopro PG-X 1188','Sopro EPG 1522 - 2 Komponent Epoxy primer','Sopro HPS 673 - spesial primer ikke sugende','Sopro GD 749 - primer sugende underlag','Sopro SG 874 Dampsperre-Primer'] },
  { title: 'Membransystem / tetting', items: ['Sopro FDK 1-K 1180 membranlim','Sopro FDF 527 smøremembran lys grå','Sopro DSF 623 RS - 1K sementbasert membran','AEB 815 Tetteduk','Sopro BBM 134 Slukmansjett','Sopro FDB 524 selvklebende tettebånd','Sopro AEB 816 Tettebånd','Sopro AEB 821 Hjørnemansjett innerhjørne','Sopro AEB 822 Hjørnemansjett ytterhjørne','Sopro AEB 825 Rørmansjett Ø10-24mm'] },
  { title: 'Limprodukter / festeprodukter', items: ['Sopro’s No.1 400 Flislim','Sopro’s No.1 403 Silver Hurtig flislim','Sopro FKM XL 444 Støvredusert flislim','Sopro FKM 5555 Hurtig flislim','Sopro FF 450 - Sigefri flislim','Soudal Fix All HT','Soudal Fix All Turbo'] },
  { title: 'Fugemasse / silikon', items: ['Sopro DFH Bruksklar fugemasse','Sopro DFX epoxyfug','Sopro DF 10® Designfug','Sopro FL plus Fugemasse','Sopro Sanitær Silikon','Sopro Ceramic Silikon'] }
];

const surfaces = ['Veggflis 1','Veggflis 2','Veggflis 3','Gulvflis 1','Gulvflis 2','Gulvflis 3','Mosaikkfliser vegg','Mosaikkfliser gulv','Dekorfliser'];
const imageCats = ['Før arbeid','Underlag','Avretting/støp','Primer','Membran','Sluk og mansjetter','Rørgjennomføringer','Flislegging','Fuging/silikon','Ferdig resultat'];
const roles = ['Eier / administrator','Ansatt','Underleverandør','Kun lesetilgang'];
const installCats = ['Rørlegger','Tømrer/Snekker','Maler','Andre'];

const checklistTemplate = [
  { category: 'Forarbeid', items: ['Underlag kontrollert', 'Fall kontrollert', 'Sluk korrekt montert', 'Terskel og høyder kontrollert'] },
  { category: 'Primer / underlag', items: ['Riktig primer valgt', 'Primer påført', 'Tørketid fulgt'] },
  { category: 'Membran / tetting', items: ['Membranløsning kontrollert', 'Tettebånd montert', 'Slukmansjett montert', 'Rørmansjetter montert'] },
  { category: 'Flislegging / fuging', items: ['Fliser montert iht. plan', 'Fuging utført', 'Silikon utført'] },
  { category: 'Sluttkontroll', items: ['Visuell kontroll utført', 'Bilder tatt', 'Dokumentasjon komplett'] }
];

const emptyProject = () => ({
  responsible:'', projectName:'', address:'', customer:'', date:new Date().toISOString().slice(0,10), notes:'',
  fall:'', sluk:'', terskel:'', membran:'', prosjekteringKommentar:''
});

function App() {
  const [tab, setTab] = useState('prosjekt');
  const [company, setCompany] = useState({ companyName:'Expo Proffsenter', address:'', orgNumber:'', phone:'', email:'', website:'', logoUrl:'' });
  const [user, setUser] = useState({ name:'', email:'', role:'Eier / administrator' });
  const [project, setProject] = useState(emptyProject());
  const [checked, setChecked] = useState({});
  const [other, setOther] = useState({});
  const [surf, setSurf] = useState({});
  const [photos, setPhotos] = useState([]);
  const [access, setAccess] = useState([]);
  const [inst, setInst] = useState([]);
  const [files, setFiles] = useState([]);
  const [checklist, setChecklist] = useState({});
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const selected = useMemo(() => productSections.flatMap(s => s.items.filter(i => checked[i]).map(i => ({ section:s.title, item:i }))), [checked]);
  const name = company.companyName || 'Expo Proffsenter';

  const isReadOnly = new URLSearchParams(window.location.search).has('project');

  const tabs = [
    ['prosjekt','Prosjekt'], ['firma','Firmaprofil'], ['innlogging','Innlogging'], ['prosjektering','Prosjektering'],
    ['produkter','Produkter'], ['overflater','Overflater'], ['bilder','Bilder'], ['tilgang','Tilgang'],
    ['installasjoner','Fag/utstyr'], ['sjekklister','Sjekklister'], ['prosjektliste','Prosjektliste'], ['rapport','Rapport']
  ];

  const packData = () => ({ company, user, project, checked, other, surf, photos, access, inst, files, checklist });
  const unpackData = (data) => {
    setCompany(data.company || { companyName:'Expo Proffsenter', address:'', orgNumber:'', phone:'', email:'', website:'', logoUrl:'' });
    setUser(data.user || { name:'', email:'', role:'Eier / administrator' });
    setProject(data.project || emptyProject());
    setChecked(data.checked || {});
    setOther(data.other || {});
    setSurf(data.surf || {});
    setPhotos(data.photos || []);
    setAccess(data.access || []);
    setInst(data.inst || []);
    setFiles(data.files || []);
    setChecklist(data.checklist || {});
  };

  const loadProjects = async (currentUser = authUser) => {
    if (!currentUser) {
      setProjects([]);
      return;
    }
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('updated_at', { ascending:false });
    if (error) { console.error(error); return alert('Kunne ikke hente prosjektliste: ' + error.message); }
    setProjects(data || []);
  };

  const openProjectById = async (id) => {
    const { data, error } = await supabase.from('projects').select('*').eq('id', id).single();
    if (error || !data) { console.error(error); return alert('Kunne ikke åpne prosjekt: ' + (error?.message || 'Fant ikke prosjekt')); }
    unpackData(data.data || {});
    setProjectId(data.id);
    setTab('rapport');
  };

  const applyProfile = (row) => {
    if (!row) return;
    setProfile(row);
    setCompany(c => ({
      ...c,
      companyName: row.company_name || c.companyName || 'Expo Proffsenter',
      orgNumber: row.org_number || '',
      address: row.address || '',
      phone: row.phone || '',
      email: row.email || '',
      website: row.website || '',
      logoUrl: row.logo_url || c.logoUrl || '',
    }));
  };

  const ensureProfile = async (sessionUser) => {
    if (!sessionUser) return null;
    setProfileLoading(true);

    let { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', sessionUser.id)
      .maybeSingle();

    if (error) {
      console.error(error);
      alert('Kunne ikke hente brukerprofil: ' + error.message);
      setProfileLoading(false);
      return null;
    }

    if (!data) {
      const { data: inserted, error: insertError } = await supabase
        .from('profiles')
        .insert({ id: sessionUser.id, email: sessionUser.email, approved: false })
        .select('*')
        .single();

      if (insertError) {
        console.error(insertError);
        alert('Kunne ikke opprette brukerprofil: ' + insertError.message);
        setProfileLoading(false);
        return null;
      }
      data = inserted;
    }

    applyProfile(data);
    setProfileLoading(false);
    return data;
  };

  const handleAuthUser = async (sessionUser) => {
    setAuthUser(sessionUser);
    if (!sessionUser) {
      setProjects([]);
      setProfile(null);
      setProfileLoading(false);
      return;
    }
    const row = await ensureProfile(sessionUser);
    if (row?.approved) loadProjects(sessionUser);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('project');
    if (id) {
      openProjectById(id);
      setAuthLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      handleAuthUser(data.session?.user || null).finally(() => setAuthLoading(false));
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      handleAuthUser(session?.user || null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const saveProject = async () => {
    if (!authUser) return alert('Du må være logget inn for å lagre prosjekt.');
    const payload = { title: project.projectName || project.address || 'Uten navn', data: packData(), user_id: authUser.id, share_enabled: true, updated_at: new Date().toISOString() };
    if (projectId) {
      const { error } = await supabase.from('projects').update(payload).eq('id', projectId).eq('user_id', authUser.id);
      if (error) { console.error(error); return alert('Kunne ikke oppdatere prosjekt i sky: ' + error.message); }
      alert('Prosjektet er oppdatert i sky');
    } else {
      const { data, error } = await supabase.from('projects').insert(payload).select().single();
      if (error) { console.error(error); return alert('Kunne ikke lagre i sky: ' + error.message); }
      setProjectId(data.id);
      alert('Prosjekt lagret i sky');
    }
    loadProjects(authUser);
  };

  const saveAsNewProject = async () => {
    if (!authUser) return alert('Du må være logget inn for å lagre prosjekt.');
    const payload = { title: project.projectName || project.address || 'Uten navn', data: packData(), user_id: authUser.id, share_enabled: true, updated_at: new Date().toISOString() };
    const { data, error } = await supabase.from('projects').insert(payload).select().single();
    if (error) { console.error(error); return alert('Kunne ikke lagre som nytt prosjekt: ' + error.message); }
    setProjectId(data.id);
    alert('Lagret som nytt prosjekt');
    loadProjects(authUser);
  };

  const deleteProject = async (id) => {
    if (!window.confirm('Er du sikker på at du vil slette prosjektet?')) return;
    if (!authUser) return alert('Du må være logget inn for å slette prosjekt.');
    const { error } = await supabase.from('projects').delete().eq('id', id).eq('user_id', authUser.id);
    if (error) { console.error(error); return alert('Kunne ikke slette prosjekt: ' + error.message); }
    if (id === projectId) setProjectId(null);
    loadProjects(authUser);
  };

  const shareProject = async () => {
    if (!projectId) {
      await saveProject();
      alert('Prosjektet er lagret. Trykk Kopier delingslink en gang til.');
      return;
    }
    const link = `${window.location.origin}${window.location.pathname}?project=${projectId}`;
    try {
      await navigator.clipboard.writeText(link);
      alert('Delingslink er kopiert til utklippstavlen. Du kan nå lime den inn i for eksempel en e-post med Ctrl+V.');
    } catch {
      prompt('Kopier denne linken:', link);
    }
  };


  const uploadLogo = async (file) => {
    if (!authUser || !file) return;
    const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
    const path = `logos/${authUser.id}/${Date.now()}-${cleanName}`;
    const { error } = await supabase.storage
      .from('project-images')
      .upload(path, file, { cacheControl: '3600', upsert: true });
    if (error) return alert('Kunne ikke laste opp logo: ' + error.message);
    const { data } = supabase.storage.from('project-images').getPublicUrl(path);
    setCompany(c => ({ ...c, logoUrl: data.publicUrl }));
    alert('Logo lastet opp. Husk å trykke Lagre firmaprofil.');
  };

  const saveProfile = async () => {
    if (!authUser) return alert('Du må være logget inn.');

    const payload = {
      id: authUser.id,
      email: company.email || authUser.email,
      company_name: company.companyName || '',
      org_number: company.orgNumber || '',
      address: company.address || '',
      phone: company.phone || '',
      website: company.website || '',
      logo_url: company.logoUrl || '',
    };

    const { error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', authUser.id);

    if (error) return alert('Kunne ikke lagre firmaprofil: ' + error.message);

    const row = { ...(profile || {}), ...payload };
    applyProfile(row);
    alert('Firmaprofil lagret');
  };

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
    if (error) return alert('Kunne ikke logge inn: ' + error.message);
  };

  const signUp = async () => {
    const { error } = await supabase.auth.signUp({ email: authEmail, password: authPassword });
    if (error) return alert('Kunne ikke opprette bruker: ' + error.message);
    alert('Bruker opprettet. Kontoen må godkjennes før appen kan brukes.');
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProjectId(null);
    setProjects([]);
    setProfile(null);
    setTab('prosjekt');
  };

  const printReport = () => {
    setTab('rapport');
    setTimeout(() => window.print(), 400);
  };

  const uploadImages = async (fileList, folder = 'photos') => {
    const filesArray = Array.from(fileList || []);
    const uploaded = [];

    for (const file of filesArray) {
      const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
      const path = `${folder}/${Date.now()}-${uid()}-${cleanName}`;
      const { error } = await supabase.storage
        .from('project-images')
        .upload(path, file, { cacheControl: '3600', upsert: false });

      if (error) {
        console.error(error);
        alert('Kunne ikke laste opp bilde: ' + error.message);
        continue;
      }

      const { data } = supabase.storage.from('project-images').getPublicUrl(path);
      uploaded.push({ id: uid(), url: data.publicUrl, path, name: file.name });
    }

    return uploaded;
  };

  const addPhoto = async (cat, fl) => {
    const imgs = await uploadImages(fl, 'photos');
    setPhotos(p => [...p, ...imgs.map(img => ({
      ...img,
      cat,
      comment: '',
      created: new Date().toLocaleString('no-NO')
    }))]);
  };

  const setChecklistValue = (category, item, patch) => {
    setChecklist(prev => ({
      ...prev,
      [category]: {
        ...(prev[category] || {}),
        [item]: {
          ...(prev[category]?.[item] || {}),
          ...patch
        }
      }
    }));
  };

  const addChecklistPhoto = async (category, item, fl) => {
    const imgs = await uploadImages(fl, 'sjekklister');
    if (!imgs.length) return;
    setChecklist(prev => ({
      ...prev,
      [category]: {
        ...(prev[category] || {}),
        [item]: {
          ...(prev[category]?.[item] || {}),
          photos: [...(prev[category]?.[item]?.photos || []), ...imgs]
        }
      }
    }));
  };

  const addFiles = fl => setFiles(p => [...p, ...Array.from(fl || []).map(f => ({
    id: uid(), name:f.name, url: URL.createObjectURL(f), by:user.name || 'Ukjent', created:new Date().toLocaleString('no-NO')
  }))]);


  const startNewProject = () => {
    const hasExistingData = projectId || project.projectName || project.address || photos.length || inst.length || files.length || Object.keys(checklist || {}).length;
    if (hasExistingData && !window.confirm('Starte et nytt tomt prosjekt? Husk å lagre først hvis du vil beholde endringene.')) return;

    setProject(emptyProject());
    setChecked({});
    setOther({});
    setSurf({});
    setPhotos([]);
    setAccess([]);
    setInst([]);
    setFiles([]);
    setChecklist({});
    setProjectId(null);
    setTab('prosjekt');
  };


  if (authLoading && !isReadOnly) {
    return <div><main><section><h2>Laster...</h2></section></main></div>;
  }

  if (!authUser && !isReadOnly) {
    return <div>
      <header>
        <div className="head">
          <Brand logo={company.logoUrl} name={name}/>
          <div><h1>Expo ProffDok</h1><p>Logg inn for å se dine prosjekter</p></div>
        </div>
      </header>
      <main>
        <Section title="Innlogging" icon={<BadgeCheck/>}>
          <Grid>
            <Input label="E-post" value={authEmail} onChange={setAuthEmail}/>
            <Input label="Passord" type="password" value={authPassword} onChange={setAuthPassword}/>
          </Grid>
          <div style={{ display:'flex', gap:'12px', marginTop:'16px', flexWrap:'wrap' }}>
            <button onClick={signIn}>Logg inn</button>
            <button className="secondary" onClick={signUp}>Opprett bruker</button>
          </div>
          <p className="note" style={{ marginTop:'16px' }}>Delingslenker fungerer fortsatt uten innlogging.</p>
        </Section>
      </main>
    </div>;
  }

  if (!isReadOnly && (profileLoading || (authUser && !profile))) {
    return <div>
      <header><div className="head"><Brand logo={company.logoUrl} name={name}/><div><h1>Expo ProffDok</h1><p>Laster brukerprofil...</p></div></div></header>
      <main><Section title="Laster" icon={<BadgeCheck/>}><p>Henter brukerprofil...</p></Section></main>
    </div>;
  }

  if (!isReadOnly && authUser && profile && !profile.approved) {
    return <div>
      <header>
        <div className="head">
          <Brand logo={company.logoUrl} name={name}/>
          <div><h1>Expo ProffDok</h1><p>Venter på godkjenning</p></div>
          <button className="secondary" onClick={signOut}>Logg ut</button>
        </div>
      </header>
      <main>
        <Section title="Konto venter på godkjenning" icon={<BadgeCheck/>}>
          <p className="note">Brukeren <b>{authUser.email}</b> er registrert, men må godkjennes av administrator før appen kan brukes.</p>
          <p>Fyll gjerne inn firmaprofilen under. Administrator kan deretter godkjenne deg i Supabase ved å sette <b>approved = true</b> i tabellen <b>profiles</b>.</p>
          <Grid>
            <Input label="Firmanavn" value={company.companyName} onChange={v=>setCompany({...company,companyName:v})}/>
            <Input label="Org.nr" value={company.orgNumber} onChange={v=>setCompany({...company,orgNumber:v})}/>
            <Input label="Adresse" value={company.address} onChange={v=>setCompany({...company,address:v})}/>
            <Input label="Telefon" value={company.phone} onChange={v=>setCompany({...company,phone:v})}/>
            <Input label="E-post" value={company.email || authUser.email} onChange={v=>setCompany({...company,email:v})}/>
            <Input label="Hjemmeside" value={company.website || ''} onChange={v=>setCompany({...company,website:v})}/>
          </Grid>
          <div style={{ marginTop:'16px' }}>
            <Brand logo={company.logoUrl} name={name}/>
            <label className="upload"><Plus size={18}/> Last opp firmalogo<input type="file" accept="image/*" onChange={e=>uploadLogo(e.target.files?.[0])}/></label>
          </div>
          <div style={{ display:'flex', gap:'12px', marginTop:'16px', flexWrap:'wrap' }}>
            <button onClick={saveProfile}>Lagre firmaprofil</button>
            <button className="secondary" onClick={signOut}>Logg ut</button>
          </div>
        </Section>
      </main>
    </div>;
  }

  if (isReadOnly) {
    return <div>
      <header>
        <div className="head">
          <Brand logo={company.logoUrl} name={name}/>
          <div><h1>FDV-rapport</h1><p>Expo ProffDok – kundevisning</p></div>
          <button onClick={() => window.print()}><Download size={18}/> Lag PDF / skriv ut</button>
        </div>
      </header>
      <main>
        <CustomerReport company={company} name={name} project={project} selected={selected} other={other} surf={surf} photos={photos} inst={inst} files={files} checklist={checklist}/>
      </main>
    </div>;
  }


  return <div>
    <header>
      <div className="head">
        <Brand logo={company.logoUrl} name={name}/>
        <div><h1>Expo ProffDok</h1><p>{projectId ? 'Åpnet prosjekt' : (authUser?.email || name)}</p></div>
        <button className="secondary" onClick={signOut}>Logg ut</button>
        <button className="secondary" onClick={startNewProject}>+ Nytt prosjekt</button>
        <button onClick={saveProject}>{projectId ? 'Oppdater prosjekt' : 'Lagre nytt prosjekt'}</button>
        <button onClick={saveAsNewProject}>Lagre som nytt</button>
        <button onClick={shareProject}>Kopier delingslink</button>
        <button onClick={printReport}><Download size={18}/> Lag PDF / skriv ut</button>
      </div>
      <nav>{tabs.map(([id,l]) => <button className={tab===id?'on':''} onClick={()=>setTab(id)} key={id}>{l}</button>)}</nav>
    </header>

    <main>
      {tab==='prosjekt' && <Section title="Prosjektinformasjon" icon={<ClipboardCheck/>}><Grid>
        <Input label="Prosjektansvarlig" value={project.responsible} onChange={v=>setProject({...project,responsible:v})}/>
        <Input label="Dato" type="date" value={project.date} onChange={v=>setProject({...project,date:v})}/>
        <Input label="Navn på prosjekt" value={project.projectName} onChange={v=>setProject({...project,projectName:v})}/>
        <Input label="Adresse" value={project.address} onChange={v=>setProject({...project,address:v})}/>
        <Input label="Kunde" value={project.customer} onChange={v=>setProject({...project,customer:v})}/>
        <Textarea label="Notater" value={project.notes} onChange={v=>setProject({...project,notes:v})}/>
      </Grid></Section>}

      {tab==='firma' && <Section title="Firmaprofil" icon={<Building2/>}>
        <p className="note">Firmaprofilen lagres på brukeren din og brukes automatisk i prosjekter og rapporter.</p>
        <div className="two"><div className="logoBox"><Brand logo={company.logoUrl} name={name}/><label className="upload"><Plus size={18}/> Last opp firmalogo<input type="file" accept="image/*" onChange={e=>uploadLogo(e.target.files?.[0])}/></label>{company.logoUrl && <button className="secondary" onClick={()=>setCompany({...company,logoUrl:''})}>Fjern logo</button>}</div>
        <Grid>
          <Input label="Firmanavn" value={company.companyName} onChange={v=>setCompany({...company,companyName:v})}/>
          <Input label="Org.nr" value={company.orgNumber} onChange={v=>setCompany({...company,orgNumber:v})}/>
          <Input label="Adresse" value={company.address} onChange={v=>setCompany({...company,address:v})}/>
          <Input label="Telefon" value={company.phone} onChange={v=>setCompany({...company,phone:v})}/>
          <Input label="E-post" value={company.email} onChange={v=>setCompany({...company,email:v})}/>
          <Input label="Hjemmeside" value={company.website} onChange={v=>setCompany({...company,website:v})}/>
        </Grid></div><button onClick={saveProfile}>Lagre firmaprofil</button>
      </Section>}

      {tab==='innlogging' && <Section title="Innlogging og brukerprofil" icon={<BadgeCheck/>}>
        <p className="note">Du er logget inn som <b>{authUser?.email}</b>. Prosjektlisten viser kun dine prosjekter. Delingslenker kan fortsatt åpnes av kunde uten innlogging.</p>
        <Grid>
          <Input label="Navn" value={user.name} onChange={v=>setUser({...user,name:v})}/>
          <Input label="E-post i rapport" value={user.email} onChange={v=>setUser({...user,email:v})}/>
          <Select label="Rolle" value={user.role} options={roles} onChange={v=>setUser({...user,role:v})}/>
        </Grid>
        <button className="secondary" onClick={signOut}>Logg ut</button>
      </Section>}

      {tab==='prosjektering' && <Section title="Prosjektering"><Grid>
        <Input label="Fall mot sluk (mm per meter)" value={project.fall} onChange={v=>setProject({...project,fall:v})}/>
        <Input label="Slukplassering" value={project.sluk} onChange={v=>setProject({...project,sluk:v})}/>
        <Input label="Terskelhøyde" value={project.terskel} onChange={v=>setProject({...project,terskel:v})}/>
        <Input label="Membranløsning" value={project.membran} onChange={v=>setProject({...project,membran:v})}/>
        <Textarea label="Kommentar / avvik" value={project.prosjekteringKommentar} onChange={v=>setProject({...project,prosjekteringKommentar:v})}/>
      </Grid><label className="upload"><Plus size={18}/> Last opp tegning / bilde<input type="file" accept="image/*" multiple onChange={e=>addPhoto('Prosjektering',e.target.files)}/></label></Section>}

      {tab==='produkter' && <>{productSections.map(s=><Section title={s.title} key={s.title}><div className="checks">{s.items.map(i=><label className="check" key={i}><input type="checkbox" checked={!!checked[i]} onChange={e=>setChecked({...checked,[i]:e.target.checked})}/>{i}</label>)}</div><Textarea label="Annet produkt / hvor brukt" value={other[s.title]||''} onChange={v=>setOther({...other,[s.title]:v})}/></Section>)}</>}

      {tab==='overflater' && <Section title="Overflateprodukter"><Grid>{surfaces.map(f=><Input key={f} label={`${f} - produkt, farge og plassering`} value={surf[f]||''} onChange={v=>setSurf({...surf,[f]:v})}/>)}</Grid></Section>}

      {tab==='bilder' && <Section title="Bildedokumentasjon" icon={<Camera/>}><div className="cards">{imageCats.map(c=><label className="tile" key={c}><b><Plus size={16}/> {c}</b><span>Ta bilde eller velg fra galleri</span><input type="file" accept="image/*" capture="environment" multiple onChange={e=>addPhoto(c,e.target.files)}/></label>)}</div><PhotoGrid photos={photos} setPhotos={setPhotos}/></Section>}

      {tab==='tilgang' && <Section title="Del tilgang til prosjekt"><button onClick={()=>setAccess([...access,{id:uid(),name:'',email:'',role:'Underleverandør'}])}><Plus size={18}/> Legg til tilgang</button>{access.map(a=><div className="row" key={a.id}><Input label="Navn" value={a.name} onChange={v=>setAccess(access.map(x=>x.id===a.id?{...x,name:v}:x))}/><Input label="E-post" value={a.email} onChange={v=>setAccess(access.map(x=>x.id===a.id?{...x,email:v}:x))}/><Select label="Rolle" value={a.role} options={roles} onChange={v=>setAccess(access.map(x=>x.id===a.id?{...x,role:v}:x))}/><button className="secondary" onClick={()=>setAccess(access.filter(x=>x.id!==a.id))}>Fjern</button></div>)}</Section>}

      {tab==='installasjoner' && <Section title="Fag, deler og utstyr"><button type="button" onClick={()=>setInst(prev=>[...prev,{id:uid(),category:'Rørlegger',name:'',qty:'',supplier:'',desc:'',photos:[],by:user.name||'Ukjent',created:new Date().toLocaleString('no-NO')}])}><Plus size={18}/> Legg til post</button>{inst.map(x=><div className="item" key={x.id}><Grid><Select label="Kategori" value={x.category} options={installCats} onChange={v=>setInst(inst.map(i=>i.id===x.id?{...i,category:v}:i))}/><Input label="Navn/produkt" value={x.name} onChange={v=>setInst(inst.map(i=>i.id===x.id?{...i,name:v}:i))}/><Input label="Antall/mengde" value={x.qty} onChange={v=>setInst(inst.map(i=>i.id===x.id?{...i,qty:v}:i))}/><Input label="Leverandør" value={x.supplier} onChange={v=>setInst(inst.map(i=>i.id===x.id?{...i,supplier:v}:i))}/><Textarea label="Beskrivelse/plassering" value={x.desc} onChange={v=>setInst(inst.map(i=>i.id===x.id?{...i,desc:v}:i))}/></Grid><label className="upload"><Plus size={18}/> Last opp bilder<input type="file" accept="image/*" multiple onChange={async e=>{const imgs = await uploadImages(e.target.files,'installasjoner'); setInst(inst.map(i=>i.id===x.id?{...i,photos:[...(i.photos||[]),...imgs]}:i));}}/></label><div className="photos">{(x.photos||[]).map(p=><div className="photo" key={p.id}><img src={p.url}/><small>{p.name}</small></div>)}</div><small>Lagt inn av {x.by} · {x.created}</small><button type="button" className="secondary" onClick={()=>setInst(inst.filter(i=>i.id!==x.id))}>Fjern</button></div>)}</Section>}

      {tab==='sjekklister' && <Section title="Sjekklister og vedlegg" icon={<FileText/>}>
        <p className="note">Velg status per kontrollpunkt. Ved Avvik kan du skrive kommentar og ta bilde. Opplastede sjekklister fra andre fag kan fortsatt legges ved nederst.</p>
        <div className="checklistList">
          {checklistTemplate.map(group => <div className="item" key={group.category}>
            <h3>{group.category}</h3>
            {group.items.map(item => {
              const value = checklist[group.category]?.[item] || {};
              return <div className="checklistPoint" key={item}>
                <div className="checklistHeader">
                  <b>{item}</b>
                  <div className="checklistStatusButtons">
                    {['Ok','Ikke aktuelt','Avvik'].map(status => <button
                      type="button"
                      key={status}
                      className={value.status===status ? '' : 'secondary'}
                      onClick={()=>setChecklistValue(group.category, item, { status })}
                    >{status}</button>)}
                  </div>
                </div>
                {(value.status || value.comment || (value.photos||[]).length>0) && <Textarea
                  label="Kommentar"
                  value={value.comment || ''}
                  onChange={v=>setChecklistValue(group.category, item, { comment:v })}
                />}
                <label className="upload checklistUpload"><Plus size={18}/> Ta bilde / last opp bilde
                  <input type="file" accept="image/*" capture="environment" multiple onChange={e=>addChecklistPhoto(group.category, item, e.target.files)}/>
                </label>
                {(value.photos || []).length > 0 && <div className="photos checklistPhotos">
                  {value.photos.map(p => <div className="photo" key={p.id}><img src={p.url}/><small>{p.name}</small></div>)}
                </div>}
              </div>;
            })}
          </div>)}
        </div>
        <Section title="Opplastede sjekklister / vedlegg fra andre fag" icon={<FileText/>}>
          <label className="upload"><Plus size={18}/> Last opp sjekkliste / vedlegg<input type="file" multiple onChange={e=>addFiles(e.target.files)}/></label>
          {files.map(f=><div className="file" key={f.id}><b>{f.name}</b><small>Lastet opp av {f.by} · {f.created}</small><a href={f.url} target="_blank">Åpne</a><button className="secondary" onClick={()=>setFiles(files.filter(x=>x.id!==f.id))}>Fjern</button></div>)}
        </Section>
      </Section>}

      {tab==='prosjektliste' && <Section title="Prosjektliste"><button onClick={() => loadProjects(authUser)}>Oppdater liste</button>{projects.map(p=><div className="item" key={p.id}><b>{p.title || 'Uten navn'}</b><small>Sist oppdatert: {new Date(p.updated_at || p.created_at).toLocaleString('no-NO')}</small><button onClick={()=>openProjectById(p.id)}>Åpne prosjekt</button><button className="secondary" onClick={()=>deleteProject(p.id)}>Slett</button></div>)}</Section>}

      {tab==='rapport' && <Report company={company} name={name} project={project} selected={selected} other={other} surf={surf} photos={photos} access={access} inst={inst} files={files} checklist={checklist}/>} 
    </main>
  </div>;
}

function Brand({logo,name}) { return <div style={{ width:"260px", height:"80px", overflow:"hidden", display:"flex", alignItems:"center" }}><img src={logo ? logo : "/expo-logo.png"} alt={name || "Expo Proffsenter"} style={{ maxWidth:"100%", maxHeight:"100%", objectFit:"contain" }}/></div>; }
function Section({title,icon,children}) { return <section><h2>{icon}{title}</h2>{children}</section>; }
function Grid({children}) { return <div className="grid">{children}</div>; }
function Input({label,value,onChange,type='text'}) { return <label><span>{label}</span><input type={type} value={value} onChange={e=>onChange(e.target.value)}/></label>; }
function Textarea({label,value,onChange}) { return <label><span>{label}</span><textarea value={value} onChange={e=>onChange(e.target.value)} /></label>; }
function Select({label,value,onChange,options}) { return <label><span>{label}</span><select value={value} onChange={e=>onChange(e.target.value)}>{options.map(o=><option key={o}>{o}</option>)}</select></label>; }
function PhotoGrid({photos,setPhotos}) { return <div className="photos">{photos.map(p=><div className="photo" key={p.id}><img src={p.url}/><b>{p.cat}</b><small>{p.created}</small><textarea placeholder="Kommentar" value={p.comment} onChange={e=>setPhotos(photos.map(x=>x.id===p.id?{...x,comment:e.target.value}:x))}/><button className="secondary" onClick={()=>setPhotos(photos.filter(x=>x.id!==p.id))}><Trash2 size={16}/> Fjern</button></div>)}</div>; }

function ChecklistReportSection({checklist}) {
  const rows = [];
  Object.entries(checklist || {}).forEach(([category, items]) => {
    Object.entries(items || {}).forEach(([item, value]) => {
      if (value?.status || value?.comment || (value?.photos || []).length) {
        rows.push({ category, item, ...value });
      }
    });
  });

  if (!rows.length) return null;
  const deviations = rows.filter(r => r.status === 'Avvik');

  return <section>
    <h2>Sjekkliste</h2>
    {[...new Set(rows.map(r => r.category))].map(category => <div key={category}>
      <h3>{category}</h3>
      {rows.filter(r => r.category === category).map(r => <div className="checklistReportItem" key={r.category + r.item}>
        <p><b>{r.item}</b> — {r.status || 'Ikke vurdert'}</p>
        {r.comment && <p>{r.comment}</p>}
        {(r.photos || []).length > 0 && <div className="photos reportPhotos">
          {r.photos.map(p => <div className="photo" key={p.id}><img src={p.url} alt={p.name || r.item}/></div>)}
        </div>}
      </div>)}
    </div>)}
    {deviations.length > 0 && <div>
      <h2>Avviksliste</h2>
      {deviations.map(r => <p key={'avvik-' + r.category + r.item}><b>{r.category} / {r.item}:</b> {r.comment || 'Avvik registrert'}</p>)}
    </div>}
  </section>;
}

function Report({company,name,project,selected,other,surf,photos,access,inst,files,checklist}) {
  const projectFields = { Prosjektansvarlig: project.responsible, Prosjektnavn: project.projectName, Adresse: project.address, Kunde: project.customer, Dato: project.date, Notater: project.notes };
  const cats = [...new Set(photos.map(p=>p.cat))];
  return <div className="report">
    <section><div className="reportTop"><Brand logo={company.logoUrl} name={name}/><div><h2>{name}</h2>{company.address&&<p>{company.address}</p>}{company.orgNumber&&<p>Org.nr: {company.orgNumber}</p>}{company.phone&&<p>{company.phone}</p>}{company.email&&<p>{company.email}</p>}{company.website&&<p>{company.website}</p>}</div></div><h2>FDV-rapport / Prosjektdokumentasjon</h2><Grid>{Object.entries(projectFields).map(([k,v])=><div className="out" key={k}><b>{k}</b><p>{v || 'Ikke fylt ut'}</p></div>)}</Grid></section>
    <section><h2>Prosjektering</h2><Grid><div className="out"><b>Fall mot sluk</b><p>{project.fall || 'Ikke oppgitt'}</p></div><div className="out"><b>Slukplassering</b><p>{project.sluk || 'Ikke oppgitt'}</p></div><div className="out"><b>Terskelhøyde</b><p>{project.terskel || 'Ikke oppgitt'}</p></div><div className="out"><b>Membran</b><p>{project.membran || 'Ikke oppgitt'}</p></div></Grid>{project.prosjekteringKommentar&&<div className="out"><b>Kommentar / avvik</b><p>{project.prosjekteringKommentar}</p></div>}</section>
    <section><h2>Produkter</h2>{selected.map(p=><p key={p.item}><b>{p.section}:</b> {p.item}</p>)}{Object.entries(other).filter(([,v])=>v).map(([k,v])=><p key={k}><b>{k} annet:</b> {v}</p>)}</section>
    <section><h2>Overflater</h2>{Object.entries(surf).filter(([,v])=>v).map(([k,v])=><p key={k}><b>{k}:</b> {v}</p>)}</section>
    <section><h2>Bildedokumentasjon</h2>{cats.map(cat=><div key={cat}><h3>{cat}</h3><div className="photos reportPhotos">{photos.filter(p=>p.cat===cat).map(p=><div className="photo" key={p.id}><img src={p.url}/>{p.comment&&<p>{p.comment}</p>}</div>)}</div></div>)}</section>
    <section><h2>Fag, deler og utstyr</h2>{inst.map(i=><p key={i.id}><b>{i.category}:</b> {i.name} {i.qty&&`· ${i.qty}`} {i.supplier&&`· ${i.supplier}`} {i.desc&&` — ${i.desc}`}</p>)}</section>
    <ChecklistReportSection checklist={checklist}/>
    <section><h2>Sjekklister og vedlegg</h2>{files.map(f=><p key={f.id}>{f.name}</p>)}</section>
    <section><h2>Prosjekttilgang</h2>{access.map(a=><p key={a.id}>{a.name||a.email} — {a.role}</p>)}</section>
    <footer>Levert av Expo Proffsenter</footer>
  </div>;
}

function hasValue(value) {
  return value !== undefined && value !== null && String(value).trim() !== '';
}

function InfoCard({label, value}) {
  if (!hasValue(value)) return null;
  return <div className="out"><b>{label}</b><p>{value}</p></div>;
}

function CustomerReport({company,name,project,selected,other,surf,photos,inst,files,checklist}) {
  const projectFields = [
    ['Prosjektansvarlig', project.responsible],
    ['Prosjektnavn', project.projectName],
    ['Adresse', project.address],
    ['Kunde', project.customer],
    ['Dato', project.date],
    ['Notater', project.notes]
  ];

  const prosjektering = [
    ['Fall mot sluk', project.fall],
    ['Slukplassering', project.sluk],
    ['Terskelhøyde', project.terskel],
    ['Membranløsning', project.membran],
    ['Kommentar / avvik', project.prosjekteringKommentar]
  ];

  const surfaceRows = Object.entries(surf || {}).filter(([,v]) => hasValue(v));
  const otherRows = Object.entries(other || {}).filter(([,v]) => hasValue(v));
  const photoCats = [...new Set((photos || []).map(p => p.cat).filter(Boolean))];

  return <div className="report">
    <section>
      <div className="reportTop">
        <Brand logo={company.logoUrl} name={name}/>
        <div>
          <h2>{project.projectName || 'FDV-rapport / Prosjektdokumentasjon'}</h2>
          {project.address && <p>{project.address}</p>}
          {project.customer && <p><b>Kunde:</b> {project.customer}</p>}
          {company.companyName && <p><b>Utførende:</b> {company.companyName}</p>}
          {company.orgNumber && <p>Org.nr: {company.orgNumber}</p>}
        </div>
      </div>
      <h2>Prosjektinformasjon</h2>
      <Grid>{projectFields.map(([label,value]) => <InfoCard key={label} label={label} value={value}/>)}</Grid>
    </section>

    {prosjektering.some(([,v]) => hasValue(v)) && <section>
      <h2>Prosjektering</h2>
      <Grid>{prosjektering.map(([label,value]) => <InfoCard key={label} label={label} value={value}/>)}</Grid>
    </section>}

    {(selected.length > 0 || otherRows.length > 0) && <section>
      <h2>Produkter</h2>
      {selected.map(p => <p key={p.item}><b>{p.section}:</b> {p.item}</p>)}
      {otherRows.map(([k,v]) => <p key={k}><b>{k} annet:</b> {v}</p>)}
    </section>}

    {surfaceRows.length > 0 && <section>
      <h2>Overflater</h2>
      <Grid>{surfaceRows.map(([k,v]) => <InfoCard key={k} label={k} value={v}/>)}</Grid>
    </section>}

    {(photos || []).length > 0 && <section>
      <h2>Bildedokumentasjon</h2>
      {photoCats.map(cat => <div key={cat}>
        <h3>{cat}</h3>
        <div className="photos reportPhotos">
          {photos.filter(p => p.cat === cat).map(p => <div className="photo" key={p.id}>
            <img src={p.url} alt={p.cat || 'Dokumentasjonsbilde'}/>
            {p.comment && <p>{p.comment}</p>}
          </div>)}
        </div>
      </div>)}
    </section>}

    {(inst || []).length > 0 && <section>
      <h2>Fag, deler og utstyr</h2>
      {inst.map(i => <div className="out" key={i.id}>
        <b>{i.category || 'Post'}</b>
        <p>{[i.name, i.qty, i.supplier, i.desc].filter(Boolean).join(' · ')}</p>
        {(i.photos || []).length > 0 && <div className="photos reportPhotos">
          {i.photos.map(p => <div className="photo" key={p.id}><img src={p.url} alt={p.name || 'Bilde'}/></div>)}
        </div>}
      </div>)}
    </section>}

    <ChecklistReportSection checklist={checklist}/>

    {(files || []).length > 0 && <section>
      <h2>Sjekklister og vedlegg</h2>
      {files.map(f => <p key={f.id}>{f.name}</p>)}
    </section>}

    <footer>Levert av Expo Proffsenter</footer>
  </div>;
}

createRoot(document.getElementById('root')).render(<App />);
