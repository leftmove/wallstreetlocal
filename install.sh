cd ../telemetry
sudo docker compose up --force-recreate -d
cd ../server

sudo docker compose -f docker-compose.yml down
sudo docker system prune -a -f
sudo docker rm -vf $(sudo docker ps -aq)

sudo docker compose up --build -d