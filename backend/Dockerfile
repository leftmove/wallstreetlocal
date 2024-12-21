FROM ghcr.io/astral-sh/uv:python3.9-bookworm-slim AS base

# Copy only requirements to cache them in docker layer
WORKDIR /app
COPY uv.lock pyproject.toml /app/

# Install requirements
RUN uv sync

# Copy the applications
COPY main.py /app/
COPY routers /app/routers/
COPY worker /app/worker/
COPY static /app/static/

# Command to run the application
CMD ["uv", "run", "python", "-m", "main"]
