# CI Workflow Documentation

## File: `.github/workflows/ci.yaml`

### Overview
This GitHub Actions workflow handles **Continuous Integration (CI)** for the DocumentPortal project. It automatically runs tests and builds the application whenever code changes are pushed to the repository.

### Purpose
- **Quality Assurance**: Ensures code quality through automated testing
- **Build Verification**: Confirms the application builds successfully
- **Early Detection**: Catches bugs and issues before deployment
- **Gatekeeper**: Acts as a prerequisite for the CD pipeline

### Trigger Conditions
- **Push Events**: Runs on every push to any branch
- **Pull Requests**: Runs on every pull request
- **Manual Trigger**: Can be manually triggered if needed

### Workflow Name
`Run Unit Tests`

### Job Configuration
- **Runner**: `ubuntu-latest` (GitHub-hosted runner)
- **Single Job**: `test` - handles all CI tasks

## Step-by-Step Process

### 1. Repository Checkout
```yaml
- name: Checkout repo
  uses: actions/checkout@v3
```
- **Action**: `actions/checkout@v3`
- **Purpose**: Clones the repository to the runner
- **Result**: All source code available for processing

### 2. Python Environment Setup
```yaml
- name: Set up Python
  uses: actions/setup-python@v4
  with:
    python-version: '3.10'
```
- **Action**: `actions/setup-python@v4`
- **Version**: Python 3.10
- **Purpose**: Prepares Python environment for backend testing

### 3. Node.js Environment Setup
```yaml
- name: Set up Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20.19.0'
    cache: 'npm'
    cache-dependency-path: frontend/package-lock.json
```
- **Action**: `actions/setup-node@v4`
- **Version**: Node.js 20.19.0
- **Caching**: Enables npm caching for faster builds
- **Cache Path**: `frontend/package-lock.json`
- **Purpose**: Prepares Node.js environment for frontend testing

### 4. Python Dependencies Installation
```yaml
- name: Install Python dependencies
  run: |
    python -m pip install --upgrade pip
    pip install -r requirements.txt
    pip install pytest
```
- **Pip Upgrade**: Ensures latest pip version
- **Requirements**: Installs all Python dependencies
- **Pytest**: Installs testing framework
- **Purpose**: Prepares backend for testing

### 5. Frontend Dependencies Installation
```yaml
- name: Install frontend dependencies
  run: |
    cd frontend
    npm ci
```
- **Directory**: Changes to `frontend/`
- **Command**: `npm ci` (clean install)
- **Purpose**: Installs all frontend dependencies

### 6. Frontend Build
```yaml
- name: Build frontend
  run: |
    cd frontend
    npm run build
  continue-on-error: false
```
- **Directory**: Changes to `frontend/`
- **Command**: `npm run build`
- **Fail-Fast**: Stops workflow if build fails
- **Purpose**: Verifies frontend builds successfully

### 7. Unit Testing
```yaml
- name: Run unit tests
  run: |
    pytest tests/ -v --tb=short
  continue-on-error: false
```
- **Framework**: Pytest
- **Directory**: `tests/`
- **Verbose**: `-v` for detailed output
- **Traceback**: `--tb=short` for concise error messages
- **Fail-Fast**: Stops workflow if tests fail
- **Purpose**: Runs all unit tests

## Test Coverage

### Current Tests
Based on `tests/test_unit_cases.py`:
- **Home Page Test**: Verifies the main page loads correctly
  - Tests HTTP status code (200)
  - Verifies "Document Portal" text is present in response

### Test Structure
```python
def test_home():
    response = client.get("/")
    assert response.status_code == 200
    assert "Document Portal" in response.text
```

### Test Coverage Status
**Current State**: Basic test coverage with room for expansion
- **Coverage Level**: Minimal (1 test case)
- **Areas Covered**: Home page accessibility
- **Areas Needing Coverage**: 
  - API endpoints
  - Document processing functionality
  - User interactions
  - Error handling
  - Integration tests

### Recommended Test Expansion
To improve test coverage, consider adding:
1. **API Endpoint Tests**: Test all FastAPI routes
2. **Document Processing Tests**: Test document upload and analysis
3. **Frontend Component Tests**: React component testing
4. **Integration Tests**: End-to-end workflow testing
5. **Error Handling Tests**: Test error scenarios and edge cases

## Key Features

### 1. Full-Stack Testing
- **Backend**: Python/FastAPI testing
- **Frontend**: React build verification
- **Integration**: End-to-end testing

### 2. Caching Strategy
- **npm Cache**: Speeds up frontend builds
- **Dependency Caching**: Reduces installation time

### 3. Fail-Fast Approach
- **Immediate Failure**: Stops on first error
- **Clear Feedback**: Detailed error messages
- **Quality Gate**: Prevents broken code from proceeding

### 4. Cross-Platform Compatibility
- **Ubuntu Runner**: Consistent environment
- **Version Pinning**: Specific Python and Node.js versions
- **Reproducible**: Same results across environments

## Success Criteria
The CI workflow is considered successful when:
1. ✅ Repository checkout completes
2. ✅ Python environment setup succeeds
3. ✅ Node.js environment setup succeeds
4. ✅ Python dependencies install without errors
5. ✅ Frontend dependencies install without errors
6. ✅ Frontend build completes successfully
7. ✅ All unit tests pass

## Integration with CD Pipeline
- **Trigger**: This CI workflow triggers the CD workflow
- **Condition**: CD only runs if CI passes
- **Branch Restriction**: CD only runs on `main` branch
- **Quality Gate**: Ensures only tested code gets deployed

## Troubleshooting

### Common Issues
1. **Dependency Conflicts**: Check `requirements.txt` and `package.json`
2. **Build Failures**: Verify frontend build scripts
3. **Test Failures**: Check test cases and application logic
4. **Timeout Issues**: Consider workflow optimization

### Debugging Tips
- Check workflow logs for detailed error messages
- Verify dependency versions are compatible
- Ensure all required files are present
- Test locally before pushing changes

## Best Practices
1. **Keep Tests Fast**: Optimize test execution time
2. **Maintain Coverage**: Add tests for new features
3. **Update Dependencies**: Regularly update packages
4. **Monitor Performance**: Track workflow execution times
5. **Document Changes**: Update this README when modifying workflow

---

**Last Updated**: [Current Date]
**Maintainer**: Development Team
**Related Files**: `ci.yaml`, `aws.yml`, `task_definition.json`
