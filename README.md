# BarbaAgenda

MVP de uma plataforma de agendamento para barbearias. Donos cadastram a barbearia, a equipe, os serviços e os horários disponíveis; clientes encontram estabelecimentos e reservam um atendimento.

## Demonstração

**Aplicação publicada:** [barba-agenda.vercel.app](https://barba-agenda.vercel.app)

> O banco utiliza o plano gratuito do Supabase. Após períodos sem uso, o projeto pode ser pausado automaticamente e levar alguns minutos para voltar a responder.

## Funcionalidades

### Cliente

- Cadastro e login com e-mail e senha
- Listagem e busca de barbearias por nome ou cidade
- Visualização de serviços, preços e barbeiros
- Escolha de serviço, profissional, data e horário
- Confirmação do agendamento
- Histórico de agendamentos
- Link de confirmação pelo WhatsApp e confirmação de e-mail simulada

### Dono da barbearia

- Cadastro da barbearia com nome, endereço, cidade e horário de funcionamento
- Upload de foto da barbearia
- Cadastro de barbeiros
- Cadastro de serviços com duração e preço
- Definição da disponibilidade semanal de cada barbeiro
- Painel com os agendamentos recebidos

### Regras do sistema

- Dois clientes não podem reservar horários sobrepostos com o mesmo barbeiro
- Somente clientes podem criar agendamentos
- Cada dono gerencia apenas os dados da própria barbearia
- As permissões também são protegidas no banco por Row Level Security (RLS)

## Tecnologias

- [Next.js 15](https://nextjs.org/)
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) para autenticação, PostgreSQL e armazenamento de imagens
- [Vercel](https://vercel.com/) para publicação

## Como executar localmente

### 1. Clone o repositório

```bash
git clone https://github.com/joaovittormonteiro/barba-agenda.git
cd barba-agenda
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o Supabase

Crie um projeto no Supabase e execute os arquivos SQL pelo **SQL Editor**:

1. `supabase/001_initial_schema.sql`
2. `supabase/003_barbershop_photos.sql`

O arquivo `002_allow_owner_deletion.sql` existe para instalações antigas que ainda não possuem a política de exclusão. Ele não precisa ser executado depois da versão atual do arquivo `001_initial_schema.sql`.

### 4. Configure as variáveis de ambiente

Copie `.env.local.example` para um novo arquivo chamado `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-publica
```

Esses valores ficam no painel do Supabase, em **Project Settings > API**. Nunca coloque uma chave `service_role` no frontend.

### 5. Inicie o projeto

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Estrutura principal

```text
app/
├── (auth)/                 # Login e cadastro
├── agendar/confirmar/      # Confirmação do agendamento
├── barbearias/             # Busca e página de cada barbearia
├── meus-agendamentos/      # Agenda do cliente
├── painel/                 # Administração da barbearia
├── globals.css             # Tema e estilos globais
└── layout.tsx              # Layout e navegação

components/                 # Componentes compartilhados
lib/supabase.ts             # Cliente do Supabase
supabase/                   # Schema e migrations SQL
types/database.ts           # Tipos do banco de dados
```

## Banco de dados

As principais tabelas são:

- `profiles`: perfil e tipo de usuário
- `barbershops`: dados das barbearias
- `barbers`: profissionais de cada barbearia
- `services`: serviços, duração e preço
- `availability`: disponibilidade semanal dos barbeiros
- `appointments`: agendamentos dos clientes

A restrição `no_barber_overlap` no PostgreSQL impede agendamentos confirmados que ocupem o mesmo período para um barbeiro.

## Escopo do MVP

Este projeto foi construído para validar o fluxo principal de agendamento. Pagamento online, avaliações, notificações reais, rede social e busca geográfica avançada não fazem parte desta versão.

## Autor

Desenvolvido por [João Vittor Monteiro](https://github.com/joaovittormonteiro).
