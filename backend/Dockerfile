FROM python:3.9-slim as base

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV POETRY_VERSION 1.8.3
ENV POETRY_HOME "/opt/poetry"
ENV POETRY_NO_INTERACTION 1
ENV PATH "$POETRY_HOME/bin:$PATH"

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Poetry - respects $POETRY_VERSION & $POETRY_HOME
RUN curl -sSL https://install.python-poetry.org | python3 -


# Copy only requirements to cache them in docker layer
WORKDIR /app
COPY poetry.lock pyproject.toml /app/

# Project initialization:
RUN poetry config virtualenvs.create false
RUN poetry install --no-interaction

COPY main.py /app/
COPY routers /app/routers/
COPY static /app/static/

# Command to run the application
CMD ["poetry", "run", "python", "main.py"]