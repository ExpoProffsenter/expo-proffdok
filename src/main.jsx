import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Camera, FileText, Plus, Trash2, Download, Building2, ClipboardCheck, BadgeCheck } from 'lucide-react';
import './style.css';

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

function App() {
  const [tab, setTab] = useState('prosjekt');
  const [company, setCompany] = useState({ companyName:'Expo Proffsenter', address:'', orgNumber:'', phone:'', email:'', website:'', logoUrl:'' });
  const [user, setUser] = useState({ name:'', email:'', role:'Eier / administrator' });
  const [project, setProject] = useState({
    responsible:'',
    projectName:'',
    address:'',
    customer:'',
    date:new Date().toISOString().slice(0,10),
    notes:'',
    fall:'',
    sluk:'',
    terskel:'',
    membran:'',
    prosjekteringKommentar:''
  });

  const [checked, setChecked] = useState({});
  const [other, setOther] = useState({});
  const [surf, setSurf] = useState({});
  const [photos, setPhotos] = useState([]);
  const [access, setAccess] = useState([]);
  const [inst, setInst] = useState([]);
  const [files, setFiles] = useState([]);

  const selected = useMemo(() =>
    productSections.flatMap(s =>
      s.items.filter(i => checked[i]).map(i => ({ section:s.title, item:i }))
    ), [checked]
  );

  const name = company.companyName || 'Expo Proffsenter';

  const tabs = [
    ['prosjekt','Prosjekt'],
    ['firma','Firma'],
    ['innlogging','Innlogging'],
    ['prosjektering','Prosjektering'],
    ['produkter','Produkter'],
    ['overflater','Overflater'],
    ['bilder','Bilder'],
    ['tilgang','Tilgang'],
    ['installasjoner','Fag/utstyr'],
    ['sjekklister','Sjekklister'],
    ['rapport','Rapport']
  ];

  const addPhoto = (cat, fl) =>
    setPhotos(p => [
      ...p,
      ...Array.from(fl || []).map(f => ({
        id: uid(),
        cat,
        url: URL.createObjectURL(f),
        comment:'',
        created:new Date().toLocaleString('no-NO')
      }))
    ]);

  const addFiles = fl =>
    setFiles(p => [
      ...p,
      ...Array.from(fl || []).map(f => ({
        id: uid(),
        name:f.name,
        url: URL.createObjectURL(f),
        by:user.name || 'Ukjent',
        created:new Date().toLocaleString('no-NO')
      }))
    ]);

  return (
    <div>
      <header>
        <div className="head">
          <Brand logo={company.logoUrl} name={name}/>
          <div>
            <h1>Expo ProffDok</h1>
            <p>{name}</p>
          </div>
          <button onClick={() => window.print()}><Download size={18}/> Lag PDF / skriv ut</button>
        </div>

        <nav>
          {tabs.map(([id,l]) =>
            <button className={tab===id?'on':''} onClick={()=>setTab(id)} key={id}>{l}</button>
          )}
        </nav>
      </header>

      <main>
        {tab==='prosjekt' && (
          <Section title="Prosjektinformasjon" icon={<ClipboardCheck/>}>
            <Grid>
              <Input label="Prosjektansvarlig" value={project.responsible} onChange={v=>setProject({...project,responsible:v})}/>
              <Input label="Dato" type="date" value={project.date} onChange={v=>setProject({...project,date:v})}/>
              <Input label="Navn på prosjekt" value={project.projectName} onChange={v=>setProject({...project,projectName:v})}/>
              <Input label="Adresse" value={project.address} onChange={v=>setProject({...project,address:v})}/>
              <Input label="Kunde" value={project.customer} onChange={v=>setProject({...project,customer:v})}/>
              <Textarea label="Notater" value={project.notes} onChange={v=>setProject({...project,notes:v})}/>
            </Grid>
          </Section>
        )}

        {tab==='firma' && (
          <Section title="Firma / white-label" icon={<Building2/>}>
            <p className="note">Kundens logo og firmainfo vises i appen og rapporten. Uten kundelogo brukes Expo Proffsenter som standard.</p>
            <div className="two">
              <div className="logoBox">
                <Brand logo={company.logoUrl} name={name}/>
                <label className="upload">
                  <Plus size={18}/> Last opp kundelogo
                  <input type="file" accept="image/*" onChange={e=>setCompany({...company,logoUrl:URL.createObjectURL(e.target.files[0])})}/>
                </label>
                {company.logoUrl && <button className="secondary" onClick={()=>setCompany({...company,logoUrl:''})}>Fjern logo</button>}
              </div>

              <Grid>
                <Input label="Firmanavn" value={company.companyName} onChange={v=>setCompany({...company,companyName:v})}/>
                <Input label="Org.nr" value={company.orgNumber} onChange={v=>setCompany({...company,orgNumber:v})}/>
                <Input label="Adresse" value={company.address} onChange={v=>setCompany({...company,address:v})}/>
                <Input label="Telefon" value={company.phone} onChange={v=>setCompany({...company,phone:v})}/>
                <Input label="E-post" value={company.email} onChange={v=>setCompany({...company,email:v})}/>
                <Input label="Hjemmeside" value={company.website} onChange={v=>setCompany({...company,website:v})}/>
              </Grid>
            </div>
          </Section>
        )}

        {tab==='innlogging' && (
          <Section title="Innlogging og brukerprofil" icon={<BadgeCheck/>}>
            <p className="note">Demo av brukerprofil. I ferdig løsning kobles dette til ekte innlogging og database.</p>
            <Grid>
              <Input label="Navn" value={user.name} onChange={v=>setUser({...user,name:v})}/>
              <Input label="E-post" value={user.email} onChange={v=>setUser({...user,email:v})}/>
              <Select label="Rolle" value={user.role} options={roles} onChange={v=>setUser({...user,role:v})}/>
            </Grid>
          </Section>
        )}

        {tab==='prosjektering' && (
          <Section title="Prosjektering">
            <Grid>
              <Input label="Fall mot sluk (mm per meter)" value={project.fall} onChange={v=>setProject({...project,fall:v})}/>
              <Input label="Slukplassering" value={project.sluk} onChange={v=>setProject({...project,sluk:v})}/>
              <Input label="Terskelhøyde" value={project.terskel} onChange={v=>setProject({...project,terskel:v})}/>
              <Input label="Membranløsning" value={project.membran} onChange={v=>setProject({...project,membran:v})}/>
              <Textarea label="Kommentar / avvik" value={project.prosjekteringKommentar} onChange={v=>setProject({...project,prosjekteringKommentar:v})}/>
            </Grid>

            <label className="upload">
              <Plus size={18}/> Last opp tegning / bilde
              <input type="file" accept="image/*" multiple onChange={e=>addPhoto('Prosjektering',e.target.files)}/>
            </label>
          </Section>
        )}

        {tab==='produkter' && (
          <>
            {productSections.map(s=>(
              <Section title={s.title} key={s.title}>
                <div className="checks">
                  {s.items.map(i=>(
                    <label className="check" key={i}>
                      <input type="checkbox" checked={!!checked[i]} onChange={e=>setChecked({...checked,[i]:e.target.checked})}/>
                      {i}
                    </label>
                  ))}
                </div>
                <Textarea label="Annet produkt / hvor brukt" value={other[s.title]||''} onChange={v=>setOther({...other,[s.title]:v})}/>
              </Section>
            ))}
          </>
        )}

        {tab==='overflater' && (
          <Section title="Overflateprodukter">
            <Grid>
              {surfaces.map(f=>
                <Input key={f} label={`${f} - produkt, farge og plassering`} value={surf[f]||''} onChange={v=>setSurf({...surf,[f]:v})}/>
              )}
            </Grid>
          </Section>
        )}

        {tab==='bilder' && (
          <Section title="Bildedokumentasjon" icon={<Camera/>}>
            <div className="cards">
              {imageCats.map(c=>(
                <label className="tile" key={c}>
                  <b><Plus size={16}/> {c}</b>
                  <span>Ta bilde eller velg fra galleri</span>
                  <input type="file" accept="image/*" capture="environment" multiple onChange={e=>addPhoto(c,e.target.files)}/>
                </label>
              ))}
            </div>
            <PhotoGrid photos={photos} setPhotos={setPhotos}/>
          </Section>
        )}

        {tab==='tilgang' && (
          <Section title="Del tilgang til prosjekt">
            <button onClick={()=>setAccess([...access,{id:uid(),name:'',email:'',role:'Underleverandør'}])}><Plus size={18}/> Legg til tilgang</button>
            {access.map(a=>(
              <div className="row" key={a.id}>
                <Input label="Navn" value={a.name} onChange={v=>setAccess(access.map(x=>x.id===a.id?{...x,name:v}:x))}/>
                <Input label="E-post" value={a.email} onChange={v=>setAccess(access.map(x=>x.id===a.id?{...x,email:v}:x))}/>
                <Select label="Rolle" value={a.role} options={roles} onChange={v=>setAccess(access.map(x=>x.id===a.id?{...x,role:v}:x))}/>
                <button className="secondary" onClick={()=>setAccess(access.filter(x=>x.id!==a.id))}>Fjern</button>
              </div>
            ))}
          </Section>
        )}

        {tab==='installasjoner' && (
          <Section title="Fag, deler og utstyr">
            <button type="button" onClick={()=>setInst(prev=>[...prev,{id:uid(),category:'Rørlegger',name:'',qty:'',supplier:'',desc:'',photos:[],by:user.name||'Ukjent',created:new Date().toLocaleString('no-NO')}])}>
              <Plus size={18}/> Legg til post
            </button>

            {inst.map(x=>(
              <div className="item" key={x.id}>
                <Grid>
                  <Select label="Kategori" value={x.category} options={installCats} onChange={v=>setInst(inst.map(i=>i.id===x.id?{...i,category:v}:i))}/>
                  <Input label="Navn/produkt" value={x.name} onChange={v=>setInst(inst.map(i=>i.id===x.id?{...i,name:v}:i))}/>
                  <Input label="Antall/mengde" value={x.qty} onChange={v=>setInst(inst.map(i=>i.id===x.id?{...i,qty:v}:i))}/>
                  <Input label="Leverandør" value={x.supplier} onChange={v=>setInst(inst.map(i=>i.id===x.id?{...i,supplier:v}:i))}/>
                  <Textarea label="Beskrivelse/plassering" value={x.desc} onChange={v=>setInst(inst.map(i=>i.id===x.id?{...i,desc:v}:i))}/>
                </Grid>

                <label className="upload">
                  <Plus size={18}/> Last opp bilder
                  <input type="file" accept="image/*" multiple onChange={e=>{
                    const imgs = Array.from(e.target.files || []).map(f=>({id:uid(),url:URL.createObjectURL(f),name:f.name}));
                    setInst(inst.map(i=>i.id===x.id?{...i,photos:[...(i.photos||[]),...imgs]}:i));
                  }}/>
                </label>

                <div className="photos">
                  {(x.photos||[]).map(p=><div className="photo" key={p.id}><img src={p.url}/><small>{p.name}</small></div>)}
                </div>

                <small>Lagt inn av {x.by} · {x.created}</small>
                <button type="button" className="secondary" onClick={()=>setInst(inst.filter(i=>i.id!==x.id))}>Fjern</button>
              </div>
            ))}
          </Section>
        )}

        {tab==='sjekklister' && (
          <Section title="Sjekklister og vedlegg" icon={<FileText/>}>
            <label className="upload">
              <Plus size={18}/> Last opp sjekkliste / vedlegg
              <input type="file" multiple onChange={e=>addFiles(e.target.files)}/>
            </label>

            {files.map(f=>(
              <div className="file" key={f.id}>
                <b>{f.name}</b>
                <small>Lastet opp av {f.by} · {f.created}</small>
                <a href={f.url} target="_blank">Åpne</a>
                <button className="secondary" onClick={()=>setFiles(files.filter(x=>x.id!==f.id))}>Fjern</button>
              </div>
            ))}
          </Section>
        )}

        {tab==='rapport' && (
          <Report company={company} name={name} project={project} selected={selected} other={other} surf={surf} photos={photos} access={access} inst={inst} files={files}/>
        )}
      </main>
    </div>
  );
}

function Brand({logo,name}) {
  return (
    <div style={{ width:"260px", height:"80px", overflow:"hidden", display:"flex", alignItems:"center" }}>
      <img src={logo ? logo : "/expo-logo.png"} alt={name || "Expo Proffsenter"} style={{ maxWidth:"100%", maxHeight:"100%", objectFit:"contain" }}/>
    </div>
  );
}

function Section({title,icon,children}) {
  return <section><h2>{icon}{title}</h2>{children}</section>;
}

function Grid({children}) {
  return <div className="grid">{children}</div>;
}

function Input({label,value,onChange,type='text'}) {
  return <label><span>{label}</span><input type={type} value={value} onChange={e=>onChange(e.target.value)}/></label>;
}

function Textarea({label,value,onChange}) {
  return <label><span>{label}</span><textarea value={value} onChange={e=>onChange(e.target.value)} /></label>;
}

function Select({label,value,onChange,options}) {
  return <label><span>{label}</span><select value={value} onChange={e=>onChange(e.target.value)}>{options.map(o=><option key={o}>{o}</option>)}</select></label>;
}

function PhotoGrid({photos,setPhotos}) {
  return (
    <div className="photos">
      {photos.map(p=>(
        <div className="photo" key={p.id}>
          <img src={p.url}/>
          <b>{p.cat}</b>
          <small>{p.created}</small>
          <textarea placeholder="Kommentar" value={p.comment} onChange={e=>setPhotos(photos.map(x=>x.id===p.id?{...x,comment:e.target.value}:x))}/>
          <button className="secondary" onClick={()=>setPhotos(photos.filter(x=>x.id!==p.id))}><Trash2 size={16}/> Fjern</button>
        </div>
      ))}
    </div>
  );
}

function Report({company,name,project,selected,other,surf,photos,access,inst,files}) {
  const projectFields = {
    Prosjektansvarlig: project.responsible,
    Prosjektnavn: project.projectName,
    Adresse: project.address,
    Kunde: project.customer,
    Dato: project.date,
    Notater: project.notes
  };

  return (
    <div className="report">
      <section>
        <div className="reportTop">
          <Brand logo={company.logoUrl} name={name}/>
          <div>
            <h2>{name}</h2>
            {company.address && <p>{company.address}</p>}
            {company.orgNumber && <p>Org.nr: {company.orgNumber}</p>}
            {company.phone && <p>{company.phone}</p>}
            {company.email && <p>{company.email}</p>}
            {company.website && <p>{company.website}</p>}
          </div>
        </div>

        <h2>FDV-rapport / Prosjektdokumentasjon</h2>
        <Grid>
          {Object.entries(projectFields).map(([k,v])=>(
            <div className="out" key={k}>
              <b>{k}</b>
              <p>{v || 'Ikke fylt ut'}</p>
            </div>
          ))}
        </Grid>
      </section>

      <section>
        <h2>Prosjektering</h2>
        {project.fall && <p><b>Fall mot sluk:</b> {project.fall}</p>}
        {project.sluk && <p><b>Slukplassering:</b> {project.sluk}</p>}
        {project.terskel && <p><b>Terskelhøyde:</b> {project.terskel}</p>}
        {project.membran && <p><b>Membran:</b> {project.membran}</p>}
        {project.prosjekteringKommentar && <p><b>Kommentar:</b> {project.prosjekteringKommentar}</p>}
      </section>

      <section>
        <h2>Produkter</h2>
        {selected.map(p=><p key={p.item}><b>{p.section}:</b> {p.item}</p>)}
        {Object.entries(other).filter(([,v])=>v).map(([k,v])=><p key={k}><b>{k} annet:</b> {v}</p>)}
      </section>

      <section>
        <h2>Overflater</h2>
        {Object.entries(surf).filter(([,v])=>v).map(([k,v])=><p key={k}><b>{k}:</b> {v}</p>)}
      </section>

      <section>
        <h2>Bildedokumentasjon</h2>
        <div className="photos reportPhotos">
          {photos.map(p=><div className="photo" key={p.id}><img src={p.url}/><b>{p.cat}</b><p>{p.comment}</p></div>)}
        </div>
      </section>

      <section>
        <h2>Fag, deler og utstyr</h2>
        {inst.map(i=><p key={i.id}><b>{i.category}:</b> {i.name} {i.qty&&`· ${i.qty}`} {i.supplier&&`· ${i.supplier}`} {i.desc&&` — ${i.desc}`}</p>)}
      </section>

      <section>
        <h2>Sjekklister og vedlegg</h2>
        {files.map(f=><p key={f.id}>{f.name}</p>)}
      </section>

      <section>
        <h2>Prosjekttilgang</h2>
        {access.map(a=><p key={a.id}>{a.name||a.email} — {a.role}</p>)}
      </section>

      <footer>Levert av Expo Proffsenter</footer>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
