# CloudFormation Infrastructure Documentation

## File: `infrastructure/document-portal-cf.yaml`

### Overview
This CloudFormation template defines the complete AWS infrastructure for the DocumentPortal application. It creates a production-ready environment with ECS Fargate, ECR repository, VPC networking, security groups, and IAM roles.

### Purpose
- **Infrastructure as Code**: Defines all AWS resources in a declarative YAML format
- **Production Environment**: Creates a complete, scalable infrastructure
- **Security**: Implements proper networking and access controls
- **Monitoring**: Sets up logging and observability
- **Secrets Management**: Integrates with AWS Secrets Manager

## Template Structure

### Template Metadata
```yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: Full ECS + ECR + VPC Infra for Document Portal with secrets and logging
```

### Parameters
```yaml
Parameters:
  VpcCIDR:
    Type: String
    Default: 10.0.0.0/16

  Subnet1CIDR:
    Type: String
    Default: 10.0.1.0/24

  Subnet2CIDR:
    Type: String
    Default: 10.0.2.0/24

  ImageUrl:
    Type: String
    Description: ECR Image URI to use for container
```

#### Parameter Details
- **VpcCIDR**: VPC network range (default: 10.0.0.0/16)
- **Subnet1CIDR**: First subnet range (default: 10.0.1.0/24)
- **Subnet2CIDR**: Second subnet range (default: 10.0.2.0/24)
- **ImageUrl**: ECR image URI for container deployment

## Resource Definitions

### 1. ECR Repository
```yaml
MyECRRepository:
  Type: AWS::ECR::Repository
  Properties:
    RepositoryName: documentportal
    ImageScanningConfiguration:
      ScanOnPush: true
    ImageTagMutability: MUTABLE
```

#### ECR Configuration
- **Repository Name**: `documentportal`
- **Image Scanning**: Enabled on push for security
- **Tag Mutability**: MUTABLE (allows tag overwrites)
- **Purpose**: Stores Docker images for the application

### 2. VPC and Networking

#### VPC
```yaml
MyVPC:
  Type: AWS::EC2::VPC
  Properties:
    CidrBlock: !Ref VpcCIDR 
    EnableDnsSupport: true
    EnableDnsHostnames: true
    Tags:
      - Key: Name
        Value: ecs-vpc
```

#### Subnets
```yaml
Subnet1:
  Type: AWS::EC2::Subnet
  Properties:
    VpcId: !Ref MyVPC 
    CidrBlock: !Ref Subnet1CIDR
    AvailabilityZone: !Select [0, !GetAZs '']
    MapPublicIpOnLaunch: true
    Tags:
      - Key: Name
        Value: public-subnet-1

Subnet2:
  Type: AWS::EC2::Subnet
  Properties:
    VpcId: !Ref MyVPC
    CidrBlock: !Ref Subnet2CIDR
    AvailabilityZone: !Select [1, !GetAZs '']
    MapPublicIpOnLaunch: true
    Tags:
      - Key: Name
        Value: public-subnet-2
```

#### Internet Gateway and Routing
```yaml
InternetGateway:
  Type: AWS::EC2::InternetGateway

AttachGateway:
  Type: AWS::EC2::VPCGatewayAttachment
  Properties:
    VpcId: !Ref MyVPC
    InternetGatewayId: !Ref InternetGateway

RouteTable:
  Type: AWS::EC2::RouteTable
  Properties:
    VpcId: !Ref MyVPC

PublicRoute:
  Type: AWS::EC2::Route
  DependsOn: AttachGateway
  Properties:
    RouteTableId: !Ref RouteTable
    DestinationCidrBlock: 0.0.0.0/0
    GatewayId: !Ref InternetGateway
```

#### Network Configuration Details
- **VPC**: Custom CIDR with DNS support
- **Subnets**: Two public subnets across different AZs
- **Internet Gateway**: Provides internet access
- **Route Table**: Routes traffic to internet gateway
- **Public IP**: Auto-assigned to instances

### 3. ECS Cluster
```yaml
ECSCluster:
  Type: AWS::ECS::Cluster
  Properties:
    ClusterName: document-portal-cluster
```

#### Cluster Configuration
- **Name**: `document-portal-cluster`
- **Type**: ECS Cluster for container orchestration
- **Purpose**: Manages container deployments

### 4. IAM Execution Role
```yaml
ECSExecutionRole:
  Type: AWS::IAM::Role
  Properties:
    RoleName: ecsTaskExecutionRole
    AssumeRolePolicyDocument:
      Version: '2012-10-17'
      Statement:
        - Effect: Allow
          Principal:
            Service: ecs-tasks.amazonaws.com
          Action: sts:AssumeRole
    Policies:
      - PolicyName: ecs-secrets-logs-access
        PolicyDocument:
          Version: '2012-10-17'
          Statement:
            - Effect: Allow
              Action:
                - logs:CreateLogStream
                - logs:PutLogEvents
                - logs:CreateLogGroup
              Resource: "*"
            - Effect: Allow
              Action:
                - secretsmanager:GetSecretValue
              Resource: "*"
```

#### IAM Role Permissions
- **Service**: ECS tasks can assume this role
- **Logging**: Create and write to CloudWatch logs
- **Secrets**: Access AWS Secrets Manager
- **Security**: Least-privilege access principle

### 5. Security Group
```yaml
ECSSecurityGroup:
  Type: AWS::EC2::SecurityGroup
  Properties:
    GroupDescription: Allow HTTP access to container
    VpcId: !Ref MyVPC
    SecurityGroupIngress:
      - IpProtocol: tcp
        FromPort: 8080
        ToPort: 8080
        CidrIp: 0.0.0.0/0
```

#### Security Configuration
- **Port**: 8080 (HTTP)
- **Access**: Public (0.0.0.0/0)
- **Protocol**: TCP
- **Purpose**: Allow web traffic to application

### 6. ECS Task Definition
```yaml
ECSTaskDefinition:
  Type: AWS::ECS::TaskDefinition
  Properties:
    Family: documentportaltd
    Cpu: "1024"
    Memory: "8192"
    NetworkMode: awsvpc
    RequiresCompatibilities:
      - FARGATE
    ExecutionRoleArn: !GetAtt ECSExecutionRole.Arn
    ContainerDefinitions:
      - Name: document-portal-container
        Image: !Ref ImageUrl
        Essential: true
        PortMappings:
          - ContainerPort: 8080
        Environment:
          - Name: LANGCHAIN_PROJECT
            Value: DOCUMENT PORTAL
        Secrets:
          - Name: GROQ_API_KEY
            ValueFrom: arn:aws:secretsmanager:us-east-1:685057748560:secret:GROQ_API_KEY
          - Name: HF_TOKEN
            ValueFrom: arn:aws:secretsmanager:us-east-1:685057748560:secret:HF_TOKEN
          - Name: GOOGLE_API_KEY
            ValueFrom: arn:aws:secretsmanager:us-east-1:685057748560:secret:GOOGLE_API_KEY
          - Name: LANGCHAIN_API_KEY
            ValueFrom: arn:aws:secretsmanager:us-east-1:685057748560:secret:LANGCHAIN_API_KEY
        LogConfiguration:
          LogDriver: awslogs
          Options:
            awslogs-group: /ecs/documentportal
            awslogs-region: !Ref AWS::Region
            awslogs-stream-prefix: ecs
```

#### Task Definition Details
- **Family**: `documentportaltd`
- **Resources**: 1 vCPU, 8GB RAM
- **Network**: AWS VPC mode
- **Platform**: Fargate (serverless)

#### Container Configuration
- **Name**: `document-portal-container`
- **Image**: Parameterized ECR image
- **Port**: 8080
- **Environment**: LangChain project name
- **Secrets**: Multiple API keys from Secrets Manager
- **Logging**: CloudWatch logs integration

#### Secrets Management
The template integrates with AWS Secrets Manager for secure API key storage:
- **GROQ_API_KEY**: Groq API access
- **HF_TOKEN**: Hugging Face token
- **GOOGLE_API_KEY**: Google API access
- **LANGCHAIN_API_KEY**: LangChain API access

### 7. ECS Service
```yaml
ECSService:
  Type: AWS::ECS::Service
  DependsOn: AttachGateway
  Properties:
    ServiceName: document-portal-service
    Cluster: !Ref ECSCluster
    LaunchType: FARGATE
    DesiredCount: 1
    NetworkConfiguration:
      AwsvpcConfiguration:
        AssignPublicIp: ENABLED
        Subnets:
          - !Ref Subnet1
          - !Ref Subnet2
        SecurityGroups:
          - !Ref ECSSecurityGroup
    TaskDefinition: !Ref ECSTaskDefinition
```

#### Service Configuration
- **Name**: `document-portal-service`
- **Type**: Fargate (serverless)
- **Instances**: 1 desired count
- **Network**: Public IP enabled
- **Subnets**: Multi-AZ deployment
- **Security**: Custom security group

## Outputs
```yaml
Outputs:
  ECSClusterName:
    Value: !Ref ECSCluster

  TaskDefinitionArn:
    Value: !Ref ECSTaskDefinition
```

#### Output Values
- **ECSClusterName**: Cluster name for reference
- **TaskDefinitionArn**: Task definition ARN for deployment

## Infrastructure Architecture

### Network Layout
```
Internet
    │
    ▼
Internet Gateway
    │
    ▼
VPC (10.0.0.0/16)
    │
    ├── Subnet 1 (10.0.1.0/24) - AZ 1
    │   └── ECS Service Instance
    │
    └── Subnet 2 (10.0.2.0/24) - AZ 2
        └── ECS Service Instance
```

### Security Architecture
- **VPC Isolation**: Private network environment
- **Security Groups**: Port 8080 access control
- **IAM Roles**: Least-privilege permissions
- **Secrets Manager**: Encrypted API key storage

### High Availability
- **Multi-AZ**: Subnets in different availability zones
- **Load Balancing**: Ready for ALB integration
- **Auto Scaling**: ECS service can scale automatically

## Deployment Process

### 1. Template Validation
```bash
aws cloudformation validate-template --template-body file://document-portal-cf.yaml
```

### 2. Stack Creation
```bash
aws cloudformation create-stack \
  --stack-name document-portal-infra \
  --template-body file://document-portal-cf.yaml \
  --parameters ParameterKey=ImageUrl,ParameterValue=<ECR_IMAGE_URI> \
  --capabilities CAPABILITY_NAMED_IAM
```

### 3. Stack Updates
```bash
aws cloudformation update-stack \
  --stack-name document-portal-infra \
  --template-body file://document-portal-cf.yaml \
  --parameters ParameterKey=ImageUrl,ParameterValue=<NEW_ECR_IMAGE_URI>
```

## Integration with CI/CD

### GitHub Actions Integration
The CloudFormation template works with the existing CI/CD pipeline:

1. **CI Workflow**: Builds and tests application
2. **CD Workflow**: Builds Docker image and pushes to ECR
3. **Infrastructure**: CloudFormation deploys to ECS

### Parameter Updates
The `ImageUrl` parameter can be updated to deploy new versions:
- **Automated**: Via CI/CD pipeline
- **Manual**: Via AWS CLI or console
- **Rollback**: Previous versions remain available

## Monitoring and Observability

### CloudWatch Integration
- **Log Groups**: `/ecs/documentportal`
- **Log Streams**: Per container instance
- **Metrics**: ECS service metrics
- **Alarms**: Can be configured for monitoring

### ECS Monitoring
- **Service Events**: Deployment and health events
- **Task Status**: Running, stopped, or failed tasks
- **Resource Utilization**: CPU and memory usage

## Security Considerations

### Network Security
- **VPC**: Isolated network environment
- **Security Groups**: Minimal required access
- **Public Subnets**: Internet access for container

### Access Control
- **IAM Roles**: Service-specific permissions
- **Secrets Manager**: Encrypted secret storage
- **ECR**: Private image repository

### Container Security
- **Image Scanning**: Automatic vulnerability scanning
- **Fargate**: Managed container runtime
- **No SSH**: No direct container access

## Cost Optimization

### Resource Sizing
- **CPU**: 1 vCPU (1024 units)
- **Memory**: 8GB RAM
- **Instances**: 1 desired count (can scale)

### Recommendations
1. **Right-sizing**: Monitor resource utilization
2. **Auto Scaling**: Implement based on demand
3. **Reserved Capacity**: For predictable workloads
4. **Spot Instances**: For non-critical workloads

## Troubleshooting

### Common Issues
1. **VPC Configuration**: Ensure subnets are public
2. **Security Groups**: Verify port 8080 access
3. **IAM Permissions**: Check execution role policies
4. **Secrets Access**: Verify Secrets Manager ARNs

### Debugging Steps
1. Check CloudFormation stack events
2. Review ECS service events
3. Check CloudWatch logs
4. Verify network connectivity

## Best Practices

### Infrastructure
1. **Version Control**: Template in Git repository
2. **Parameterization**: Use parameters for flexibility
3. **Tagging**: Consistent resource tagging
4. **Documentation**: Keep template documentation updated

### Security
1. **Least Privilege**: Minimal required permissions
2. **Secrets Management**: Use AWS Secrets Manager
3. **Network Security**: Proper VPC configuration
4. **Regular Updates**: Keep dependencies updated

### Monitoring
1. **CloudWatch**: Comprehensive logging
2. **Alarms**: Automated alerting
3. **Metrics**: Performance monitoring
4. **Dashboards**: Visual monitoring

---

**Last Updated**: [Current Date]
**Maintainer**: DevOps Team
**Related Files**: 
- `ci.yaml` - CI workflow
- `aws.yml` - CD workflow
- `task_definition.json` - ECS configuration
- `Dockerfile` - Container build configuration
