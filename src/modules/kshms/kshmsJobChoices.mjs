export const routineNumber = number => Number.isSafeInteger(Number(number)) && Number(number) > 0 ? `R-${String(number).padStart(3, '0')}` : '';
export const routineReference = row => `${routineNumber(row.reference_number)} – ${row.content.title} (versjon ${row.number})`;
