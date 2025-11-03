# Deployment Guide

Complete guide for deploying AnonDocs API using Docker Compose or Kubernetes.

---

## Table of Contents

- [Docker Compose Deployment](#docker-compose-deployment)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Initial Setup](#initial-setup)
- [Production Considerations](#production-considerations)
- [Monitoring & Scaling](#monitoring--scaling)

---

## Docker Compose Deployment

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- (Optional) NVIDIA Docker for GPU support

### Quick Start

```bash
# 1. Clone the repository
git clone <repository-url>
cd anondocs-api

# 2. Start services
docker-compose up -d

# 3. Check service health
docker-compose ps

# 4. Pull and load the Ollama model
docker-compose exec ollama ollama pull mistral-nemo

# 5. Test the API
curl http://localhost:3000/health
```

### Service Configuration

The `docker-compose.yml` includes:

- **Ollama**: Local LLM server on port 11434
- **AnonDocs API**: API server on port 3000

#### Environment Variables

Edit `docker-compose.yml` to customize:

```yaml
environment:
  - DEFAULT_LLM_PROVIDER=ollama
  - OLLAMA_MODEL=mistral-nemo # Change model here
  - CHUNK_SIZE=1500
  - ENABLE_PARALLEL_CHUNKS=false
```

### GPU Support

If you have an NVIDIA GPU:

```yaml
# Uncomment in docker-compose.yml:
deploy:
  resources:
    reservations:
      devices:
        - driver: nvidia
          count: all
          capabilities: [gpu]
```

Verify GPU access:

```bash
docker-compose exec ollama nvidia-smi
```

### Without GPU

Remove or comment out the entire `deploy` section in `docker-compose.yml`:

```yaml
# deploy:
#   resources:
#     reservations:
#       devices:
#         - driver: nvidia
#           count: all
#           capabilities: [gpu]
```

### Common Commands

```bash
# View logs
docker-compose logs -f anondocs-api
docker-compose logs -f ollama

# Restart services
docker-compose restart

# Stop services
docker-compose down

# Rebuild after code changes
docker-compose up -d --build

# Pull different Ollama model
docker-compose exec ollama ollama pull llama3.1

# List loaded models
docker-compose exec ollama ollama list
```

### Persistent Data

Data is stored in Docker volumes:

- `ollama-data`: Ollama models and configuration
- `uploads-data`: Temporary upload storage

```bash
# Backup volumes
docker run --rm -v ollama-data:/data -v $(pwd):/backup alpine tar czf /backup/ollama-backup.tar.gz /data

# View volume size
docker volume inspect ollama-data
```

---

## Kubernetes Deployment

### Prerequisites

- Kubernetes cluster 1.24+
- `kubectl` configured
- Container registry access
- (Optional) Ingress controller (nginx, traefik)
- (Optional) cert-manager for HTTPS

### Build and Push Image

```bash
# 1. Build Docker image
docker build -t your-registry/anondocs-api:latest .

# 2. Push to your registry
docker push your-registry/anondocs-api:latest

# Update image in k8s/anondocs-deployment.yaml
```

### Deploy to Kubernetes

```bash
# 1. Create namespace
kubectl apply -f k8s/namespace.yaml

# 2. Create ConfigMap
kubectl apply -f k8s/configmap.yaml

# 3. Deploy Ollama
kubectl apply -f k8s/ollama-pvc.yaml
kubectl apply -f k8s/ollama-deployment.yaml
kubectl apply -f k8s/ollama-service.yaml

# 4. Wait for Ollama to be ready
kubectl wait --for=condition=ready pod -l app=ollama -n anondocs --timeout=300s

# 5. Load Ollama model
kubectl exec -n anondocs deployment/ollama -- ollama pull mistral-nemo

# 6. Deploy AnonDocs API
kubectl apply -f k8s/anondocs-deployment.yaml
kubectl apply -f k8s/anondocs-service.yaml

# 7. (Optional) Setup autoscaling
kubectl apply -f k8s/hpa.yaml

# 8. (Optional) Setup ingress
# Edit k8s/ingress.yaml with your domain first
kubectl apply -f k8s/ingress.yaml
```

### Quick Deploy All

```bash
# Deploy everything at once
kubectl apply -f k8s/

# Wait for all pods to be ready
kubectl wait --for=condition=ready pod -l app=anondocs-api -n anondocs --timeout=300s
```

### Verify Deployment

```bash
# Check pod status
kubectl get pods -n anondocs

# Check services
kubectl get svc -n anondocs

# View logs
kubectl logs -f -n anondocs deployment/anondocs-api
kubectl logs -f -n anondocs deployment/ollama

# Test health endpoint
kubectl port-forward -n anondocs svc/anondocs-api-service 3000:80
curl http://localhost:3000/health
```

### Configuration

#### Update Environment Variables

```bash
# Edit ConfigMap
kubectl edit configmap anondocs-config -n anondocs

# Restart deployment to apply changes
kubectl rollout restart deployment/anondocs-api -n anondocs
```

#### Change Ollama Model

```bash
# Update ConfigMap
kubectl patch configmap anondocs-config -n anondocs --type merge -p '{"data":{"OLLAMA_MODEL":"llama3.1"}}'

# Load new model
kubectl exec -n anondocs deployment/ollama -- ollama pull llama3.1

# Restart API
kubectl rollout restart deployment/anondocs-api -n anondocs
```

### Scaling

#### Manual Scaling

```bash
# Scale API replicas
kubectl scale deployment/anondocs-api -n anondocs --replicas=5

# Check status
kubectl get deployment anondocs-api -n anondocs
```

#### Auto-scaling (HPA)

The HPA configuration automatically scales based on CPU/memory:

```bash
# Check HPA status
kubectl get hpa -n anondocs

# View detailed metrics
kubectl describe hpa anondocs-api-hpa -n anondocs
```

### GPU Support

For GPU nodes, uncomment in `k8s/ollama-deployment.yaml`:

```yaml
resources:
  limits:
    nvidia.com/gpu: '1'

nodeSelector:
  nvidia.com/gpu: 'true'

tolerations:
  - key: nvidia.com/gpu
    operator: Exists
    effect: NoSchedule
```

### Ingress & HTTPS

#### Update Domain

Edit `k8s/ingress.yaml`:

```yaml
rules:
  - host: anondocs.yourdomain.com # Your domain
```

#### Enable HTTPS with cert-manager

```yaml
annotations:
  cert-manager.io/cluster-issuer: letsencrypt-prod

tls:
  - hosts:
      - anondocs.yourdomain.com
    secretName: anondocs-tls
```

### Storage

#### Increase Ollama Storage

Edit `k8s/ollama-pvc.yaml`:

```yaml
resources:
  requests:
    storage: 50Gi # Increase based on models
```

### Monitoring

```bash
# Watch pod metrics
kubectl top pods -n anondocs

# View events
kubectl get events -n anondocs --sort-by='.lastTimestamp'

# Check resource usage
kubectl describe node <node-name>
```

### Troubleshooting

```bash
# Pod not starting
kubectl describe pod -n anondocs <pod-name>

# Check logs
kubectl logs -n anondocs <pod-name> --previous

# Check network connectivity
kubectl exec -n anondocs deployment/anondocs-api -- curl http://ollama-service:11434/api/tags

# Restart all
kubectl rollout restart deployment -n anondocs
```

---

## Initial Setup

### 1. Choose Your Model

Available models (from fastest to most accurate):

```bash
# Small & Fast (3.8B parameters)
ollama pull phi-3

# Medium (7B parameters) - Good balance
ollama pull mistral

# Large (8B parameters) - Better quality
ollama pull llama3.1

# Extra Large (12B parameters) - Best quality
ollama pull mistral-nemo
```

### 2. Test Model Performance

```bash
# Docker Compose
docker-compose exec ollama ollama run mistral-nemo "Test anonymization"

# Kubernetes
kubectl exec -n anondocs deployment/ollama -- ollama run mistral-nemo "Test anonymization"
```

### 3. Load Multiple Models (Optional)

```bash
# Pull multiple models
ollama pull mistral
ollama pull llama3.1
ollama pull mistral-nemo

# Switch between them via API provider parameter
curl -X POST http://localhost:3000/api/anonymize \
  -H "Content-Type: application/json" \
  -d '{"text": "...", "provider": "ollama"}'
```

---

## Production Considerations

### Security

1. **API Authentication**: Add authentication middleware
2. **Rate Limiting**: Implement rate limiting for public endpoints
3. **HTTPS**: Always use HTTPS in production
4. **Network Policies**: Restrict pod-to-pod communication

```yaml
# Example Network Policy
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: anondocs-netpol
  namespace: anondocs
spec:
  podSelector:
    matchLabels:
      app: anondocs-api
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: ingress-nginx
      ports:
        - protocol: TCP
          port: 3000
  egress:
    - to:
        - podSelector:
            matchLabels:
              app: ollama
      ports:
        - protocol: TCP
          port: 11434
```

### Performance

1. **Enable Parallel Processing**: Set `ENABLE_PARALLEL_CHUNKS=true` for faster processing
2. **Resource Limits**: Adjust based on actual usage
3. **GPU Acceleration**: Use GPU for Ollama when available
4. **Caching**: Consider adding Redis for response caching

### High Availability

1. **Multiple API Replicas**: Run at least 2 replicas
2. **Pod Disruption Budgets**:

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: anondocs-pdb
  namespace: anondocs
spec:
  minAvailable: 1
  selector:
    matchLabels:
      app: anondocs-api
```

3. **Health Checks**: Already configured in deployments
4. **Backup Strategy**: Regular backups of Ollama models

### Monitoring Setup

1. **Prometheus Metrics**: Add metrics endpoint
2. **Logging**: Centralized logging (ELK, Loki)
3. **Alerting**: Set up alerts for:
   - Pod restarts
   - High memory usage
   - API errors
   - Slow response times

### Cost Optimization

1. **Right-size Resources**: Monitor and adjust limits
2. **Spot/Preemptible Instances**: For non-critical workloads
3. **Scale to Zero**: Consider scaling down during off-hours
4. **Model Selection**: Smaller models use less resources

---

## Common Issues

### Ollama Model Not Loading

```bash
# Check Ollama logs
docker-compose logs ollama
# or
kubectl logs -n anondocs deployment/ollama

# Manually pull model
docker-compose exec ollama ollama pull mistral-nemo
# or
kubectl exec -n anondocs deployment/ollama -- ollama pull mistral-nemo
```

### API Can't Connect to Ollama

```bash
# Docker Compose: Check network
docker-compose exec anondocs-api curl http://ollama:11434/api/tags

# Kubernetes: Check service
kubectl exec -n anondocs deployment/anondocs-api -- curl http://ollama-service:11434/api/tags
```

### Out of Memory

- Reduce `CHUNK_SIZE`
- Disable `ENABLE_PARALLEL_CHUNKS`
- Use smaller model (mistral instead of mistral-nemo)
- Increase container memory limits

### Slow Processing

- Enable `ENABLE_PARALLEL_CHUNKS=true`
- Use GPU for Ollama
- Use smaller model for faster inference
- Increase API replicas

---

## Cleanup

### Docker Compose

```bash
# Stop and remove containers
docker-compose down

# Remove volumes (deletes models!)
docker-compose down -v

# Remove images
docker rmi anondocs-api ollama/ollama
```

### Kubernetes

```bash
# Delete all resources
kubectl delete namespace anondocs

# Or delete individually
kubectl delete -f k8s/
```

---

**Made with ❤️ by [AI SmartTalk](https://aismarttalk.tech)**
