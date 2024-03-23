sudo docker compose -f docker-compose.yaml up --force-recreate -d cache
sudo docker compose -f docker-compose.yaml up --build --force-recreate -d backend
