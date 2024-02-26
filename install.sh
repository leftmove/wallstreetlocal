sudo docker system prune -a -f
sudo docker compose -f docker-compose.yml down

sudo docker compose -f docker-compose.yml up --build -d