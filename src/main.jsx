import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Download } from 'lucide-react';
import './style.css';

const uid = () => Math.random().toString(36).slice(2);

function App() {

  const [project, setProject] = useState({
    projectName: '',
    fall: '',
    sluk: '',
    terskel: '',
    membran: '',
    kommentar: ''
  });

  // ✅ LAGRING
  const saveLocal = () => {
    localStorage.setItem('expoProject', JSON.stringify(project));
    alert('Lagret!');
  };

  const loadLocal = () => {
    const data = localStorage.getItem('expoProject');
    if (!data) return alert('Ingen lagret data');
    setProject(JSON.parse(data));
    alert('Lastet!');
  };

  return (
    <div>
      <h1>Expo ProffDok</h1>

      <button onClick={saveLocal}>Lagre</button>
      <button onClick={loadLocal}>Last inn</button>
      <button onClick={() => window.print()}>
        <Download size={18}/> PDF
      </button>

      <h2>Prosjektering</h2>

      <input placeholder="Fall" value={project.fall}
        onChange={e=>setProject({...project,fall:e.target.value})} />

      <input placeholder="Sluk" value={project.sluk}
        onChange={e=>setProject({...project,sluk:e.target.value})} />

      <input placeholder="Terskel" value={project.terskel}
        onChange={e=>setProject({...project,terskel:e.target.value})} />

      <input placeholder="Membran" value={project.membran}
        onChange={e=>setProject({...project,membran:e.target.value})} />

      <textarea placeholder="Kommentar"
        value={project.kommentar}
        onChange={e=>setProject({...project,kommentar:e.target.value})}
      />

      <h2>Rapport</h2>

      <p>Fall: {project.fall}</p>
      <p>Sluk: {project.sluk}</p>
      <p>Terskel: {project.terskel}</p>
      <p>Membran: {project.membran}</p>
      <p>Kommentar: {project.kommentar}</p>

    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
