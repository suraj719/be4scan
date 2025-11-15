# Be4Scan Backend Server

Backend API for Be4Scan

## Prerequisites

- Node.js 18+ and npm
- Docker installed and running
- PostgreSQL database (Aiven cloud or local)
- Docker socket accessible (default: `/var/run/docker.sock`)

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure environment:**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set your PostgreSQL connection string:

   ```
   DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
   ```

3. **Set up database:**

   ```bash
   # Generate Prisma client
   npm run db:generate

   # Run migrations
   npm run db:migrate
   ```

4. **Create artifacts directory:**
   ```bash
   mkdir -p artifacts
   ```

## Running

### Development Mode

**Terminal 1 - API Server:**

```bash
npm run dev
```

**Terminal 2 - Worker Process:**

```bash
npm run worker
```

### Production Mode

```bash
npm run build
npm start
# In separate terminal:
npm run worker
```

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - API server port (default: 3001)
- `NODE_ENV` - development | production
- `DOCKER_SOCKET_PATH` - Docker socket path (default: `/var/run/docker.sock`)
- `SCAN_TIMEOUT_MINUTES` - Maximum scan duration (default: 30)
- `ARTIFACTS_DIR` - Artifact storage directory (default: `./artifacts`)
