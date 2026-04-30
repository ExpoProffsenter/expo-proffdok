import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Download } from 'lucide-react';
import './style.css';

function App() {
  const [project, setProject] = useState({
    projectName: '',
    address: '',
    fall: '',
    sluk: '',
    terskel: '',
    membran: '',
    kommentar: ''
  });

  const saveLocal = () => {
    localStorage.setItem('expoProject', JSON.stringify(project));
    alert('Lagret!');
  };

  const loadLocal = () => {
    const data = localStorage.getItem('expoProject');
    if (!data) return alert('Ingen lagring funnet');
    setProject(JSON.parse(data));
  };

  return (
    <div>
      <header>
        <h1>Expo ProffDok</h1>
        <button onClick={saveLocal}>Lagre</button>
        <button onClick={loadLocal}>Last inn</button>
        <button onClick={() => window.print()}>
          <Download size={18}/> PDF
        </button>
      </header>

      <main>
        <h2>Prosjekt</h2>

        <input
          placeholder="Prosjektnavn"
          value={project.projectName}
          onChange={e => setProject({...project, projectName: e.target.value})}
        />

        <input
          placeholder="Adresse"
          value={project.address}
          onChange={e => setProject({...project, address: e.target.value})}
        />

        <h2>Prosjektering</h2>

        <input
          placeholder="Fall"
          value={project.fall}
          onChange={e => setProject({...project, fall: e.target.value})}
        />

        <input
          placeholder="Sluk"
          value={project.sluk}
          onChange={e => setProject({...project, sluk: e.target.value})}
        />

        <input
          placeholder="Terskel"
          value={project.terskel}
          onChange={e => setProject({...project, terskel: e.target.value})}
        />

        <input
          placeholder="Membran"
          value={project.membran}
          onChange={e => setProject({...project, membran: e.target.value})}
        />

        <textarea
          placeholder="Kommentar"
          value={project.kommentar}
          onChange={e => setProject({...project, kommentar: e.target.value})}
        />

        <h2>Rapport</h2>
        <p><b>Prosjektnavn:</b> {project.projectName}</p>
        <p><b>Adresse:</b> {project.address}</p>
        <p><b>Fall:</b> {project.fall}</p>
        <p><b>Sluk:</b> {project.sluk}</p>
        <p><b>Terskel:</b> {project.terskel}</p>
        <p><b>Membran:</b> {project.membran}</p>
        <p><b>Kommentar:</b> {project.kommentar}</p>
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
