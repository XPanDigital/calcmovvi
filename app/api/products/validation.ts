import { z } from 'zod';
const amount=z.number().finite().min(0).max(10000000),percent=z.number().finite().min(0).max(100);
const inputs=z.object({
 name:z.string().trim().min(1,'Informe o nome do produto.').max(120),sku:z.string().trim().max(80).default(''),
 price:amount.positive(),cost:amount,affiliate:percent,target:percent.max(99.99),
 discount:amount,coupon:amount,qty:z.number().int().min(1).max(9999),pack:amount,inbound:amount,labor:amount,shipping:amount,
 rule:z.enum(['auto','custom']),commission:percent,fixed:amount,pte:z.boolean(),pteRate:percent,pteCap:amount,
 tax:percent,ads:amount,adsRate:percent,monthly:amount,volume:z.number().int().min(1).max(10000000),other:amount,extraRate:percent,extraFixed:amount,mdr:percent,mdrBase:amount,mdrManual:z.boolean(),early:amount,returnRate:percent,returnLoss:amount,
 commissionOn:z.boolean(),fixedOn:z.boolean(),discountOn:z.boolean(),orderOn:z.boolean(),packOn:z.boolean(),inboundOn:z.boolean(),laborOn:z.boolean(),shippingOn:z.boolean(),taxOn:z.boolean(),adsOn:z.boolean(),overheadOn:z.boolean(),otherOn:z.boolean(),paymentOn:z.boolean(),earlyOn:z.boolean(),extraOn:z.boolean(),riskOn:z.boolean(),
});
export function validateProduct(body:unknown){
 const result=z.object({inputs}).safeParse(body);if(!result.success)return {ok:false as const,error:result.error.issues[0]?.message||'Confira os dados do produto.'};
 const s=result.data.inputs,discount=s.discountOn?s.discount:0,coupon=s.discountOn?s.coupon:0;
 if(discount>=s.price||coupon>s.price-discount+.000001)return {ok:false as const,error:'Confira os descontos: eles não podem superar o preço de venda.'};
 return {ok:true as const,name:s.name,sku:s.sku,inputs:s};
}
