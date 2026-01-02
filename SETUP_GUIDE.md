# Complete Step-by-Step GitLab CI/CD Setup Guide

## IT Services Management Platform - Docker & GitLab CI/CD

This comprehensive guide walks you through setting up GitLab CI/CD for a Docker-based IT Services Management application from start to finish.

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Part 1: Local Setup](#part-1-local-setup)
4. [Part 2: GitLab Repository Setup](#part-2-gitlab-repository-setup)
5. [Part 3: CI/CD Variables Configuration](#part-3-cicd-variables-configuration)
6. [Part 4: Understanding the Pipeline](#part-4-understanding-the-pipeline)
7. [Part 5: Server Setup for Deployment](#part-5-server-setup-for-deployment)
8. [Part 6: Running Your First Pipeline](#part-6-running-your-first-pipeline)
9. [Part 7: Deploying to Production](#part-7-deploying-to-production)
10. [Troubleshooting](#troubleshooting)

---

## Overview

### What You'll Build

A professional IT Services Management platform with:
- **Frontend**: HTML/CSS/JavaScript running in a Docker container
- **Backend**: Node.js/Express API in a separate container
- **CI/CD**: Automated testing and deployment via GitLab
- **Deployment**: Staging and production environments

### Architecture

```
Developer → GitLab → CI/CD Pipeline → Docker Images → Deployment Servers
```

---

## Prerequisites

### Required Software

- **Git** (2.30+): [Download](https://git-scm.com/downloads)
- **Docker** (20.10+): [Download](https://docs.docker.com/get-docker/)
- **Docker Compose** (2.0+): [Download](https://docs.docker.com/compose/install/)
- **Node.js** (18+): [Download](https://nodejs.org/)
- **GitLab Account**: [Sign up](https://gitlab.com/users/sign_up)

### Optional but Recommended

- **VS Code** or your preferred code editor
- **Terminal** (Git Bash on Windows, iTerm2 on Mac, or native terminal)

---

## Part 1: Local Setup

### Step 1.1: Clone the Project

```bash
# Create a working directory
mkdir ~/projects
cd ~/projects

# Clone this repository (replace with your actual repo URL)
git clone <your-repo-url>
cd it-services-management
```

### Step 1.2: Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..

# Install backend dependencies
cd backend
npm install
cd ..
```

### Step 1.3: Test Locally with Docker Compose

```bash
# Build and start containers
docker-compose up --build

# Expected output:
# ✓ Backend running on port 5000
# ✓ Frontend running on port 3000
```

**Test the application:**
1. Open browser: http://localhost:3000
2. Test health endpoint: http://localhost:5000/health

### Step 1.4: Stop Containers

```bash
# Stop containers
docker-compose down
```

---

## Part 2: GitLab Repository Setup

### Step 2.1: Create GitLab Project

1. **Log in to GitLab**: https://gitlab.com
2. Click **"New Project"** (blue button, top right)
3. Select **"Create blank project"**
4. Fill in project details:
   - **Project name**: `it-services-management`
   - **Project URL**: `https://gitlab.com/<your-username>/it-services-management`
   - **Visibility Level**: Private (or Public for portfolio)
   - **Initialize repository**: Uncheck (we already have code)
5. Click **"Create project"**

### Step 2.2: Enable Container Registry

1. In your GitLab project, go to **Settings** → **General**
2. Expand **"Visibility, project features, permissions"**
3. Enable **"Container Registry"**
4. Click **"Save changes"**

### Step 2.3: Connect Local Repository to GitLab

```bash
# Add GitLab as remote
git remote add origin https://gitlab.com/<your-username>/it-services-management.git

# Verify remote
git remote -v

# Create initial commit
git add .
git commit -m "Initial commit: IT Services Management Platform with GitLab CI/CD"

# Push to GitLab
git push -u origin main
```

**Verify**: Refresh your GitLab project page - you should see all files.

---

## Part 3: CI/CD Variables Configuration

### Step 3.1: Create GitLab Access Token

1. Click your **profile icon** (top right) → **Preferences**
2. Left sidebar: **Access Tokens**
3. Create new token:
   - **Token name**: `CI/CD Pipeline`
   - **Expiration date**: 1 year from now
   - **Scopes**: Check these boxes:
     - ✓ `read_registry`
     - ✓ `write_registry`
4. Click **"Create personal access token"**
5. **COPY THE TOKEN** (you won't see it again!)

### Step 3.2: Generate SSH Keys for Deployment

```bash
# Generate SSH key pair
ssh-keygen -t ed25519 -C "gitlab-ci-deploy" -f ~/.ssh/gitlab_deploy

# When prompted:
# - Enter file location: (press Enter to accept default)
# - Passphrase: (press Enter for no passphrase)
# - Confirm passphrase: (press Enter)

# Display private key (you'll need this)
cat ~/.ssh/gitlab_deploy

# Display public key
cat ~/.ssh/gitlab_deploy.pub
```

**Save both keys** in a secure location!

### Step 3.3: Add CI/CD Variables to GitLab

1. In GitLab project: **Settings** → **CI/CD**
2. Expand **"Variables"**
3. Click **"Add variable"** for each variable below:

| Variable Key | Value | Type | Protected | Masked | Description |
|-------------|-------|------|-----------|--------|-------------|
| `CI_REGISTRY_USER` | Your GitLab username | Variable | ✓ Yes | No | GitLab username |
| `CI_REGISTRY_PASSWORD` | Token from Step 3.1 | Variable | ✓ Yes | ✓ Yes | GitLab access token |
| `CI_REGISTRY` | `registry.gitlab.com` | Variable | ✓ Yes | No | GitLab registry URL |
| `SSH_PRIVATE_KEY` | Content from `~/.ssh/gitlab_deploy` | File | ✓ Yes | ✓ Yes | SSH private key |
| `STAGING_SERVER` | `staging.yourdomain.com` | Variable | ✓ Yes | No | Staging server IP/domain |
| `STAGING_USER` | `deploy` | Variable | ✓ Yes | No | Staging server username |
| `PRODUCTION_SERVER` | `production.yourdomain.com` | Variable | ✓ Yes | No | Production server IP/domain |
| `PRODUCTION_USER` | `deploy` | Variable | ✓ Yes | No | Production server username |
| `JWT_SECRET_PROD` | Random 64-char string | Variable | ✓ Yes | ✓ Yes | JWT secret for production |

**Generate JWT Secret:**
```bash
# On Linux/Mac
openssl rand -hex 32

# On Windows PowerShell
[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

---

## Part 4: Understanding the Pipeline

### Pipeline Stages

The `.gitlab-ci.yml` defines 5 sequential stages:

```yaml
stages:
  1. build-frontend      # Build frontend Docker image
  2. build-backend       # Build backend Docker image
  3. test               # Run automated tests
  4. deploy-staging     # Deploy to staging (manual)
  5. deploy-production  # Deploy to production (manual)
```

### Stage Details

#### **Stage 1 & 2: Build**
- Builds Docker images for frontend and backend
- Tags images with commit SHA and `latest`
- Pushes to GitLab Container Registry
- **Triggers**: Automatically on push to `main` or `develop`

#### **Stage 3: Test**
- Runs unit tests for frontend and backend
- Checks code quality
- **Triggers**: Automatically after build stages
- **Fail Behavior**: Stops pipeline if tests fail

#### **Stage 4: Deploy Staging**
- Deploys to staging server via SSH
- Pulls latest Docker images
- Restarts containers
- **Triggers**: Manual approval required
- **Available**: After successful tests

#### **Stage 5: Deploy Production**
- Deploys to production server
- Uses specific commit SHA (not `latest`)
- **Triggers**: Manual approval required
- **Available**: Only from `main` branch after staging deployment

### Visual Pipeline Flow

```
Code Push → Build Images → Test → [Manual: Deploy Staging] → [Manual: Deploy Production]
            ↓              ↓         ↓                           ↓
            ✓ Success      ✓ Pass    ⏸ Wait                     ⏸ Wait
            ✗ Fail         ✗ Fail    ❌ Stop                     ❌ Stop
```

---

## Part 5: Server Setup for Deployment

### Step 5.1: Prepare Deployment Servers

You need two servers (can be VPS like DigitalOcean, AWS EC2, Linode):
- **Staging Server**: For testing deployments
- **Production Server**: For live application

**Minimum Requirements:**
- CPU: 2 cores
- RAM: 4GB
- Storage: 20GB
- OS: Ubuntu 20.04+ or Debian 11+

### Step 5.2: Initial Server Configuration

Run these commands on **BOTH** servers:

```bash
# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 3. Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 4. Verify installations
docker --version
docker-compose --version

# 5. Create deployment user
sudo useradd -m -s /bin/bash deploy
sudo usermod -aG docker deploy
sudo passwd deploy  # Set a password

# 6. Allow SSH for deploy user
sudo mkdir -p /home/deploy/.ssh
sudo chmod 700 /home/deploy/.ssh
```

### Step 5.3: Add SSH Public Key to Servers

On **BOTH** servers:

```bash
# Switch to deploy user
sudo su - deploy

# Create authorized_keys file
nano ~/.ssh/authorized_keys

# Paste your PUBLIC key from Step 3.2 (the .pub file)
# Save and exit (Ctrl+X, Y, Enter)

# Set correct permissions
chmod 600 ~/.ssh/authorized_keys
exit
```

**Test SSH connection from your local machine:**

```bash
# Test staging server
ssh deploy@<staging-server-ip>

# Test production server
ssh deploy@<production-server-ip>
```

If both work without password prompt, you're ready!

---

## Part 6: Running Your First Pipeline

### Step 6.1: Trigger the Pipeline

```bash
# Make a small change to test pipeline
echo "# CI/CD Test" >> README.md

# Commit and push
git add README.md
git commit -m "Test: Trigger CI/CD pipeline"
git push origin main
```

### Step 6.2: Monitor Pipeline Execution

1. Go to your GitLab project
2. Left sidebar: **CI/CD** → **Pipelines**
3. Click on the latest pipeline (should show "running")
4. Watch each stage complete:
   - **build-frontend**: ~2-3 minutes
   - **build-backend**: ~2-3 minutes
   - **test**: ~1 minute

### Step 6.3: Check Build Artifacts

After successful build:

1. Go to **Packages & Registries** → **Container Registry**
2. You should see two repositories:
   - `frontend` with tags: `latest`, `<commit-sha>`
   - `backend` with tags: `latest`, `<commit-sha>`

### Step 6.4: Deploy to Staging (Manual)

1. In the pipeline view, find **deploy-staging** job
2. Click the **"Play"** button (▶️)
3. Click **"Deploy"** in confirmation dialog
4. Monitor logs:
   - SSH connection established
   - Docker images pulled
   - Containers started
   - Deployment successful

**Verify staging deployment:**
```bash
curl http://<staging-server-ip>:3000
curl http://<staging-server-ip>:5000/health
```

---

## Part 7: Deploying to Production

### Step 7.1: Test Staging Environment

Before deploying to production, thoroughly test staging:

1. Open staging URL: `http://<staging-server-ip>:3000`
2. Test all features:
   - ✓ Dashboard loads
   - ✓ Can add/edit/delete services
   - ✓ Can add/edit/delete clients
   - ✓ Can create bookings
   - ✓ User registration/login works
   - ✓ Reports display correctly

### Step 7.2: Deploy to Production

1. Return to GitLab pipeline view
2. Find **deploy-production** job
3. Click **"Play"** button (▶️)
4. Confirm deployment
5. Monitor logs for success

**Verify production deployment:**
```bash
curl http://<production-server-ip>:3000
curl http://<production-server-ip>:5000/health
```

### Step 7.3: Set Up Domain (Optional)

If you have a domain name:

**On production server:**

```bash
# Install Nginx
sudo apt install nginx -y

# Create site configuration
sudo nano /etc/nginx/sites-available/it-services
```

**Paste this configuration:**

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

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
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

**Enable the site:**

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/it-services /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

**Access your site:**
- Open browser: `http://yourdomain.com`

---

## Troubleshooting

### Issue 1: Pipeline Fails at Build Stage

**Symptoms:**
- Build job shows red "failed" status
- Error: "Cannot connect to Docker daemon"

**Solution:**
```bash
# Ensure GitLab Runner has Docker access
# In GitLab: Settings → CI/CD → Runners → Edit Runner
# Check "Run untagged jobs"
# Add tag: "docker"
```

### Issue 2: SSH Connection Fails During Deployment

**Symptoms:**
- Deploy job fails with "Permission denied (publickey)"

**Solution:**
```bash
# On server, check SSH key permissions
sudo su - deploy
ls -la ~/.ssh/
# authorized_keys should be 600 permissions

# Verify key matches
cat ~/.ssh/authorized_keys
# Compare with GitLab CI variable SSH_PRIVATE_KEY (public part)
```

### Issue 3: Docker Image Not Found

**Symptoms:**
- Deployment fails with "Unable to find image"
- Error: "manifest unknown"

**Solution:**
```bash
# Check GitLab Container Registry
# Go to: Packages & Registries → Container Registry
# Verify images exist

# Check CI variables
# Ensure CI_REGISTRY, CI_REGISTRY_USER, CI_REGISTRY_PASSWORD are correct

# Manually login to registry on server
ssh deploy@<server-ip>
docker login registry.gitlab.com
# Use your GitLab credentials
```

### Issue 4: Port Already in Use

**Symptoms:**
- Container fails to start
- Error: "port is already allocated"

**Solution:**
```bash
# On server, find process using port
sudo lsof -i :3000
sudo lsof -i :5000

# Stop containers
docker stop $(docker ps -aq)
docker rm $(docker ps -aq)

# Retry deployment
```

### Issue 5: Frontend Can't Connect to Backend

**Symptoms:**
- Frontend loads but API calls fail
- Console errors: "Failed to fetch"

**Solution:**
```bash
# Check backend is running
curl http://localhost:5000/health

# Update frontend API_URL if needed
# Edit frontend/app.js:
# const API_URL = 'http://your-server-ip:5000/api';

# Rebuild and redeploy
git add frontend/app.js
git commit -m "Fix API URL"
git push origin main
```

### Getting Help

**GitLab Pipeline Logs:**
1. Go to **CI/CD** → **Pipelines**
2. Click on failed job
3. View full logs
4. Look for red error messages

**Server Logs:**
```bash
# Check container logs
docker logs it-services-backend
docker logs it-services-frontend

# Check system logs
sudo journalctl -u docker -f
```

**Common Commands:**
```bash
# Restart Docker
sudo systemctl restart docker

# Check disk space
df -h

# Check memory
free -m

# View running containers
docker ps

# Remove all containers and images (use with caution!)
docker system prune -a
```

---

## Success Checklist

✅ **Local Development**
- [ ] Project runs locally with `docker-compose up`
- [ ] Frontend accessible at http://localhost:3000
- [ ] Backend health check at http://localhost:5000/health

✅ **GitLab Setup**
- [ ] Repository created and code pushed
- [ ] Container Registry enabled
- [ ] All CI/CD variables configured
- [ ] SSH keys generated and added

✅ **CI/CD Pipeline**
- [ ] Pipeline triggers automatically on push
- [ ] Build stages complete successfully
- [ ] Tests pass
- [ ] Docker images appear in Container Registry

✅ **Deployment**
- [ ] Staging server configured and accessible
- [ ] Production server configured and accessible
- [ ] Manual deployment to staging works
- [ ] Manual deployment to production works
- [ ] Application accessible from server IPs/domains

---

## Next Steps

### For Beginners
1. **Explore the codebase**: Understand how frontend and backend communicate
2. **Make small changes**: Try modifying colors, text, or adding features
3. **Learn Docker**: Understand Dockerfile and docker-compose.yml
4. **Study CI/CD**: Review .gitlab-ci.yml to understand each stage

### For Intermediate Developers
1. **Add database**: Integrate PostgreSQL or MongoDB
2. **Implement authentication**: Add JWT tokens properly
3. **Add monitoring**: Integrate Prometheus/Grafana
4. **Enhance security**: Add HTTPS with Let's Encrypt
5. **Scale deployment**: Use Kubernetes or Docker Swarm

### For Production Use
1. **Add automated tests**: Unit tests, integration tests, E2E tests
2. **Implement logging**: Centralized logging with ELK stack
3. **Set up backups**: Automated database and file backups
4. **Configure alerts**: Email/Slack notifications for failures
5. **Add monitoring**: APM tools like New Relic or DataDog

---

## Resources

### Official Documentation
- [GitLab CI/CD](https://docs.gitlab.com/ee/ci/)
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

### Tutorials
- [GitLab CI/CD Beginner Guide](https://docs.gitlab.com/ee/ci/quick_start/)
- [Docker for Beginners](https://docker-curriculum.com/)
- [Express.js Tutorial](https://expressjs.com/en/starter/installing.html)

### Community
- [GitLab Forum](https://forum.gitlab.com/)
- [Docker Community](https://www.docker.com/community/)
- [Stack Overflow - GitLab CI](https://stackoverflow.com/questions/tagged/gitlab-ci)

---

## Conclusion

Congratulations! You've successfully set up a complete Docker-based application with GitLab CI/CD pipeline.

**What you've learned:**
- Setting up GitLab projects and CI/CD pipelines
- Building and deploying Docker containers
- Implementing staging and production environments
- Managing secrets and environment variables
- Troubleshooting common deployment issues

**This setup is production-ready and demonstrates:**
- Modern DevOps practices
- Continuous Integration/Continuous Deployment
- Microservices architecture
- Infrastructure as Code
- Best practices for security and deployment

Use this project as a portfolio piece to showcase your skills to potential employers!

---

**Happy Deploying! 🚀**
