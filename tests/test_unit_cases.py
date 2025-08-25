# tests/test_unit_cases.py

import pytest
from fastapi.testclient import TestClient

def test_home(client):
    """Test the home page endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    assert "Document Portal" in response.text

def test_api_health(client):
    """Test API health check endpoint"""
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "document-portal"}

def test_analyze_endpoint_exists(client):
    """Test that the analyze endpoint exists"""
    response = client.get("/api/analyze")
    # Should return 405 Method Not Allowed since it's a POST endpoint
    assert response.status_code == 405

def test_compare_endpoint_exists(client):
    """Test that the compare endpoint exists"""
    response = client.get("/api/compare")
    # Should return 405 Method Not Allowed since it's a POST endpoint
    assert response.status_code == 405

def test_chat_endpoint_exists(client):
    """Test that the chat endpoint exists"""
    response = client.get("/api/chat")
    # Should return 405 Method Not Allowed since it's a POST endpoint
    assert response.status_code == 405

def test_build_index_endpoint_exists(client):
    """Test that the build index endpoint exists"""
    response = client.get("/api/build-index")
    # Should return 405 Method Not Allowed since it's a POST endpoint
    assert response.status_code == 405

def test_nonexistent_endpoint(client):
    """Test that nonexistent endpoints return 404"""
    response = client.get("/api/nonexistent")
    assert response.status_code == 404