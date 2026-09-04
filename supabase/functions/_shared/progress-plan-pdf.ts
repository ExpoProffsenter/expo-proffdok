import { PDFDocument, StandardFonts, rgb } from "npm:pdf-lib@1.17.1";

const PAGE_WIDTH = 841.89;
const PAGE_HEIGHT = 595.28;
const MARGIN = 28;
const LEFT_COL = 215;
const MAX_WEEKS_PER_PAGE = 8;
const MAX_ACTIVITIES_PER_PAGE = 13;

const COLORS = {
  dark: rgb(23 / 255, 33 / 255, 38 / 255),
  darkSoft: rgb(38 / 255, 52 / 255, 58 / 255),
  teal: rgb(18 / 255, 174 / 255, 183 / 255),
  border: rgb(219 / 255, 230 / 255, 233 / 255),
  light: rgb(248 / 255, 251 / 255, 251 / 255),
  text: rgb(23 / 255, 33 / 255, 38 / 255),
  muted: rgb(100 / 255, 116 / 255, 124 / 255),
  todo: rgb(223 / 255, 232 / 255, 236 / 255),
  active: rgb(247 / 255, 203 / 255, 102 / 255),
  waiting: rgb(159 / 255, 195 / 255, 245 / 255),
  done: rgb(145 / 255, 221 / 255, 176 / 255),
};

const clean = (value: unknown) => String(value ?? "").replace(/\s+/g, " ").trim();
const safeText = (value: unknown) => clean(value)
  .replaceAll("–", "-")
  .replaceAll("—", "-")
  .replaceAll("…", "...")
  .replaceAll("•", "-");

const parseIso = (value: unknown) => {
  const match = clean(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12));
  return Number.isNaN(date.getTime()) ? null : date;
};

const isoDate = (date: Date) => `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
};
const mondayOf = (date: Date) => {
  const next = new Date(date);
  const day = next.getUTCDay() || 7;
  next.setUTCDate(next.getUTCDate() - day + 1);
  return next;
};
const isoWeekNumber = (dateValue: Date) => {
  const date = new Date(Date.UTC(dateValue.getUTCFullYear(), dateValue.getUTCMonth(), dateValue.getUTCDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};
const formatDate = (value: unknown) => {
  const date = parseIso(value);
  return date ? `${String(date.getUTCDate()).padStart(2, "0")}.${String(date.getUTCMonth() + 1).padStart(2, "0")}.${date.getUTCFullYear()}` : clean(value);
};
const formatShortDate = (value: unknown) => {
  const date = parseIso(value);
  return date ? `${String(date.getUTCDate()).padStart(2, "0")}.${String(date.getUTCMonth() + 1).padStart(2, "0")}` : clean(value);
};

function allSessions(activities: any[]) {
  return activities
    .flatMap((activity) => (Array.isArray(activity?.sessions) ? activity.sessions : []).map((session: any) => ({ activity, session })))
    .filter(({ session }) => parseIso(session?.date))
    .sort((a, b) => `${a.session.date}${a.session.startTime || ""}`.localeCompare(`${b.session.date}${b.session.startTime || ""}`));
}

function makeWeeks(activities: any[]) {
  const sessions = allSessions(activities);
  if (!sessions.length) return [];
  const first = mondayOf(parseIso(sessions[0].session.date)!);
  const last = mondayOf(parseIso(sessions[sessions.length - 1].session.date)!);
  const count = Math.max(1, Math.round((last.getTime() - first.getTime()) / (7 * 86400000)) + 1);
  return Array.from({ length: count }, (_, index) => {
    const start = addDays(first, index * 7);
    return {
      index: index + 1,
      key: isoDate(start),
      start,
      end: addDays(start, 6),
      calendarWeek: isoWeekNumber(start),
    };
  });
}

function chunk<T>(items: T[], size: number) {
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += size) result.push(items.slice(index, index + size));
  return result;
}

function statusColor(status: unknown) {
  const value = clean(status);
  if (value === "Ferdig") return COLORS.done;
  if (value === "Pågår") return COLORS.active;
  if (value === "Avventer") return COLORS.waiting;
  return COLORS.todo;
}

function sessionsInWeek(activity: any, week: any) {
  return (Array.isArray(activity?.sessions) ? activity.sessions : [])
    .filter((session: any) => {
      const date = parseIso(session?.date);
      return date && date >= week.start && date <= week.end;
    })
    .sort((a: any, b: any) => `${a.date}${a.startTime || ""}`.localeCompare(`${b.date}${b.startTime || ""}`));
}

function fitText(text: unknown, font: any, size: number, maxWidth: number) {
  const value = safeText(text);
  if (!value || maxWidth <= 5) return "";
  if (font.widthOfTextAtSize(value, size) <= maxWidth) return value;
  let current = value;
  while (current.length > 1 && font.widthOfTextAtSize(`${current}...`, size) > maxWidth) current = current.slice(0, -1);
  return `${current}...`;
}

function sanitizeFilename(value: unknown) {
  const base = safeText(value || "fremdriftsplan")
    .replace(/[<>:"/\\|?*]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${base || "fremdriftsplan"}-fremdrift.pdf`;
}

function drawHeader(page: any, fonts: any, input: any, generatedLabel: string) {
  page.drawRectangle({ x: 0, y: PAGE_HEIGHT - 92, width: PAGE_WIDTH, height: 92, color: COLORS.dark });
  page.drawText(fitText(input.companyName || "Expo ProffDok", fonts.bold, 12, 360), {
    x: MARGIN, y: PAGE_HEIGHT - 34, size: 12, font: fonts.bold, color: rgb(1, 1, 1),
  });
  page.drawText("FREMDRIFTSPLAN", {
    x: PAGE_WIDTH - 170, y: PAGE_HEIGHT - 30, size: 9, font: fonts.bold, color: COLORS.teal,
  });
  page.drawText(fitText(generatedLabel, fonts.regular, 7, 145), {
    x: PAGE_WIDTH - 170, y: PAGE_HEIGHT - 43, size: 7, font: fonts.regular, color: rgb(.82, .9, .91),
  });
  page.drawText(fitText(input.projectName || "Prosjekt", fonts.bold, 24, 620), {
    x: MARGIN, y: PAGE_HEIGHT - 68, size: 24, font: fonts.bold, color: rgb(1, 1, 1),
  });
  if (clean(input.address)) {
    page.drawText(fitText(input.address, fonts.regular, 10, 620), {
      x: MARGIN, y: PAGE_HEIGHT - 83, size: 10, font: fonts.regular, color: rgb(.84, .91, .92),
    });
  }
}

function drawMeta(page: any, fonts: any, input: any, activities: any[], weeks: any[], sessions: any[]) {
  const first = sessions[0]?.session?.date || "";
  const last = sessions[sessions.length - 1]?.session?.date || "";
  const period = first && last ? (first === last ? formatDate(first) : `${formatDate(first)} - ${formatDate(last)}`) : "Ikke datofestet";
  const boxes = [
    ["Kunde", input.customer || "-", 180],
    ["Planlagt periode", period, 180],
    ["Prosjektuker", String(weeks.length || "-"), 105],
    ["Omfang", `${activities.length} operasjoner / ${sessions.length} økter`, 190],
  ];
  let x = MARGIN;
  const y = PAGE_HEIGHT - 135;
  for (const [label, value, width] of boxes) {
    page.drawRectangle({ x, y, width: Number(width), height: 31, color: COLORS.light, borderColor: COLORS.border, borderWidth: 0.7 });
    page.drawText(String(label).toUpperCase(), { x: x + 7, y: y + 20, size: 6, font: fonts.bold, color: COLORS.muted });
    page.drawText(fitText(value, fonts.bold, 8, Number(width) - 14), { x: x + 7, y: y + 8, size: 8, font: fonts.bold, color: COLORS.text });
    x += Number(width) + 7;
  }

  const statuses = ["Ikke startet", "Pågår", "Avventer", "Ferdig"];
  x = MARGIN;
  for (const status of statuses) {
    const count = activities.filter((activity) => clean(activity?.status) === status).length;
    const width = 95;
    page.drawRectangle({ x, y: y - 20, width, height: 14, color: statusColor(status), borderColor: COLORS.border, borderWidth: 0.5 });
    page.drawText(`${safeText(status)}  ${count}`, { x: x + 6, y: y - 16, size: 6.5, font: fonts.bold, color: COLORS.text });
    x += width + 7;
  }
}

function drawFooter(page: any, fonts: any, input: any, pageNumber: number, pageCount: number) {
  page.drawText(`Expo ProffDok  |  ${safeText(input.projectName)}  |  Side ${pageNumber}/${pageCount}`, {
    x: MARGIN, y: 16, size: 6, font: fonts.regular, color: COLORS.muted,
  });
}

function drawSummaryPage(page: any, fonts: any, input: any, activities: any[], weeks: any[], sessions: any[], generatedLabel: string, pageCount: number) {
  drawHeader(page, fonts, input, generatedLabel);
  drawMeta(page, fonts, input, activities, weeks, sessions);

  const headingY = PAGE_HEIGHT - 185;
  page.drawText("Planoversikt", { x: MARGIN, y: headingY, size: 13, font: fonts.bold, color: COLORS.text });
  page.drawLine({ start: { x: MARGIN, y: headingY - 5 }, end: { x: PAGE_WIDTH - MARGIN, y: headingY - 5 }, thickness: 1, color: COLORS.dark });

  const visible = activities.slice(0, 24);
  const perColumn = 12;
  const columnWidth = (PAGE_WIDTH - (2 * MARGIN) - 18) / 2;
  visible.forEach((activity, index) => {
    const column = Math.floor(index / perColumn);
    const row = index % perColumn;
    const x = MARGIN + column * (columnWidth + 18);
    const y = headingY - 30 - row * 25;
    page.drawRectangle({ x, y, width: columnWidth, height: 21, color: row % 2 ? COLORS.light : rgb(1, 1, 1), borderColor: COLORS.border, borderWidth: 0.5 });
    page.drawText(String(index + 1), { x: x + 6, y: y + 8, size: 6, font: fonts.bold, color: COLORS.muted });
    page.drawText(fitText(activity?.title || "Arbeidsoperasjon", fonts.bold, 7.5, columnWidth - 125), { x: x + 23, y: y + 12, size: 7.5, font: fonts.bold, color: COLORS.text });
    const resource = [clean(activity?.trade), clean(activity?.resource)].filter(Boolean).join(" / ") || "Ansvar ikke valgt";
    page.drawText(fitText(resource, fonts.regular, 5.5, columnWidth - 125), { x: x + 23, y: y + 4, size: 5.5, font: fonts.regular, color: COLORS.muted });
    page.drawRectangle({ x: x + columnWidth - 92, y: y + 5, width: 43, height: 11, color: statusColor(activity?.status), borderColor: COLORS.border, borderWidth: 0.4 });
    page.drawText(fitText(activity?.status || "Ikke startet", fonts.bold, 4.8, 39), { x: x + columnWidth - 90, y: y + 8.5, size: 4.8, font: fonts.bold, color: COLORS.text });
    const count = Array.isArray(activity?.sessions) ? activity.sessions.filter((session: any) => parseIso(session?.date)).length : 0;
    page.drawText(`${count} økt${count === 1 ? "" : "er"}`, { x: x + columnWidth - 42, y: y + 8.5, size: 5.2, font: fonts.bold, color: COLORS.muted });
  });

  if (activities.length > visible.length) {
    page.drawText(`+ ${activities.length - visible.length} flere arbeidsoperasjoner vises i Gantt-planen.`, {
      x: MARGIN, y: 48, size: 7, font: fonts.regular, color: COLORS.muted,
    });
  }
  drawFooter(page, fonts, input, 1, pageCount);
}

function drawGanttPage(page: any, fonts: any, input: any, activityGroup: any[], weekGroup: any[], pageNumber: number, pageCount: number, generatedLabel: string, globalActivityOffset: number) {
  drawHeader(page, fonts, input, generatedLabel);
  const top = PAGE_HEIGHT - 118;
  page.drawText(`Gantt-plan - prosjektuke ${weekGroup[0].index}-${weekGroup[weekGroup.length - 1].index}`, {
    x: MARGIN, y: top, size: 11, font: fonts.bold, color: COLORS.text,
  });

  const gridTop = top - 12;
  const gridWidth = PAGE_WIDTH - (2 * MARGIN);
  const weeksWidth = gridWidth - LEFT_COL;
  const weekWidth = weeksWidth / weekGroup.length;
  const headerHeight = 30;
  const rowHeight = 28;

  page.drawRectangle({ x: MARGIN, y: gridTop - headerHeight, width: LEFT_COL, height: headerHeight, color: COLORS.dark });
  page.drawText("ARBEIDSOPERASJON", { x: MARGIN + 8, y: gridTop - 19, size: 7, font: fonts.bold, color: rgb(1, 1, 1) });

  weekGroup.forEach((week, index) => {
    const x = MARGIN + LEFT_COL + (index * weekWidth);
    page.drawRectangle({ x, y: gridTop - headerHeight, width: weekWidth, height: headerHeight, color: COLORS.dark, borderColor: COLORS.darkSoft, borderWidth: 0.5 });
    page.drawText(fitText(`Prosjektuke ${week.index}`, fonts.bold, 7, weekWidth - 4), { x: x + 2, y: gridTop - 11, size: 7, font: fonts.bold, color: COLORS.teal });
    page.drawText(`Uke ${week.calendarWeek}`, { x: x + 2, y: gridTop - 21, size: 6, font: fonts.bold, color: rgb(1, 1, 1) });
    page.drawText(`${formatShortDate(isoDate(week.start))}-${formatShortDate(isoDate(week.end))}`, { x: x + 2, y: gridTop - 28, size: 5, font: fonts.regular, color: rgb(.8, .87, .88) });
  });

  activityGroup.forEach((activity, rowIndex) => {
    const y = gridTop - headerHeight - ((rowIndex + 1) * rowHeight);
    page.drawRectangle({ x: MARGIN, y, width: gridWidth, height: rowHeight, color: rowIndex % 2 ? COLORS.light : rgb(1, 1, 1), borderColor: COLORS.border, borderWidth: 0.5 });
    page.drawLine({ start: { x: MARGIN + LEFT_COL, y }, end: { x: MARGIN + LEFT_COL, y: y + rowHeight }, thickness: 0.5, color: COLORS.border });
    const number = globalActivityOffset + rowIndex + 1;
    page.drawText(String(number), { x: MARGIN + 6, y: y + 17, size: 6, font: fonts.bold, color: COLORS.muted });
    page.drawText(fitText(activity?.title || "Arbeidsoperasjon", fonts.bold, 7.5, LEFT_COL - 68), { x: MARGIN + 22, y: y + 17, size: 7.5, font: fonts.bold, color: COLORS.text });
    const resource = [clean(activity?.trade), clean(activity?.resource)].filter(Boolean).join(" / ") || "Ansvar ikke valgt";
    page.drawText(fitText(resource, fonts.regular, 5.5, LEFT_COL - 68), { x: MARGIN + 22, y: y + 7, size: 5.5, font: fonts.regular, color: COLORS.muted });
    page.drawRectangle({ x: MARGIN + LEFT_COL - 43, y: y + 8, width: 37, height: 12, color: statusColor(activity?.status), borderColor: COLORS.border, borderWidth: 0.4 });
    page.drawText(fitText(activity?.status || "Ikke startet", fonts.bold, 4.8, 33), { x: MARGIN + LEFT_COL - 41, y: y + 12, size: 4.8, font: fonts.bold, color: COLORS.text });

    weekGroup.forEach((week, weekIndex) => {
      const x = MARGIN + LEFT_COL + (weekIndex * weekWidth);
      if (weekIndex > 0) page.drawLine({ start: { x, y }, end: { x, y: y + rowHeight }, thickness: 0.35, color: COLORS.border });
      const allWeekSessions = sessionsInWeek(activity, week);
      const visibleSessions = allWeekSessions.slice(0, 2);
      visibleSessions.forEach((session: any, sessionIndex: number) => {
        const label = `${formatShortDate(session.date)} ${clean(session.startTime) || ""}${clean(session.endTime) ? `-${clean(session.endTime)}` : ""}`.trim();
        const barY = y + 5 + (sessionIndex * 9);
        page.drawRectangle({ x: x + 3, y: barY, width: Math.max(10, weekWidth - 6), height: 7, color: statusColor(activity?.status), borderColor: COLORS.border, borderWidth: 0.35 });
        page.drawText(fitText(label, fonts.bold, 4.7, weekWidth - 10), { x: x + 5, y: barY + 2, size: 4.7, font: fonts.bold, color: COLORS.text });
      });
      if (allWeekSessions.length > 2) {
        page.drawText(`+${allWeekSessions.length - 2}`, { x: x + weekWidth - 13, y: y + 2, size: 4.5, font: fonts.bold, color: COLORS.muted });
      }
    });
  });

  drawFooter(page, fonts, input, pageNumber, pageCount);
}

export async function buildProgressPlanPdf(input: {
  projectName?: string;
  address?: string;
  customer?: string;
  companyName?: string;
  plan?: any;
  generatedAt?: Date;
}) {
  const activities = Array.isArray(input?.plan?.activities) ? input.plan.activities : [];
  const sessions = allSessions(activities);
  if (!activities.length) throw new Error("Fremdriftsplanen har ingen arbeidsoperasjoner.");
  if (!sessions.length) throw new Error("Fremdriftsplanen har ingen daterte arbeidsøkter.");

  const weeks = makeWeeks(activities);
  const weekGroups = chunk(weeks, MAX_WEEKS_PER_PAGE);
  const activityGroups = chunk(activities, MAX_ACTIVITIES_PER_PAGE);
  const pageSpecs = weekGroups.flatMap((weekGroup) => activityGroups.map((activityGroup, activityGroupIndex) => ({ weekGroup, activityGroup, activityGroupIndex })));
  const pageCount = 1 + pageSpecs.length;

  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const fonts = { regular, bold };
  const generated = input.generatedAt || new Date();
  const generatedLabel = `Generert ${String(generated.getDate()).padStart(2, "0")}.${String(generated.getMonth() + 1).padStart(2, "0")}.${generated.getFullYear()} ${String(generated.getHours()).padStart(2, "0")}:${String(generated.getMinutes()).padStart(2, "0")}`;

  const summary = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  drawSummaryPage(summary, fonts, input, activities, weeks, sessions, generatedLabel, pageCount);

  pageSpecs.forEach((spec, index) => {
    const page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    drawGanttPage(
      page,
      fonts,
      input,
      spec.activityGroup,
      spec.weekGroup,
      index + 2,
      pageCount,
      generatedLabel,
      spec.activityGroupIndex * MAX_ACTIVITIES_PER_PAGE,
    );
  });

  const bytes = await pdf.save();
  return {
    bytes,
    filename: sanitizeFilename(input.projectName || "fremdriftsplan"),
    activityCount: activities.length,
    sessionCount: sessions.length,
    weekCount: weeks.length,
  };
}
