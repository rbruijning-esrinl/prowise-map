export default async function install(app) {
 const mount=app.getMount('floating-contents');
 const [LayerListViewModel, reactiveUtils]=await Promise.all([app.import('esri/widgets/LayerList/LayerListViewModel'),app.import('esri/core/reactiveUtils')]);
 const list=new LayerListViewModel({view:app.view});
 const root=document.createElement('section');
 root.setAttribute('aria-label',"Thema's");
 root.style.cssText='position:absolute;top:16px;left:76px;display:flex;flex-direction:column;min-width:0;box-sizing:border-box;background:var(--app-surface);color:var(--app-text);border:1px solid var(--app-border);border-radius:20px;overflow:hidden;box-shadow:0 8px 28px #0003;pointer-events:auto;font-size:18px;font-family:"Poppins",sans-serif;font-weight:500;--calcite-font-family:"Poppins",sans-serif;';
 const header=document.createElement('div');header.style.cssText='display:flex;align-items:center;gap:12px;padding:12px 16px;min-width:0;background:#2e7f84;color:#ffffff;border-radius:19px 19px 0 0;';
 const headerIcon=document.createElement('calcite-icon');headerIcon.setAttribute('icon','layers');headerIcon.setAttribute('scale','m');headerIcon.setAttribute('aria-hidden','true');headerIcon.style.cssText='flex:0 0 24px;color:#ffffff;';
 const title=document.createElement('strong');title.textContent="Thema's";title.style.cssText='flex:1;font-size:22px;font-weight:500;color:#ffffff;';
 const collapse=document.createElement('button');collapse.type='button';collapse.textContent='−';collapse.style.cssText='min-width:44px;min-height:44px;font-family:inherit;font-weight:500;font-size:26px;border:1px solid #ffffff80;border-radius:6px;background:transparent;color:#ffffff;cursor:pointer;';
 const body=document.createElement('div');body.style.cssText='overflow:auto;min-height:0;min-width:0;padding:0 16px 12px;border-top:1px solid var(--app-border-subtle);';
 header.append(headerIcon,title,collapse);root.append(header,body);mount.append(root);app.view.ui.add(root,'manual');
 let folded=false;const fold=()=>{folded=!folded;body.hidden=folded;collapse.textContent=folded?'+':'−';collapse.setAttribute('aria-label',folded?"Expand Thema's":"Collapse Thema's");collapse.setAttribute('aria-expanded',String(!folded));header.style.borderRadius=folded?'19px':'19px 19px 0 0';};
 collapse.setAttribute('aria-label',"Collapse Thema's");collapse.setAttribute('aria-expanded','true');collapse.addEventListener('click',fold);
 function size(){root.style.width=Math.max(180,Math.min(460,app.view.width-108))+'px';root.style.maxHeight=Math.max(120,app.view.height-80)+'px';}
 size();const sizing=reactiveUtils.watch(()=>[app.view.width,app.view.height],size);
 const rows=new Map();
 function listen(el,event,fn,clean){el.addEventListener(event,fn);clean.push(()=>el.removeEventListener(event,fn));}
 function renderCollection(collection,container){
 let clean=[];
 function rebuild(){clean.forEach(fn=>fn());clean=[];container.replaceChildren();collection.forEach(item=>{
 if(item.hidden)return;const local=[];clean.push(()=>local.forEach(fn=>fn()));
 const wrap=document.createElement('div');const row=document.createElement('div');row.style.cssText='display:flex;align-items:center;gap:12px;min-width:0;padding:12px 0;border-bottom:1px solid var(--app-border-subtle);';
 const expand=document.createElement('button');expand.type='button';expand.style.cssText='flex:0 0 44px;width:44px;height:44px;border:0;background:transparent;color:var(--app-text);cursor:pointer;font-family:inherit;font-weight:500;font-size:24px;';
 const text=document.createElement('span');text.style.cssText='flex:1;min-width:0;overflow-wrap:anywhere;color:var(--app-text);font-size:18px;line-height:1.4;';
 const toggle=document.createElement('calcite-switch');toggle.setAttribute('scale','l');toggle.style.flexShrink='0';
 const nested=document.createElement('div');nested.style.cssText='margin-left:16px;padding-left:8px;border-left:1px solid var(--app-border-subtle);min-width:0;';
 const iconName=!item.parent?app.config.themeIcons[item.layer?.id]:null;let icon=null;row.append(expand);
 if(iconName){icon=document.createElement('calcite-icon');icon.setAttribute('icon',iconName);icon.setAttribute('scale','m');icon.setAttribute('aria-hidden','true');icon.style.cssText='flex:0 0 24px;color:var(--app-accent);';row.append(icon);}
 row.append(text,toggle);wrap.append(row,nested);container.append(wrap);
 function sync(){text.textContent=item.title;toggle.checked=!!item.visible;toggle.setAttribute('aria-label','Visibility: '+item.title);toggle.disabled=!!item.parent&&item.parent.layer?.visibilityMode==='inherited';const has=item.children.length>0;expand.style.visibility=has?'visible':'hidden';expand.disabled=!has;expand.textContent=item.open?'▾':'▸';expand.setAttribute('aria-label',(item.open?'Collapse ':'Expand ')+item.title);expand.setAttribute('aria-expanded',String(!!item.open));nested.hidden=!item.open;text.title=item.error?'Layer unavailable: '+item.title:item.title;}
 sync();rows.set(item,{toggle,expand,icon});local.push(()=>rows.delete(item));
 listen(expand,'click',()=>{item.open=!item.open;sync();},local);listen(toggle,'calciteSwitchChange',()=>{item.visible=toggle.checked;sync();},local);
 const watcher=reactiveUtils.watch(()=>[item.visible,item.open,item.title,item.children.length,item.error,item.parent?.layer?.visibilityMode],sync);local.push(()=>watcher.remove());local.push(renderCollection(item.children,nested));
 });}
 rebuild();const handle=collection.on('change',rebuild);return()=>{handle.remove();clean.forEach(fn=>fn());};
 }
 const dispose=renderCollection(list.operationalItems,body);
 app.onCleanup(()=>{dispose();sizing.remove();collapse.removeEventListener('click',fold);app.view.ui.remove(root);root.remove();list.destroy();mount.replaceChildren();});
 app.actions.register('inspect-contents-tree',()=>({title:title.textContent,cornerRadius:root.style.borderRadius,headerIcon:headerIcon.getAttribute('icon'),floating:root.isConnected,fontFamily:root.style.fontFamily,fontWeight:root.style.fontWeight,headerBackground:getComputedStyle(header).backgroundColor,headerText:getComputedStyle(title).color,switchCount:rows.size,themeIconCount:Array.from(rows.values()).filter(r=>r.icon).length,synchronized:Array.from(rows).every(([item,row])=>row.toggle.checked===!!item.visible)}));
 return {title:title.textContent,cornerRadius:root.style.borderRadius,headerCornerRadius:header.style.borderRadius,floating:root.isConnected};
}