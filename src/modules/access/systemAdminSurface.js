// Legacy adapters belong to the Systemadmin section, even when Firmaadmin is visible.
export function findSystemAdminElements(selector) {
  const sections = Array.from(document.querySelectorAll('section')).filter(section => {
    if (section.closest('[data-company-admin="unified"]')) return false;
    const heading = Array.from(section.children).find(node => node.tagName === 'H2');
    return heading?.textContent.replace(/\s+/g, ' ').trim() === 'Systemadmin';
  });
  return sections.flatMap(section => Array.from(section.querySelectorAll(selector)))
    .filter(node => !node.closest('[data-company-admin="unified"]'));
}
