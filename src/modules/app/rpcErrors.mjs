// Keep legacy responses readable during staged database/client deployments.
export function isRpcConflict(error) {
  return error?.code === 'PT409' || error?.code === '40001';
}
