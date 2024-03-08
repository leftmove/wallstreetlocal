# wallstreetlocal

Thousands of filings from the world's biggest investors.

This reposority is only the back-end, for the front-end (and main repository) of wallstreetlocal, see [here](https://github.com/bruhbruhroblox/wallstreetlocal).

### Getting Started

This project uses Docker, to deploy run the following command.

```bash
docker compose up -f docker-compose.yaml up
```

#### Third Party APIs

To run both the development and production builds, you will need to have environment variables for third party APIs. Most of the environment variables in the provided compose files you can keep as is, but for the API keys you will need to visit the following services.

* [Alpha Vantage](https://www.alphavantage.co/)
* [OpenFIGI](https://www.openfigi.com/)
* [Finnhub](https://finnhub.io/)

These three different services allow for the most up-to-date and accurate data, while also avoiding rate-limiting.

#### Development

The development build is mainly made for testing, so it may not be ideal.

To run the full app, you need the microservices running through Docker, and the main application running seperately.

1. Run the microservices by calling the development `docker-compose.yaml`.

```bash
docker compose -f docker-compose.yaml up
```

2. Run the main application.

```bash
python main.py
```


`docker-compose.yaml` (Development) 
```yaml
services:

  cache:
    container_name: cache
    build:
      context: ./cache
      dockerfile: Dockerfile
    restart: always
    networks:
      - staging
    ports:
      - 6379:6379
  database:
    container_name: database
    build:
      context: ./database
      dockerfile: Dockerfile
    volumes:
      - ./database/main_db:/data/db
    restart: always
    networks:
      - staging
    ports:
      - 27017:27017
  search:
    container_name: search
    build:
      context: ./search
      dockerfile: Dockerfile
    volumes:
      - ./search/search_db:/meili_data
    restart: always
    networks:
      - staging
    ports:
      - 7700:7700

networks:
  staging:
    driver: bridge
```

#### Production

The production build is made for running at scale, so you may want to do the following things:
- Either run Grafana or remove telemetry altogether (reccomended for self-hosting).
- Run on only one worker
- Map all docker ports to `localhost`

To run the full application with all required microservices, you need just one command.

```bash
docker compose -f docker-compose.yaml up
```

`docker-compose.yaml` (Production)
```yaml
version: "3.4"

services:

  backend:
    container_name: backend
    build:
      dockerfile: Dockerfile.prod
    restart: always
    depends_on:
      - database
      - cache
      - search
    volumes:
      - ./public:/app/public
    networks:
      - proxy-network
    environment:

      APP_NAME: "backend"
      ENVIRONMENT: "production"
      ADMIN_PASSWORD: "***********"

      WORKERS: 9
      HOST: "0.0.0.0"
      EXPOSE_PORT: 8000
      FORWARDED_ALLOW_IPS: "*"
      OTLP_GRPC_ENDPOINT: "http://trace:4317"

      FINN_HUB_API_KEY: "***********"
      ALPHA_VANTAGE_API_KEY: "***********"
      OPEN_FIGI_API_KEY: "***********"

      MONGO_SERVER_URL: "database"
      MONGO_BACKUP_URL: "1LT4xiFJkh6YlAPQDcov8YIKqcvevFlEE"
      REDIS_SERVER_URL: "cache"
      MEILI_SERVER_URL: "search"
      MEILI_MASTER_KEY: "***********"

  cache:
    container_name: cache
    build:
      context: ./cache
      dockerfile: Dockerfile
    networks:
      - proxy-network
    restart: always

  database:
    container_name: database
    build:
      context: ./database
      dockerfile: Dockerfile
    networks:
      - proxy-network
    volumes:
      - ./database/main_db:/data/db
    restart: always

  search:
    container_name: search
    build:
      context: ./search
      dockerfile: Dockerfile
    volumes:
      - ./search/search_db:/meili_data
    networks:
      - proxy-network
    restart: always

networks:
  proxy-network:
    name: proxy-network
```


### License
wallstreetlocal is [MIT Licensed](./LICENSE.MD)