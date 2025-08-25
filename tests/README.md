# Tests

This directory contains the test suite for the Document Portal application.

## Test Structure

- `test_unit_cases.py` - Unit tests for API endpoints and basic functionality
- `test_routes.py` - Route-specific tests (currently empty)
- `conftest.py` - Pytest configuration and fixtures

## Running Tests

### Local Development
```bash
# Install test dependencies
pip install -r requirements.txt

# Run all tests
pytest tests/

# Run with verbose output
pytest tests/ -v

# Run specific test file
pytest tests/test_unit_cases.py -v
```

### CI/CD Pipeline
Tests are automatically run in GitHub Actions on:
- Push to any branch
- Pull requests

The CI pipeline:
1. Sets up Python 3.10 and Node.js 18
2. Installs Python dependencies
3. Installs frontend dependencies
4. Builds the React frontend
5. Runs the test suite

## Test Coverage

Current tests cover:
- ✅ Home page endpoint (`/`)
- ✅ Health check endpoint (`/api/health`)
- ✅ API endpoint existence (analyze, compare, chat, build-index)
- ✅ Error handling (404 for nonexistent endpoints)

## Adding New Tests

1. Create test functions with `test_` prefix
2. Use the `client` fixture for HTTP requests
3. Add descriptive docstrings
4. Test both success and error cases

Example:
```python
def test_new_endpoint(client):
    """Test the new endpoint functionality"""
    response = client.get("/api/new-endpoint")
    assert response.status_code == 200
    assert "expected_data" in response.json()
```

## Test Configuration

- `pytest.ini` - Global pytest configuration
- `conftest.py` - Shared fixtures and setup
- CI workflow in `.github/workflows/ci.yaml`
