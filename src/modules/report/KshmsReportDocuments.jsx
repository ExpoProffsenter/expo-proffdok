import { kshmsReportDocuments } from './kshmsProjectReport.mjs';
import KshmsExecutionReportBlocks from './KshmsExecutionReportBlocks.jsx';

export default function KshmsReportDocuments({ data }) {
  const documents = kshmsReportDocuments(data);
  if (!documents.length) return null;
  return <div className="ks-project-report-documents">
    {documents.map(document => <section key={`${document.type}:${document.id}`}>
      <h2>{document.type}</h2><h3>{document.title}</h3>
      <dl>{document.fields.map(([label, value], i) => <div key={i} className="ks-report-field"><dt><strong>{label}</strong></dt><dd style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', margin: '4px 0 12px' }}>{value || 'Ikke fylt ut'}</dd></div>)}</dl>
      {document.blocks&&<KshmsExecutionReportBlocks document={document}/>}
    </section>)}
  </div>;
}
