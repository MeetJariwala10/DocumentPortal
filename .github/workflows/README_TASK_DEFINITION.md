# ECS Task Definition Documentation

## File: `.github/workflows/task_definition.json`

### Overview
This JSON file defines the AWS ECS task definition for the DocumentPortal application. It specifies how the application container should run in ECS Fargate, including resource allocation, networking, environment variables, and logging configuration.

### Purpose
- **Container Specification**: Defines how the application runs in ECS
- **Resource Management**: Specifies CPU and memory allocation
- **Security Configuration**: Sets up networking and IAM roles
- **Environment Setup**: Configures environment variables and secrets
- **Logging Setup**: Establishes CloudWatch logging

## Task Definition Structure

### Basic Configuration
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

#### Configuration Details

##### Family
- **Value**: `"documentportaltd"`
- **Purpose**: Unique identifier for the task definition family
- **Usage**: Groups related task definitions together
- **Naming Convention**: Descriptive name for easy identification

##### Network Mode
- **Value**: `"awsvpc"`
- **Purpose**: Uses AWS VPC networking
- **Benefits**: 
  - Enhanced security with private subnets
  - Network ACLs and security groups
  - Better isolation from other workloads
- **Requirements**: Requires security groups and subnets

##### Execution Role
- **Value**: `"arn:aws:iam::459497895986:role/ecsTaskExecutionRole"`
- **Purpose**: IAM role for ECS task execution
- **Permissions**: 
  - Pull images from ECR
  - Write logs to CloudWatch
  - Access secrets from Secrets Manager
- **Security**: Least-privilege access principle

##### Compatibility
- **Value**: `["FARGATE"]`
- **Purpose**: Specifies Fargate platform
- **Benefits**:
  - Serverless container execution
  - No server management required
  - Automatic scaling capabilities
  - Pay-per-use pricing

##### Resource Allocation
- **CPU**: `"1024"` (1 vCPU)
- **Memory**: `"8192"` (8 GB RAM)
- **Purpose**: Defines container resource limits
- **Scaling**: Can be adjusted based on application needs

## Container Definition

### Container Configuration
```json
{
  "name": "document-portal-container",
  "image": "459497895986.dkr.ecr.ap-southeast-2.amazonaws.com/documentportalliveclass",
  "cpu": 1024,
  "essential": true
}
```

#### Container Details

##### Name
- **Value**: `"document-portal-container"`
- **Purpose**: Identifies the container within the task
- **Usage**: Referenced in deployment scripts and monitoring

##### Image
- **Value**: ECR repository URL with region
- **Format**: `{account}.dkr.ecr.{region}.amazonaws.com/{repository}`
- **Purpose**: Specifies the Docker image to run
- **Dynamic**: Updated during deployment with new image tags

##### CPU Allocation
- **Value**: `1024`
- **Unit**: CPU units (1024 = 1 vCPU)
- **Purpose**: CPU resource allocation for the container
- **Matching**: Should match task-level CPU allocation

##### Essential Flag
- **Value**: `true`
- **Purpose**: Container must run for task to succeed
- **Behavior**: If this container fails, the entire task fails

## Port Configuration

### Port Mappings
```json
{
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

#### Port Details

##### Container Port
- **Value**: `8080`
- **Purpose**: Port the application listens on inside the container
- **Application**: FastAPI/React application port

##### Host Port
- **Value**: `8080`
- **Purpose**: Port exposed on the host/load balancer
- **Access**: External traffic reaches the application via this port

##### Protocol
- **Value**: `"tcp"`
- **Purpose**: Network protocol for the port
- **Usage**: Standard TCP for HTTP/HTTPS traffic

##### Port Name
- **Value**: `"document-portal-container-8080-tcp"`
- **Purpose**: Descriptive name for the port mapping
- **Usage**: Service discovery and load balancer configuration

##### Application Protocol
- **Value**: `"http"`
- **Purpose**: Indicates HTTP traffic
- **Benefits**: Enables HTTP-specific optimizations

## Environment Configuration

### Environment Variables
```json
{
  "environment": [
    {
      "name": "ENV",
      "value": "production"
    }
  ]
}
```

#### Environment Details

##### ENV Variable
- **Name**: `"ENV"`
- **Value**: `"production"`
- **Purpose**: Indicates production environment
- **Usage**: Application configuration and logging

### Secrets Management
```json
{
  "secrets": [
    {
      "name": "API_KEYS",
      "valueFrom": "arn:aws:secretsmanager:ap-southeast-2:459497895986:secret:api_keys-nZTtj8"
    }
  ]
}
```

#### Secrets Details

##### API Keys Secret
- **Name**: `"API_KEYS"`
- **Source**: AWS Secrets Manager
- **ARN**: Full ARN to the secret
- **Purpose**: Secure storage of API keys
- **Security**: Encrypted at rest and in transit

## Logging Configuration

### CloudWatch Logs Setup
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

#### Logging Details

##### Log Driver
- **Value**: `"awslogs"`
- **Purpose**: Uses AWS CloudWatch Logs
- **Benefits**: Centralized logging and monitoring

##### Log Group
- **Value**: `"/ecs/documentportaltd"`
- **Purpose**: Groups related log streams
- **Naming**: Hierarchical structure for organization

##### Log Region
- **Value**: `"ap-southeast-2"`
- **Purpose**: Specifies CloudWatch region
- **Matching**: Should match ECS cluster region

##### Stream Prefix
- **Value**: `"ecs"`
- **Purpose**: Prefix for log stream names
- **Format**: `{prefix}/{container-name}/{task-id}`

##### Create Group
- **Value**: `"true"`
- **Purpose**: Automatically creates log group if missing
- **Benefit**: No manual setup required

## Integration with CI/CD

### Template Usage
- **Template**: This file serves as a template for deployment
- **Dynamic Updates**: Image field gets replaced during deployment
- **Version Control**: Template changes are tracked in Git

### Deployment Process
1. **Template Loading**: CD workflow loads this template
2. **Image Replacement**: New Docker image URI replaces placeholder
3. **Validation**: Task definition is validated
4. **Deployment**: Updated definition deploys to ECS

### Image Tagging
- **Commit SHA**: Images tagged with commit SHA for traceability
- **Format**: `{registry}/{repository}:{commit-sha}`
- **Benefits**: Links deployments to specific code versions

## Security Considerations

### Network Security
- **VPC Mode**: Isolated network environment
- **Security Groups**: Control inbound/outbound traffic
- **Private Subnets**: Enhanced security for containers

### IAM Security
- **Execution Role**: Minimal required permissions
- **Secrets Access**: Secure API key management
- **ECR Access**: Pull-only permissions for images

### Container Security
- **Non-Root**: Containers run as non-root user
- **Resource Limits**: Prevents resource exhaustion
- **Image Scanning**: Regular vulnerability scanning

## Monitoring and Observability

### CloudWatch Integration
- **Logs**: Application and container logs
- **Metrics**: CPU, memory, and network metrics
- **Alarms**: Automated alerting for issues

### ECS Monitoring
- **Service Events**: Deployment and health events
- **Task Status**: Running, stopped, or failed tasks
- **Resource Utilization**: CPU and memory usage

### Application Monitoring
- **Health Checks**: Application readiness checks
- **Performance Metrics**: Response times and throughput
- **Error Tracking**: Application errors and exceptions

## Best Practices

### Resource Management
1. **Right-Sizing**: Match resources to application needs
2. **Monitoring**: Track resource utilization
3. **Scaling**: Adjust based on performance metrics

### Security
1. **Least Privilege**: Minimal required permissions
2. **Secrets Management**: Use AWS Secrets Manager
3. **Network Isolation**: Use VPC and security groups

### Logging
1. **Structured Logging**: Use consistent log formats
2. **Log Levels**: Appropriate logging levels
3. **Retention**: Set appropriate log retention periods

### Deployment
1. **Blue-Green**: Zero-downtime deployments
2. **Rollbacks**: Quick rollback procedures
3. **Testing**: Test deployment process regularly

## Troubleshooting

### Common Issues
1. **Resource Limits**: Insufficient CPU or memory
2. **Network Issues**: Security group or subnet problems
3. **Image Issues**: Invalid or inaccessible Docker images
4. **Permission Issues**: IAM role or policy problems

### Debugging Steps
1. Check ECS service events
2. Review CloudWatch logs
3. Verify task definition syntax
4. Test container locally
5. Check AWS permissions

---

**Last Updated**: [Current Date]
**Maintainer**: DevOps Team
**Related Files**: `ci.yaml`, `aws.yml`, `task_definition.json`
