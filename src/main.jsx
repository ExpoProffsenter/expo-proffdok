import React, { useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { createClient } from '@supabase/supabase-js'
import './style.css'

const supabase = createClient(
  'https://dqffxflaoyarbxyiyhop.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxZmZ4Zmxhb3lhcmJ4eWl5aG9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NzcxNTEsImV4cCI6MjA5MzA1MzE1MX0.5fkVNPooHGlayw4NgYM3fUVrAiv0XbUyTixkfeToMSE'
)

function App() {
  const [user, setUser] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [profile, setProfile] = useState(null)
  const [company, setCompany] = useState(null)
  const [projects, setProjects] = useState([])
  const [projectName, setProjectName] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser(data.user)
    })
  }, [])

  useEffect(() => {
    if (user) loadProfile()
  }, [user])

  const loadProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    setProfile(data)

    if (data?.company_id) {
      const { data: companyData } = await supabase
        .from('companies')
        .select('*')
        .eq('id', data.company_id)
        .single()

      setCompany(companyData)
      loadProjects(data.company_id)
    }
  }

  const loadProjects = async (companyId) => {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('company_id', companyId)

    setProjects(data || [])
  }

  const signUp = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })

    if (error) return alert(error.message)

    await supabase.from('profiles').insert({
      id: data.user.id,
      email,
      approved: false
    })

    alert('Bruker opprettet – venter på godkjenning')
  }

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) return alert(error.message)

    location.reload()
  }

  const createCompany = async () => {
    const { data } = await supabase
      .from('companies')
      .insert({ company_name: 'Mitt firma' })
      .select()
      .single()

    await supabase
      .from('profiles')
      .update({
        company_id: data.id,
        role: 'admin'
      })
      .eq('id', user.id)

    location.reload()
  }

  const saveProject = async () => {
    await supabase.from('projects').insert({
      title: projectName,
      company_id: profile.company_id
    })

    loadProjects(profile.company_id)
    setProjectName('')
  }

  if (!user) {
    return (
      <div className="wrap">
        <h2>Innlogging</h2>
        <input placeholder="E-post" onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Passord" onChange={e => setPassword(e.target.value)} />

        <button onClick={signIn}>Logg inn</button>
        <button onClick={signUp}>Opprett bruker</button>
      </div>
    )
  }

  if (profile && !profile.approved) {
    return <h2>Venter på godkjenning</h2>
  }

  if (!profile?.company_id) {
    return (
      <div>
        <h2>Opprett firma</h2>
        <button onClick={createCompany}>Opprett firma</button>
      </div>
    )
  }

  return (
    <div>
      <h1>{company?.company_name}</h1>

      <input
        value={projectName}
        onChange={e => setProjectName(e.target.value)}
        placeholder="Prosjektnavn"
      />

      <button onClick={saveProject}>Lagre prosjekt</button>

      <h3>Prosjekter</h3>
      {projects.map(p => (
        <div key={p.id}>{p.title}</div>
      ))}
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)
