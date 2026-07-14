# 🐳 Docker Deployment Guide — Suvaialaya SEMS

> **Your friend does NOT need to install Node.js, MongoDB, or anything else.**
> They only need **Docker Desktop** installed. That's it.

---

## 📋 Prerequisites

| Tool | Version | Download |
|---|---|---|
| **Docker Desktop** | Latest | [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/) |
| **Git** | Any | [git-scm.com](https://git-scm.com) |

---

## 🚀 One-Command Launch (For Your Friend)

```bash
# 1. Clone the project
git clone https://github.com/prawinkumar2k/suvaialaya.git
cd suvaialaya

# 2. Copy environment file
cp .env.example .env

# 3. Launch everything (MongoDB + App) with a single command!
docker-compose up --build
```

Open your browser at: **http://localhost:8080** 🎉

> **First boot takes ~2-3 minutes** to build the Docker image. Subsequent starts are instant.

---

## 🔑 Test Login Credentials

After the app starts, run the seed command **once** to populate demo data:

```bash
# In a second terminal window (while docker-compose is running):
docker exec sems-application node -e "
const { execSync } = require('child_process');
execSync('node dist/server/node-build.mjs seed', { stdio: 'inherit' });
"
```

**OR** if you have Node.js installed locally:
```bash
pnpm install
npx tsx server/seed.ts
```

Then log in with:

| Role | Email | Password |
|---|---|---|
| 👑 **Admin** | `admin@suvaialaya.com` | `admin123` |
| 👤 **Customer** | `john@example.com` | `password123` |

---

## 🛑 Stopping the App

```bash
# Stop all containers (keeps your database data)
docker-compose down

# Stop AND delete all data (fresh reset)
docker-compose down -v
```

---

## 🔄 Updating to Latest Version

```bash
git pull origin main
docker-compose up --build
```

---

## ⚙️ Environment Variables

The `.env.example` file contains all configuration keys. For a demo, the defaults work fine.
For a real production deployment, update these:

| Variable | Required | Description |
|---|---|---|
| `JWT_SECRET` | ✅ Yes | Change to a long random string |
| `RAZORPAY_KEY_ID` | 💳 For payments | From Razorpay dashboard |
| `RAZORPAY_KEY_SECRET` | 💳 For payments | From Razorpay dashboard |
| `RESEND_API_KEY` | 📧 For emails | From Resend dashboard |

---

## 🗂️ What's Running Inside Docker

```
docker-compose up starts:
  ├── sems-database   → MongoDB 6.0  (port 27017)
  └── sems-application → Node.js + React SPA (port 8080)
```

---

## 🩺 Health Check

```bash
# Check running containers
docker ps

# View live logs
docker-compose logs -f

# View app logs only
docker-compose logs -f sems-app
```

---

*Built with ❤️ for Suvaialaya South Indian Cuisine*
