echo "Deploying Server..."

git add -A .
git stash
git pull origin main

bash install.sh
