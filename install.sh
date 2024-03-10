sudo docker system prune -a -f

sudo docker compose -f docker-compose.yml up --force-recreate --build -d backend