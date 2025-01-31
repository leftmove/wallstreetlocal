sudo systemctl stop uvicorn
sudo systemctl stop celery
/usr/bin/uv run python -m celery -A worker.tasks.queue purge -f
sudo systemctl restart celery
sudo systemctl start uvicorn
