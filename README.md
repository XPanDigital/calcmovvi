# Precifica — preparação para GitHub e Vercel

Código da migração preparado e compilado. A conexão com as contas externas, o login real e a transferência dos dados ainda estão pendentes; não é uma publicação concluída.

## Já preparado

- Interface e calculadora copiadas da versão publicada, incluindo comparação de comissões e exportação.
- Estrutura Next.js para Vercel, sem o runtime proprietário da hospedagem anterior.
- Adaptador servidor para Cloudflare D1 via API oficial, com consultas parametrizadas, timeout e erros sanitizados.
- Migração SQL da tabela de produtos e exemplo das variáveis necessárias.
- Arquivos de segredo, dependências e backups excluídos do Git.
- Rotas de criação, consulta, edição e exclusão adaptadas ao D1 remoto, preservando isolamento por proprietário e controle de versão.
- Login Auth.js configurável com GitHub ou Google, sessões assinadas e lista explícita de contas autorizadas. Sem configuração, o catálogo fica bloqueado.
- Testes do adaptador D1 e da autorização; verificação local das quatro rotas rejeitando requisições sem sessão e cabeçalhos de identidade forjados.

## Pendências antes de publicar

1. Vincular o repositório XPanDigital/calcmovvi à Vercel.
2. Acessar a conta Cloudflare do proprietário e criar ou selecionar o D1 de destino.
3. Configurar o novo login (GitHub ou Google, conforme escolha do proprietário). O login com ChatGPT da versão antiga não funciona fora do Sites.
4. Registrar a aplicação OAuth do provedor escolhido com callback `https://DOMINIO/api/auth/callback/github` ou `/google`. Preencher `AUTH_SECRET`, `AUTH_URL`, credenciais do provedor e a lista de contas autorizadas. A conta GitHub conectada é `XPanDigital`, identidade estável `github:200939900`; só adicioná-la caso GitHub seja o login escolhido. Para Google, usar o endereço explicitamente confirmado do proprietário em `AUTH_ALLOWED_GOOGLE_EMAILS` (somente emails verificados são aceitos).
5. Configurar os segredos no ambiente Vercel, resolver acesso à equipe se necessário e validar o fluxo completo de produtos.
6. Exportar os dados do banco antigo, mapear explicitamente a identidade antiga para a nova conta do proprietário e importar no novo D1. Não publicar backups no GitHub.
7. Conferir contagem e conteúdo dos produtos migrados antes da troca de endereço.

O site original continua em https://precifica-shop-jv.joaovtbusiness.chatgpt.site. Nenhum produto foi transferido ou apagado.

## Desenvolvimento

Requer Node.js 22.18 ou mais recente. Execute `npm ci`, `npm test`, `npm run check` e `npm run build` nesta pasta; `npm run dev` inicia o desenvolvimento.

Os testes locais usam respostas simuladas para o D1. O login OAuth real, o CRUD no banco remoto e a importação precisam ser verificados após configurar as contas. Os cenários de comissões e a calculadora foram conferidos no navegador local.

## Cloudflare D1

Configure `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_D1_DATABASE_ID` e `CLOUDFLARE_API_TOKEN` somente no servidor. Não prefixar essas variáveis com `NEXT_PUBLIC_`.

O token deve ter apenas as permissões de leitura/gravação D1 necessárias na conta escolhida. Não usar a Global API Key. Aplicar `migrations/0001_products.sql` uma única vez no banco novo; não executar automaticamente em cada deploy.

Referência: https://developers.cloudflare.com/api/resources/d1/subresources/database/methods/query/

