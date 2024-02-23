git pull origin main
sudo docker compose -f docker-compose.yml down

sudo docker system prune -f
# sudo docker rm -vf $(sudo docker ps -aq)

sudo docker compose -f docker-compose.yml build backend
sudo docker compose -f docker-compose.yml up -d
