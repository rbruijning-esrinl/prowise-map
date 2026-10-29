export default function install(app) {
  const host=document.getElementById('app-widget-host-place-search');
  const popover=host?.shadowRoot?.querySelector('calcite-popover');
  app.assert(popover?.shadowRoot,'Search popover missing');
  const style=document.createElement('style');
  style.textContent=':host > div > div { background:transparent!important;box-shadow:none!important;border:0!important;pointer-events:none!important; } :host > div > div > svg {display:none!important}';
  popover.shadowRoot.append(style);
  const wrapperStyle=document.createElement('style');
  wrapperStyle.textContent='.popover-content, .content-container {background:transparent!important;box-shadow:none!important;pointer-events:none!important}';
  host.shadowRoot.append(wrapperStyle);
  const searchStyle=document.createElement('style');
  searchStyle.textContent='#app-widget-place-search{pointer-events:auto!important}';
  document.head.append(searchStyle);
  const inspect=()=>{const shell=popover.shadowRoot.querySelector('.container'),inner=host.shadowRoot.querySelector('.content-container'),search=document.getElementById('app-widget-place-search');const describe=e=>{if(!e)return null;const r=e.getBoundingClientRect(),s=getComputedStyle(e);return {left:r.left,top:r.top,width:r.width,height:r.height,background:s.backgroundColor,shadow:s.boxShadow,pointerEvents:s.pointerEvents}};return {shell:describe(shell),innerWrapper:describe(inner),search:describe(search),searchBar:describe(search?.shadowRoot?.firstElementChild),arrowDisplay:shell?.querySelector('svg')&&getComputedStyle(shell.querySelector('svg')).display}};
  app.actions.register('inspect-empty-search-popover',inspect);
  app.onCleanup(()=>{style.remove();wrapperStyle.remove();searchStyle.remove()});
  return inspect();
}