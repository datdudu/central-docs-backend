# Central Docs Backend

API RESTful para upload, ingestão, consulta e histórico de datasets (CSV/PDF), desenvolvida em Node.js, Express, Prisma e PostgreSQL.

## 🚀 Funcionalidades

- Registro e autenticação de usuários (JWT)
- Upload de arquivos `.csv` e `.pdf`
- Ingestão automática de dados de CSV para o banco
- Consulta de datasets e registros
- Busca por campo/valor nos registros
- Registro e histórico de queries simuladas
- **Integração com IA (Hugging Face) para geração automática de respostas**
- Documentação Swagger
- Testes automatizados
- Docker e Docker Compose

---

## 🛠️ Tecnologias

- Node.js + Express
- PostgreSQL + Prisma ORM
- JWT para autenticação
- Multer para upload de arquivos
- Docker e Docker Compose
- Swagger para documentação
- Jest + Supertest para testes
- **Integração com Hugging Face Inference API**

---

## Fluxograma do Backend

```mermaid
flowchart TD
    A[Usuário] --> B[Registro/Login]
    B --> C[Upload de Dataset]
    C --> D[Ingestão de Dados]
    D --> E[Consulta/Listagem]
    E --> F[Registro de Query]
    F --> G[Histórico de Queries]
```

---

## ⚙️ Como rodar o projeto

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/central-docs-backend.git
cd central-docs-backend
```

### 2. Configure o ambiente

Crie um arquivo `.env` na raiz com:

```
DATABASE_URL=postgres://postgres:admin@localhost:5432/centraldocs
JWT_SECRET=12345678
PORT=3000
HF_API_TOKEN=seu_token_huggingface
```

> **Importante:** Para usar a integração com IA, gere um token gratuito em https://huggingface.co/settings/tokens e coloque em `HF_API_TOKEN`.

### 3. Instale as dependências

```bash
npm install
```

### 4. Rode tudo com Docker

```bash
docker compose up --build
```

---

## 🧪 Rodando os testes

```bash
npm test
```

---

## 📚 Documentação da API

Acesse a documentação Swagger em:
[http://localhost:3000/api-docs](http://localhost:3000/api-docs)

---

## 📦 Exemplos de requisições

### Registro

```http
POST /auth/register
Content-Type: application/json

{
  "nome": "João",
  "email": "joao@email.com",
  "senha": "123456"
}
```

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "joao@email.com",
  "senha": "123456"
}
```

### Upload de dataset

```http
POST /datasets/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: arquivo.csv
```

### Listar datasets

```http
GET /datasets
Authorization: Bearer <token>
```

### Listar registros de um dataset

```http
GET /datasets/{id}/records
Authorization: Bearer <token>
```

### Buscar registros por campo/valor

```http
GET /datasets/{id}/records/search?campo=nome&valor=João
Authorization: Bearer <token>
```

### **Registrar query com resposta automática da IA**

```http
POST /queries
Authorization: Bearer <token>
Content-Type: application/json

{
  "pergunta": "Onde fica a Torre Eiffel?",
  "datasetId": 1
}
```
> O campo `datasetId` é opcional. Se informado, a IA usará os dados do dataset como contexto para gerar a resposta.

**Resposta esperada:**
```json
{
  "id": 1,
  "usuario_id": 123,
  "pergunta": "Onde fica a Torre Eiffel?",
  "resposta": "A Torre Eiffel fica em Paris, França.",
  "criado_em": "2025-07-20T..."
}
```

### Listar queries do usuário

```http
GET /queries
Authorization: Bearer <token>
```

---

## 📝 Observações

- Os arquivos enviados ficam na pasta `/uploads`.
- Apenas arquivos `.csv` e `.pdf` são aceitos.
- O campo `dados_json` da tabela `Record` armazena cada linha do CSV como um objeto JSON.
- **A integração com IA utiliza o modelo `deepset/roberta-base-squad2` da Hugging Face para responder perguntas com base no contexto do dataset.**

---

## 🐳 Docker

O projeto já está pronto para rodar com Docker e Docker Compose.
Basta rodar:

```bash
docker compose up --build
```

---

## 👤 Autor

Carlos Eduardo Carvalho Cardoso |
[LinkedIn](https://www.linkedin.com/in/c-eduardocarvalho/) |
[GitHub](https://github.com/datdudu)

---