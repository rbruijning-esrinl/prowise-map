export default async function install(app) {
  const host = document.getElementById('app-widget-host-place-search');
  const search = document.getElementById('app-widget-place-search');
  const root = host?.shadowRoot;
  app.assert(root && search, 'Search widget is not rendered');
  const touched = new Map();
  const properties = ['display', 'background', 'box-shadow', 'pointer-events'];
  function wrapper() {
    const inner = root.querySelector('calcite-popover > div > .content-container');
    const outer = inner?.parentElement;
    return outer?.parentElement?.localName === 'calcite-popover' ? outer : null;
  }
  function apply() {
    const el = wrapper();
    if (!el) return;
    if (!touched.has(el)) {
      touched.set(el, {hadClass: el.classList.contains('popover-content'), styles: properties.map(name => [name, el.style.getPropertyValue(name), el.style.getPropertyPriority(name)])});
    }
    el.classList.remove('popover-content');
    el.style.setProperty('display', 'flex', 'important');
    el.style.setProperty('background', 'transparent', 'important');
    el.style.setProperty('box-shadow', 'none', 'important');
    el.style.setProperty('pointer-events', 'none', 'important');
  }
  const before = search.getBoundingClientRect();
  apply();
  const observer = new MutationObserver(records => {
    if (records.some(record => record.type === 'childList' || (record.type === 'attributes' && record.attributeName === 'class'))) apply();
  });
  observer.observe(root, {childList: true, subtree: true, attributes: true, attributeFilter: ['class']});
  app.onCleanup(() => {
    observer.disconnect();
    for (const [el, original] of touched) {
      if (original.hadClass) el.classList.add('popover-content');
      for (const [name, value, priority] of original.styles) {
        if (value) el.style.setProperty(name, value, priority);
        else el.style.removeProperty(name);
      }
    }
  });
  await new Promise(resolve => requestAnimationFrame(resolve));
  const el = wrapper();
  app.assert(el && !el.classList.contains('popover-content'), 'Search wrapper class remains');
  const after = search.getBoundingClientRect();
  const rect = el.getBoundingClientRect();
  const slot = el.querySelector('slot');
  return {classRemoved: true, wrapperDisplay: getComputedStyle(el).display, wrapperSize: [rect.width, rect.height], searchSizeBefore: [before.width, before.height], searchSizeAfter: [after.width, after.height], searchTopBefore: before.top, searchTopAfter: after.top, searchStillSlotted: !!slot?.assignedElements().includes(search), searchInputPresent: !!search.shadowRoot?.querySelector('calcite-autocomplete')};
}