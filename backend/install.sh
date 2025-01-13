sudo systemctl stop uvicorn
sudo systemctl stop celery
uv run python -m celery -A worker.tasks.queue purge -f
redis-cli flushall
sudo systemctl restart celery
sudo systemctl start uvicorn
