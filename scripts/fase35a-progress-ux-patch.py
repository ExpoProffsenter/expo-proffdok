from pathlib import Path

ux_path = Path('src/modules/progress/progressPlanUxV2.jsx')
css_path = Path('src/modules/progress/progressPlanLayout.css')
ux = ux_path.read_text(encoding='utf-8')
css = css_path.read_text(encoding='utf-8')

def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected exactly 1 match, found {count}')
    return text.replace(old, new, 1)

ux = replace_once(
    ux,
    "  const [showOperationPicker, setShowOperationPicker] = useState(false);\n",
    "  const [showOperationPicker, setShowOperationPicker] = useState(false);\n  const [highlightedActivityId, setHighlightedActivityId] = useState('');\n",
    'highlight state',
)

ux = replace_once(
    ux,
    "  const addOwnActivity = () => {\n    const activity = newActivity();\n    markPlan((prev) => ({ ...prev, activities: [...prev.activities, activity] }));\n    setExpandedActivityId(activity.id);\n    setShowOperationPicker(false);\n  };\n",
    "  const focusActivity = (activityId) => {\n    setExpandedActivityId(activityId);\n    setHighlightedActivityId(activityId);\n    window.setTimeout(() => {\n      const targets = Array.from(document.querySelectorAll(`[data-progress-activity-id=\"${activityId}\"]`));\n      const target = targets.find((element) => element.offsetParent !== null) || targets[0];\n      target?.scrollIntoView({ behavior: 'smooth', block: 'center' });\n    }, 80);\n    window.setTimeout(() => {\n      setHighlightedActivityId((current) => current === activityId ? '' : current);\n    }, 1800);\n  };\n\n  const addOwnActivity = () => {\n    const activity = newActivity();\n    markPlan((prev) => ({ ...prev, activities: [...prev.activities, activity] }));\n    setShowOperationPicker(false);\n    focusActivity(activity.id);\n  };\n",
    'own activity focus',
)

ux = replace_once(
    ux,
    "    markPlan((prev) => ({ ...prev, activities: [...prev.activities, activity] }));\n    setNotice(`${operation.title} ble lagt til som arbeidsoperasjon.`);\n  };\n",
    "    markPlan((prev) => ({ ...prev, activities: [...prev.activities, activity] }));\n    setShowOperationPicker(false);\n    focusActivity(activity.id);\n    setNotice(`${operation.title} ble lagt til som arbeidsoperasjon.`);\n  };\n",
    'suggested activity focus',
)

ux = replace_once(
    ux,
    "      </section>\n\n      {!readOnly && showOperationPicker ? (\n",
    "      </section>\n\n      {!readOnly ? (\n        <div className=\"progress-sticky-actions\" aria-label=\"Fremdrift handlinger\">\n          <button type=\"button\" className=\"progress-secondary\" onClick={() => setShowOperationPicker((value) => !value)}>\n            + Arbeidsoperasjoner\n          </button>\n          <button type=\"button\" className=\"progress-secondary\" onClick={addOwnActivity}>\n            + Egen arbeidsoperasjon\n          </button>\n          <button type=\"button\" className=\"progress-primary\" onClick={save} disabled={!dirty || saving}>\n            {saving ? 'Lagrer…' : dirty ? 'Lagre fremdriftsplan' : 'Lagret'}\n          </button>\n        </div>\n      ) : null}\n\n      {!readOnly && showOperationPicker ? (\n",
    'sticky action bar',
)

ux = replace_once(
    ux,
    "                    <div className=\"progress-activity-cell progress-sticky-left\">\n",
    "                    <div\n                      data-progress-activity-id={activity.id}\n                      className={`progress-activity-cell progress-sticky-left${highlightedActivityId === activity.id ? ' progress-activity-highlight' : ''}`}\n                    >\n",
    'desktop activity marker',
)

ux = replace_once(
    ux,
    "          <article key={`mobile-${activity.id}`} className=\"progress-mobile-card\">\n",
    "          <article\n            key={`mobile-${activity.id}`}\n            data-progress-activity-id={activity.id}\n            className={`progress-mobile-card${highlightedActivityId === activity.id ? ' progress-activity-highlight' : ''}`}\n          >\n",
    'mobile activity marker',
)

css_marker = '/* FASE35A_STICKY_ACTIONS */'
if css_marker in css:
    raise SystemExit('sticky CSS marker already exists')
css += """

/* FASE35A_STICKY_ACTIONS */
#expo-progress-plan-root .progress-sticky-actions {
  position: sticky;
  top: 10px;
  z-index: 12;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 9px 10px;
  border: 1px solid #d9e4e8;
  border-radius: 14px;
  background: rgba(255,255,255,.95);
  box-shadow: 0 10px 28px rgba(20,42,52,.12);
  backdrop-filter: blur(10px);
}

#expo-progress-plan-root .progress-activity-highlight {
  animation: expoProgressActivityHighlight 1.8s ease-out;
}

@keyframes expoProgressActivityHighlight {
  0%, 35% { box-shadow: inset 0 0 0 3px rgba(18,174,183,.28); background: #eefafb; }
  100% { box-shadow: none; }
}

@media (max-width: 820px) {
  #expo-progress-plan-root .progress-sticky-actions {
    top: 8px;
    justify-content: stretch;
  }
  #expo-progress-plan-root .progress-sticky-actions .progress-secondary,
  #expo-progress-plan-root .progress-sticky-actions .progress-primary {
    flex: 1 1 auto;
  }
}
"""

ux_path.write_text(ux, encoding='utf-8')
css_path.write_text(css, encoding='utf-8')
print('Fase 35A UX patch applied')
