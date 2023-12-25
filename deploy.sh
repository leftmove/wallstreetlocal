git pull origin main
sudo docker compose down

sudo docker rm -vf $(sudo docker ps -aq)
curl "$SECRETS_URL" -o "./backend/.env.production"

sudo docker compose up --build -d
