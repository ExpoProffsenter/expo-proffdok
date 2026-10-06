import { identityText } from './kshmsPersonal.mjs';
const dateTime=value=>new Date(value).toLocaleString('nb-NO');

export default function KshmsVersionIdentity({version,acknowledgment,data,userId}) {
 const publisher=data.members.find(member=>member.id===version.published_by);
 const self=data.members.find(member=>member.id===userId);
 return <dl className="ks-signatures">
  <div><dt>Godkjent for firmaet av</dt><dd>{identityText(version.publisher_identity,publisher?.email||version.published_by||'Ikke tilgjengelig')}{version.published_at&&<> · <time dateTime={version.published_at}>{dateTime(version.published_at)}</time></>}</dd></div>
  <div><dt>Din egen gjennomgang</dt><dd>{acknowledgment?.user_id===userId&&acknowledgment.version_id===version.id?<>{identityText(acknowledgment.user_identity,self?.email||userId)} · Bekreftet{acknowledgment.acknowledged_at&&<> · <time dateTime={acknowledgment.acknowledged_at}>{dateTime(acknowledgment.acknowledged_at)}</time></>}</>:version.requires_ack||version.number===1?'Ikke bekreftet ennå':'Ny bekreftelse er valgfri for denne utgaven'}</dd></div>
 </dl>;
}
