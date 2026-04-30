import React, { useMemo, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import { Download } from 'lucide-react';
import './style.css';

const supabase = createClient(
  'https://dqffxflaoyarbxyiyhop.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxZmZ4Zmxhb3lhcmJ4eWl5aG9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NzcxNTEsImV4cCI6MjA5MzA1MzE1MX0.5fkVNPooHGlayw4NgYM3fUVrAiv0XbUyTixkfeToMSE'
);

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

  const [projectId, setProjectId] = useState(null);
  const [projects, setProjects] = useState([]);

  // 🔹 HENT PROSJEKTLISTE
  const loadProjects = async () => {
    const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
    setProjects(data || []);
  };

  // 🔹 LAST FRA URL (deling)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('project');

    if (id) {
      loadSharedProject(id);
    } else {
      loadProjects();
    }
  }, []);

  const loadSharedProject = async (id) => {
    const { data } = await supabase.from('projects').select('*').eq('id', id).single();
    if (data) {
      setProject(data.data);
      setProjectId(data.id);
    }
  };

  // 🔹 LAGRE
  const saveProject = async () => {
    if (projectId) {
      await supabase.from('projects').update({
        data: project
      }).eq('id', projectId);
      alert('Oppdatert');
    } else {
      const { data } = await supabase.from('projects').insert({
        title: project.projectName || 'Uten navn',
        data: project
      }).select().single();

      setProjectId(data.id);
      alert('Lagret');
      loadProjects();
    }
  };

  // 🔹 SLETT
  const deleteProject = async (id) => {
    if (!confirm('Slette prosjekt?')) return;

    await supabase.from('projects').delete().eq('id', id);
    loadProjects();
  };

  // 🔹 ÅPNE
  const openProject = (p) => {
    setProject(p.data);
    setProjectId(p.id);
  };

  // 🔹 DELING
  const shareProject = () => {
    if (!projectId) return alert('Lagre prosjekt først');

    const link = `${window.location.origin}?project=${projectId}`;
    navigator.clipboard.writeText(link);
    alert('Link kopiert');
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Expo ProffDok</h1>

      <button onClick={saveProject}>Lagre i sky</button>
      <button onClick={shareProject}>Kopier delingslink</button>
      <button onClick={() => window.print()}><Download size={18}/> PDF</button>

      <h2>Prosjekt</h2>

      <input placeholder="Navn" value={project.projectName} onChange={e => setProject({...project, projectName: e.target.value})} />
      <input placeholder="Adresse" value={project.address} onChange={e => setProject({...project, address: e.target.value})} />
      <input placeholder="Fall" value={project.fall} onChange={e => setProject({...project, fall: e.target.value})} />
      <input placeholder="Sluk" value={project.sluk} onChange={e => setProject({...project, sluk: e.target.value})} />
      <input placeholder="Terskel" value={project.terskel} onChange={e => setProject({...project, terskel: e.target.value})} />
      <input placeholder="Membran" value={project.membran} onChange={e => setProject({...project, membran: e.target.value})} />
      <textarea placeholder="Kommentar" value={project.kommentar} onChange={e => setProject({...project, kommentar: e.target.value})} />

      <h2>Prosjektliste</h2>

      {projects.map(p => (
        <div key={p.id} style={{ border: '1px solid #ccc', padding: 10, marginBottom: 10 }}>
          <b>{p.title}</b>
          <br />
          <button onClick={() => openProject(p)}>Åpne</button>
          <button onClick={() => deleteProject(p.id)}>Slett</button>
        </div>
      ))}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
