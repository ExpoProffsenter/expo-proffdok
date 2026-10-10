// Status is computed by the scoped RPC using the Norwegian calendar date.
export function deviationDeadlineLabel(status) {
 const labels={overdue:'Fristen er passert',today:'Frist i dag',soon:'Frist innen tre dager'};
 return Object.hasOwn(labels,status)?labels[status]:'';
}
