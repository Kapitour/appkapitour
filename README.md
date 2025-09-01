# Kapitour - Painel Administrativo

Painel administrativo para gerenciamento do aplicativo Kapitour, desenvolvido em React com Vite.

## 🚀 Funcionalidades

### 🔐 Autenticação
- Login com validação de tipo de usuário (apenas administradores)
- Sessão persistente
- Proteção de rotas

### 📍 Gerenciamento de Pontos Turísticos
- Listagem de pontos turísticos
- Adicionar novos pontos
- Editar pontos existentes
- Excluir pontos
- Busca e filtros

### 📊 Dashboard
- Estatísticas gerais do sistema
- Visão rápida dos dados
- Ações rápidas

### 🎨 Interface
- Design responsivo
- Identidade visual consistente com o app mobile
- Interface moderna e intuitiva

## 🛠️ Tecnologias

- **React 18** - Framework principal
- **Vite** - Build tool e dev server
- **React Router** - Navegação
- **Supabase** - Backend e autenticação
- **Tailwind CSS** - Estilização
- **Lucide React** - Ícones

## 📦 Instalação

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

3. Configure o Supabase:
   - Edite `src/lib/supabase.js`
   - Adicione suas credenciais do Supabase

4. Execute o projeto:
```bash
npm run dev
```

## 🔧 Configuração

### Supabase
Edite o arquivo `src/lib/supabase.js` e adicione suas credenciais:

```javascript
const supabaseUrl = 'sua-url-do-supabase'
const supabaseAnonKey = 'sua-chave-anonima'
```

### Estrutura do Banco
O projeto espera as seguintes tabelas no Supabase:

- `usuarios` - com campo `tipo` para identificar administradores
- `pontos_turisticos` - pontos turísticos
- `rotas` - rotas turísticas
- `rota_ponto` - relacionamento entre rotas e pontos

## 📱 Rotas

- `/login` - Tela de login
- `/dashboard` - Dashboard principal
- `/pontos-turisticos` - Gerenciamento de pontos
- `/rotas` - Gerenciamento de rotas (em desenvolvimento)
- `/fotos` - Gerenciamento de fotos (em desenvolvimento)
- `/usuarios` - Gerenciamento de usuários (em desenvolvimento)
- `/configuracoes` - Configurações (em desenvolvimento)

## 🔒 Segurança

- Apenas usuários com `tipo = 'administrador'` podem acessar
- Rotas protegidas automaticamente
- Validação de sessão em todas as páginas

## 🎯 Próximos Passos

- [ ] Implementar gerenciamento de rotas
- [ ] Sistema de upload de fotos
- [ ] Gerenciamento de usuários
- [ ] Configurações do sistema
- [ ] Relatórios e analytics

## 📄 Licença

Este projeto é parte do sistema Kapitour.
