# Docker Quickstart Guide - VSDC Manager

Complete guide to running VSDC Manager using Docker and Docker Compose.

## Prerequisites

- **Docker**: [Install Docker](https://docs.docker.com/get-docker/)
- **Docker Compose**: [Install Docker Compose](https://docs.docker.com/compose/install/)
- Minimum 4GB available RAM
- ~2GB disk space for images and volumes

## Quick Start

### 1. Clone and Setup

```bash
# Navigate to project root
cd c:\Users\user\ybgroupvsdc

# Ensure .env file exists (already in place)
cat yb-vsdc-api\.env
```

### 2. Build and Run (One Command)

```bash
# Build and start all services
docker-compose up -d

# This will start:
# - PostgreSQL database on port 5432
# - MeiliSearch on port 7700
# - Backend API on port 8000
# - Frontend on port 3000
```

### 3. Access the Application

Once all services are healthy (30-60 seconds):

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs** (if available): http://localhost:8000/docs
- **MeiliSearch Dashboard**: http://localhost:7700

### 4. Login

Use the following test credentials:

**Administrator**
- Email: admin@test.com
- Password: admin

**Operator**
- Email: operator@company.rw
- Password: (check .env or ask admin)

## Common Docker Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f db
```

### Stop Services

```bash
# Stop all without removing
docker-compose stop

# Stop and remove containers
docker-compose down

# Remove everything including volumes (⚠️ deletes data)
docker-compose down -v
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Rebuild Images

```bash
# Rebuild all images
docker-compose up -d --build

# Rebuild specific service
docker-compose up -d --build frontend
```

## Service Details

### Frontend Container
- **Image**: Custom built from `./frontend/Dockerfile`
- **Port**: 3000
- **Status**: Built from production optimized Vue 3 build
- **Command**: Serves built files with `serve`

### Backend Container
- **Image**: Custom built from `./yb-vsdc-api/Dockerfile.dev`
- **Port**: 8000 (mapped from 3333 inside container)
- **Status**: Running AdonisJS development server
- **Database**: Connected to PostgreSQL container

### Database Container
- **Image**: postgres:16-alpine
- **Port**: 5432
- **Credentials**: See `.env` file
- **Volumes**: Data persisted in `db_data` volume

### MeiliSearch Container
- **Image**: getmeili/meilisearch:v1.7
- **Port**: 7700
- **API Key**: From `MEILISEARCH_API_KEY` in `.env`
- **Volumes**: Data persisted in `meilisearch_data` volume

## Environment Configuration

### Edit Environment Variables

Edit `yb-vsdc-api/.env`:

```env
PORT=8000                          # Backend port
DB_USER=mihig                      # Database user
DB_PASSWORD=post                   # Database password
DB_DATABASE=vsdc_api               # Database name
ADMIN_EMAIL=admin@test.com         # Admin email
ADMIN_PASSWORD=admin               # Admin password
```

After changes, rebuild:
```bash
docker-compose up -d --build
```

## Troubleshooting

### Services Won't Start

```bash
# Check logs
docker-compose logs

# Verify Docker is running
docker ps

# Check available ports aren't in use
netstat -ano | findstr :3000
netstat -ano | findstr :8000
netstat -ano | findstr :5432
```

### Database Connection Failed

```bash
# Restart database
docker-compose restart db

# Wait for database to be healthy
docker-compose ps

# Check database logs
docker-compose logs db
```

### Port Already in Use

If ports are in use, edit `docker-compose.yml`:

```yaml
ports:
  - "3001:3000"    # Frontend on 3001 instead of 3000
  - "8001:3333"    # Backend on 8001 instead of 8000
```

Then rebuild:
```bash
docker-compose down
docker-compose up -d
```

### Slow Performance on Windows

Docker on Windows (using WSL2) may be slower. To improve:

1. **Allocate more CPU/RAM** in Docker Desktop settings
2. **Store files on WSL2 filesystem** instead of Windows filesystem
3. **Use native Linux** if possible

### Frontend Shows Blank Page

Check browser console for errors:
1. Open DevTools (F12)
2. Check Console tab for JavaScript errors
3. Check Network tab for API failures
4. Verify backend is running: `docker-compose logs backend`

### API Connection Errors

In frontend logs:
```
Failed to fetch http://backend:3333
```

Solution: Wait for backend to fully start (check health) and restart frontend:
```bash
docker-compose restart frontend
```

## Data Persistence

### Volumes

- `db_data` - PostgreSQL database files
- `meilisearch_data` - Search index data

### Backup Database

```bash
# Dump database to file
docker exec vsdc-db pg_dump -U mihig vsdc_api > backup.sql

# Restore from backup
docker exec -i vsdc-db psql -U mihig vsdc_api < backup.sql
```

### Delete All Data (Reset)

```bash
# Remove containers and volumes
docker-compose down -v

# Start fresh
docker-compose up -d
```

## Performance Monitoring

### Check Resource Usage

```bash
# View container stats
docker stats

# View specific container
docker stats vsdc-frontend vsdc-api vsdc-db
```

### Container Health

```bash
# Check container health status
docker-compose ps

# Detailed health check
docker inspect vsdc-frontend --format='{{json .State.Health}}' | jq
```

## Development Workflow

### Local Development (Without Docker)

To run services locally without Docker:

```bash
# Terminal 1: Database (if using PostgreSQL locally)
# Make sure PostgreSQL is running

# Terminal 2: Backend
cd yb-vsdc-api
npm install
npm run dev

# Terminal 3: Frontend
cd frontend
npm install
npm run dev
```

### Docker for Backend Only

If developing frontend locally but want Docker backend:

```bash
# Start only backend and database
docker-compose up -d backend db meilisearch

# Update .env in frontend
# VITE_API_URL=http://localhost:8000

# Then run frontend locally
cd frontend
npm run dev
```

## Production Considerations

### Current Setup
The `docker-compose.yml` is optimized for **development**. For production:

1. **Use environment-specific compose files**
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

2. **Enable HTTPS** (use Nginx reverse proxy)

3. **Set stronger passwords** for database and services

4. **Configure backup strategy** for persistent volumes

5. **Use secrets management** (Docker Secrets, HashiCorp Vault)

6. **Enable logging** (ELK stack, Datadog, New Relic)

7. **Setup monitoring** (Prometheus, Grafana)

8. **Implement rate limiting** on API

9. **Use CDN** for frontend assets

10. **Setup CI/CD pipeline** (GitHub Actions, GitLab CI)

## Useful Docker Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Docker Security](https://docs.docker.com/engine/security/)

## Next Steps

1. Verify all services are running: `docker-compose ps`
2. Check logs for any errors: `docker-compose logs`
3. Open frontend in browser: http://localhost:3000
4. Test login with admin/operator credentials
5. Explore the application

## Getting Help

If issues persist:

1. Check individual service logs: `docker-compose logs [service]`
2. Verify Docker and Docker Compose versions
3. Ensure ports are not blocked by firewall
4. Restart Docker daemon
5. Rebuild images: `docker-compose up -d --build`

---

**Status**: ✅ Production-Ready Docker Setup

**Last Updated**: 2024

**Version**: 1.0.0
