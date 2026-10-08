import {executionReportDocument,appendExecutionPdf} from './kshmsExecutionReport.mjs';
import { formatDeviationDate, formatDeviationDateTime } from '../deviations/deviationDates.mjs';

export const emptyKshmsReport = () => ({ sjas: [], ruhs: [], rounds: [], risks: [] });
export const kshmsReportSelectionKey = data => JSON.stringify(['sjas','ruhs','rounds','risks'].map(key=>(data?.[key]||[]).map(row=>[row.id,row.revision])));
const identity = value => value?.name || value?.email || 'Ikke oppgitt';
const date = value => formatDeviationDate(value) || 'Ikke oppgitt';
const when = value => formatDeviationDateTime(value) || 'Ikke oppgitt';
const status = value => ({ open: 'Åpen', in_progress: 'Under behandling', closed: 'Lukket' }[value] || 'Ikke oppgitt');

// All renderers use these same fields. Signed content and identity snapshots are
// used verbatim; current routines/profiles never rewrite historical documents.
export function kshmsReportDocuments(data) {
  return [
    ...(data?.sjas || []).map(row => {
      const c = row.content || {}, fields = [
        ['Status', row.status === 'signed' ? 'Signert' : 'UTKAST – IKKE SIGNERT'],
        ['Arbeidssted', c.workplace], ['Egen / ekstern referanse', c.project_reference],
        ['Arbeidsoppgave', c.task], ['Planlagt arbeidsdato', date(c.planned_on)],
        ['Ansvarlig prosjektleder', identity(row.leader_identity)], ['Bedriftens rutiner / utgaver', c.routines],
      ];
      (c.steps || []).forEach((step, i) => {
        fields.push([`Arbeidstrinn ${i + 1}`, step.activity], ['Farer', step.hazard], ['Mulige konsekvenser', step.consequence], ['Tiltak', step.measures], ['Ansvar for tiltak', step.owner], ['Kontroll før arbeid', step.check]);
      });
      fields.push(['Arbeidsutstyr og kontroll', c.equipment], ['Verneutstyr', c.ppe], ['Beredskap og førstehjelp', c.emergency], ['Når skal arbeidet stanses?', c.stop_conditions], ['Dato for gjennomgang', date(c.reviewed_on)], ['Hvordan gjennomgikk dere jobben?', c.communication]);
      (c.participants || []).forEach((person, i) => fields.push([`Deltaker ${i + 1}`, person.name], ['Rolle i jobben', person.role], ['Firma', person.company], ['Bidrag / gjennomgang', person.involvement]));
      if (row.status === 'signed') fields.push(['Prosjektleders elektroniske signatur', identity(row.signed_identity)], ['Signert dato', when(row.signed_at)], ['Signert bekreftelse', row.statement]);
      else fields.push(['Signatur', 'Ikke signert. Dette utkastet dokumenterer ikke godkjenning før arbeid.']);
      return { id: row.id, type: 'SJA – sikker jobbanalyse', title: c.title || 'Uten navn', fields };
    }),
    ...(data?.ruhs || []).map(row => ({ id: row.id, type: 'RUH – rapport om uønsket hendelse', title: row.title, fields: [
      ['Status', status(row.status)], ['Registrert av', identity(row.creator_identity)], ['Registrert dato', when(row.created_at)],
      ['Egen / ekstern referanse', row.project_reference], ['Hendelse', row.event], ['Umiddelbare tiltak', row.immediate_action],
      ['Bedriftens rutiner / utgaver', row.routines], ['Ansvarlig', identity(row.responsible_identity)], ['Behandler', identity(row.handler_identity)], ['Frist', date(row.due_on)],
      ['Årsak', row.cause], ['Utførte tiltak / forbedring', row.improvement_action], ['Videre oppfølging', row.follow_up], ['Egen kontroll av resultatet', row.control_note],
      ...(row.status === 'closed' ? [['Lukket av', identity(row.closed_identity)], ['Lukket dato', when(row.closed_at)]] : [['Lukking', 'Ikke lukket. Oppfølging gjenstår.']]),
    ] })),
    ...(data?.rounds||[]).map(executionReportDocument),
    ...(data?.risks||[]).map(executionReportDocument),
  ];
}

// KS fields can be 20,000 characters. Write line by line so valid long content
// never runs through the footer or off the page in the existing jsPDF report.
export function appendKshmsPdfReport(doc, data, { margin = 14 } = {}) {
 let y=null;
 for(const document of kshmsReportDocuments(data))y=appendExecutionPdf(doc,document,{margin});
 return y;
}
