# IT Services Management Platform

A professional, full-stack IT Services Management system designed for small businesses and enterprises. This project demonstrates enterprise-level architecture with Docker containerization and GitLab CI/CD automation.

![Project Architecture](https://img.shields.io/badge/Architecture-Microservices-blue)
![CI/CD](https://img.shields.io/badge/CI%2FCD-GitLab-orange)
![Docker](https://img.shields.io/badge/Container-Docker-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## 🚀 Features

### Core Functionality
- **Dashboard Analytics** - Real-time overview of services, clients, and revenue
- **Service Management** - Full CRUD operations for IT services
- **Client Management** - Comprehensive client database with business profiles
- **Booking System** - Schedule and manage service appointments
- **Reports & Analytics** - Visual insights into business performance
- **User Authentication** - Secure login/registration system
- **Responsive Design** - Mobile-first approach, works on all devices

### Technical Highlights
- **Frontend**: HTML5, CSS3, Modern JavaScript (ES6+)
- **Backend**: Node.js with Express.js RESTful API
- **Containerization**: Docker with multi-stage builds
- **CI/CD**: Automated GitLab pipeline with staging/production deployments
- **Architecture**: Microservices architecture with separate frontend/backend containers

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Project Structure](#project-structure)
3. [GitLab CI/CD Setup](#gitlab-cicd-setup)
4. [Docker Deployment](#docker-deployment)
5. [API Documentation](#api-documentation)
6. [Development Guide](#development-guide)
7. [Production Deployment](#production-deployment)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:
- **Docker** (version 20.10+)
- **Docker Compose** (version 2.0+)
- **Node.js** (version 18+) - for local development
- **Git** (version 2.30+)
- **GitLab Account** - for CI/CD setup

### Local Development Setup

```bash
# 1. Clone the repository
git clone <your-repository-url>
cd it-services-management

# 2. Install dependencies for local development
npm install

# 3. Set up environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with your configuration

# 4. Run with Docker Compose (Recommended)
docker-compose up --build

# Alternative: Run services separately
# Terminal 1 - Backend
cd backend
npm install
npm start

# Terminal 2 - Frontend
cd frontend
npm install
npm start
```

**Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/health

---

## 📁 Project Structure

```
it-services-management/
├── frontend/                    # Frontend Application
│   ├── index.html              # Main HTML file
│   ├── styles.css              # Comprehensive styling
│   ├── app.js                  # Frontend JavaScript logic
│   ├── package.json            # Frontend dependencies
│   └── Dockerfile              # Frontend container configuration
│
├── backend/                     # Backend API
│   ├── server.js               # Express server setup
│   ├── routes/                 # API route handlers
│   │   ├── auth.js            # Authentication endpoints
│   │   ├── services.js        # Service management endpoints
│   │   ├── clients.js         # Client management endpoints
│   │   └── bookings.js        # Booking management endpoints
│   ├── package.json           # Backend dependencies
│   ├── Dockerfile             # Backend container configuration
│   └── .env                   # Environment variables
│
├── .gitlab-ci.yml             # GitLab CI/CD pipeline configuration
├── docker-compose.yml         # Multi-container orchestration
├── .gitignore                 # Git ignore rules
└── README.md                  # This file
```

---

## 🔧 GitLab CI/CD Setup

### Step 1: Create GitLab Repository

1. **Log in to GitLab** (https://gitlab.com)
2. **Create a new project**:
   - Click "New Project" → "Create blank project"
   - Project name: `it-services-management`
   - Visibility: Private (or Public for portfolio)
   - Initialize with README: No (we already have one)
   - Click "Create project"

### Step 2: Configure GitLab Container Registry

```bash
# Enable Container Registry in GitLab
# Go to: Settings → General → Visibility → Container Registry (Enable)

# Login to GitLab Container Registry
docker login registry.gitlab.com
# Enter your GitLab username and password/access token
```

### Step 3: Set Up CI/CD Variables

Navigate to: **Settings → CI/CD → Variables**

Add the following variables:

| Variable Name | Value | Protected | Masked |
|--------------|-------|-----------|--------|
| `CI_REGISTRY_USER` | Your GitLab username | Yes | No |
| `CI_REGISTRY_PASSWORD` | GitLab Access Token | Yes | Yes |
| `SSH_PRIVATE_KEY` | Your SSH private key | Yes | Yes |
| `STAGING_SERVER` | staging.example.com | Yes | No |
| `STAGING_USER` | deploy | Yes | No |
| `PRODUCTION_SERVER` | production.example.com | Yes | No |
| `PRODUCTION_USER` | deploy | Yes | No |
| `JWT_SECRET_PROD` | Strong random string | Yes | Yes |

**Creating a GitLab Access Token:**
1. Go to User Settings → Access Tokens
2. Name: "CI/CD Pipeline"
3. Scopes: `read_registry`, `write_registry`
4. Click "Create personal access token"
5. Copy the token and save it as `CI_REGISTRY_PASSWORD`

**Generating SSH Key for Deployment:**
```bash
# Generate SSH key pair
ssh-keygen -t ed25519 -C "gitlab-ci-deploy" -f ~/.ssh/gitlab_deploy

# Copy private key content to SSH_PRIVATE_KEY variable
cat ~/.ssh/gitlab_deploy

# Copy public key to your servers
ssh-copy-id -i ~/.ssh/gitlab_deploy.pub user@your-server.com
```

### Step 4: Push Code to GitLab

```bash
# Add GitLab remote
git remote add origin https://gitlab.com/your-username/it-services-management.git

# Push to GitLab
git add .
git commit -m "Initial commit: IT Services Management Platform"
git push -u origin main
```

### Step 5: Pipeline Overview

The `.gitlab-ci.yml` file defines 5 stages:

```yaml
stages:
  - build-frontend      # Build frontend Docker image
  - build-backend       # Build backend Docker image
  - test               # Run automated tests
  - deploy-staging     # Deploy to staging environment
  - deploy-production  # Deploy to production environment
```

**Pipeline Execution:**
1. **Automatic Triggers**: Runs on every push to `main` or `develop` branches
2. **Manual Deployments**: Staging and production deployments require manual approval
3. **Branch Protection**: Production deployments only from `main` branch

**Monitoring Pipeline:**
- Navigate to: **CI/CD → Pipelines**
- Click on a pipeline to see job details
- View logs for each job
- Retry failed jobs if needed

---

## 🐳 Docker Deployment

### Building Docker Images Locally

```bash
# Build frontend image
cd frontend
docker build -t it-services-frontend:latest .

# Build backend image
cd ../backend
docker build -t it-services-backend:latest .
```

### Running with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild and restart
docker-compose up -d --build
```

### Manual Docker Deployment

```bash
# Create network
docker network create it-services-network

# Run backend
docker run -d \
  --name it-services-backend \
  --network it-services-network \
  -p 5000:5000 \
  -e NODE_ENV=production \
  it-services-backend:latest

# Run frontend
docker run -d \
  --name it-services-frontend \
  --network it-services-network \
  -p 3000:3000 \
  it-services-frontend:latest
```

### Container Management

```bash
# Check running containers
docker ps

# View container logs
docker logs it-services-backend
docker logs it-services-frontend

# Restart containers
docker restart it-services-backend
docker restart it-services-frontend

# Stop containers
docker stop it-services-backend it-services-frontend

# Remove containers
docker rm it-services-backend it-services-frontend

# Clean up unused images
docker image prune -a
```

---

## 📚 API Documentation

### Base URL
- Local: `http://localhost:5000/api`
- Production: `http://your-domain.com/api`

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}

Response: 201 Created
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}

Response: 200 OK
{
  "message": "Login successful",
  "token": "jwt-token-here",
  "user": { ... }
}
```

### Service Endpoints

#### Get All Services
```http
GET /api/services

Response: 200 OK
[
  {
    "id": "1",
    "name": "Network Infrastructure Setup",
    "category": "Network Support",
    "price": 2500,
    "duration": 8,
    "status": "Active"
  }
]
```

#### Create Service
```http
POST /api/services
Content-Type: application/json

{
  "name": "Cloud Migration",
  "category": "Cloud Services",
  "price": 5000,
  "duration": 40,
  "description": "Migrate infrastructure to cloud",
  "status": "Active"
}

Response: 201 Created
```

#### Update Service
```http
PUT /api/services/:id
Content-Type: application/json

{
  "price": 4500,
  "status": "Active"
}
```

#### Delete Service
```http
DELETE /api/services/:id

Response: 200 OK
{
  "message": "Service deleted successfully"
}
```

### Client Endpoints

Similar CRUD operations available for:
- `GET /api/clients`
- `POST /api/clients`
- `PUT /api/clients/:id`
- `DELETE /api/clients/:id`

### Booking Endpoints

Similar CRUD operations available for:
- `GET /api/bookings`
- `POST /api/bookings`
- `PUT /api/bookings/:id`
- `DELETE /api/bookings/:id`

### Health Check
```http
GET /health

Response: 200 OK
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "uptime": 3600
}
```

---

## 💻 Development Guide

### For Beginners

**What is Docker?**
Docker packages your application and all its dependencies into a container, ensuring it runs the same everywhere.

**What is CI/CD?**
Continuous Integration/Continuous Deployment automatically tests and deploys your code when you push changes.

### Development Workflow

```bash
# 1. Create a new feature branch
git checkout -b feature/new-feature

# 2. Make your changes
# Edit files in frontend/ or backend/

# 3. Test locally
docker-compose up --build

# 4. Commit changes
git add .
git commit -m "Add new feature: description"

# 5. Push to GitLab
git push origin feature/new-feature

# 6. Create Merge Request on GitLab
# Pipeline will automatically run tests

# 7. After approval, merge to develop
# This triggers staging deployment

# 8. After staging validation, merge to main
# This enables production deployment
```

### Code Structure Best Practices

**Frontend (`frontend/`):**
- `index.html` - Structure and layout
- `styles.css` - All styling (mobile-first)
- `app.js` - Application logic and API calls

**Backend (`backend/`):**
- `server.js` - Express server configuration
- `routes/` - API endpoint handlers
- Keep routes RESTful and organized

### Testing

```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
npm test

# Run tests in Docker
docker-compose run backend npm test
docker-compose run frontend npm test
```

---

## 🚀 Production Deployment

### Server Requirements

**Minimum Specifications:**
- CPU: 2 cores
- RAM: 4GB
- Storage: 20GB
- OS: Ubuntu 20.04+ or CentOS 8+

### Server Setup

```bash
# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 3. Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 4. Create deployment user
sudo useradd -m -s /bin/bash deploy
sudo usermod -aG docker deploy

# 5. Set up SSH for CI/CD
sudo su - deploy
mkdir ~/.ssh
chmod 700 ~/.ssh
# Add your GitLab CI public key to ~/.ssh/authorized_keys
```

### Manual Production Deployment

```bash
# On production server
cd /opt
sudo git clone https://gitlab.com/your-username/it-services-management.git
cd it-services-management

# Set environment variables
sudo nano backend/.env
# Add production values

# Deploy with Docker Compose
sudo docker-compose up -d

# Verify deployment
sudo docker-compose ps
curl http://localhost:5000/health
```

### Nginx Reverse Proxy (Optional)

```bash
# Install Nginx
sudo apt install nginx -y

# Configure reverse proxy
sudo nano /etc/nginx/sites-available/it-services
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/it-services /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔍 Troubleshooting

### Common Issues

**1. Docker Build Fails**
```bash
# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

**2. Port Already in Use**
```bash
# Find process using port
sudo lsof -i :3000
sudo lsof -i :5000

# Kill process
kill -9 <PID>
```

**3. GitLab Pipeline Fails**
- Check CI/CD variables are set correctly
- Verify SSH key has access to servers
- Review job logs in GitLab UI
- Ensure Docker registry login credentials are valid

**4. Container Connectivity Issues**
```bash
# Check Docker network
docker network ls
docker network inspect it-services-network

# Restart containers
docker-compose restart
```

**5. Frontend Can't Connect to Backend**
- Verify `API_URL` in `frontend/app.js`
- Check CORS settings in `backend/server.js`
- Ensure both containers are on same network

### Logs and Debugging

```bash
# View all logs
docker-compose logs

# Follow specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Check container health
docker inspect it-services-backend | grep Health
```

---

## 📊 For Executives & Stakeholders

### Business Value

**Time to Market**: Automated CI/CD pipeline reduces deployment time from hours to minutes.

**Reliability**: Containerization ensures consistent behavior across all environments.

**Scalability**: Microservices architecture allows independent scaling of frontend/backend.

**Cost Efficiency**: Docker containers optimize resource utilization.

**Security**: Automated testing catches issues before production deployment.

### Key Metrics

- **Deployment Frequency**: Multiple deployments per day
- **Lead Time**: < 30 minutes from commit to production
- **Mean Time to Recovery**: < 15 minutes
- **Change Failure Rate**: < 5% with automated testing

### Technical Stack Summary

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Frontend | HTML/CSS/JS | User interface |
| Backend | Node.js/Express | API server |
| Database | In-memory (upgradable) | Data storage |
| Containers | Docker | Deployment |
| CI/CD | GitLab | Automation |
| Hosting | Cloud/On-premise | Infrastructure |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Merge Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 📞 Support

For questions or issues:
- Create an issue in GitLab
- Email: support@example.com
- Documentation: https://docs.example.com

---

## 🎓 Learning Resources

### For Beginners
- [Docker Tutorial](https://docs.docker.com/get-started/)
- [GitLab CI/CD Tutorial](https://docs.gitlab.com/ee/ci/)
- [Node.js Guide](https://nodejs.org/en/docs/guides/)
- [REST API Design](https://restfulapi.net/)

### For Intermediate Developers
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [GitLab CI/CD Pipeline Configuration](https://docs.gitlab.com/ee/ci/yaml/)

---

## 🌟 Acknowledgments

Built with modern web technologies and best practices for production-ready deployment.

---

**Happy Coding! 🚀**
