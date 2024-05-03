sudo docker system prune -f
sudo docker compose -f docker-compose.yaml up --build --force-recreate -d backend
