const app='https://expo-proffdok.app/';
const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
export function hrNotificationHtml({kind,on,time}){
 const content={
  feedback:{title:'Nytt innspill til medarbeidersamtale',message:'Medarbeideren har delt sin forberedelse eller lagt inn en kommentar til samtalen.',next:'Åpne HR i ProffDok og velg riktig arbeidsprofil for å lese innspillet.',note:'Du mottar dette fordi du er registrert som nærmeste leder.'},
  reminder:{title:'Påminnelse om medarbeidersamtale',message:`Samtalen er avtalt ${on?.split('-').reverse().join('.')} kl. ${time} (norsk tid).`,next:'Åpne HR i ProffDok og velg riktig arbeidsprofil for å se samtalen.',note:'Du har selv valgt denne e-postpåminnelsen.'},
  followup:{title:'Du har en oppfølging i HR',message:'En oppgave du har ansvar for, nærmer seg fristen eller venter på oppfølging.',next:'Åpne HR eller Min side → Mine oppfølginger i ProffDok. Velg riktig arbeidsprofil og se hva som gjenstår.',note:'Kontakt din leder hvis du trenger hjelp med oppgaven.'}
 }[kind];
 if(!content)throw Error('invalid_notification_kind');
 return `<!doctype html><html lang="nb"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#51585a;font-family:Arial,Helvetica,sans-serif;color:#dbe7f0;">
 <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#51585a;"><tr><td align="center" style="padding:24px 12px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#242424;border:1px solid #dbe7f0;border-radius:18px;">
 <tr><td style="padding:24px;border-bottom:1px solid #dbe7f0;"><div aria-label="Expo ProffDok" style="font-size:28px;font-weight:900;line-height:1.2;color:#ffffff;"><span style="color:#08b9c3;">EXPO</span><br>ProffDok</div></td></tr>
 <tr><td style="padding:28px 24px;"><h1 style="margin:0 0 18px;font-size:24px;line-height:1.3;color:#dbe7f0;">${escape(content.title)}</h1><p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#ffffff;">${escape(content.message)}</p><p style="margin:0 0 24px;font-size:16px;line-height:1.7;color:#cbd5e1;">${escape(content.next)}</p>
 <table role="presentation" cellpadding="0" cellspacing="0"><tr><td bgcolor="#007f89" style="border-radius:12px;"><a href="${app}" style="display:inline-block;padding:14px 24px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:bold;">Åpne Expo ProffDok</a></td></tr></table>
 <p style="margin:24px 0 16px;font-size:14px;line-height:1.6;color:#cbd5e1;">${escape(content.note)}</p><p style="font-size:13px;line-height:1.6;color:#b8c7d3;">Hvis knappen ikke fungerer: <a href="${app}" style="color:#08d5d8;">expo-proffdok.app</a></p><hr style="border:0;border-top:1px solid #dbe7f0;margin:28px 0;"><p style="font-size:12px;color:#aebbc7;">Sendt gjennom Expo ProffDok.</p></td></tr></table></td></tr></table></body></html>`;
}
