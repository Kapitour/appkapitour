# 🏛️ Kapitour - App de Turismo de Maricá

> **Descubra as maravilhas de Maricá com a Kapitour!**  
> Aplicativo móvel desenvolvido em React Native para explorar pontos turísticos, rotas personalizadas e produtos locais da cidade de Maricá - RJ.

<div align="center">
  <img src="./assets/Kapitour.png" alt="Logo Kapitour" width="200"/>
</div>

---

## 📱 Sobre o Projeto

O **Kapitour** é um aplicativo de turismo completo que oferece:

- 🗺️ **Rotas Turísticas Personalizadas** - Explore Maricá através de roteiros curados
- 📍 **Pontos Turísticos** - Descubra locais incríveis com informações detalhadas
- 🛍️ **Loja Integrada** - Produtos locais com controle de estoque em tempo real
- 👤 **Sistema de Usuário** - Cadastro, login e área personalizada
- 📊 **Progresso de Rotas** - Acompanhe suas visitas e conquistas

---

## 🚀 Tecnologias Utilizadas

### Frontend Mobile
- **React Native** - Framework principal
- **Expo** - Plataforma de desenvolvimento
- **React Navigation** - Navegação entre telas
- **Expo Linear Gradient** - Gradientes visuais
- **Expo Checkbox** - Componentes de interface

### Backend & Database
- **Supabase** - Backend como serviço
- **PostgreSQL** - Banco de dados relacional
- **Real-time subscriptions** - Atualizações em tempo real

### Ferramentas de Desenvolvimento
- **Git & GitHub** - Controle de versão
- **Genymotion** - Emulador Android
- **Expo Go** - Teste em dispositivos físicos

---

## 📂 Estrutura do Projeto

```
appkapitour/
├── 📱 android/              # Configurações Android
├── 🖼️ assets/               # Imagens e recursos
├── 🧩 components/           # Componentes reutilizáveis
│   ├── Categories.jsx       # Filtro de categorias
│   ├── MostCaroussel.jsx    # Carrossel de rotas populares
│   ├── Map.jsx              # Componente de mapa
│   └── ...
├── 📱 Screens/              # Telas principais
│   ├── Home.jsx             # Tela inicial
│   ├── Rotas.jsx            # Lista de rotas
│   ├── DetalhesRotas.jsx    # Detalhes da rota
│   ├── Loja.jsx             # Loja de produtos
│   ├── Login.jsx            # Autenticação
│   └── ...
├── 🔧 lib/                  # Configurações
│   └── supabase.ts          # Cliente Supabase
├── 📝 constants/            # Constantes da aplicação
└── 📋 package.json          # Dependências do projeto
```

---

## ⚙️ Instalação e Configuração

### Pré-requisitos
- **Node.js** (versão 16+)
- **npm** ou **yarn**
- **Expo CLI** (`npm install -g @expo/cli`)
- **Git**

### 1️⃣ Clone o Repositório
```bash
git clone https://github.com/Kapitour/appkapitour.git
cd appkapitour
```

### 2️⃣ Instale as Dependências
```bash
npm install
```

### 3️⃣ Configure o Supabase
1. Crie uma conta no [Supabase](https://supabase.com)
2. Configure as credenciais em `constants/supabase.ts`

### 4️⃣ Execute o Projeto
```bash
npx expo start
```

---

## 📱 Como Testar

### 🤖 Android (Emulador)
1. **Baixe o Genymotion**: [Download aqui](https://www.genymotion.com/product-desktop/download/)
2. **Configure um dispositivo**: Recomendado **Google Pixel 2**
3. **Inicie o emulador** antes de executar a aplicação
4. Execute `npx expo start` e pressione `a` para Android

### 📱 Dispositivo Físico
1. **Instale o Expo Go**:
   - [Android](https://play.google.com/store/apps/details?id=host.exp.exponent&hl=pt_BR)
   - [iOS](https://apps.apple.com/br/app/expo-go/id982107779)
2. **Escaneie o QR Code** que aparece no terminal
3. **Teste diretamente** no seu dispositivo

---

## 🗃️ Banco de Dados

### Principais Tabelas
- **`rotas`** - Informações das rotas turísticas
- **`pontos_turisticos`** - Pontos de interesse
- **`rota_ponto`** - Relacionamento rotas ↔ pontos
- **`produtos`** - Catálogo da loja
- **`tipos_produto`** - Categorias de produtos
- **`estoque`** - Controle de inventário

---

## 🎨 Design System

### Paleta de Cores
- **Primária**: `#c3073f` (Vermelho Kapitour)
- **Secundária**: `#f7a000` (Dourado)
- **Gradiente**: `#0f142c` → `#c83349` → `#f7a000`
- **Texto**: `#fff` (Branco) e `#eee` (Cinza claro)

### Componentes Visuais
- **Cards**: Bordas arredondadas (12px) com sombras
- **Botões**: Gradientes e estados interativos
- **Filtros**: Design moderno com transparências

---

## 🔄 Comandos Git Úteis

### Desenvolvimento Diário
```bash
# Atualizar projeto
git pull

# Instalar dependências após pull
npm install

# Fazer commit das mudanças
git add .
git commit -m "Descrição das alterações"
git push
```

### Configuração Inicial
```bash
# Clonar em novo PC
git clone https://github.com/Kapitour/appkapitour.git
```

---

## 🚀 Funcionalidades

### ✅ Implementadas
- [x] Sistema de rotas turísticas
- [x] Integração com mapas e GPS
- [x] Loja com produtos e estoque
- [x] Filtros por categoria
- [x] Sistema de progresso de rotas
- [x] Interface responsiva e moderna
- [x] Integração completa com Supabase

### 🔄 Em Desenvolvimento
- [ ] Sistema de avaliações
- [ ] Notificações push
- [ ] Modo offline
- [ ] Compartilhamento social

---

## 👥 Equipe de Desenvolvimento

- **Frontend Mobile**: React Native + Expo
- **Backend**: Supabase
- **Design**: Sistema unificado com gradientes
- **Database**: PostgreSQL com relacionamentos

---

## 📄 Licença

Este projeto é desenvolvido pela equipe **Kapitour** para promover o turismo em Maricá - RJ.

---

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

---

## 📞 Contato

**Kapitour** - Descubra Maricá  
📧 Email: contato@kapitour.com.br  
🌐 Website: [kapitour.com.br](https://kapitour.com.br)  
📱 App: Em desenvolvimento

---

<div align="center">
  <p><strong>🏛️ Feito com ❤️ para Maricá - RJ</strong></p>
  <p><em>"Somos a Kapitour, e viemos lhe revelar o que Maricá pode te proporcionar"</em></p>
</div>
