FROM ghcr.io/astral-sh/uv:python3.9-bookworm-slim AS base

# Copy only requirements to cache them in docker layer
WORKDIR /app
COPY uv.lock pyproject.toml /app/

# Install requirements
RUN uv sync

COPY worker/tasks.py /app/worker/tasks.py
COPY static /app/static/
COPY routers /app/routers/

# Command to run the application
CMD ["uv", "run", "python", "-m", "celery", "-A", "worker.tasks.queue", "worker", "--loglevel=info"]
