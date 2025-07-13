# vitalflow-backend
Inventory Management System powered by AI


```
docker buildx create --use
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t peradi/vitalflow-backend:latest \
  --push .

docker rm vitalflow-backend
docker pull peradi/vitalflow-backend:latest
docker run -d \
  --name vitalflow-backend \
  --env-file .env.prod \
  -p 5001:5001 \
  peradi/vitalflow-backend:latest

docker start vitalflow-backend
docker stop vitalflow-backend

docker logs -f vitalflow-backend
```