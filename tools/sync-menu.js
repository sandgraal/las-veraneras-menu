const fs=require('fs');
const md=fs.readFileSync('content/menu.md','utf8');
const lines=md.split('\n');
let categories=[];
let current=null;
lines.forEach(l=>{
 if(l.startsWith('# ')){
   current={name:{es:l.replace('# ','').split('/')[0].trim(),en:l.split('/')[1]?.trim()||''},items:[]};
   categories.push(current);
 }
 if(l.startsWith('## ')){
   const name=l.replace('## ','');
   const parts=name.split('/');
   current.items.push({name:{es:parts[0].trim(),en:parts[1]?.trim()||''},price:''});
 }
 if(l.includes('₡')){
   current.items[current.items.length-1].price=l.replace('₡','').trim();
 }
});
fs.mkdirSync('data',{recursive:true});
fs.writeFileSync('data/menu.json',JSON.stringify({categories},null,2));
console.log('menu synced');
