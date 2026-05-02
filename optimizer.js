(function(){
  const STORE='lv-analytics-v1';
  const FALLBACK_COMBOS=[
    {id:'auto-antojo',emoji:'🍔',items:['burger','helado'],tag:{es:'Mejor valor',en:'Best value'},name:{es:'Combo Antojo Inteligente',en:'Smart Craving Combo'}},
    {id:'auto-amigos',emoji:'🔥',items:['nachos','tacos-arreglados','salchipapas'],tag:{es:'Para compartir',en:'Shareable'},name:{es:'Combo Amigos Inteligente',en:'Smart Friends Combo'}},
    {id:'auto-casero',emoji:'🍽️',items:['chifrijo','papas'],tag:{es:'Recomendado por la casa',en:'House recommended'},name:{es:'Combo Casero Inteligente',en:'Smart House Combo'}}
  ];
  function read(){try{return JSON.parse(localStorage.getItem(STORE)||'{}')}catch(e){return {}}}
  function write(data){localStorage.setItem(STORE,JSON.stringify(data))}
  function track(event,id,value){const data=read();data[event]=data[event]||{};data[event][id]=(data[event][id]||0)+(value||1);write(data)}
  function lang(){return document.documentElement.lang==='en'?'en':'es'}
  function price(n){return '₡'+String(n).replace(/\B(?=(\d{3})+(?!\d))/g,'.')}
  function item(id){return typeof findItem==='function'?findItem(id):null}
  function items(ids){return ids.map(item).filter(Boolean)}
  function total(ids){return items(ids).reduce((s,i)=>s+Number(i.price||0),0)}
  function comboPrice(ids){return Math.max(500,Math.round(total(ids)*0.92/100)*100)}
  function dynamicCombos(){
    const data=read();const adds=data.add||{};
    const ranked=Object.entries(adds).sort((a,b)=>b[1]-a[1]).map(([id])=>id).filter(id=>item(id));
    const combos=[];
    if(ranked.length>=2)combos.push({id:'auto-top-2',emoji:'🔥',items:ranked.slice(0,2),tag:{es:'Basado en pedidos',en:'Based on orders'},name:{es:'Combo Más Pedido',en:'Most Ordered Combo'}});
    if(ranked.length>=3)combos.push({id:'auto-top-3',emoji:'💸',items:ranked.slice(0,3),tag:{es:'Mayor valor',en:'Best value'},name:{es:'Combo Ahorro',en:'Savings Combo'}});
    return combos.length?combos:FALLBACK_COMBOS;
  }
  function comboCard(c){
    const l=lang();const its=items(c.items);const full=total(c.items);const deal=comboPrice(c.items);
    const desc=its.map(i=>i.name[l]).join(' + ');
    return `<article class="combo-card auto-combo"><div class="combo-top"><span>${c.emoji}</span><b>${c.tag[l]}</b></div><h3>${c.name[l]}</h3><p>${desc}</p><div class="deal"><span>${price(full)}</span><strong>${price(deal)}</strong></div><button onclick="addAutoCombo('${c.id}')">＋ ${l==='es'?'Agregar combo':'Add combo'}</button></article>`;
  }
  window.addAutoCombo=function(id){
    const c=dynamicCombos().find(x=>x.id===id);if(!c)return;
    c.items.forEach(x=>{if(typeof addToCart==='function')addToCart(x,false)});
    track('combo',id,1);
    if(typeof toggleCartOpen==='function')toggleCartOpen();
  };
  function renderPromo(){
    const target=document.querySelector('main');if(!target)return;
    let promo=document.getElementById('smart-promo');
    if(!promo){promo=document.createElement('section');promo.id='smart-promo';target.prepend(promo)}
    const h=new Date().getHours();const l=lang();
    const msg=h>=18?(l==='es'?'🔥 Promo noche: combos para compartir':'🔥 Night promo: shareable combos'):(h>=11&&h<=14?(l==='es'?'🍽️ Almuerzo rápido: prueba el combo recomendado':'🍽️ Quick lunch: try the recommended combo'):(l==='es'?'⭐ Combo del día listo para agregar':'⭐ Daily combo ready to add'));
    promo.innerHTML=`<div class="promo-banner">${msg}</div>`;
  }
  const oldRenderConversion=window.renderConversion;
  window.renderConversion=function(){
    renderPromo();
    const root=document.getElementById('conversion');if(!root){if(oldRenderConversion)oldRenderConversion();return}
    const l=lang();const data=read();const adds=data.add||{};
    const ranked=Object.entries(adds).sort((a,b)=>b[1]-a[1]).map(([id])=>item(id)).filter(Boolean).slice(0,5);
    const popular=ranked.length?ranked:(typeof allItems==='function'?allItems().filter(i=>i.popular).slice(0,5):[]);
    root.innerHTML=`<div class="section-title"><span>💸</span><h2>${l==='es'?'Combos auto-optimizados':'Auto-optimized combos'}</h2></div><div class="combo-row">${dynamicCombos().map(comboCard).join('')}</div><div class="section-title"><span>🔥</span><h2>${l==='es'?'Más pedidos':'Most ordered'}</h2></div><div class="popular-row">${popular.map(i=>`<button onclick="focusItem('${i.id}')">${i.name[l]} <b>${price(i.price)}</b></button>`).join('')}</div>`;
  };
  const oldAdd=window.addToCart;
  window.addToCart=function(id,show){track('add',id,1);return oldAdd?oldAdd(id,show):undefined};
  const oldCheckout=window.checkout;
  window.checkout=function(){track('checkout','all',1);return oldCheckout?oldCheckout():undefined};
  const oldSetLang=window.setLang;
  window.setLang=function(l){const out=oldSetLang?oldSetLang(l):undefined;setTimeout(()=>{renderPromo();if(window.renderConversion)window.renderConversion()},0);return out};
  setTimeout(()=>{renderPromo();if(window.renderConversion)window.renderConversion()},500);
})();
