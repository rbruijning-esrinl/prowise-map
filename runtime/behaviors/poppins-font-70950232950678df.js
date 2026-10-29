export default async function install(app) {
 const font = new FontFace('Poppins', 'url(https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/Poppins-Medium.ttf)', {weight:'500',style:'normal',display:'swap'});
 await font.load();
 document.fonts.add(font);
 app.onCleanup(()=>document.fonts.delete(font));
 app.actions.register('inspect-poppins-font',()=>({family:font.family,weight:font.weight,status:font.status}));
 return {family:font.family,weight:font.weight,status:font.status};
}