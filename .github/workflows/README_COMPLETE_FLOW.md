# Complete CI/CD Pipeline Flow Documentation

## DocumentPortal CI/CD Pipeline Overview

This document provides a comprehensive explanation of the complete CI/CD pipeline for the DocumentPortal application, from code development to production deployment.

## Complete Flow Breakdown

### Phase 1: Development & Code Push

#### 1.1 Developer Actions
- **Code Development**: Developer works on new features/fixes
- **Local Testing**: Runs tests locally before pushing
- **Code Review**: Creates pull request (if applicable)
- **Code Push**: Pushes changes to GitHub repository

#### 1.2 Trigger Conditions
- **Push Events**: Any push to any branch
- **Pull Requests**: Any pull request creation/update
- **Manual Trigger**: Manual workflow execution

### Phase 2: Continuous Integration (CI)

#### 2.1 Workflow Trigger
**File**: `.github/workflows/ci.yaml`
- **Trigger**: Automatic on code push/PR
- **Workflow Name**: "Run Unit Tests"
- **Runner**: `ubuntu-latest`

#### 2.2 CI Process Steps

##### Step 1: Repository Setup
```yaml
- name: Checkout repo
  uses: actions/checkout@v3
```
- **Purpose**: Clone repository to runner
- **Result**: Source code available for processing

##### Step 2: Environment Setup
```yaml
# Python Setup
- name: Set up Python
  uses: actions/setup-python@v4
  with:
    python-version: '3.10'

# Node.js Setup
- name: Set up Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20.19.0'
    cache: 'npm'
    cache-dependency-path: frontend/package-lock.json
```
- **Purpose**: Prepare development environments
- **Caching**: npm cache for faster builds

##### Step 3: Dependency Installation
```yaml
# Python Dependencies
- name: Install Python dependencies
  run: |
    python -m pip install --upgrade pip
    pip install -r requirements.txt
    pip install pytest

# Frontend Dependencies
- name: Install frontend dependencies
  run: |
    cd frontend
    npm ci
```
- **Purpose**: Install all required dependencies
- **Clean Install**: `npm ci` for reproducible builds

##### Step 4: Build Verification
```yaml
- name: Build frontend
  run: |
    cd frontend
    npm run build
  continue-on-error: false
```
- **Purpose**: Verify frontend builds successfully
- **Fail-Fast**: Stops on build failure

##### Step 5: Testing
```yaml
- name: Run unit tests
  run: |
    pytest tests/ -v --tb=short
  continue-on-error: false
```
- **Framework**: Pytest for Python testing
- **Coverage**: Based on `tests/test_unit_cases.py`
- **Current Tests**:
  - Home page accessibility (status code 200)
  - Content verification ("Document Portal" text presence)

#### 2.3 CI Success Criteria
✅ Repository checkout completes  
✅ Python environment setup succeeds  
✅ Node.js environment setup succeeds  
✅ Python dependencies install without errors  
✅ Frontend dependencies install without errors  
✅ Frontend build completes successfully  
✅ All unit tests pass  

### Phase 3: Continuous Deployment (CD)

#### 3.1 CD Workflow Trigger
**File**: `.github/workflows/aws.yml`
- **Trigger**: CI workflow completion
- **Condition**: CI succeeded AND main branch
- **Workflow Name**: "CI/CD to ECS Fargate"

#### 3.2 CD Process Steps

##### Step 1: Pre-Deployment Validation
```yaml
check-status:
  runs-on: ubuntu-latest
  if: ${{github.event.workflow_run.conclusion == 'success' && github.event.workflow_run.head_branch == 'main'}}
```
- **Purpose**: Validate deployment conditions
- **Conditions**: CI success + main branch
- **Result**: Proceeds to deployment if valid

##### Step 2: Docker Image Building
```yaml
build-and-push:
  name: Build & Push Docker Image
  needs: [check-status]
  runs-on: ubuntu-latest
```

###### 2A: AWS Authentication
```yaml
- name: Configure AWS Credentials
  uses: aws-actions/configure-aws-credentials@v4
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: ${{ env.AWS_REGION }}
```
- **Purpose**: Authenticate with AWS
- **Secrets**: Stored in GitHub repository secrets

###### 2B: ECR Login
```yaml
- name: Login to Amazon ECR
  id: login-ecr
  uses: aws-actions/amazon-ecr-login@v2
```
- **Purpose**: Authenticate with ECR
- **Output**: Registry information

###### 2C: Image Build & Push
```yaml
- name: Build and Push Docker Image
  id: build-image
  env:
    ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
    IMAGE_TAG: ${{ github.sha }}
  run: |
    IMAGE_URI=$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
    echo "IMAGE_URI=$IMAGE_URI" >> $GITHUB_ENV
    docker build -t $IMAGE_URI .
    docker push $IMAGE_URI
    echo "image=$IMAGE_URI" >> $GITHUB_OUTPUT
```
- **Tag**: Uses commit SHA for traceability
- **Build**: Docker image from Dockerfile
- **Push**: Upload to ECR repository

##### Step 3: ECS Deployment
```yaml
deploy:
  name: Deploy to ECS Fargate
  needs: build-and-push
  runs-on: ubuntu-latest
```

###### 3A: Task Definition Rendering
```yaml
- name: Render Task Definition
  id: render-task
  uses: aws-actions/amazon-ecs-render-task-definition@v1
  with:
    task-definition: ${{ env.ECS_TASK_DEFINITION }}
    container-name: ${{ env.CONTAINER_NAME }}
    image: ${{ needs.build-and-push.outputs.image }}
```
- **Template**: Uses `task_definition.json`
- **Image Replacement**: Updates with new image
- **Output**: Updated task definition

###### 3B: ECS Deployment
```yaml
- name: Deploy to ECS
  uses: aws-actions/amazon-ecs-deploy-task-definition@v1
  with:
    task-definition: ${{ steps.render-task.outputs.task-definition }}
    service: ${{ env.ECS_SERVICE }}
    cluster: ${{ env.ECS_CLUSTER }}
    wait-for-service-stability: true
```
- **Service**: Updates `document-portal-service`
- **Cluster**: Deploys to `document-portal-cluster`
- **Stability**: Waits for service to stabilize

#### 3.3 CD Success Criteria
✅ Pre-deployment checks pass  
✅ Docker image builds successfully  
✅ Image pushes to ECR without errors  
✅ Task definition renders correctly  
✅ ECS deployment completes  
✅ Service reaches stable state  
✅ Application is accessible  

### Phase 4: Production Deployment

#### 4.1 Docker Build Process
**File**: `Dockerfile`

The CD workflow builds a Docker image using the project's Dockerfile:

```dockerfile
# Base Image
FROM python:3.10-slim

# Environment Setup
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    poppler-utils \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# Application Setup
WORKDIR /app
COPY requirements.txt .
COPY .env .
COPY . .

# Python Dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Frontend Build
WORKDIR /app/frontend
RUN npm ci
RUN npm run build
WORKDIR /app

# Runtime Configuration
EXPOSE 8080
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8080", "--workers", "4"]
```

**Build Characteristics**:
- **Base Image**: Python 3.10-slim
- **Node.js**: Version 20.x installed in container
- **Frontend**: Built inside container during image creation
- **Port**: Exposes 8080
- **Workers**: Runs with 4 uvicorn workers

#### 4.2 ECS Task Definition
**File**: `.github/workflows/task_definition.json`

##### Container Configuration
```json
{
  "family": "documentportaltd",
  "networkMode": "awsvpc",
  "executionRoleArn": "arn:aws:iam::459497895986:role/ecsTaskExecutionRole",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "8192"
}
```

##### Resource Allocation
- **CPU**: 1 vCPU (1024 units)
- **Memory**: 8 GB RAM
- **Network**: AWS VPC for security
- **Platform**: Fargate (serverless)

##### Container Definition
```json
{
  "name": "document-portal-container",
  "image": "459497895986.dkr.ecr.ap-southeast-2.amazonaws.com/documentportalliveclass",
  "cpu": 1024,
  "essential": true,
  "portMappings": [
    {
      "containerPort": 8080,
      "hostPort": 8080,
      "protocol": "tcp",
      "name": "document-portal-container-8080-tcp",
      "appProtocol": "http"
    }
  ]
}
```

##### Environment & Secrets
```json
{
  "environment": [
    {
      "name": "ENV",
      "value": "production"
    }
  ],
  "secrets": [
    {
      "name": "API_KEYS",
      "valueFrom": "arn:aws:secretsmanager:ap-southeast-2:459497895986:secret:api_keys-nZTtj8"
    }
  ]
}
```

##### Logging Configuration
```json
{
  "logConfiguration": {
    "logDriver": "awslogs",
    "options": {
      "awslogs-group": "/ecs/documentportaltd",
      "awslogs-region": "ap-southeast-2",
      "awslogs-stream-prefix": "ecs",
      "awslogs-create-group": "true"
    }
  }
}
```

#### 4.3 Production Environment
- **Region**: `ap-southeast-2`
- **Service**: `document-portal-service`
- **Cluster**: `document-portal-cluster`
- **Repository**: `documentportalliveclass`
- **Port**: 8080 (HTTP)

## Environment Configuration

### AWS Resources
- **ECR**: Container image registry
- **ECS**: Container orchestration
- **IAM**: Identity and access management
- **Secrets Manager**: Secure secret storage
- **CloudWatch**: Logging and monitoring
- **VPC**: Network isolation

### GitHub Secrets
- `AWS_ACCESS_KEY_ID`: AWS access key
- `AWS_SECRET_ACCESS_KEY`: AWS secret key

### Environment Variables
- `AWS_REGION`: ap-southeast-2
- `ECR_REPOSITORY`: documentportalliveclass
- `ECS_SERVICE`: document-portal-service
- `ECS_CLUSTER`: document-portal-cluster
- `ECS_TASK_DEFINITION`: .github/workflows/task_definition.json
- `CONTAINER_NAME`: document-portal-container

## Security Features

### Network Security
- **VPC Mode**: Isolated network environment
- **Security Groups**: Traffic control
- **Private Subnets**: Enhanced security

### Access Control
- **IAM Roles**: Least-privilege access
- **Secrets Manager**: Encrypted secrets
- **ECR Authentication**: Secure image access

### Container Security
- **Non-Root Execution**: Security best practice
- **Resource Limits**: Prevents abuse
- **Image Scanning**: Vulnerability detection

## Monitoring & Observability

### CloudWatch Integration
- **Logs**: Application and container logs
- **Metrics**: Performance monitoring
- **Alarms**: Automated alerting

### ECS Monitoring
- **Service Events**: Deployment tracking
- **Task Status**: Health monitoring
- **Resource Utilization**: Performance metrics

### Application Monitoring
- **Health Checks**: Service availability
- **Performance Metrics**: Response times
- **Error Tracking**: Issue identification

## Rollback Strategy

### Automatic Rollback
- **ECS Service**: Handles failed deployments
- **Health Checks**: Automatic failure detection
- **Previous Version**: Reverts to last stable version

### Manual Rollback
- **GitHub Actions**: Manual workflow execution
- **Previous Image**: Deploy specific image version
- **Task Definition**: Revert to previous configuration

## Best Practices

### Development
1. **Local Testing**: Test before pushing
2. **Code Review**: Peer review process
3. **Small Changes**: Incremental updates
4. **Documentation**: Keep docs updated

### CI/CD
1. **Fast Feedback**: Quick test execution
2. **Fail Fast**: Stop on first error
3. **Caching**: Optimize build times
4. **Security**: Secure credential handling

### Deployment
1. **Zero Downtime**: Blue-green deployments
2. **Monitoring**: Comprehensive observability
3. **Rollbacks**: Quick recovery procedures
4. **Testing**: Regular deployment testing

## Troubleshooting Guide

### CI Issues
1. **Build Failures**: Check dependencies and build scripts
2. **Test Failures**: Review test cases and application logic
3. **Timeout Issues**: Optimize workflow performance
4. **Dependency Conflicts**: Update package versions

### CD Issues
1. **Authentication Failures**: Verify AWS credentials
2. **Build Failures**: Check Dockerfile and dependencies
3. **Deployment Failures**: Review ECS configuration
4. **Stability Issues**: Check application health

### Production Issues
1. **Resource Limits**: Monitor CPU and memory usage
2. **Network Issues**: Verify security groups and subnets
3. **Application Errors**: Check CloudWatch logs
4. **Performance Issues**: Monitor metrics and optimize

## Success Metrics

### Pipeline Metrics
- **Build Time**: < 10 minutes
- **Test Coverage**: > 80% (target, currently minimal)
- **Deployment Time**: < 5 minutes
- **Success Rate**: > 95%

### Application Metrics
- **Uptime**: > 99.9%
- **Response Time**: < 500ms
- **Error Rate**: < 1%
- **Resource Utilization**: < 80%

---

**Last Updated**: [Current Date]
**Maintainer**: DevOps Team
**Related Files**: 
- `ci.yaml` - CI workflow
- `aws.yml` - CD workflow  
- `task_definition.json` - ECS configuration
- `Dockerfile` - Container build configuration
- `README_CI.md` - CI documentation
- `README_CD.md` - CD documentation
- `README_TASK_DEFINITION.md` - Task definition documentation
