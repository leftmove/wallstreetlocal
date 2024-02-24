echo "Deploying Server..."

git stash
git pull origin main

bash install.sh
