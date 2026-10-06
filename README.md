# Precifica / calcmovvi

Calculadora de precificação para TikTok Shop com comparação de comissões e catálogo único de produtos no Cloudflare D1. Hospedagem na Vercel.

## Acesso

Sem cadastro ou login, conforme escolha do proprietário. Qualquer pessoa que acesse o endereço pode consultar, criar, editar e excluir produtos do catálogo compartilhado. As credenciais do Cloudflare ficam apenas no servidor, nunca no navegador ou no repositório.

## Configuração

Configure na Vercel as variáveis de `.env.example`: `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_D1_DATABASE_ID` e `CLOUDFLARE_API_TOKEN`. O token deve ter somente o acesso D1 necessário à conta escolhida. Aplique `migrations/0001_products.sql` uma única vez em um banco vazio.

O catálogo utiliza o proprietário interno fixo `personal-catalog`. Os dados do antigo Sites não são copiados automaticamente; transferi-los exige exportação e mapeamento explícito para esse catálogo público.

## Desenvolvimento e verificação

Node.js 22.18 ou posterior. Execute `npm ci`, `npm test`, `npm run build` e `npm run dev`.

Os testes D1 usam respostas simuladas. Valide criação, leitura após recarregar, edição e exclusão no banco real após configurar as três variáveis. O cálculo e seus cenários são salvos juntos nas entradas do produto.

## Publicação

Repositório: https://github.com/XPanDigital/calcmovvi

Aplicativo: https://calcmovvi.vercel.app
