import { useCallback, useRef, useState } from "react";
// UI pointers and search text, never copied contact records, prices or authority. Each ID
// must still occur in the fresh server response before its content is rendered.
export function useBoligUiState(context, name, initial) {
  const key = `expo-proffdok.bolig-ui.v1:${context.user_id}:${context.company_id}:${name}`;
  const [value, setValue] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(key)) ?? initial;
    } catch {
      return initial;
    }
  });
  const latest = useRef(value);
  const update = useCallback(
    (next) => {
      const resolved = typeof next === "function" ? next(latest.current) : next;
      latest.current = resolved;
      try {
        sessionStorage.setItem(key, JSON.stringify(resolved));
      } catch {}
      setValue(resolved);
    },
    [key],
  );
  return [value, update];
}
