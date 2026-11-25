const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
const app='https://expo-proffdok.app/';
function logoUrl(raw){
 try{const url=new URL(raw,app);if(url.protocol==='https:'&&!url.username&&!url.password&&url.href.length<=2048)return url.href;}catch{/* Use the app logo if the configured image is unavailable. */}
 return app+'expo-logo.png';
}
export function conversationInvitation(job){
 const brand=job.branding;
 if(!brand||Object.keys(brand).sort().join(',')!=='logo,name'||typeof brand.name!=='string'||!brand.name.trim()||brand.name.length>200||/[\r\n]/.test(brand.name)||typeof brand.logo!=='string')throw Error('invalid_branding');
 const date=job.on.split('-').reverse().join('.');
 const text=`Du er invitert til medarbeidersamtale ${date} kl. ${job.time} (norsk tid).\nSted: ${job.location}\n\nLogg inn på ${app} og åpne Min side → Mine oppfølginger. Velg riktig firma, åpne samtalen og fyll ut Forberedelse. Lagre svarene og trykk Klar til samtale når du vil dele dem med din leder.\n\nKontakt din leder hvis tidspunktet eller stedet ikke passer. Inne i samtalen kan du bruke Åpne i Outlook / Office 365 og lagre avtalen i ønsket kalender. Invitasjonen legger ikke møtet automatisk i kalenderen din.`;
 const row=(label,value)=>`<tr><td style="padding:8px 12px;color:#cbd5e1;font-size:14px;vertical-align:top;width:90px;">${label}</td><td style="padding:8px 12px;color:#ffffff;font-size:16px;font-weight:bold;overflow-wrap:anywhere;">${escape(value)}</td></tr>`;
 const html=`<!doctype html><html lang="nb"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#51585a;font-family:Arial,Helvetica,sans-serif;color:#dbe7f0;">
 <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#51585a;"><tr><td align="center" style="padding:24px 12px;">
 <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#242424;border:1px solid #dbe7f0;border-radius:18px;">
 <tr><td style="padding:24px;border-bottom:1px solid #dbe7f0;"><table role="presentation" width="100%"><tr><td style="font-size:28px;font-weight:900;color:#ffffff;"><span style="color:#08b9c3;">EXPO</span><br>ProffDok</td><td align="right"><img src="${escape(logoUrl(brand.logo))}" alt="${escape(brand.name)}" width="150" style="max-width:100%;height:auto;background:#ffffff;padding:4px;border:0;"></td></tr></table></td></tr>
 <tr><td style="padding:28px 24px;"><h1 style="margin:0 0 14px;font-size:24px;line-height:1.3;color:#dbe7f0;">Invitasjon til medarbeidersamtale</h1><p style="font-size:16px;line-height:1.6;color:#cbd5e1;">Du er invitert til en samtale med din nærmeste leder.</p>
 <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#5a5d60;border:1px solid #dbe7f0;border-radius:14px;margin:20px 0;">${row('Dato',date)}${row('Klokkeslett',job.time+' (norsk tid)')}${row('Sted',job.location)}</table>
 <p style="font-size:16px;line-height:1.7;color:#ffffff;">Logg inn og åpne <strong>Min side → Mine oppfølginger</strong>. Velg riktig firma, åpne samtalen og fyll ut <strong>Forberedelse</strong>. Lagre svarene og trykk <strong>Klar til samtale</strong> når du vil dele dem med din leder.</p>
 <table role="presentation" cellpadding="0" cellspacing="0"><tr><td bgcolor="#007f89" style="border-radius:12px;"><a href="${app}" style="display:inline-block;padding:14px 24px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:bold;">Åpne Expo ProffDok</a></td></tr></table>
 <p style="font-size:14px;line-height:1.7;color:#cbd5e1;">Inne i samtalen kan du bruke <strong>Åpne i Outlook / Office 365</strong> og lagre avtalen i ønsket kalender. Kontakt din leder hvis tidspunktet eller stedet ikke passer.</p>
 <p style="font-size:13px;line-height:1.6;color:#b8c7d3;">Hvis knappen ikke fungerer: <a href="${app}" style="color:#08d5d8;">${app}</a></p>
 <hr style="border:0;border-top:1px solid #dbe7f0;margin:28px 0;"><p style="margin:0;color:#cbd5e1;">Med vennlig hilsen</p><p style="margin:8px 0;font-size:17px;font-weight:bold;color:#dbe7f0;">${escape(brand.name)}</p><p style="font-size:12px;color:#aebbc7;">Invitasjon sendt gjennom Expo ProffDok.</p></td></tr></table></td></tr></table></body></html>`;
 return {text,html};
}
