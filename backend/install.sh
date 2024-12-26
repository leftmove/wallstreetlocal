sudo systemctl restart uvicorn
uv run python -m celery -A worker.tasks.queue purge -f
sudo systemctl restart celery
