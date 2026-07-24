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
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_de_app
```

`MONGODB_URI`, `JWT_SECRET` e as credenciais de e-mail são segredos. O arquivo `.env` está no `.gitignore` e não deve ser commitado.

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
- `Obra`: dados da obra, localização e foto
- `Fiscalizacao`: dados da fiscalização vinculada a uma obra

## Segurança e produção

- Use uma senha forte e exclusiva para `JWT_SECRET`.
- Nunca publique `.env`, tokens, senhas ou strings do MongoDB.
- Restrinja o CORS aos domínios necessários em produção.
- Publique a API atrás de HTTPS.
- O armazenamento de fotos em base64 é adequado apenas para o escopo atual; uma evolução possível é usar armazenamento de objetos.

## Licença

Projeto acadêmico e didático desenvolvido por Ricardo Lacerda Pereira.

