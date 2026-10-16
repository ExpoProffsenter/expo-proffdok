// Drafts are scoped to company, actor and plan. Read server revision before use.
const memory = new Map();
const keyFor = key => 'expo:kshms-progress-draft:v1:' + key;
const storage = () => globalThis.window?.localStorage;
export const progressDrafts = {
  get(key) {
    if (memory.has(key)) return memory.get(key);
    try {
      const value = JSON.parse(storage()?.getItem(keyFor(key)) || 'null');
      if (Number.isInteger(value?.revision) && value.revision > 0 && value.plan?.version === 1 && Array.isArray(value.plan.activities)) {
        memory.set(key, value);
        return value;
      }
    } catch { /* Memory still protects drafts when browser storage is unavailable. */ }
    return undefined;
  },
  has(key) { return Boolean(this.get(key)); },
  set(key, value) {
    memory.set(key, value);
    try { storage()?.setItem(keyFor(key), JSON.stringify(value)); } catch { /* Keep memory draft. */ }
  },
  delete(key) {
    memory.delete(key);
    try { storage()?.removeItem(keyFor(key)); } catch { /* Server remains authoritative. */ }
  },
};
