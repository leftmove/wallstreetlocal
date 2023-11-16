git pull origin main
sudo docker compose down
sudo docker rm -vf $(sudo docker ps -aq)
sudo docker compose up --build -d
