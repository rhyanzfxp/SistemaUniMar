# SistemaUniMar 🌊

Uma plataforma educacional gamificada focada na **Cultura Oceânica**, desenvolvida especialmente para o público universitário. O sistema tem como objetivo principal educar sobre a biodiversidade marinha, ecossistemas costeiros e os desafios ambientais do **Ceará**, com ênfase na região de Fortaleza.

##  Funcionalidades

- **Minijogos Interativos:**
  - **Fauna Marinha (Quiz):** Perguntas cronometradas sobre as espécies locais, incluindo o Boto-Cinza e as tartarugas marinhas da costa cearense.
  - **Flora Marinha (Quiz):** Focado em recifes de corais, rodolitos, e ecossistemas únicos como o Parque Estadual Marinho da Pedra da Risca do Meio.
  - **Poluição Oceânica (Quiz):** Educação sobre os impactos da poluição, dados da SEMACE e ações de sustentabilidade em Fortaleza.
  - **Ecossistema do Manguezal (Drag & Drop):** Um minijogo interativo onde o usuário deve arrastar e soltar espécies (como Caranguejo-uçá e Garça-branca) nas zonas corretas do manguezal cearense.

- **Hub de Estudos (Cards Educativos):**
  - Fichas completas com curiosidades científicas ("Você Sabia?"), status de conservação da IUCN, e metadados detalhados para cada espécie ou tópico do ecossistema local.

- **Gamificação e Leaderboard:**
  - Sistema de pontuação baseado no tempo de resposta e acertos.
  - Ranking global para incentivar a competição amigável entre os jogadores.
  - Ranks e Títulos desbloqueáveis por XP acumulado.

- **Experiência Visual e Sonora:**
  - Tema "Ocean Dark Mode" com efeitos "Glassmorphism" e aceleração de hardware (GPU) para máxima fluidez.
  - Integração com a *Web Audio API* nativa para efeitos sonoros imersivos (sem bibliotecas externas pesadas).

##  Stack Tecnológica

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Lucide Icons, React Router.
- **Backend:** Node.js, Express, TypeScript, Serverless (Vercel Functions).
- **Banco de Dados:** Supabase (PostgreSQL).
- **Deploy:** Vercel (Frontend + Backend Serverless).
- **Arquitetura:** MVC (Model-View-Controller).

##  Como Executar o Projeto Localmente

O projeto está dividido em dois diretórios principais: `client` (frontend) e `server` (backend).
Para rodar corretamente, certifique-se de ter o [Node.js](https://nodejs.org/) instalado.

### 1. Inicializando o Backend
Abra um terminal e navegue até a pasta `server`:
```bash
cd server
npm install
npm run dev
```
> A API rodará na porta **http://localhost:3000**

### 2. Inicializando o Frontend
Abra um novo terminal e navegue até a pasta `client`:
```bash
cd client
npm install
npm run dev
```
> A aplicação rodará na porta **http://localhost:5173**

---
*Desenvolvido com foco na conservação e conscientização do litoral do Ceará.* 🏖️