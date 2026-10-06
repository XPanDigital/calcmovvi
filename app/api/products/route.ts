import { productDb } from '../../../lib/d1';
import { validateProduct } from './validation';
export const dynamic = 'force-dynamic';
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
async function identity(){return 'personal-catalog';}
function sameOrigin(req:Request){const origin=req.headers.get('origin');return req.headers.get('content-type')?.split(';')[0].trim()==='application/json'&&(!origin||origin===new URL(req.url).origin)&&req.headers.get('sec-fetch-site')!=='cross-site';}
function product(row:Record<string,unknown>){return {...row,inputs:JSON.parse(String(row.inputs))};}
export async function GET(){
 try{const owner=await identity();
 const result=await productDb().prepare('SELECT id,name,sku,inputs,version,created_at,updated_at FROM products WHERE owner = ? ORDER BY updated_at DESC, id DESC').bind(owner).all();
 return json({products:result.results.map(product)});
 }catch(e){console.error('products.list failed',e);return json({error:'Não foi possível acessar o banco de produtos. Confira a conexão com o Cloudflare.'},503)}
}
export async function POST(req:Request){
 try{const owner=await identity();if(!sameOrigin(req))return json({error:'Origem inválida.'},403);
 const body=await readBody(req);const valid=validateProduct(body);if(!valid.ok)return json({error:valid.error},400);
 const id=typeof body.id==='string'&&/^[0-9a-f-]{36}$/i.test(body.id)?body.id:crypto.randomUUID(),now=new Date().toISOString();
 const result=await productDb().prepare('INSERT INTO products (id,owner,name,sku,inputs,version,created_at,updated_at) VALUES (?,?,?,?,?,1,?,?) ON CONFLICT(id) DO NOTHING').bind(id,owner,valid.name,valid.sku,JSON.stringify(valid.inputs),now,now).run();
 if(!result.meta.changes){const previous=await productDb().prepare('SELECT id,name,sku,inputs,version,created_at,updated_at FROM products WHERE id=? AND owner=?').bind(id,owner).first();if(!previous)return json({error:'Identificador já utilizado. Inicie um novo produto.'},409);return json({product:product(previous)});}
 return json({product:{id,name:valid.name,sku:valid.sku,inputs:valid.inputs,version:1,created_at:now,updated_at:now}},201);
 }catch(e){if(e instanceof Error&&e.message==='BAD_BODY')return json({error:'Dados inválidos ou arquivo muito grande.'},400);console.error('products.create failed',e);return json({error:'Não foi possível salvar. Seus dados continuam no formulário.'},503)}
}
export async function PUT(req:Request){
 try{const owner=await identity();if(!sameOrigin(req))return json({error:'Origem inválida.'},403);
 const body=await readBody(req),valid=validateProduct(body);if(!valid.ok)return json({error:valid.error},400);if(typeof body.id!=='string'||!Number.isInteger(body.version))return json({error:'Produto ou versão inválida.'},400);
 const now=new Date().toISOString();const result=await productDb().prepare('UPDATE products SET name=?,sku=?,inputs=?,version=version+1,updated_at=? WHERE id=? AND owner=? AND version=?').bind(valid.name,valid.sku,JSON.stringify(valid.inputs),now,body.id,owner,body.version).run();
 if(!result.meta.changes)return json({error:'Este produto mudou ou foi excluído em outra aba. Reabra-o em Produtos ou salve uma cópia.'},409);
 const row=await productDb().prepare('SELECT id,name,sku,inputs,version,created_at,updated_at FROM products WHERE id=? AND owner=?').bind(body.id,owner).first();return json({product:row?product(row):null});
 }catch(e){if(e instanceof Error&&e.message==='BAD_BODY')return json({error:'Dados inválidos.'},400);console.error('products.update failed',e);return json({error:'Não foi possível atualizar. Seus dados continuam no formulário.'},503)}
}
export async function DELETE(req:Request){
 try{const owner=await identity();if(!sameOrigin(req))return json({error:'Origem inválida.'},403);const body=await readBody(req);if(typeof body.id!=='string'||!Number.isInteger(body.version))return json({error:'Produto inválido.'},400);
 const result=await productDb().prepare('DELETE FROM products WHERE id=? AND owner=? AND version=?').bind(body.id,owner,body.version).run();if(!result.meta.changes)return json({error:'O produto mudou ou já foi excluído. Atualize a tabela.'},409);return json({ok:true});
 }catch(e){console.error('products.delete failed',e);return json({error:'Não foi possível excluir. Tente novamente.'},503)}
}
async function readBody(req:Request){const text=await req.text();if(text.length>40000)throw new Error('BAD_BODY');try{const value=JSON.parse(text);if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('BAD_BODY');return value}catch{throw new Error('BAD_BODY')}}



