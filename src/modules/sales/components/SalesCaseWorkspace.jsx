import SalesCaseCustomerPreview from "./SalesCaseCustomerPreview.jsx";

// Opening the reading panel only changes its local dialog state. The native
// editor remains the same child with the same key and callbacks throughout.
export default function SalesCaseWorkspace({ request, companyProfile, children, tools }) {
  return <>
    <div className="sales-case-editor-tools">{tools}</div>
    <div className="sales-case-workspace sales-case-editor-workspace">
    <div className="sales-case-work-content">{children}</div>
    <SalesCaseCustomerPreview request={request} companyProfile={companyProfile} />
    </div>
  </>;
}
