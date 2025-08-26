# CD Workflow Documentation

## File: `.github/workflows/aws.yml`

### Overview
This GitHub Actions workflow handles **Continuous Deployment (CD)** to AWS ECS Fargate. It automatically builds, packages, and deploys the DocumentPortal application to production after successful CI testing.

### Purpose
- **Automated Deployment**: Eliminates manual deployment processes
- **Production Deployment**: Deploys to AWS ECS Fargate production environment
- **Zero Downtime**: Ensures continuous service availability
- **Quality Assurance**: Only deploys code that has passed all tests

### Trigger Conditions
- **Workflow Dependency**: Triggers when "Run Unit Tests" workflow completes
- **Success Only**: Only runs if the CI workflow succeeded
- **Main Branch Only**: Only deploys changes from the `main` branch
- **Automatic**: No manual intervention required

### Workflow Name
`CI/CD to ECS Fargate`

## Environment Configuration

### AWS Settings
```yaml
env:
  AWS_REGION: ap-southeast-2
  ECR_REPOSITORY: documentportalliveclass
  ECS_SERVICE: document-portal-service
  ECS_CLUSTER: document-portal-cluster
  ECS_TASK_DEFINITION: .github/workflows/task_definition.json
  CONTAINER_NAME: document-portal-container
```

### Required Secrets
- `AWS_ACCESS_KEY_ID`: AWS access key for authentication
- `AWS_SECRET_ACCESS_KEY`: AWS secret key for authentication

### Permissions
- **ID Token**: Write access for AWS authentication
- **Contents**: Read access for repository access

## Job Structure

### 1. Check Status Job
```yaml
check-status:
  runs-on: ubuntu-latest
  if: ${{github.event.workflow_run.conclusion == 'success' && github.event.workflow_run.head_branch == 'main'}}
```

**Purpose**: Validates deployment conditions
- **Condition**: CI workflow succeeded AND changes are on main branch
- **Action**: Prints confirmation message
- **Result**: Proceeds to deployment if conditions are met

### 2. Build and Push Job
```yaml
build-and-push:
  name: Build & Push Docker Image
  needs: [check-status]
  runs-on: ubuntu-latest
```

**Dependencies**: Requires `check-status` job to complete first

#### Steps:

##### A. Repository Checkout
```yaml
- name: Checkout Repo
  uses: actions/checkout@v4
```
- **Action**: `actions/checkout@v4`
- **Purpose**: Clones the repository for building

##### B. AWS Credentials Configuration
```yaml
- name: Configure AWS Credentials
  uses: aws-actions/configure-aws-credentials@v4
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: ${{ env.AWS_REGION }}
```
- **Action**: `aws-actions/configure-aws-credentials@v4`
- **Authentication**: Uses AWS secrets for secure access
- **Region**: Configures for ap-southeast-2

##### C. ECR Login
```yaml
- name: Login to Amazon ECR
  id: login-ecr
  uses: aws-actions/amazon-ecr-login@v2
```
- **Action**: `aws-actions/amazon-ecr-login@v2`
- **Purpose**: Authenticates with Amazon ECR
- **Output**: Provides registry information

##### D. Docker Build and Push
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
- **Tag**: Uses commit SHA for unique image identification
- **Build**: Creates Docker image from Dockerfile
- **Push**: Uploads image to ECR repository
- **Output**: Provides image URI for deployment

### 3. Deploy Job
```yaml
deploy:
  name: Deploy to ECS Fargate
  needs: build-and-push
  runs-on: ubuntu-latest
```

**Dependencies**: Requires `build-and-push` job to complete first

#### Steps:

##### A. Repository Checkout
```yaml
- name: Checkout Repo
  uses: actions/checkout@v4
```
- **Purpose**: Access task definition template

##### B. AWS Credentials Configuration
```yaml
- name: Configure AWS Credentials
  uses: aws-actions/configure-aws-credentials@v1
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: ${{ env.AWS_REGION }}
```
- **Action**: `aws-actions/configure-aws-credentials@v1` (Note: Uses v1, not v4)
- **Purpose**: Authenticate for ECS deployment

##### C. Task Definition Rendering
```yaml
- name: Render Task Definition
  id: render-task
  uses: aws-actions/amazon-ecs-render-task-definition@v1
  with:
    task-definition: ${{ env.ECS_TASK_DEFINITION }}
    container-name: ${{ env.CONTAINER_NAME }}
    image: ${{ needs.build-and-push.outputs.image }}
```
- **Action**: `aws-actions/amazon-ecs-render-task-definition@v1`
- **Template**: Uses `task_definition.json` as template
- **Image Replacement**: Updates container image with newly built image
- **Output**: Provides updated task definition

##### D. Task Definition Verification
```yaml
- name: Print Rendered Task
  run: cat ${{ steps.render-task.outputs.task-definition }}
```
- **Purpose**: Debugging and verification
- **Output**: Shows final task definition for review

##### E. ECS Deployment
```yaml
- name: Deploy to ECS
  uses: aws-actions/amazon-ecs-deploy-task-definition@v1
  with:
    task-definition: ${{ steps.render-task.outputs.task-definition }}
    service: ${{ env.ECS_SERVICE }}
    cluster: ${{ env.ECS_CLUSTER }}
    wait-for-service-stability: true
```
- **Action**: `aws-actions/amazon-ecs-deploy-task-definition@v1`
- **Service**: Updates `document-portal-service`
- **Cluster**: Deploys to `document-portal-cluster`
- **Stability**: Waits for service to stabilize
- **Zero Downtime**: Ensures continuous availability

##### F. Deployment Confirmation
```yaml
- name: Done!
  run: echo "Deployed to ECS Fargate Successfully"
```
- **Purpose**: Confirms successful deployment

## Docker Build Process

### Dockerfile Configuration
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

### Build Characteristics
- **Base Image**: Python 3.10-slim
- **Node.js**: Version 20.x installed in container
- **Frontend**: Built inside container during image creation
- **Port**: Exposes 8080
- **Workers**: Runs with 4 uvicorn workers

## Deployment Flow

### 1. Pre-Deployment Checks
- ✅ CI workflow completed successfully
- ✅ Changes are on main branch
- ✅ All tests passed

### 2. Image Building
- ✅ Repository checkout
- ✅ AWS authentication
- ✅ ECR login
- ✅ Docker build with commit SHA tag
- ✅ Image push to ECR

### 3. Deployment Process
- ✅ Task definition template loading
- ✅ Image replacement in task definition
- ✅ ECS service update
- ✅ Service stability verification
- ✅ Deployment confirmation

## Key Features

### 1. Security
- **AWS Secrets**: Secure credential management
- **IAM Roles**: Proper permission handling
- **ECR Authentication**: Secure image registry access

### 2. Reliability
- **Service Stability**: Waits for deployment to stabilize
- **Rollback Capability**: ECS handles failed deployments
- **Health Checks**: ECS monitors service health

### 3. Traceability
- **Commit SHA Tags**: Links deployments to specific commits
- **Logging**: Comprehensive deployment logs
- **Verification**: Task definition review

### 4. Automation
- **Zero Manual Steps**: Fully automated deployment
- **Conditional Execution**: Only deploys on main branch
- **Quality Gates**: Only deploys tested code

## AWS Resources Used

### ECR (Elastic Container Registry)
- **Repository**: `documentportalliveclass`
- **Region**: `ap-southeast-2`
- **Purpose**: Stores Docker images

### ECS (Elastic Container Service)
- **Cluster**: `document-portal-cluster`
- **Service**: `document-portal-service`
- **Platform**: Fargate (serverless)

### IAM (Identity and Access Management)
- **Execution Role**: `ecsTaskExecutionRole`
- **Permissions**: ECR access, ECS deployment

## Success Criteria
The CD workflow is considered successful when:
1. ✅ Pre-deployment checks pass
2. ✅ Docker image builds successfully
3. ✅ Image pushes to ECR without errors
4. ✅ Task definition renders correctly
5. ✅ ECS deployment completes
6. ✅ Service reaches stable state
7. ✅ Application is accessible

## Monitoring and Troubleshooting

### Deployment Monitoring
- **ECS Console**: Monitor service status
- **CloudWatch Logs**: Application and container logs
- **GitHub Actions**: Workflow execution logs

### Common Issues
1. **Authentication Failures**: Check AWS credentials
2. **Build Failures**: Verify Dockerfile and dependencies
3. **Deployment Failures**: Check ECS service configuration
4. **Stability Issues**: Review application health checks

### Debugging Steps
1. Check GitHub Actions logs for detailed error messages
2. Verify AWS credentials and permissions
3. Review ECS service events
4. Check CloudWatch logs for application errors
5. Verify task definition syntax

## Best Practices
1. **Security**: Use least-privilege IAM roles
2. **Monitoring**: Set up CloudWatch alarms
3. **Rollbacks**: Test rollback procedures
4. **Documentation**: Keep deployment procedures updated
5. **Testing**: Test deployment process regularly

---

**Last Updated**: [Current Date]
**Maintainer**: DevOps Team
**Related Files**: `ci.yaml`, `aws.yml`, `task_definition.json`
