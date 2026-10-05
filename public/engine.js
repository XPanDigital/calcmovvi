(function(root){
'use strict';
const round=x=>Math.round((x+Number.EPSILON)*100)/100;
const defaults={name:'Produto de exemplo',price:79.9,discount:0,coupon:0,qty:1,cost:28,pack:2,inbound:1,labor:0,shipping:0,rule:'auto',commission:6,fixed:6,pte:true,pteRate:6,pteCap:50,affiliate:10,tax:0,ads:0,adsRate:0,monthly:0,volume:100,other:0,extraRate:0,extraFixed:0,mdr:0,mdrBase:0,mdrManual:false,early:0,returnRate:0,returnLoss:0,target:25};
const options={discountOn:['discount','coupon'],orderOn:['qty'],packOn:['pack'],inboundOn:['inbound'],laborOn:['labor'],shippingOn:['shipping'],taxOn:['tax'],adsOn:['ads','adsRate'],overheadOn:['monthly','volume'],otherOn:['other'],paymentOn:['mdr','mdrBase','mdrManual'],earlyOn:['early'],extraOn:['extraRate','extraFixed'],riskOn:['returnRate','returnLoss']};
Object.assign(defaults,{sku:'',price:59.9,cost:20,pack:0,inbound:0,commissionOn:true,fixedOn:true,...Object.fromEntries(Object.keys(options).map(k=>[k,false]))});
function effective(s){s={...defaults,...s};for(const [flag,keys] of Object.entries(options))if(!s[flag])for(const key of keys)s[key]=key==='qty'?1:key==='volume'?100:key==='mdrManual'?false:0;return s}
function calculate(s,baseOverride,raw=false){
 s=effective(s);
 const R=raw?x=>x:round,q=s.qty,b=baseOverride===undefined?R(s.price-s.discount):baseOverride;
 const rate=s.commissionOn?(s.rule==='auto'?(b<50?10:6):s.commission):0;
 const fixed=s.fixedOn?(s.rule==='auto'?(b<50?4:6):s.fixed):0;
 const revenue=R(b*q),rows=[];
 const add=(key,label,value,basis,group)=>{rows.push({key,label,value:R(value),basis,group});return R(value)};
 add('cost','Custo do produto',s.cost*q,'Custo unitário × quantidade','product');
 add('pack','Embalagem',s.pack*q,'Por unidade','product');
 add('inbound','Frete de compra rateado',s.inbound*q,'Por unidade','product');
 add('labor','Preparação / mão de obra',s.labor*q,'Por unidade','product');
 add('commission','Comissão TikTok Shop',R(b*rate/100)*q,rate+'% sobre '+b.toFixed(2)+' por item','platform');
 add('fixed','Tarifa por item',fixed*q,'Tarifa unitária × quantidade','platform');
 add('pte','Programa de taxas de envio',s.pte?R(Math.min(b*s.pteRate/100,s.pteCap))*q:0,s.pte?s.pteRate+'%, teto de R$ '+s.pteCap.toFixed(2)+' por item':'Desativado','platform');
 add('affiliate','Comissão de afiliado',R(b*s.affiliate/100)*q,s.affiliate+'% da receita dos produtos','selling');
 add('shipping','Frete pago pelo vendedor',s.shipping,'Saldo líquido por pedido; sem duplicar o programa','selling');
 add('mdr','Pagamento / TikTok Parcelado', (s.mdrManual?s.mdrBase:revenue)*s.mdr/100,s.mdr+'% × '+(s.mdrManual?'base informada':'receita dos produtos'),'platform');
 add('early','Recebimento antecipado',s.early,'Custo total informado por pedido','platform');
 add('extra','Outras cobranças da plataforma',revenue*s.extraRate/100+s.extraFixed,s.extraRate+'% da receita + valor fixo por pedido','platform');
 add('tax','Tributos sobre a venda',revenue*s.tax/100,s.tax+'% da receita; alíquota efetiva informada','tax');
 add('ads','Anúncios',s.ads+revenue*s.adsRate/100,'Valor por pedido + percentual da receita','selling');
 add('overhead','Custos fixos rateados',s.monthly/s.volume*q,'Despesas mensais ÷ unidades mensais × quantidade','operation');
 add('other','Outros custos operacionais',s.other*q,'Por unidade','operation');
 const before=R(revenue-rows.reduce((a,r)=>a+r.value,0));
 add('reserve','Reserva para devoluções / perdas',s.returnRate/100*s.returnLoss,'Probabilidade por pedido × perda líquida por ocorrência','reserve');
 const expenses=R(rows.reduce((a,r)=>a+r.value,0)),profit=R(revenue-expenses);
 return {base:b,revenue,rate,fixed,rows,expenses,profit,before,unit:R(profit/q),margin:revenue?profit/revenue*100:0,markup:s.cost?b/s.cost:null,platform:R(rows.filter(r=>r.group==='platform').reduce((a,r)=>a+r.value,0)),buyer:R(Math.max(0,b-s.coupon)*q)};
}
// Search each fee band separately: the R$ 50 boundary changes both fee components.
// A rounding-error bound gives a safe lower start, then cents are verified exactly.
function suggest(s,target){
 s=effective(s);
 const max=100000,minBase=Math.max(.01,s.coupon),breaks=[minBase,max+0.01];
 if(minBase>max)return null;
 if(s.rule==='auto'&&minBase<50)breaks.push(50);
 if(s.pte&&s.pteRate>0){const cap=s.pteCap*100/s.pteRate;if(cap>minBase&&cap<max)breaks.push(cap)}
 breaks.sort((a,b)=>a-b);let best=null;
 for(let i=0;i<breaks.length-1;i++){
   const low=breaks[i],high=breaks[i+1];if(high-low<1e-7)continue;
   const a=low+(high-low)*.2,c=low+(high-low)*.8;
   const f=p=>{const r=calculate(s,p,true);return r.profit-r.revenue*target/100};
   const slope=(f(c)-f(a))/(c-a),intercept=f(a)-slope*a;
   const error=.005*(s.qty*4+10);
   let start=Math.max(1,Math.ceil((low-1e-8)*100)),end=Math.min(10000000,Math.ceil((high-1e-8)*100)-1);
   if(slope>1e-10)start=Math.max(start,Math.ceil(((-intercept-error)/slope-1e-8)*100));
   else if(Math.max(f(low),f(high)) < -error)continue;
   for(let cents=start; cents<=end && cents<start+100000; cents++){
     const b=cents/100,r=calculate(s,b);
     if(r.profit+1e-8>=r.revenue*target/100){best=best===null?b:Math.min(best,b);break}
   }
 }
 return best===null?null:round(best+s.discount);
}
function scenarios(s){
 const base=round(Number(s.affiliate));
 if(!Number.isFinite(base)||base<0||base>100)return [];
 const rates=new Set([base]);
 for(let i=1;i<=4;i++)if(base+i*2.5<=100)rates.add(round(base+i*2.5));
 for(let i=1;rates.size<5&&base-i*2.5>=0;i++)rates.add(round(base-i*2.5));
 return [...rates].sort((a,b)=>a-b).map(rate=>{const input={...s,affiliate:rate},result=calculate(input);return {rate,current:rate===base,result,suggested:suggest(input,s.target)}});
}
const api={round,defaults,calculate,suggest,effective,options,scenarios};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.Pricing=api;
})(typeof globalThis!=='undefined'?globalThis:this);
