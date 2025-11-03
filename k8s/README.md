# Kubernetes Manifests

This directory contains all Kubernetes manifests for deploying AnonDocs API.

## Files

- `namespace.yaml` - Creates the `anondocs` namespace
- `configmap.yaml` - Environment configuration
- `ollama-pvc.yaml` - Persistent storage for Ollama models
- `ollama-deployment.yaml` - Ollama LLM server deployment
- `ollama-service.yaml` - Ollama internal service
- `anondocs-deployment.yaml` - AnonDocs API deployment
- `anondocs-service.yaml` - AnonDocs API service (LoadBalancer)
- `ingress.yaml` - (Optional) Ingress for external access
- `hpa.yaml` - (Optional) Horizontal Pod Autoscaler

## Quick Deploy

```bash
# Deploy all at once
kubectl apply -f .

# Or deploy in order
kubectl apply -f namespace.yaml
kubectl apply -f configmap.yaml
kubectl apply -f ollama-pvc.yaml
kubectl apply -f ollama-deployment.yaml
kubectl apply -f ollama-service.yaml
kubectl apply -f anondocs-deployment.yaml
kubectl apply -f anondocs-service.yaml
kubectl apply -f hpa.yaml
kubectl apply -f ingress.yaml  # Optional
```

## Before Deploying

1. **Update image**: Edit `anondocs-deployment.yaml`

   ```yaml
   image: your-registry/anondocs-api:latest
   ```

2. **Update domain**: Edit `ingress.yaml`

   ```yaml
   host: anondocs.yourdomain.com
   ```

3. **Storage class**: Edit `ollama-pvc.yaml` if needed
   ```yaml
   storageClassName: your-storage-class
   ```

## Post-Deployment

```bash
# Load Ollama model
kubectl exec -n anondocs deployment/ollama -- ollama pull mistral-nemo

# Check status
kubectl get pods -n anondocs
kubectl get svc -n anondocs

# View logs
kubectl logs -f -n anondocs deployment/anondocs-api
```

## See Full Documentation

👉 [DEPLOYMENT.md](../DEPLOYMENT.md)
