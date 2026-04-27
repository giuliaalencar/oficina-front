# Oficina Front

Interface web do Sistema Integrado de Atendimento e Execução de Serviços para uma oficina mecânica.

## Links

Front publicado: https://oficina-front.vercel.app

API/Swagger: https://oficina-api-10.onrender.com/swagger

## Tecnologias

- Angular
- TypeScript
- Bootstrap
- HTML
- CSS
- Vercel

## Funcionalidades

- Login com autenticação JWT
- Proteção de rotas
- Cadastro, listagem, edição e exclusão de clientes
- Cadastro, listagem, edição e exclusão de veículos
- Cadastro, listagem, edição e exclusão de peças e serviços
- Criação de ordens de serviço
- Separação da OS em abas: Dados Gerais, Serviços, Peças e Resumo
- Adição de serviços e peças na OS
- Cálculo automático do valor total da OS
- Fluxo de status da OS: Recebida, Em Diagnóstico, Aguardando Aprovação, Em Execução, Finalizada e Entregue
- Exibição de erro para estoque indisponível
- Validação de campos obrigatórios
- Validação de CPF/CNPJ e placa
- Dashboard/resumo de ordens

## Usuários de teste

Administrador:

Email: giulia.sia@hotmail.com  
Senha: 123456

Cliente:

Email: cliente@teste.com  
Senha: 123456

## Como rodar localmente

Instale as dependências:

```bash
npm install
Inicie o projeto:

npm start
Acesse:

http://localhost:4200
Build
npm run build
API utilizada
A aplicação consome a API publicada em:

https://oficina-api-10.onrender.com
Principais endpoints:

POST /api/auth/login
GET /api/clientes
POST /api/clientes
GET /api/veiculos
POST /api/veiculos
GET /api/itens
POST /api/itens
GET /api/ordens-servico
POST /api/ordens-servico
PUT /api/ordens-servico/{id}/status
GET /api/ordens-servico/resumo
Observações
O sistema foi desenvolvido conforme a especificação funcional e técnica do projeto de conclusão de treinamento, contemplando autenticação, cadastros principais, controle de ordens de serviço, validação de status, cálculo de orçamento e controle de estoque.
