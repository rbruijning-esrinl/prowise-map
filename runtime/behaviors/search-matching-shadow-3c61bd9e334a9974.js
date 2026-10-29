export default function install(app) {
  const panel = document.querySelector('section[aria-label="Thema\'s"]');
  const host = document.getElementById('app-widget-host-place-search');
  const search = document.getElementById('app-widget-place-search');
  app.assert(panel && host && search, 'Thema panel and search container are required');

  const style = document.createElement('style');
  document.head.append(style);
  app.onCleanup(() => style.remove());

  const apply = () => {
    const shadow = getComputedStyle(panel).boxShadow;
    style.textContent = `#app-widget-host-place-search { box-shadow: ${shadow} !important; } #app-widget-host-place-search::part(content) { box-shadow: ${shadow} !important; }`;
  };
  apply();

  const observer = new MutationObserver(apply);
  observer.observe(panel, { attributes: true, attributeFilter: ['style', 'class'] });
  app.onCleanup(() => observer.disconnect());

  const inspect = () => ({
    themaShadow: getComputedStyle(panel).boxShadow,
    containerShadow: getComputedStyle(host).boxShadow,
    shadowApplied: getComputedStyle(host).boxShadow !== 'none'
  });
  app.actions.register('inspect-search-shadow', inspect);
  return inspect();
}