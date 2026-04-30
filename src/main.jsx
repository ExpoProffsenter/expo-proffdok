import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Plus, Download } from 'lucide-react';
import './style.css';

const uid = () => Math.random().toString(36).slice(2);

function App() {
  const [tab, setTab] = useState('prosjekt');

  const [project, setProject] = useState({
    name: '',
    address: '',
    fall: '',
    sluk: '',
    terskel: '',
    membran: '',
    kommentar: ''
  });

  const tabs = [
    ['prosjekt', 'Prosjekt'],
    ['prosjektering', 'Prosjektering'],
    ['rapport', 'Rapport']
  ];

  return (
    <div>
      <header>
        <h1>Expo ProffDok</h1>
        <nav>
          {tabs.map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
        </nav>
      </header>

      <main>

        {tab === 'prosjekt' && (
          <section>
            <h2>Prosjekt</h2>
            <input placeholder="Prosjektnavn"
              value={project.name}
              onChange={e => setProject({ ...project, name: e.target.value })}
            />
            <input placeholder="Adresse"
              value={project.address}
              onChange={e => setProject({ ...project, address: e.target.value })}
            />
          </section>
        )}

        {tab === 'prosjektering' && (
          <section>
            <h2>Prosjektering</h2>

            <input placeholder="Fall mot sluk"
              value={project.fall}
              onChange={e => setProject({ ...project, fall: e.target.value })}
            />

            <input placeholder="Slukplassering"
              value={project.sluk}
              onChange={e => setProject({ ...project, sluk: e.target.value })}
            />

            <input placeholder="Terskelhøyde"
              value={project.terskel}
              onChange={e => setProject({ ...project, terskel: e.target.value })}
            />

            <input placeholder="Membran"
              value={project.membran}
              onChange={e => setProject({ ...project, membran: e.target.value })}
            />

            <textarea placeholder="Kommentar"
              value={project.kommentar}
              onChange={e => setProject({ ...project, kommentar: e.target.value })}
            />
          </section>
        )}

        {tab === 'rapport' && (
          <section>
            <h2>Rapport</h2>

            <h3>Prosjekt</h3>
            <p>{project.name}</p>
            <p>{project.address}</p>

            <h3>Prosjektering</h3>
            <p>Fall: {project.fall}</p>
            <p>Sluk: {project.sluk}</p>
            <p>Terskel: {project.terskel}</p>
            <p>Membran: {project.membran}</p>
            <p>{project.kommentar}</p>

            <button onClick={() => window.print()}>
              <Download /> Lag PDF
            </button>
          </section>
        )}

      </main>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
