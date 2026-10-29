export default function install(app) {
  const host=document.getElementById('app-widget-host-place-search');
  const search=document.getElementById('app-widget-place-search');
  app.assert(host&&search,'Search widget missing');
  const panel=document.querySelector('section[aria-label="Thema\'s"]');
  app.assert(panel?.firstElementChild,'Thema header missing');
  const header=panel.firstElementChild;
  const viewElement=app.view.container;
  const style=document.createElement('style');
  style.textContent=`#app-widget-host-place-search{width:var(--thema-search-width,min(460px,calc(100vw - 32px)))!important;max-width:calc(100vw - 32px);height:var(--thema-header-height,auto)!important;border-radius:20px;font-family:Poppins,sans-serif!important;font-size:18px!important;font-weight:500!important;--calcite-font-family:Poppins,sans-serif}#app-widget-host-place-search::part(content){border-radius:20px}#app-widget-place-search{display:block;width:var(--thema-search-width,min(460px,calc(100vw - 32px)))!important;max-width:calc(100vw - 32px);height:var(--thema-header-height,auto)!important;border-radius:20px;font-family:Poppins,sans-serif!important;font-size:18px!important;font-weight:500!important;--calcite-font-family:Poppins,sans-serif}#app-widget-place-search::part(search-input),#app-widget-place-search::part(input),#app-widget-place-search::part(container){border-radius:20px;font-family:Poppins,sans-serif;font-size:18px;font-weight:500;height:var(--thema-header-height,auto)!important}`;
  document.head.append(style);host.expanded=true;
  const inserted=[];
  const apply=()=>{const root=search.shadowRoot,auto=root?.querySelector('calcite-autocomplete'),field=auto?.shadowRoot?.querySelector('calcite-input');
    for(const [sr,extra] of [[root,':host > div:first-child {border-radius:20px!important;background:#fff!important;height:var(--thema-header-height,auto)!important;box-sizing:border-box!important}'],[auto?.shadowRoot,''],[field?.shadowRoot,'']]){if(!sr||inserted.some(x=>x.parentNode===sr))continue;const s=document.createElement('style');s.textContent=':host {font-family:Poppins,sans-serif!important;font-size:18px!important;font-weight:500!important} input, input::placeholder, .input, [part="input"]{font-family:Poppins,sans-serif!important;font-size:18px!important;font-weight:500!important}'+extra;sr.append(s);inserted.push(s)}
    return {auto:!!auto,field:!!field,fieldShadow:!!field?.shadowRoot,input:!!field?.shadowRoot?.querySelector('input')};};
  let frame=0;
  function align(){frame=0;if(!host.isConnected||!header.isConnected)return;
    const v=viewElement.getBoundingClientRect(),p=panel.getBoundingClientRect(),h=header.getBoundingClientRect();
    if(!v.width||!h.height)return;
    const margin=p.left-v.left;
    const room=v.right-margin-p.right-16;
    const width=Math.min(460,Math.max(80,room));
    for(const el of [host,search]){el.style.setProperty('--thema-search-width',width+'px');el.style.setProperty('--thema-header-height',h.height+'px');el.style.transform='none'}
    const base=host.getBoundingClientRect();
    host.style.transform=`translate(${v.right-margin-base.right}px, ${h.top-base.top}px)`;
    const actual=search.getBoundingClientRect();
    search.style.transform=`translate(${v.right-margin-width-actual.left}px, ${h.top-actual.top}px)`;
    apply();
  }
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(align)};
  const observer=new ResizeObserver(schedule);
  observer.observe(header);observer.observe(panel);observer.observe(viewElement);
  window.addEventListener('resize',schedule);
  const describe=el=>{if(!el)return null;const c=getComputedStyle(el),r=el.getBoundingClientRect();return {tag:el.localName,size:c.fontSize,font:c.fontFamily,weight:c.fontWeight,left:r.left,top:r.top,right:r.right,width:r.width,height:r.height,radius:c.borderRadius,background:c.backgroundColor}};
  const inspect=()=>{align();const found=apply(),auto=search.shadowRoot?.querySelector('calcite-autocomplete'),field=auto?.shadowRoot?.querySelector('calcite-input'),input=field?.shadowRoot?.querySelector('input'),bar=search.shadowRoot?.firstElementChild,v=viewElement.getBoundingClientRect(),p=panel.getBoundingClientRect(),h=header.getBoundingClientRect(),s=search.getBoundingClientRect(),b=bar?.getBoundingClientRect();return {found,header:describe(header),panel:describe(panel),host:describe(host),search:describe(search),bar:describe(bar),auto:describe(auto),field:describe(field),input:describe(input),searchTopDifference:s.top-h.top,searchHeightDifference:s.height-h.height,barTopDifference:b?.top-h.top,barHeightDifference:b?.height-h.height,leftMargin:p.left-v.left,rightMargin:v.right-s.right,barRightMargin:b&&v.right-b.right,injected:inserted.length};};
  app.actions.register('inspect-search-bar',inspect);
  app.onCleanup(()=>{if(frame)cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener('resize',schedule);style.remove();inserted.forEach(x=>x.remove());for(const el of [host,search]){el.style.transform='';el.style.removeProperty('--thema-search-width');el.style.removeProperty('--thema-header-height')}});
  return inspect();
}