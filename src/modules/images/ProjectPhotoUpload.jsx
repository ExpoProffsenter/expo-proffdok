import React,{useState} from 'react';
import WorkspaceDisclosure from '../ui/WorkspaceDisclosure.jsx';
import './projectPhotos.css';

export default function ProjectPhotoUpload({disabled=false,children}){
 const [open,setOpen]=useState(false);
 return <WorkspaceDisclosure className="pd-project-photo-upload" label="Legg til bilder" title="Bilder fra arbeidet" subtitle="PROSJEKT / BILDER" open={open} onOpenChange={setOpen} disabled={disabled}>
  <p>Velg kategori. Ta bilder, velg fra galleriet eller dra bildene til kategorien. Se lagringsstatusen nedenfor. Lukk panelet for å gå tilbake til prosjektet.</p>
  {children}
 </WorkspaceDisclosure>;
}
