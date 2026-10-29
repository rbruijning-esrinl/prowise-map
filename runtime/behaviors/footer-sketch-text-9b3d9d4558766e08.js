export default async function install(app) {
  const Graphic = await app.import('esri/Graphic');
  const center = document.getElementById('prowise-tools-center');
  const sketchButton = document.getElementById('footer-sketch');
  const measureButton = document.getElementById('footer-measure');
  app.assert(center && sketchButton && measureButton, 'Het schetsgereedschap in de voettekst ontbreekt.');
  const style = document.createElement('style');
  style.textContent = '#pw-text-panel{position:fixed;bottom:76px;left:50%;transform:translateX(-50%);z-index:1101;width:min(380px,calc(100vw - 32px));box-sizing:border-box;background:#fff;border-radius:32px;box-shadow:0 8px 28px rgba(0,0,0,.2);font:500 14px Poppins,sans-serif;color:#154371;overflow:hidden}#pw-text-panel[hidden]{display:none}#pw-text-panel .pw-text-header{display:flex;align-items:center;justify-content:space-between;background:#2e7f84;color:white;padding:13px 20px;font-size:18px}#pw-text-panel .pw-text-close{background:transparent;color:white;border:0;font:500 23px Poppins,sans-serif;cursor:pointer}#pw-text-panel .pw-text-body{padding:18px 20px 22px}#pw-text-panel label{display:block;margin-bottom:8px}#pw-text-panel textarea{display:block;box-sizing:border-box;width:100%;min-height:72px;resize:vertical;border:1px solid #d7e6e5;border-radius:12px;padding:10px;font:500 14px Poppins,sans-serif;color:#154371}#pw-text-panel p{color:#536c73;font-size:12px;line-height:1.5;margin:10px 0 0}#pw-text-panel button:focus-visible,#pw-text-panel textarea:focus-visible,#footer-text:focus-visible{outline:2px solid #2e7f84;outline-offset:2px}';
  document.head.append(style);
  const button = document.createElement('button'); button.type='button'; button.id='footer-text'; button.title='Tekst'; button.setAttribute('aria-label','Tekst'); button.setAttribute('aria-pressed','false');
  const svg = document.createElementNS('http://www.w3.org/2000/svg','svg'); svg.setAttribute('viewBox','0 0 24 24'); svg.setAttribute('aria-hidden','true'); svg.setAttribute('focusable','false');
  for (const [tag,attrs] of [['path',{d:'M4 6h16M12 6v13M8 19h8'}],['path',{d:'M4 6v3M20 6v3'}]]) {const node=document.createElementNS('http://www.w3.org/2000/svg',tag); for(const [key,value] of Object.entries(attrs))node.setAttribute(key,value); svg.append(node)}
  button.append(svg);center.insertBefore(button,measureButton);
  const panel=document.createElement('section');panel.id='pw-text-panel';panel.hidden=true;panel.setAttribute('aria-label','Tekstschets');
  const header=document.createElement('div');header.className='pw-text-header';const heading=document.createElement('span');heading.textContent='Tekst toevoegen';
  const close=document.createElement('button');close.type='button';close.className='pw-text-close';close.textContent='×';close.setAttribute('aria-label','Sluiten');header.append(heading,close);
  const body=document.createElement('div');body.className='pw-text-body';const label=document.createElement('label');label.htmlFor='pw-text-value';label.textContent='Tekst op de kaart';
  const input=document.createElement('textarea');input.id='pw-text-value';input.maxLength=240;input.placeholder='Typ hier je tekst';
  const hint=document.createElement('p');hint.setAttribute('aria-live','polite');hint.textContent='Typ tekst en klik op de kaart om deze te plaatsen.';body.append(label,input,hint);panel.append(header,body);document.body.append(panel);
  let open=false;
  function hide(){open=false;panel.hidden=true;button.setAttribute('aria-pressed','false')}
  const toggle=()=>{if(open){hide();return}app.actions.invoke('close-drawing-tools');open=true;panel.hidden=false;button.setAttribute('aria-pressed','true');input.focus()};
  const other=()=>hide();const onInput=()=>{hint.textContent=input.value.trim()?'Klik op de kaart om de tekst te plaatsen.':'Typ tekst en klik op de kaart om deze te plaatsen.'};
  button.addEventListener('click',toggle);close.addEventListener('click',hide);sketchButton.addEventListener('click',other);measureButton.addEventListener('click',other);input.addEventListener('input',onInput);
  const placement=app.actions.register('place-sketch-text',({event}={})=>{
    const text=input.value.trim();if(!open || !text)return {placed:false,reason:!open?'inactive':'empty'};
    const point=event?.mapPoint;if(!point || !Number.isFinite(point.x) || !Number.isFinite(point.y))return {placed:false,reason:'no-map-point'};
    const layer=app.map.findLayerById('prowise-user-sketches');if(!layer)return {placed:false,reason:'sketch-layer-unavailable'};
    layer.add(new Graphic({geometry:point,symbol:{type:'text',text,color:'#154371',haloColor:'#ffffff',haloSize:2,font:{family:'Poppins',size:16,weight:'medium'}},attributes:{type:'text',text}}));
    hint.textContent='Tekst geplaatst. Klik opnieuw op de kaart of wijzig de tekst.';
    return {placed:true,graphicCount:layer.graphics.length};
  });
  app.onCleanup(()=>{placement.remove();button.removeEventListener('click',toggle);close.removeEventListener('click',hide);sketchButton.removeEventListener('click',other);measureButton.removeEventListener('click',other);input.removeEventListener('input',onInput);button.remove();panel.remove();style.remove()});
  return {footerButtons:[...center.querySelectorAll('button')].map(b=>b.id),textPanelHidden:panel.hidden,sketchLayerPresent:!!app.map.findLayerById('prowise-user-sketches')};
}