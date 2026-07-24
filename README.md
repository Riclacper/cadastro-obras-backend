# Cadastro de Obras — backend

API REST em Node.js, Express, Mongoose e MongoDB para o aplicativo mobile de cadastro e fiscalização de obras.

## Requisitos

- Node.js 20.19.4 ou superior recomendado
- MongoDB Atlas ou uma instância MongoDB acessível
- Usuário de banco com permissão para a base da aplicação

## Instalação e configuração

```bash
git clone https://github.com/Riclacper/cadastro-obras-backend.git
cd cadastro-obras-backend
npm install
cp .env.example .env
```

Preencha `.env` sem publicar esse arquivo:

```env
PORT=5000
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/sistema-obras?retryWrites=true&w=majority
JWT_SECRET=uma-chave-secreta-longa-e-aleatoria
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxx
EMAIL_FROM=Cadastro de Obras <onboarding@resend.dev>
```

`MONGODB_URI`, `JWT_SECRET`, `RESEND_API_KEY` e as configurações de e-mail são segredos. O arquivo `.env` está no `.gitignore` e não deve ser commitado.

O envio usa o Resend. Crie uma API key e, para enviar a destinatários externos, verifique um domínio no painel do Resend. Durante testes, `onboarding@resend.dev` é limitado às regras da conta Resend.

## Executar

```bash
npm start
```

Por padrão, a API fica disponível em `http://localhost:5000`. Para testar a partir de um celular na mesma rede, use `http://IP_DO_COMPUTADOR:5000`.

O endpoint raiz permite uma verificação rápida:

```bash
curl http://localhost:5000/
```

## Autenticação

As rotas de obras e fiscalizações exigem um token JWT no cabeçalho:

```http
Authorization: Bearer SEU_TOKEN
```

### Criar usuário

```bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nome":"Seu Nome","email":"seu@email.com","senha":"SenhaCom8Caracteres"}'
```

O primeiro usuário cadastrado recebe o papel `admin`; os seguintes recebem `fiscal`.

### Perfis e permissões

- `admin` (Administrador): cria e edita obras, altera status, exclui obras/fiscalizações, gera relatórios e gerencia usuários.
- `fiscal` (Fiscal): consulta obras e registra/edita fiscalizações, sem alterar a estrutura das obras ou excluir registros.

Depois do primeiro acesso, o administrador pode criar fiscais pela área **Equipe** do aplicativo ou pela API `POST /auth/users`. O cadastro público fica bloqueado após a criação do primeiro usuário.

### Entrar

```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"seu@email.com","senha":"SenhaCom8Caracteres"}'
```

A resposta contém `token` e os dados públicos do usuário. Não compartilhe o token.

## Endpoints

Todas as rotas abaixo, exceto `/auth/register`, `/auth/login` e `/`, exigem autenticação.

### Obras

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/obras` | Lista obras |
| GET | `/obras/:id` | Busca uma obra |
| POST | `/obras` | Cria uma obra |
| PUT | `/obras/:id` | Atualiza uma obra |
| DELETE | `/obras/:id` | Remove uma obra |
| GET | `/obras/:id/fiscalizacoes` | Lista fiscalizações da obra |
| POST | `/obras/:id/email` | Envia detalhes por e-mail |

### Usuários (Administrador)

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/auth/users` | Lista usuários |
| POST | `/auth/users` | Cria usuário com papel `admin` ou `fiscal` |
| PATCH | `/auth/users/:id/role` | Altera o papel do usuário |

### Fiscalizações

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/fiscalizacoes` | Lista fiscalizações |
| GET | `/fiscalizacoes/:id` | Busca uma fiscalização |
| POST | `/fiscalizacoes` | Cria uma fiscalização |
| PUT | `/fiscalizacoes/:id` | Atualiza uma fiscalização |
| DELETE | `/fiscalizacoes/:id` | Remove uma fiscalização |

## Banco de dados

O projeto usa MongoDB com Mongoose. No MongoDB Atlas, crie um usuário em **Database Access**, autorize o IP em **Network Access** e copie a string de conexão para `MONGODB_URI`. As coleções são criadas conforme os primeiros documentos forem inseridos.

Modelos principais:

- `User`: nome, e-mail, hash da senha e papel
- `Obra`: dados da obra, localização, foto e status (`Planejada`, `Em andamento`, `Concluída` ou `Pausada`)
- `Fiscalizacao`: dados da fiscalização vinculada a uma obra

## Segurança e produção

- Use uma senha forte e exclusiva para `JWT_SECRET`.
- Nunca publique `.env`, tokens, senhas ou strings do MongoDB.
- Restrinja o CORS aos domínios necessários em produção.
- Publique a API atrás de HTTPS.
- Configure `CORS_ORIGIN` com a origem do frontend publicado; mantenha `*` apenas durante desenvolvimento.
- O armazenamento de fotos em base64 é adequado apenas para o escopo atual; uma evolução possível é usar armazenamento de objetos.

## Publicação online

O backend está preparado para deploy em serviços como Render, Railway ou Fly.io: use `npm install` no build, `npm start` na execução e configure as variáveis do `.env` no painel do provedor. O endpoint `/health` pode ser usado como health check. Após publicar a API, atualize `EXPO_PUBLIC_API_URL` do frontend para a URL HTTPS pública e gere uma nova build do aplicativo.

## Licença

Projeto acadêmico e didático desenvolvido por Ricardo Lacerda Pereira.
