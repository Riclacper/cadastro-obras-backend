# 📋 Sistema de Cadastro de Obras

Backend desenvolvido em **Node.js** com **MongoDB** e **Mongoose** para dar suporte a um aplicativo mobile de cadastro e acompanhamento de obras em andamento.

---

## 🚀 Tecnologias Utilizadas

- Node.js
- Express.js
- MongoDB + Mongoose
- Nodemailer (simulação de envio por email)
- Estrutura modular (MVC)
- Upload de imagem via base64 ou URL

---

## 📁 Estrutura do Projeto

```

.
├── app.js
├── .env.example
├── models/
├── controllers/
├── routes/
├── services/
└── uploads/

````

---

## 🔧 Instalação e Execução

1. Clone o repositório:

```bash
git clone https://github.com/riclacper/cadastro-obras.git
cd sistema-obras
````

2. Instale as dependências:

```bash
npm install
```

3. Crie um arquivo `.env` na raiz com o seguinte conteúdo:

```env
PORT=5000
MONGODB_URI=mongodb+srv://usuario:senha@host/sistema-obras?retryWrites=true&w=majority
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_app
```

4. Inicie o servidor:

```bash
node app.js
```

---

## 📌 Endpoints Disponíveis

### 📁 Obras

| Método | Rota                       | Descrição                    |
| ------ | -------------------------- | ---------------------------- |
| GET    | `/obras`                   | Listar todas as obras        |
| GET    | `/obras/:id`               | Buscar obra por ID           |
| POST   | `/obras`                   | Criar nova obra              |
| PUT    | `/obras/:id`               | Atualizar obra               |
| DELETE | `/obras/:id`               | Deletar obra                 |
| GET    | `/obras/:id/fiscalizacoes` | Listar fiscalizações da obra |
| POST   | `/obras/:id/email`         | Enviar detalhes por email    |

### 📁 Fiscalizações

| Método | Rota                 | Descrição               |
| ------ | -------------------- | ----------------------- |
| GET    | `/fiscalizacoes`     | Listar todas            |
| GET    | `/fiscalizacoes/:id` | Buscar por ID           |
| POST   | `/fiscalizacoes`     | Criar nova fiscalização |
| PUT    | `/fiscalizacoes/:id` | Atualizar fiscalização  |
| DELETE | `/fiscalizacoes/:id` | Deletar fiscalização    |

---

## 🧪 Exemplos de JSON (Payloads)

### ➕ Criar Obra

```json
{
  "nome": "Obra Praça Central",
  "responsavel": "João da Silva",
  "dataInicio": "2024-06-01",
  "dataFim": "2024-12-30",
  "localizacao": {
    "lat": -8.0557,
    "long": -34.8813
  },
  "descricao": "Construção de praça com pista de cooper",
  "foto": "https://link-da-imagem.jpg"
}
```

### ➕ Criar Fiscalização

```json
{
  "data": "2024-07-01",
  "status": "Em dia",
  "observacoes": "Execução da base de concreto iniciada.",
  "localizacao": {
    "lat": -8.0560,
    "long": -34.8820
  },
  "foto": "data:image/jpeg;base64,...",
  "obra": "ID_DA_OBRA_AQUI"
}
```

### 📤 Enviar detalhes da obra por e-mail

```json
{
  "email": "destinatario@exemplo.com"
}
```

---

## 🧑‍💻 Autor

Projeto individual desenvolvido por **Ricardo Lacerda Pereira** para fins acadêmicos.

