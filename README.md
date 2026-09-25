# DevShowcase API 🚀

API REST para publicação de projetos de desenvolvedores, com avaliações/feedbacks (nota 1 a 5 + comentário), curtidas (upvotes) e busca com filtro por tecnologia.

- 🌐 **Documentação Interativa (Swagger UI em Produção):** [https://devshowcase-api-ghsh.onrender.com/api/docs/](https://devshowcase-api-ghsh.onrender.com/api/docs/)
- 📄 **Especificação OpenAPI (JSON):** [https://devshowcase-api-ghsh.onrender.com/api/docs.json](https://devshowcase-api-ghsh.onrender.com/api/docs.json)

---

## 🛠️ Tecnologias Utilizadas

- **Runtime:** Node.js
- **Framework Web:** Express
- **Banco de Dados:** PostgreSQL (hospedado no Neon)
- **ORM:** Prisma
- **Validação de Schemas:** Zod
- **Documentação:** OpenAPI 3.0 / Swagger UI
- **Hospedagem da API:** Render

---

## 🏗️ Arquitetura do Projeto

O backend segue uma estrutura modular com separação clara de responsabilidades:

- `rotas/` — Define os endpoints e os direciona para a camada de serviços.
- `services/` — Recebe `(req, res)`, valida os dados com Zod, executa as regras de negócio (cálculo de média de avaliações, upvotes) e responde a requisição.
- `repositories/` — Camada de acesso e persistência no banco de dados via Prisma.
- `dtos/` — Schemas Zod para validação do corpo (body) e parâmetros das requisições.
- `middlewares/` — Tratamento global de exceções (rotas inexistentes `404` e erros inesperados `500`, incluindo payload JSON inválido).
- `docs/` — Especificação da OpenAPI / Swagger.

---

## 📌 Endpoints Principais

| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `GET` | `/api/projects` | Lista projetos cadastrados (permite filtro: `?technology=`) |
| `POST` | `/api/projects` | Registra um novo projeto |
| `GET` | `/api/projects/:id` | Retorna os detalhes de um projeto específico |
| `POST` | `/api/projects/:id/feedbacks` | Adiciona nota (1–5) e comentário, recalculando a média |
| `PUT` | `/api/projects/:id/upvote` | Incrementa o contador de curtidas (upvotes) do projeto |
| `POST` | `/api/profiles` | Cadastra um perfil de desenvolvedor |
| `GET` | `/api/profiles/:id` | Consulta o perfil do desenvolvedor pelo ID |
| `POST` | `/api/tech` | Cadastra uma nova tecnologia |
| `GET` | `/api/tech` | Retorna a lista de tecnologias disponíveis |

---

## 💻 Executando Localmente

### Pré-requisitos
- Node.js instalado
- Instância PostgreSQL configurada (ex.: Neon)

### Passo a passo

1. **Clone o repositório:**
   ```bash
   git clone [https://github.com/annasabrinams/devshowcase-api.git](https://github.com/annasabrinams/devshowcase-api.git)
   cd devshowcase-api
