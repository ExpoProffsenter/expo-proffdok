import React, { useEffect, useRef, useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import "./workspaceViewMode.css";

// Presentation only: keep every editor and its draft mounted in the same place.
export default function WorkspaceViewMode() {
  const [expanded, setExpanded] = useState(false);
  const control = useRef(null);
  useEffect(() => {
    const shell = control.current?.closest("[data-expo-app-shell]");
    if (!shell) return;
    if (expanded) shell.setAttribute("data-expo-fullscreen", "true");
    else shell.removeAttribute("data-expo-fullscreen");
    return () => shell.removeAttribute("data-expo-fullscreen");
  }, [expanded]);
  const Icon = expanded ? Minimize2 : Maximize2;
  return (
    <div className="workspace-view-control" ref={control}>
      <button
        type="button"
        aria-pressed={expanded}
        aria-label={
          expanded ? "Tilbake til vanlig visning" : "Fullskjermvisning"
        }
        title={
          expanded
            ? "Vis appens toppfelt og meny"
            : "Skjul appens toppfelt og meny"
        }
        onClick={() => setExpanded((value) => !value)}
      >
        <Icon size={17} aria-hidden="true" />
        {expanded ? "Vanlig visning" : "Fullskjermvisning"}
      </button>
    </div>
  );
}
