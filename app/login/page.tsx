import { auth, loginReady, signIn, signOut } from '../../auth';
export const dynamic = 'force-dynamic';

export default async function Login({searchParams}: {searchParams: Promise<{error?: string}>}) {
  const ready = loginReady();
  const session = ready ? await auth() : null;
  const { error } = await searchParams;
  const providers = [
    ...(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET ? [{id:'github',name:'GitHub'}] : []),
    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET ? [{id:'google',name:'Google'}] : []),
  ];
  return <main style={{maxWidth:440,margin:'12vh auto',padding:28,fontFamily:'system-ui',lineHeight:1.6}}>
    <h1>Seu catálogo Precifica</h1>
    <p>Entre para acessar seus produtos e precificações.</p>
    {error && <p role="alert">Não foi possível entrar. Use a conta autorizada para este catálogo ou tente novamente.</p>}
    {!ready ? <p>O acesso ao catálogo está sendo configurado. A calculadora continua disponível.</p> : session?.user?.id ? <>
      <p>Você está conectado como {session.user.name || session.user.email}.</p>
      <p><a href="/calculator.html#products">Abrir meus produtos</a></p>
      <form action={async()=>{'use server';await signOut({redirectTo:'/login'});}}><button>Sair da conta</button></form>
    </> : providers.map(provider=><form key={provider.id} action={async()=>{'use server';await signIn(provider.id,{redirectTo:'/calculator.html#products'});}}>
      <button style={{width:'100%',padding:14,marginBottom:12,borderRadius:10,border:0,background:'#7c3aed',color:'white',fontSize:16,cursor:'pointer'}}>Entrar com {provider.name}</button>
    </form>)}
    <p><a href="/calculator.html">Voltar à calculadora</a></p>
  </main>;
}
