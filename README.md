# Poliana Mega-Hair - Sistema de Agendamento Online

> Não é só BELEZA, é TRANSFORMAÇÃO

[![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)](https://docker.com)
[![React](https://img.shields.io/badge/React-18-61dafb?logo=react)](https://reactjs.org)
[![Node.js](https://img.shields.io/badge/Node.js-18-339933?logo=node.js)](https://nodejs.org)
[![MariaDB](https://img.shields.io/badge/MariaDB-10.11-003545?logo=mariadb)](https://mariadb.org)

Sistema completo para salão de beleza com agendamento online, notificações via WhatsApp (Twilio), pagamentos PIX e integração com redes sociais.

---

## Como Testar

### Opção 1: Com Docker (Recomendado)

```bash
# 1. Entre na pasta do projeto
cd /Users/gustcol/Pessoal/myenv/erik-salao

# 2. Inicie todos os serviços
docker-compose up -d --build

# 3. Aguarde ~30 segundos e acesse
open http://localhost:3002
```

### Opção 2: Sem Docker (Desenvolvimento)

**Terminal 1 - Backend:**
```bash
cd /Users/gustcol/Pessoal/myenv/erik-salao/backend
npm install
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd /Users/gustcol/Pessoal/myenv/erik-salao/frontend
npm install
npm start
```

Acesse: http://localhost:3000

---

## URLs de Acesso

| Serviço | URL | Descrição |
|---------|-----|-----------|
| Frontend | http://localhost:3002 | Site principal |
| Backend API | http://localhost:5001 | API REST |
| Health Check | http://localhost:5001/health | Status do servidor |

---

## Usuário Admin

| Campo | Valor |
|-------|-------|
| Email | admin@beautysalon.com |
| Senha | admin123 |

Acesse o painel admin em: http://localhost:3002/admin

---

## Funcionalidades

### Para Clientes
- Agendamento online em 3 etapas
- Calendário interativo com horários disponíveis
- Pagamento de sinal (30%) via PIX com QR Code
- Login com Facebook/Instagram

### Para Administradora
- Painel com estatísticas (total, pendentes, confirmados, receita)
- Confirmação de pagamentos PIX
- Notificações automáticas via WhatsApp
- Gerenciamento de agendamentos

---

## Arquitetura

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Frontend     │────>│    Backend      │────>│    MariaDB      │
│   (React/Nginx) │     │   (Express)     │     │   (Database)    │
│   Porta: 3002   │     │   Porta: 5001   │     │   Porta: 3306   │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
              v                  v                  v
        ┌──────────┐       ┌──────────┐       ┌──────────┐
        │  Twilio  │       │   PIX    │       │Instagram │
        │ WhatsApp │       │ QR Code  │       │   Feed   │
        └──────────┘       └──────────┘       └──────────┘
```

---

## Estrutura do Projeto

```
poliana-megahair/
├── docker-compose.yml      # Orquestração de containers
├── .env.example            # Template de variáveis de ambiente
├── .env                    # Configurações locais (não versionado)
│
├── backend/                # API Node.js/Express
│   ├── src/
│   │   ├── config/         # Banco, Passport, Twilio
│   │   ├── models/         # User, Service, Appointment, Payment
│   │   ├── routes/         # auth, services, appointments, payments
│   │   ├── middlewares/    # auth, admin
│   │   ├── services/       # whatsapp, instagram
│   │   └── utils/          # pixGenerator
│   └── package.json
│
├── frontend/               # SPA React
│   ├── src/
│   │   ├── components/     # Header, Footer, ServiceCard, PixPayment
│   │   ├── pages/          # Home, Booking, Payment, Login, Admin
│   │   ├── contexts/       # AuthContext
│   │   └── services/       # api.js (Axios)
│   └── package.json
│
└── database/
    └── init.sql            # Schema e dados iniciais
```

---

## Configuração

### Variáveis de Ambiente

Copie `.env.example` para `.env` e configure:

```env
# Banco de Dados
DB_ROOT_PASSWORD=rootpassword
DB_USER=beauty_user
DB_PASSWORD=beauty_pass
DB_NAME=beauty_salon

# JWT
JWT_SECRET=sua-chave-secreta

# Twilio WhatsApp (opcional)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxx
TWILIO_AUTH_TOKEN=seu_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
SALON_OWNER_PHONE=whatsapp:+5511999999999

# PIX
PIX_KEY=sua_chave_pix
PIX_RECEIVER_NAME=Poliana MegaHair
PIX_CITY=São Paulo

# Facebook OAuth (opcional)
FACEBOOK_APP_ID=seu_app_id
FACEBOOK_APP_SECRET=seu_secret

# Instagram (opcional)
INSTAGRAM_ACCESS_TOKEN=seu_token
```

---

## Comandos Úteis

```bash
# Iniciar todos os containers
docker-compose up -d

# Parar todos os containers
docker-compose down

# Ver logs
docker-compose logs -f

# Ver logs do backend
docker logs beauty-salon-backend -f

# Reconstruir após mudanças
docker-compose up -d --build

# Reset completo (apaga dados!)
docker-compose down -v
docker-compose up -d --build

# Acessar banco de dados
docker exec -it beauty-salon-db mysql -u beauty_user -p beauty_salon
```

---

## Solução de Problemas

### Porta em uso
```bash
lsof -i :3002
lsof -i :5001
```

### Erro de conexão com banco
```bash
docker-compose ps
docker logs beauty-salon-db
```

### WhatsApp não envia
- Verifique credenciais Twilio no `.env`
- Formato do telefone: `whatsapp:+5511999999999`

---

## Horário de Funcionamento

| Dia | Horário |
|-----|---------|
| Segunda a Sexta | 09:00 - 18:00 |
| Sábado | 09:00 - 16:00 |
| Domingo | Fechado |

---

## Tecnologias

- **Frontend:** React 18, React Router, Axios, React Icons
- **Backend:** Node.js, Express, Sequelize
- **Banco:** MariaDB 10.11
- **Autenticação:** JWT, Passport.js
- **Pagamento:** PIX BR Code (EMV)
- **Notificações:** Twilio WhatsApp API
- **Infraestrutura:** Docker, Docker Compose, Nginx

---

## Licença

MIT License

---

Desenvolvida por Gustavo, não é o Augusto

*Poliana Mega-Hair - Não é só BELEZA, é TRANSFORMAÇÃO*
