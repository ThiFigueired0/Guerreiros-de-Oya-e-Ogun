# Arquitetura de Dados Supabase - "Memória Total" do Mini Chefinho

Abaixo está o mapeamento completo do banco de dados relacional projetado para garantir que o assistente tenha total contexto sobre a sua vida, suportando memória de longo prazo e funcionalidades futuras como **Visão** e **Voz**.

## 1. Estrutura de Tabelas e Variáveis

### 🧠 Pilar de Memória da IA & Vida
Tabelas essenciais para o "cérebro" do Mini Chefinho.

**`profiles`** *(Dados Demográficos, Estilo e Rotina)*
- `id` (UUID, PK) -> Relacionado com `auth.users`
- `full_name` (Text)
- `work_model` (Text) -> ex: 'híbrido', reflete o controle da rotina.
- `ai_voice_tone` (Text) -> ex: 'sério', 'conciso', 'motivador'.
- `demographics` (JSONB) -> Idade, fuso horário, localização atual, etc.
- `created_at` / `updated_at` (Timestamp)

**`ai_memory_logs`** *(Resumos de conversas para o bot lembrar do que conversaram)*
- `id` (UUID, PK)
- `user_id` (UUID, FK)
- `summary` (Text) -> Resumo gerado pela IA após uma conversa.
- `context_tags` (JSONB) -> ex: `['trabalho', 'desabafo', 'foster']`
- `created_at` (Timestamp)

**`ai_pending_tasks`** *(Pendências que a IA identificou faladas no meio da conversa)*
- `id` (UUID, PK)
- `user_id` (UUID, FK)
- `description` (Text)
- `is_completed` (Boolean)
- `identified_at` (Timestamp)

**`habits`** *(Controle de hábitos e rotina diária)*
- `id` (UUID, PK)
- `user_id` (UUID, FK)
- `name` (Text)
- `frequency` (Text) -> ex: 'diário', 'semanal'
- `current_streak` (Int)

---

### 💼 Pilar Profissional & Financeiro
Rastreamento de metas e habilidades técnicas (Foster Partners, ANCORD, Python/SQL/VBA).

**`professional_goals`** *(Metas de Cargo e Progressão)*
- `id` (UUID, PK)
- `user_id` (UUID, FK)
- `company` (Text) -> ex: 'Foster Partners'
- `current_role` (Text)
- `target_role` (Text)
- `target_date` (Date)
- `status` (Text)

**`skills_progress`** *(Hard/Soft Skills e Certificações)*
- `id` (UUID, PK)
- `user_id` (UUID, FK)
- `skill_name` (Text) -> ex: 'Python', 'ANCORD', 'SQL', 'VBA'
- `proficiency_level` (Text) -> ex: 'Iniciante', 'Intermediário', 'Avançado'
- `type` (Text) -> 'Language', 'Certification', 'Tool'
- `status` (Text) -> 'Estudando', 'Concluído', 'Pausado'
- `last_practiced_at` (Timestamp)

**`financial_history`** *(Histórico de Remuneração)*
- `id` (UUID, PK)
- `user_id` (UUID, FK)
- `record_date` (Date)
- `salary_base` (Numeric)
- `bonus` (Numeric)
- `notes` (Text)

---

### 🎓 Pilar Acadêmico
Gestão universitária (ADM, UniCesumar/FIPECAFI).

**`academic_semesters`**
- `id` (UUID, PK)
- `user_id` (UUID, FK)
- `institution` (Text) -> 'UniCesumar', 'FIPECAFI'
- `course` (Text) -> 'Administração'
- `semester_name` (Text) -> '2024.1'
- `start_date` / `end_date` (Date)

**`academic_tasks`** *(Tarefas, Provas, Notas)*
- `id` (UUID, PK)
- `semester_id` (UUID, FK)
- `title` (Text)
- `type` (Text) -> 'Prova', 'Trabalho', 'Leitura'
- `due_date` (Timestamp)
- `grade` (Numeric)
- `is_completed` (Boolean)

**`digital_library_books`** *(Controle de Leituras Técnicas)*
- `id` (UUID, PK)
- `user_id` (UUID, FK)
- `title` (Text)
- `author` (Text)
- `total_pages` (Int)
- `current_page` (Int)
- `status` (Text) -> 'Lendo', 'Concluído', 'Lista de Desejos'

---

### 🌿 Pilar "Guerreiros de Oya e Ogum"
Vida espiritual, ritos e cultura.

**`spiritual_fundamentals`** *(Base rica de metadados das entidades)*
- `id` (UUID, PK)
- `user_id` (UUID, FK)
- `entity_name` (Text) -> 'Oya', 'Ogum', etc.
- `description` (Text)
- `metadata` (JSONB) -> Cores, saudações, ferramentas.

**`spiritual_rites`** *(Registro de cerimônias e ritos)*
- `id` (UUID, PK)
- `user_id` (UUID, FK)
- `name` (Text)
- `rite_date` (Timestamp)
- `observations` (Text)
- `media_urls` (JSONB) -> Para a futura função de **Visão** e **Memória Fotográfica/Áudio**.

**`herb_library`** *(Catálogo botânico ritualístico)*
- `id` (UUID, PK)
- `user_id` (UUID, FK)
- `name` (Text)
- `scientific_name` (Text)
- `properties` (Text)
- `usage_instructions` (Text)

**`cultural_projects`** *(Projetos em andamento)*
- `id` (UUID, PK)
- `user_id` (UUID, FK)
- `name` (Text)
- `description` (Text)
- `start_date` / `end_date` (Date)
- `status` (Text)

---

## 2. Diagrama de Relacionamentos (Lógico)
- Todos os registros convergem para o **`auth.users` (profiles)**, garantindo RLS (Row Level Security) e isolamento dos seus dados no Supabase.
- **`academic_tasks`** é filha de **`academic_semesters`**, que pertence a **`user_id`**.
- Os **logs de memória (`ai_memory_logs` e `ai_pending_tasks`)** são independentes mas podem carregar tags no JSONB que fazem referência às outras tabelas de projeto/meta.
- Variáveis ricas (Mídias, Preferências complexas) ficam nos campos **JSONB** para fácil expansão antes de precisarem de uma tabela separada.

---

## 3. Script SQL Inicial (Supabase)

Pode ser rodado no SQL Editor do Supabase para inicializar seu banco com essa infraestrutura:

```sql
-- Habilitar a extensão para UUIDs se ainda não estiver
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================
-- 1. PILAR MEMÓRIA DA IA E VIDA
-- =====================================

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    work_model TEXT DEFAULT 'híbrido',
    ai_voice_tone TEXT DEFAULT 'direto e profissional',
    demographics JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE ai_memory_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    summary TEXT NOT NULL,
    context_tags JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE ai_pending_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    identified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE habits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    frequency TEXT NOT NULL,
    current_streak INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================
-- 2. PILAR PROFISSIONAL & FINANCEIRO
-- =====================================

CREATE TABLE professional_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    company TEXT,
    current_role TEXT,
    target_role TEXT,
    target_date DATE,
    status TEXT DEFAULT 'Em andamento',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE skills_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    proficiency_level TEXT,
    type TEXT,
    status TEXT DEFAULT 'Estudando',
    last_practiced_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE financial_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    record_date DATE NOT NULL,
    salary_base NUMERIC(10, 2),
    bonus NUMERIC(10, 2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================
-- 3. PILAR ACADÊMICO
-- =====================================

CREATE TABLE academic_semesters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    institution TEXT NOT NULL,
    course TEXT NOT NULL,
    semester_name TEXT NOT NULL,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE academic_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    semester_id UUID REFERENCES academic_semesters(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    grade NUMERIC(4, 2),
    is_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE digital_library_books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    author TEXT,
    total_pages INT DEFAULT 0,
    current_page INT DEFAULT 0,
    status TEXT DEFAULT 'Desejo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================
-- 4. PILAR GUERREIROS DE OYA E OGUM
-- =====================================

CREATE TABLE spiritual_fundamentals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    entity_name TEXT NOT NULL,
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE spiritual_rites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    rite_date TIMESTAMP WITH TIME ZONE,
    observations TEXT,
    media_urls JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE herb_library (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    scientific_name TEXT,
    properties TEXT,
    usage_instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE cultural_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    status TEXT DEFAULT 'Planejamento',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================
-- ROW LEVEL SECURITY (Opcional p/ Produção)
-- =====================================
-- (Adicione RLS para todas as tabelas depois para segurança máxima)
```
