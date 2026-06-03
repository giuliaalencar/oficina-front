# Especificacao funcional

**Cliente:** Oficina  
**Projeto:** Sistema de Gestao de Oficina  
**Itens documentados:** Front-end Angular e API .NET  
**Repositorios:** `giuliaalencar/oficina-front.git` e `giuliaalencar/oficina-api.git`  
**Data de criacao:** 03/06/2026  
**Versao:** 1.0  
**Responsavel:** Time de Qualidade de Software

## 1. Sistema Oficina

Este documento descreve a especificacao funcional do sistema Oficina, composto por front-end Angular e back-end ASP.NET Core/.NET 8. A solucao permite autenticar usuarios, controlar acesso por perfil, gerenciar clientes, veiculos, itens de estoque, ordens de servico, usuarios, avanco de status, reserva e baixa de estoque, geracao de orcamento em PDF e notificacao por e-mail para itens com estoque baixo.

O objetivo do sistema e apoiar a rotina operacional de uma oficina, centralizando cadastros, acompanhamento das ordens, calculo de valores, emissao de orcamento e controle basico de estoque.

### Mockups de referencia

As telas de referencia do sistema sao:

1. Login com campos de e-mail e senha.
2. Layout autenticado com menu lateral e botao de saida.
3. Listagem e formulario de Clientes.
4. Listagem e formulario de Veiculos vinculados a Cliente.
5. Listagem e formulario de Itens de estoque.
6. Listagem, cadastro e detalhe de Ordens de Servico.
7. Aba de itens da Ordem de Servico.
8. Botao de avanco de status da Ordem de Servico.
9. Geracao/download de Orcamento em PDF.
10. Listagem e cadastro de Usuarios.

### 1.1. Pre-Requisitos

1. O usuario deve possuir cadastro valido no sistema.
2. A API deve estar publicada e acessivel pela URL `https://oficina-api-10.onrender.com/api`.
3. O front-end deve estar publicado e apontando para a URL correta da API.
4. O banco de dados Azure SQL deve estar ativo e com tabelas atualizadas.
5. O back-end deve possuir configuracao JWT valida.
6. As rotas protegidas devem receber token JWT no header `Authorization: Bearer <token>`.
7. Para cadastro de veiculo, deve existir ao menos um cliente cadastrado.
8. Para criacao de ordem de servico, deve existir ao menos um veiculo cadastrado.
9. Para adicionar item a ordem, deve existir item cadastrado.
10. Para envio de alerta de estoque baixo, o SMTP/SendGrid deve estar configurado.
11. Para download de PDF, a ordem de servico deve existir e o usuario deve ter permissao para acessa-la.

Configuracoes esperadas em producao:

```env
ASPNETCORE_ENVIRONMENT=Production
ConnectionStrings__DefaultConnection=<CONNECTION_STRING_AZURE_SQL>
Jwt__Issuer=OficinaAPI
Jwt__Audience=OficinaAPIUsers
Jwt__Key=<CHAVE_JWT_COM_32_CARACTERES_OU_MAIS>
Email__SmtpHost=smtp.sendgrid.net
Email__SmtpPort=587
Email__EnableSsl=true
Email__Username=apikey
Email__Password=<SENDGRID_API_KEY>
Email__From=<EMAIL_REMETENTE_VERIFICADO>
Email__SmtpTimeoutSeconds=20
Estoque__EmailDestino=<EMAIL_DESTINO_ALERTA>
Estoque__QuantidadeMinima=5
```

### 1.2. Seguranca

#### 1.2.1. Autenticacao ("Quem e voce?")

A autenticacao e realizada pelo endpoint `POST /api/auth/login`. O usuario informa e-mail e senha, a API valida as credenciais e retorna um token JWT quando o login e bem-sucedido.

O front-end armazena o token no `localStorage` usando a chave `token`. As chamadas HTTP protegidas devem enviar o token no header `Authorization`.

Fluxo principal:

1. Usuario acessa `/login`.
2. Usuario informa e-mail e senha.
3. Front chama `POST /api/auth/login`.
4. API valida usuario e senha.
5. API retorna `{ token }`.
6. Front salva o token.
7. Cliente e redirecionado para `/ordens-servico`.
8. Admin ou Funcionario e redirecionado para `/clientes`.

#### 1.2.2. Autorizacao ("O que voce pode fazer?")

O sistema possui tres perfis:

| Perfil | Valor no token | Permissoes principais |
| --- | --- | --- |
| Admin | `ADMIN` | Acesso completo, incluindo usuarios, clientes, veiculos, itens, ordens, PDF e reset de senha. |
| Funcionario | `FUNCIONARIO` | Acesso operacional a clientes, veiculos, itens e ordens. Nao administra usuarios. |
| Cliente | `CLIENTE` | Acesso restrito as proprias ordens e ao proprio orcamento em PDF. |

Regras de autorizacao:

1. A rota raiz autenticada usa `authGuard`.
2. O menu Clientes, Veiculos e Itens aparece apenas para Admin ou Funcionario.
3. O menu Usuarios aparece apenas para Admin.
4. Ordens de Servico aparece para todos os perfis autenticados.
5. A API de clientes, veiculos e itens exige `ADMIN` ou `FUNCIONARIO`.
6. A API de usuarios e reset de senha exige Admin.
7. Cliente so pode listar e consultar ordens vinculadas ao e-mail presente no token.
8. Cliente so pode baixar PDF de ordem vinculada ao seu e-mail.

#### 1.2.3. Dados Sensiveis

A funcionalidade manipula os seguintes dados sensiveis:

1. Senha dos usuarios.
2. Hash de senha armazenado no banco.
3. Token JWT.
4. Chave JWT.
5. String de conexao do banco.
6. Credenciais SMTP/SendGrid.
7. E-mails, CPF/CNPJ, telefone e dados de clientes.
8. Historico de ordens e valores de orcamento.

Nao devem ser expostos em tela, logs publicos ou documentacao:

1. Senhas reais.
2. Hashes de senha.
3. Tokens JWT.
4. Chaves de API.
5. String de conexao.
6. Stack traces internos.
7. Dados de cliente diferente do usuario autenticado quando o perfil for Cliente.

#### 1.2.4. Riscos Avaliados

1. **Acesso sem autenticacao:** rotas protegidas podem ser acessadas sem token. Mitigacao: uso de `authGuard` no front e `[Authorize]` na API.
2. **Escalada de permissao:** usuario Cliente pode tentar acessar rotas administrativas. Mitigacao: verificacao de perfil no front e roles na API.
3. **Exposicao de ordens de outros clientes:** Cliente pode tentar consultar ordem por ID. Mitigacao: API compara e-mail do token com e-mail do cliente vinculado ao veiculo.
4. **CPF/CNPJ invalido:** cadastro de cliente pode receber documento invalido. Mitigacao: validacao no front e `ERR_001` no back.
5. **Placa invalida:** cadastro de veiculo pode receber formato invalido. Mitigacao: validacao no front e `ERR_002` no back.
6. **Estoque negativo ou insuficiente:** ordem pode tentar reservar/baixar mais pecas do que existe. Mitigacao: validacao de estoque, `ERR_003` e notificacao de baixo estoque.
7. **Status fora de ordem:** ordem pode pular ou voltar etapa. Mitigacao: regra de sequencia obrigatoria e `ERR_004`.
8. **Falha no SMTP:** alerta de estoque baixo pode nao ser enviado. Mitigacao: retorno detalhado com `smtpConfigurado` e mensagem de configuracao.
9. **PDF indevido:** usuario pode tentar baixar orcamento sem permissao. Mitigacao: validacao por role e e-mail do cliente.
10. **Segredos versionados:** chaves podem ser enviadas ao Git. Mitigacao: uso de variaveis de ambiente e placeholders.

### 1.3. Requisitos Funcionais

| Codigo | Requisito funcional | Descricao | Criterios de aceite |
| --- | --- | --- | --- |
| RF-01 | Realizar login | O usuario deve autenticar usando e-mail e senha. | CA-01 |
| RF-02 | Controlar sessao | O front deve salvar token, identificar perfil e permitir logout. | CA-01, CA-02 |
| RF-03 | Controlar menu por perfil | O menu deve exibir opcoes conforme perfil autenticado. | CA-02 |
| RF-04 | Gerenciar usuarios | Admin deve listar e cadastrar usuarios. | CA-03 |
| RF-05 | Resetar senha | Admin deve conseguir resetar senha de usuario pela API. | CA-03 |
| RF-06 | Gerenciar clientes | Admin/Funcionario devem listar, cadastrar, editar e excluir clientes. | CA-04 |
| RF-07 | Validar CPF/CNPJ | Cliente deve possuir CPF ou CNPJ valido. | CA-04 |
| RF-08 | Gerenciar veiculos | Admin/Funcionario devem listar, cadastrar, editar e excluir veiculos vinculados a clientes. | CA-05 |
| RF-09 | Validar placa | Veiculo deve aceitar placa antiga ou Mercosul valida. | CA-05 |
| RF-10 | Gerenciar itens | Admin/Funcionario devem listar, cadastrar, editar e excluir itens. | CA-06 |
| RF-11 | Controlar estoque | Itens devem possuir estoque, estoque reservado, tipo e valor. | CA-06, CA-09 |
| RF-12 | Criar ordem de servico | Admin/Funcionario devem criar ordem vinculada a veiculo. | CA-07 |
| RF-13 | Listar ordens | Admin/Funcionario listam todas as ordens; Cliente lista apenas as suas. | CA-08 |
| RF-14 | Visualizar detalhe da ordem | Usuario autorizado deve visualizar veiculo, status, itens e valor total. | CA-08 |
| RF-15 | Adicionar item a ordem | Admin/Funcionario devem adicionar item com quantidade a uma ordem recebida. | CA-09 |
| RF-16 | Calcular total | O valor total da ordem deve ser recalculado pelos itens adicionados. | CA-09 |
| RF-17 | Avancar status | Admin/Funcionario devem avancar status na sequencia definida. | CA-10 |
| RF-18 | Reservar e baixar estoque | O estoque de pecas deve ser reservado e baixado em etapas especificas da ordem. | CA-10 |
| RF-19 | Gerar PDF | Usuario autorizado deve baixar orcamento em PDF da ordem. | CA-11 |
| RF-20 | Notificar estoque baixo | API deve enviar ou retornar status de alerta de estoque baixo. | CA-12 |
| RF-21 | Tratar erros | Sistema deve exibir mensagens claras de validacao, erro, sucesso e permissao. | CA-13 |
| RF-22 | Gerar relatorios de teste | Projeto deve possuir testes e relatorios de cobertura para front e back. | CA-14 |

### 1.4. Dados

#### 1.4.1. Entrada de pesquisa e filtros

| Tela | Campo | Tipo | Obrigatorio | Origem | Observacao |
| --- | --- | --- | --- | --- | --- |
| Login | E-mail | Texto | Sim | Usuario | Usado em `POST /api/auth/login`. |
| Login | Senha | Senha | Sim | Usuario | Nao deve ser exibida em texto claro. |
| Veiculos | Cliente | Combo | Sim | `GET /api/clientes` | Veiculo sempre pertence a um cliente. |
| Ordens | Veiculo | Combo | Sim | `GET /api/veiculos` | Necessario para criar ordem. |
| Ordens | Item | Combo | Sim, para adicionar item | `GET /api/itens` | Usado na aba de itens da ordem. |
| Ordens | Quantidade | Numero | Sim, para adicionar item | Usuario | Deve ser maior que zero. |
| Usuarios | Perfil | Combo/numero | Sim | Interface | Valores aceitos pela API: `1`, `2`, `3`. |

#### 1.4.2. Resumo geral do projeto

| Item | Descricao |
| --- | --- |
| Front-end | Angular standalone components. |
| Back-end | ASP.NET Core / .NET 8. |
| Banco | Azure SQL em producao; SQLite/local em desenvolvimento quando aplicavel. |
| Deploy front | Vercel. |
| Deploy API | Render. |
| Autenticacao | JWT com claims de nome, e-mail, role e perfil. |
| E-mail | SMTP/SendGrid para alerta de estoque baixo. |
| PDF | Gerado no back-end e baixado pelo front como `Blob`. |

#### 1.4.3. Lista de indicadores do projeto

| Indicador | Origem | Regra |
| --- | --- | --- |
| Total de ordens | `GET /api/ordens-servico/resumo` | Contagem total de ordens. |
| Ordens finalizadas | `GET /api/ordens-servico/resumo` | Conta status `Finalizada` e `Entregue`. |
| Tempo medio das ordens | `GET /api/ordens-servico/resumo` | Media em horas das ordens finalizadas. |
| Valor total da ordem | Ordem de Servico | Soma de `quantidade * valor` dos itens. |
| Itens com estoque baixo | `POST /api/itens/notificar-estoque-baixo` | Considera estoque disponivel menor ou igual ao limite. |
| Estoque disponivel | Item | `estoque - estoqueReservado`. |
| Status atual | Ordem de Servico | Etapa atual no fluxo obrigatorio. |

#### 1.4.4. Detalhe do indicador

| Contexto | Campo exibido | Origem esperada | Regra de exibicao |
| --- | --- | --- | --- |
| Ordem | ID | `ordem.id` | Exibir numero da ordem. |
| Ordem | Data de entrada | `ordem.dataEntrada` | Exibir data/hora de abertura. |
| Ordem | Veiculo | `ordem.veiculo` | Exibir placa, marca e modelo. |
| Ordem | Cliente | `ordem.veiculo.nomeCliente` | Exibir quando retornado pela API. |
| Ordem | Status | `ordem.status` | Exibir status normalizado. |
| Ordem | Itens | `ordem.itens` | Exibir descricao, quantidade, valor e flags de estoque. |
| Ordem | Valor total | `ordem.valorTotal` | Exibir soma calculada. |
| Estoque | Estoque reservado | `item.estoqueReservado` | Usado para bloquear baixa sem reserva. |
| Estoque | Estoque disponivel | `estoque - estoqueReservado` | Usado para alerta e validacao. |

#### 1.4.5. Dados de sessao

| Dado | Origem | Persistencia | Observacao |
| --- | --- | --- | --- |
| Token JWT | Login | `localStorage.token` | Removido no logout. |
| Perfil | Claim `perfil`, `role` ou role Microsoft | Decodificado do token | Usado para menu e redirecionamento. |
| E-mail | Claim de e-mail | Token JWT | Usado pela API para filtrar ordens de Cliente. |
| Estado de login | Existencia do token | Memoria/localStorage | `authGuard` bloqueia rota sem token. |

#### 1.4.6. APIs utilizadas

| Acao | Metodo | Endpoint | Entrada | Saida esperada | Perfil |
| --- | --- | --- | --- | --- | --- |
| Login | POST | `/api/auth/login` | `email`, `senha` | `{ token }` | Publico |
| Listar usuarios | GET | `/api/auth/usuarios` | Token | Lista de usuarios | Admin |
| Cadastrar usuario | POST | `/api/auth/usuarios` | `nome`, `email`, `senha`, `perfil` | Mensagem de sucesso | Admin |
| Resetar senha | POST | `/api/auth/resetar-senha` | `email`, `senha` | Mensagem de sucesso | Admin |
| Listar clientes | GET | `/api/clientes` | Token | Lista de clientes | Admin/Funcionario |
| Buscar cliente | GET | `/api/clientes/{id}` | `id` | Cliente | Admin/Funcionario |
| Criar cliente | POST | `/api/clientes` | Nome, e-mail, telefone, CPF/CNPJ | Cliente criado | Admin/Funcionario |
| Atualizar cliente | PUT | `/api/clientes/{id}` | Dados do cliente | Cliente atualizado | Admin/Funcionario |
| Excluir cliente | DELETE | `/api/clientes/{id}` | `id` | `204 NoContent` | Admin/Funcionario |
| Listar veiculos | GET | `/api/veiculos` | Token, opcional `clienteId` | Lista de veiculos | Admin/Funcionario |
| Buscar veiculo | GET | `/api/veiculos/{id}` | `id` | Veiculo | Admin/Funcionario |
| Criar veiculo | POST | `/api/veiculos` | Cliente, placa, marca, modelo, ano | Veiculo criado | Admin/Funcionario |
| Atualizar veiculo | PUT | `/api/veiculos/{id}` | Dados do veiculo | Veiculo atualizado | Admin/Funcionario |
| Excluir veiculo | DELETE | `/api/veiculos/{id}` | `id` | `204 NoContent` | Admin/Funcionario |
| Listar itens | GET | `/api/itens` | Token | Lista de itens | Admin/Funcionario |
| Buscar item | GET | `/api/itens/{id}` | `id` | Item | Admin/Funcionario |
| Criar item | POST | `/api/itens` | Descricao, valor, estoque, tipo | Item criado | Admin/Funcionario |
| Atualizar item | PUT | `/api/itens/{id}` | Dados do item | Item atualizado | Admin/Funcionario |
| Excluir item | DELETE | `/api/itens/{id}` | `id` | `204 NoContent` | Admin/Funcionario |
| Notificar estoque baixo | POST | `/api/itens/notificar-estoque-baixo` | Token | Resultado detalhado | Admin/Funcionario |
| Listar ordens | GET | `/api/ordens-servico` | Token | Lista de ordens | Admin/Funcionario/Cliente |
| Resumo de ordens | GET | `/api/ordens-servico/resumo` | Token | Totais e tempo medio | Admin/Funcionario |
| Buscar ordem | GET | `/api/ordens-servico/{id}` | `id` | Detalhe da ordem | Admin/Funcionario/Cliente |
| Criar ordem | POST | `/api/ordens-servico` | `veiculoId` | Ordem criada | Admin/Funcionario |
| Adicionar item | POST | `/api/ordens-servico/{id}/itens` | `itemId`, `quantidade` | Confirmacao | Admin/Funcionario |
| Atualizar status | PUT | `/api/ordens-servico/{id}/status` | `status` | Confirmacao | Admin/Funcionario |
| Avancar status | POST | `/api/ordens-servico/{id}/avancar-status` | `id` | Confirmacao | Admin/Funcionario |
| Baixar PDF | GET | `/api/ordens-servico/{id}/orcamento-pdf` | `id` | Arquivo PDF | Admin/Funcionario/Cliente |

### 1.5. Regras

1. **Login obrigatorio:** rotas autenticadas nao devem abrir sem token.
2. **Token JWT:** token deve conter nome, e-mail, role e claim `perfil`.
3. **Logout:** ao sair, o token deve ser removido do `localStorage`.
4. **Redirecionamento por perfil:** Cliente vai para Ordens; Admin/Funcionario vai para Clientes.
5. **Menu por perfil:** Clientes, Veiculos e Itens aparecem somente para Admin/Funcionario; Usuarios somente para Admin.
6. **Usuarios:** apenas Admin lista, cadastra e reseta senha.
7. **Perfil de usuario:** API aceita `1`, `2`, `3`; no back, `1=ADMIN`, `2=CLIENTE`, `3=FUNCIONARIO`.
8. **E-mail unico:** nao e permitido cadastrar usuario com e-mail duplicado.
9. **Senha:** senha deve ser armazenada com hash; login tambem aceita comparacao com hash.
10. **Cliente obrigatorio:** cliente deve possuir nome, e-mail, telefone e CPF/CNPJ.
11. **CPF/CNPJ:** documento invalido deve retornar `ERR_001 - CPF/CNPJ invalido.`
12. **Veiculo obrigatorio:** veiculo deve possuir cliente, placa, marca, modelo e ano.
13. **Placa:** deve aceitar formato antigo `AAA0000` ou Mercosul `AAA0A00`; invalida retorna `ERR_002 - Placa invalida.`
14. **Item obrigatorio:** item deve possuir descricao, valor maior que zero, estoque nao negativo e tipo.
15. **Servico nao controla estoque:** item do tipo Servico nao deve ser considerado no alerta/baixa de estoque.
16. **Ordem obrigatoria:** ordem deve ser criada vinculada a veiculo existente.
17. **Status inicial:** toda ordem nova inicia com status `Recebida`.
18. **Adicionar item:** itens so podem ser adicionados quando a ordem estiver em `Recebida`.
19. **Quantidade:** quantidade de item na ordem deve ser maior que zero.
20. **Valor total:** valor total da ordem deve ser a soma de `quantidade * valor` dos itens.
21. **Fluxo de status:** a ordem deve seguir: Recebida, Em Diagnostico, Aguardando Aprovacao, Em Execucao, Finalizada, Entregue.
22. **Nao pular status:** tentativa de pular ou voltar status retorna `ERR_004 - Nao e permitido pular ou voltar status.`
23. **Avanco automatico:** endpoint `avancar-status` calcula o proximo status permitido.
24. **Reserva de estoque:** ao chegar em `Aguardando Aprovacao`, pecas devem ser reservadas se houver estoque disponivel.
25. **Estoque insuficiente:** falta de estoque retorna `ERR_003 - Sem estoque.`
26. **Baixa de estoque:** ao chegar em `Em Execucao`, estoque reservado deve ser baixado do estoque fisico.
27. **Estoque reservado insuficiente:** tentativa de baixa sem reserva suficiente retorna `ERR_003 - Estoque reservado insuficiente.`
28. **Alerta de estoque baixo:** ao cadastrar/atualizar item ou baixar estoque, API tenta notificar itens abaixo do limite.
29. **Limite de estoque baixo:** padrao e `5`, sobrescrito por `Estoque__QuantidadeMinima`.
30. **PDF pelo back:** o front nao monta PDF; apenas chama a API e baixa o `Blob` retornado.
31. **PDF do Cliente:** Cliente so recebe PDF se a ordem pertencer ao e-mail do token.
32. **Lista de ordens do Cliente:** Cliente lista apenas ordens vinculadas ao seu e-mail.
33. **Dados ausentes:** quando relacionamento nao for encontrado em tela, exibir fallback como `Cliente nao encontrado` ou `Veiculo nao encontrado`.
34. **Erros da API:** quando `err.error` existir, o front deve priorizar a mensagem retornada.
35. **Relatorios:** testes devem poder gerar resultado e cobertura para front e back.

### 1.6. Mensagem de erro/informacao

| Situacao | Tipo | Mensagem |
| --- | --- | --- |
| E-mail vazio no login | Aviso | `Digite seu email.` |
| Senha vazia no login | Aviso | `Digite sua senha.` |
| API indisponivel no login | Erro | `Nao foi possivel conectar com a API. Aguarde alguns segundos e tente novamente.` |
| Login invalido | Erro | `Email ou senha invalidos.` |
| Token ausente na resposta | Erro | `Login realizado, mas o token nao foi retornado.` |
| Erro generico de login | Erro | `Erro ao fazer login.` |
| Usuarios sem permissao | Erro | `Erro ao carregar usuarios. Apenas ADMIN pode acessar esta tela.` |
| Nome de usuario vazio | Aviso | `Informe o nome.` |
| E-mail de usuario vazio | Aviso | `Informe o email.` |
| Senha de usuario vazia | Aviso | `Informe a senha.` |
| Perfil invalido | Aviso | `Perfil invalido.` |
| Usuario cadastrado | Sucesso | `Usuario cadastrado com sucesso!` |
| Cliente sem nome | Aviso | `Informe o nome do cliente.` |
| Cliente sem e-mail | Aviso | `Informe o email do cliente.` |
| Cliente sem telefone | Aviso | `Informe o telefone do cliente.` |
| Cliente sem documento | Aviso | `Informe o CPF ou CNPJ.` |
| Documento invalido | Erro | `CPF/CNPJ invalido.` |
| Cliente criado | Sucesso | `Cliente cadastrado com sucesso!` |
| Cliente atualizado | Sucesso | `Cliente atualizado com sucesso!` |
| Cliente excluido | Sucesso | `Cliente excluido com sucesso!` |
| Erro ao carregar clientes | Erro | `Erro ao carregar clientes` |
| Veiculo sem cliente | Aviso | `Selecione um cliente.` |
| Veiculo sem placa | Aviso | `Informe a placa do veiculo.` |
| Placa invalida | Erro | `Formato de placa invalido.` |
| Veiculo sem marca | Aviso | `Informe a marca do veiculo.` |
| Veiculo sem modelo | Aviso | `Informe o modelo do veiculo.` |
| Ano invalido | Aviso | `Informe um ano valido.` |
| Veiculo criado | Sucesso | `Veiculo cadastrado com sucesso!` |
| Veiculo atualizado | Sucesso | `Veiculo atualizado com sucesso!` |
| Veiculo excluido | Sucesso | `Veiculo excluido com sucesso!` |
| Item sem descricao | Aviso | `Informe a descricao do item.` |
| Item sem valor valido | Aviso | `Informe um valor maior que zero.` |
| Estoque negativo | Aviso | `O estoque nao pode ser negativo.` |
| Item sem tipo | Aviso | `Selecione o tipo do item.` |
| Item criado | Sucesso | `Item cadastrado com sucesso!` |
| Item atualizado | Sucesso | `Item atualizado com sucesso!` |
| Item excluido | Sucesso | `Item excluido com sucesso!` |
| Ordem sem veiculo | Aviso | `Selecione um veiculo para criar a ordem.` |
| Erro ao carregar ordens | Erro | `Erro ao carregar ordens de servico` |
| Erro ao carregar itens | Erro | `Erro ao carregar itens` |
| Ordem sem item selecionado | Aviso | `Selecione um item.` |
| Quantidade invalida | Aviso | `Informe uma quantidade maior que zero.` |
| Item adicionado | Sucesso | `Item adicionado!` |
| Estoque indisponivel | Erro | `Estoque indisponivel para um ou mais itens desta ordem.` |
| Status atualizado | Sucesso | `Status atualizado com sucesso!` |
| Status invalido | Erro | `ERR_004 - Nao e permitido pular ou voltar status.` |
| Ordem sem permissao para PDF | Erro | `Voce nao tem permissao para acessar este orcamento.` |
| PDF sem ordem | Aviso | `Selecione uma ordem para gerar o orcamento.` |
| PDF gerado | Sucesso | `Orcamento em PDF gerado com sucesso!` |
| Erro no PDF | Erro | `Erro ao gerar PDF do orcamento.` |
| SMTP ausente | Informacao | `SMTP nao configurado. Configure Email__Password, Email__Username, Email__From, Email__SmtpHost e Email__SmtpPort no Render.` |
| Sem estoque baixo | Informacao | `Nenhum item com estoque baixo encontrado.` |
| E-mail enviado | Sucesso | `E-mail de estoque baixo enviado para {email}.` |

### 1.7. Fora do Escopo

1. Pagamento online.
2. Emissao de nota fiscal.
3. Agendamento de servicos.
4. Integracao com WhatsApp.
5. Cadastro publico de usuario.
6. Recuperacao publica de senha por e-mail.
7. Controle financeiro completo.
8. Controle de fornecedores.
9. Compra automatica de estoque.
10. App mobile nativo.
11. Edicao de itens da ordem depois de avancar status.
12. Cancelamento formal de ordem de servico.
13. Historico/auditoria detalhada de status.
14. Upload de imagens ou anexos.
15. Envio automatico do PDF para o cliente por e-mail.

### 1.8. Criterios de Aceite

**CA-01 - Login e acesso ao sistema:** O usuario deve conseguir acessar `/login`, informar e-mail e senha validos, receber token JWT, ter o token salvo no navegador e ser redirecionado conforme perfil. Com credenciais invalidas, o acesso deve ser negado.

**CA-02 - Autorizacao por perfil:** O sistema deve exibir menu e permitir rotas conforme perfil. Admin visualiza Usuarios; Admin/Funcionario visualizam Clientes, Veiculos, Itens e Ordens; Cliente visualiza apenas Ordens permitidas.

**CA-03 - Gestao de usuarios:** Admin deve listar usuarios, cadastrar novo usuario com nome, e-mail, senha e perfil valido, impedir e-mail duplicado e conseguir resetar senha pela API.

**CA-04 - Gestao de clientes:** Admin/Funcionario devem listar, cadastrar, editar e excluir clientes. O sistema deve validar campos obrigatorios e CPF/CNPJ antes de salvar.

**CA-05 - Gestao de veiculos:** Admin/Funcionario devem listar, cadastrar, editar e excluir veiculos vinculados a clientes. O sistema deve validar cliente, placa, marca, modelo e ano.

**CA-06 - Gestao de itens:** Admin/Funcionario devem listar, cadastrar, editar e excluir itens com descricao, valor, estoque e tipo. Estoque nao pode ser negativo e valor deve ser maior que zero.

**CA-07 - Criacao de ordem de servico:** Admin/Funcionario devem criar uma ordem vinculada a veiculo existente. A ordem deve iniciar com status `Recebida` e valor total zero.

**CA-08 - Listagem e detalhe de ordens:** Admin/Funcionario devem visualizar todas as ordens. Cliente deve visualizar apenas ordens vinculadas ao proprio e-mail. O detalhe deve exibir veiculo, status, itens e valor total.

**CA-09 - Adicao de itens e calculo de total:** Admin/Funcionario devem adicionar itens a uma ordem em status `Recebida`, informando quantidade maior que zero. O valor total deve ser recalculado.

**CA-10 - Fluxo de status e estoque:** Admin/Funcionario devem avancar status apenas na sequencia permitida. O sistema deve reservar estoque ao chegar em `Aguardando Aprovacao` e baixar estoque ao chegar em `Em Execucao`, bloqueando falta de estoque.

**CA-11 - Orcamento em PDF:** Usuario autorizado deve conseguir baixar o PDF da ordem. Cliente so pode baixar PDF de ordem vinculada ao seu e-mail.

**CA-12 - Alerta de estoque baixo:** A API deve identificar itens com estoque disponivel menor ou igual ao limite configurado, enviar e-mail quando SMTP estiver configurado e retornar informacao clara quando nao houver itens ou SMTP estiver incompleto.

**CA-13 - Mensagens e tratamento de erro:** O front deve exibir mensagens especificas de validacao, sucesso e erro. Quando a API retornar texto de erro, essa mensagem deve ser priorizada.

**CA-14 - Testes e relatorios:** O projeto deve possuir testes de front e back, alem de relatorios de cobertura geraveis por comando.

### 1.9. Cenarios de Teste

#### 1.9.1. Criterio de Aceite: CA-01 - Login e acesso ao sistema

1. **Login com Admin valido**  
Dado que existe usuario Admin cadastrado, quando informar e-mail e senha corretos, entao a API deve retornar token e o front deve redirecionar para `/clientes`.

2. **Login com Cliente valido**  
Dado que existe usuario Cliente cadastrado, quando informar e-mail e senha corretos, entao a API deve retornar token e o front deve redirecionar para `/ordens-servico`.

3. **Login com credenciais invalidas**  
Dado que a senha esta incorreta, quando clicar em entrar, entao o sistema deve exibir `Email ou senha invalidos.` e nao deve salvar token.

4. **Campos obrigatorios no login**  
Dado que e-mail ou senha estejam vazios, quando clicar em entrar, entao o sistema deve exibir a mensagem obrigatoria correspondente.

#### 1.9.2. Criterio de Aceite: CA-02 - Autorizacao por perfil

1. **Admin visualiza menu completo**  
Dado que o usuario logado possui perfil Admin, quando abrir o layout autenticado, entao deve visualizar Clientes, Veiculos, Itens, Ordens e Usuarios.

2. **Funcionario nao visualiza Usuarios**  
Dado que o usuario logado possui perfil Funcionario, quando abrir o layout autenticado, entao nao deve visualizar a opcao Usuarios.

3. **Cliente visualiza somente Ordens**  
Dado que o usuario logado possui perfil Cliente, quando abrir o layout autenticado, entao deve visualizar `Minhas Ordens` e nao deve visualizar cadastros administrativos.

4. **Acesso direto sem token**  
Dado que nao existe token no navegador, quando acessar rota protegida, entao o guard deve bloquear e redirecionar para login.

#### 1.9.3. Criterio de Aceite: CA-03 - Gestao de usuarios

1. **Listar usuarios como Admin**  
Dado que o usuario possui perfil Admin, quando acessar `/usuarios`, entao o front deve chamar `GET /api/auth/usuarios` e exibir a lista.

2. **Bloquear usuarios para nao Admin**  
Dado que o usuario nao possui perfil Admin, quando tentar carregar usuarios, entao a API deve retornar proibido e a tela deve informar que apenas Admin acessa.

3. **Cadastrar usuario valido**  
Dado que Admin preenche nome, e-mail, senha e perfil valido, quando salvar, entao a API deve criar usuario com senha protegida por hash.

4. **Impedir perfil invalido**  
Dado que o perfil informado nao e `1`, `2` ou `3`, quando salvar, entao o sistema deve exibir `Perfil invalido.`

5. **Impedir e-mail duplicado**  
Dado que ja existe usuario com o e-mail informado, quando cadastrar, entao a API deve retornar `Ja existe um usuario com este email.`

#### 1.9.4. Criterio de Aceite: CA-04 - Gestao de clientes

1. **Listar clientes**  
Dado que Admin/Funcionario acessa `/clientes`, quando a tela inicializar, entao deve chamar `GET /api/clientes`.

2. **Cadastrar cliente valido**  
Dado que os campos obrigatorios foram preenchidos e CPF/CNPJ e valido, quando salvar, entao o cliente deve ser criado e listado.

3. **Rejeitar CPF/CNPJ invalido**  
Dado que o documento possui formato invalido, quando salvar, entao o front deve exibir `CPF/CNPJ invalido.`

4. **Editar cliente existente**  
Dado que existe cliente cadastrado, quando acessar `/clientes/cadastro?clienteId={id}`, entao os dados devem ser carregados e atualizados ao salvar.

5. **Excluir cliente existente**  
Dado que existe cliente cadastrado, quando acionar exclusao, entao a API deve remover o cliente e retornar `204 NoContent`.

#### 1.9.5. Criterio de Aceite: CA-05 - Gestao de veiculos

1. **Listar veiculos**  
Dado que Admin/Funcionario acessa `/veiculos`, quando a tela inicializar, entao deve chamar `GET /api/veiculos`.

2. **Carregar clientes no cadastro**  
Dado que o usuario acessa cadastro de veiculo, quando a tela abrir, entao deve carregar clientes pelo endpoint `GET /api/clientes`.

3. **Cadastrar veiculo valido**  
Dado que cliente, placa, marca, modelo e ano validos foram preenchidos, quando salvar, entao o veiculo deve ser criado.

4. **Rejeitar placa invalida**  
Dado que a placa nao segue formato antigo ou Mercosul, quando salvar, entao deve aparecer `Formato de placa invalido.`

5. **Editar veiculo existente**  
Dado que existe veiculo cadastrado, quando acessar `/veiculos/cadastro?veiculoId={id}`, entao os dados devem ser carregados e atualizados ao salvar.

#### 1.9.6. Criterio de Aceite: CA-06 - Gestao de itens

1. **Listar itens**  
Dado que Admin/Funcionario acessa `/itens`, quando a tela inicializar, entao deve chamar `GET /api/itens`.

2. **Cadastrar item valido**  
Dado que descricao, valor, estoque e tipo foram preenchidos corretamente, quando salvar, entao o item deve ser criado.

3. **Rejeitar valor zero**  
Dado que valor e menor ou igual a zero, quando salvar, entao deve aparecer `Informe um valor maior que zero.`

4. **Rejeitar estoque negativo**  
Dado que estoque e negativo, quando salvar, entao deve aparecer `O estoque nao pode ser negativo.`

5. **Disparar verificacao de estoque baixo**  
Dado que item foi criado ou atualizado, quando a API salvar, entao deve executar verificacao de estoque baixo.

#### 1.9.7. Criterio de Aceite: CA-07 - Criacao de ordem de servico

1. **Criar ordem com veiculo valido**  
Dado que existe veiculo cadastrado, quando Admin/Funcionario selecionar o veiculo e salvar, entao a API deve criar ordem com status `Recebida`.

2. **Bloquear criacao sem veiculo**  
Dado que nenhum veiculo foi selecionado, quando salvar, entao deve aparecer `Selecione um veiculo para criar a ordem.`

3. **Rejeitar veiculo inexistente**  
Dado que o veiculo informado nao existe, quando a API processar a criacao, entao deve retornar `Veiculo nao encontrado.`

#### 1.9.8. Criterio de Aceite: CA-08 - Listagem e detalhe de ordens

1. **Admin lista todas as ordens**  
Dado que Admin acessa Ordens, quando a tela carregar, entao a API deve retornar todas as ordens.

2. **Cliente lista somente suas ordens**  
Dado que Cliente acessa Minhas Ordens, quando a API consultar, entao deve retornar apenas ordens cujo e-mail do cliente seja igual ao e-mail do token.

3. **Visualizar detalhe da ordem**  
Dado que existe ordem cadastrada, quando selecionar a ordem, entao deve chamar `GET /api/ordens-servico/{id}` e exibir veiculo, status, itens e valor total.

4. **Bloquear detalhe de outro cliente**  
Dado que Cliente tenta acessar ordem de outro e-mail, quando a API validar permissao, entao deve retornar proibido.

#### 1.9.9. Criterio de Aceite: CA-09 - Adicao de itens e calculo de total

1. **Adicionar item em ordem recebida**  
Dado que a ordem esta em `Recebida`, quando selecionar item e quantidade maior que zero, entao o item deve ser adicionado.

2. **Recalcular valor total**  
Dado que um item foi adicionado, quando a API salvar, entao o valor total deve somar `quantidade * valor`.

3. **Bloquear item sem selecao**  
Dado que nenhum item foi selecionado, quando adicionar, entao deve aparecer `Selecione um item.`

4. **Bloquear quantidade invalida**  
Dado que quantidade e menor ou igual a zero, quando adicionar, entao deve aparecer `Informe uma quantidade maior que zero.`

5. **Bloquear adicao fora de Recebida**  
Dado que a ordem ja avancou de status, quando tentar adicionar item, entao a API deve retornar `ERR_004 - Nao e permitido adicionar itens neste status.`

#### 1.9.10. Criterio de Aceite: CA-10 - Fluxo de status e estoque

1. **Avancar para Em Diagnostico**  
Dado que a ordem esta em `Recebida`, quando acionar avancar status, entao deve ir para `Em Diagnostico`.

2. **Reservar estoque ao aguardar aprovacao**  
Dado que a ordem possui pecas e esta em `Em Diagnostico`, quando avancar para `Aguardando Aprovacao`, entao a API deve reservar estoque das pecas.

3. **Bloquear reserva sem estoque**  
Dado que estoque disponivel e menor que a quantidade da ordem, quando avancar para `Aguardando Aprovacao`, entao deve retornar `ERR_003 - Sem estoque.`

4. **Baixar estoque em execucao**  
Dado que a ordem possui estoque reservado, quando avancar para `Em Execucao`, entao a API deve subtrair do estoque fisico e reduzir o reservado.

5. **Impedir pular status**  
Dado que a ordem esta em `Recebida`, quando tentar mudar diretamente para `Finalizada`, entao deve retornar `ERR_004 - Nao e permitido pular ou voltar status.`

6. **Impedir avanco depois de Entregue**  
Dado que a ordem esta em `Entregue`, quando acionar avancar, entao deve retornar `ERR_004 - Nao existe proximo status para esta ordem.`

#### 1.9.11. Criterio de Aceite: CA-11 - Orcamento em PDF

1. **Baixar PDF como Admin/Funcionario**  
Dado que existe ordem cadastrada, quando Admin/Funcionario clicar para gerar PDF, entao o front deve chamar `GET /api/ordens-servico/{id}/orcamento-pdf` e baixar `orcamento-os-{id}.pdf`.

2. **Baixar PDF como Cliente autorizado**  
Dado que Cliente possui ordem vinculada ao seu e-mail, quando baixar PDF, entao a API deve retornar o arquivo.

3. **Bloquear PDF de outro cliente**  
Dado que Cliente tenta baixar PDF de ordem de outro cliente, quando a API validar o e-mail, entao deve retornar erro de permissao.

4. **Exibir erro quando PDF falhar**  
Dado que a API falha na geracao, quando o front tratar o erro, entao deve exibir `Erro ao gerar PDF do orcamento.`

#### 1.9.12. Criterio de Aceite: CA-12 - Alerta de estoque baixo

1. **Enviar e-mail com itens baixos**  
Dado que existem pecas com estoque disponivel menor ou igual ao limite e SMTP configurado, quando executar notificacao, entao a API deve enviar e-mail e retornar `emailEnviado: true`.

2. **Nao enviar sem itens baixos**  
Dado que todos os itens estao acima do limite, quando executar notificacao, entao deve retornar `Nenhum item com estoque baixo encontrado.`

3. **Informar SMTP incompleto**  
Dado que existem itens baixos mas SMTP nao esta configurado, quando executar notificacao, entao deve retornar mensagem orientando configurar variaveis de e-mail.

4. **Ignorar servicos no estoque**  
Dado que item possui tipo `Servico`, quando calcular baixo estoque, entao ele nao deve ser considerado como item controlado por estoque.

#### 1.9.13. Criterio de Aceite: CA-13 - Mensagens e tratamento de erro

1. **Priorizar erro textual da API**  
Dado que a API retorna corpo textual de erro, quando o front tratar a resposta, entao deve exibir essa mensagem quando houver regra implementada.

2. **Exibir erro padrao sem detalhe**  
Dado que a API falha sem mensagem especifica, quando o front tratar, entao deve exibir a mensagem padrao da operacao.

3. **Manter tela consistente apos erro**  
Dado que uma operacao falha, quando a mensagem for exibida, entao os dados ja carregados nao devem ser corrompidos.

4. **Exibir sucesso apos operacao**  
Dado que uma criacao, edicao, exclusao, adicao, status ou PDF finaliza com sucesso, quando a resposta retornar, entao deve ser exibida mensagem de sucesso quando previsto na tela.

#### 1.9.14. Criterio de Aceite: CA-14 - Testes e relatorios

1. **Executar testes do back-end**  
Dado que o repositorio da API esta configurado, quando executar `dotnet test oficina-api.sln`, entao os testes de Controller, Business e DAL devem rodar.

2. **Gerar cobertura do back-end**  
Dado que os testes do back foram executados com cobertura, quando executar ReportGenerator, entao deve ser gerado relatorio HTML.

3. **Executar testes do front-end**  
Dado que o repositorio do front esta configurado, quando executar `npm test -- --watch=false --code-coverage`, entao os testes de componentes, servicos, guard e interceptor devem rodar.

4. **Registrar evidencias**  
Dado que os relatorios foram gerados, quando finalizar a validacao, entao os caminhos dos relatorios devem ser informados como evidencia.

### 1.10. Testes e Relatorios

Back-end:

1. Testes unitarios de Business.
2. Testes unitarios de DAL.
3. Testes de integracao de Controllers.
4. Relatorio HTML de cobertura.

Comandos do back:

```powershell
cd "C:\Users\giuli\OneDrive\Área de Trabalho\Internship 2026\oficina-api"
dotnet test oficina-api.sln --collect:"XPlat Code Coverage" --results-directory TestResults
dotnet tool run reportgenerator -reports:"TestResults/**/coverage.cobertura.xml" -targetdir:"TestResults/CoverageReport" -reporttypes:Html
```

Relatorio do back:

```text
C:\Users\giuli\OneDrive\Área de Trabalho\Internship 2026\oficina-api\TestResults\CoverageReport\index.html
```

Front-end:

1. Testes unitarios de componentes.
2. Testes de servicos.
3. Testes de guard e interceptor.
4. Relatorio HTML de cobertura.

Comandos do front:

```powershell
cd "C:\Users\giuli\oficina-front-1"
npm test -- --watch=false --code-coverage
```

Relatorio do front:

```text
C:\Users\giuli\oficina-front-1\TestResults\CoverageReport\index.html
```

### 1.11. Deploy e Publicacao

| Item | Ambiente | URL/Origem |
| --- | --- | --- |
| Front-end | Vercel | `https://oficina-front.vercel.app` |
| API | Render | `https://oficina-api-10.onrender.com` |
| Swagger | Render | `https://oficina-api-10.onrender.com/swagger/index.html` |
| Repositorio front | GitHub | `https://github.com/giuliaalencar/oficina-front.git` |
| Repositorio API | GitHub | `https://github.com/giuliaalencar/oficina-api.git` |
| Banco | Azure SQL | Configurado por variavel de ambiente no Render. |
| E-mail | SendGrid/SMTP | Configurado por variaveis `Email__*`. |

### 1.12. Contas de Teste

As contas abaixo sao exemplos esperados para validacao. A senha real deve ficar fora da documentacao e ser compartilhada apenas por canal seguro.

| Perfil | E-mail | Senha |
| --- | --- | --- |
| Admin | `admin@teste.com` | `<SENHA_DE_TESTE>` |
| Funcionario | `funcionario@teste.com` | `<SENHA_DE_TESTE>` |
| Cliente | `cliente@teste.com` | `<SENHA_DE_TESTE>` |

### 1.13. Evidencias Esperadas

1. Swagger abrindo em producao.
2. Login retornando token.
3. Front abrindo em producao.
4. Menu variando conforme perfil.
5. CRUD de clientes funcionando.
6. CRUD de veiculos funcionando.
7. CRUD de itens funcionando.
8. Criacao e listagem de ordens funcionando.
9. Cliente visualizando apenas suas ordens.
10. Avanco de status seguindo a sequencia obrigatoria.
11. Bloqueio de estoque insuficiente.
12. PDF sendo baixado pelo navegador.
13. Alerta de estoque baixo retornando resultado esperado.
14. Relatorio de cobertura do back gerado.
15. Relatorio de cobertura do front gerado.
