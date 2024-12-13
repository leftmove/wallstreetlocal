<p align="center">
  <a href="https://wallstreetlocal.com" target="_blank">
    <picture>
      <img alt="wallstreetlocal" src="https://i.ibb.co/Fb8wgTw/Wallstreetlocal-logo.png" style="max-width: 100%;">
    </picture>
  </a>
</p>

<p align="center">
  A website that allows you to view the investments of America's largest investors.
</p>

<!-- <h1 align="center" color="red">
  The site may be down currently due to excessive traffic.
</h1> -->

The Securities and Exchange Commission (SEC) keeps record of every company in the United States. Companies whose holdings surpass $100 million though, are required to file a special type of form: the 13F form. This form, filed quarterly, discloses the filer's holdings, providing transparency into their investment activities and allowing the public and other market participants to monitor them.

The problem though, is that these holdings are often cumbersome to access, and valuable analysis is often hidden behind a paywall. Through **wallstreetlocal**, the SEC's 13F filers become more accessible and open.

- **Large:** With over 850,000 companies archived, any filer registered with the SEC can be queried. Download the database [here](https://drive.google.com/file/d/1LT4xiFJkh6YlAPQDcov8YIKqcvevFlEE/view).
- **Recent:** View thousands of cached stocks in the database, with accurate and recent data.
- **Historical:** View filer holdings going back 30+ years in the explorer, or visit the SEC directly.
- **On-Demand:** Data is queried and stored on user request, and is progressively available for download.

---

- [Introduction](#introduction)
- [Getting Started](#getting-started)
- [Self-Hosting](#self-hosting)
  - [Frontend](#frontend)
  - [Backend](#backend)
    - [Third Party APIs](#third-party-apis)
    - [Telemetry](#telemetry)
    - [Development](#development)
    - [Production](#production)
- [Contributing](#contributing)
- [License](#license)
- [Code of Conduct](#code-of-conduct)

## Getting Started

This repository holds the [backend](./backend/) and [frontend](./frontend/) for wallstreetlocal.

To visit the wallstreetlocal, you can go to [`wallstreetlocal.com`](https://wallstreetlocal.com).

You can also see important resources used to create the site at the [resources](https://www.wallstreetlocal.com/about/resources) page, or view the OpenAPI documentation at the [API](https://content.wallstreetlocal.com/docs) page.

For more information, see the documentation for wallstreetlocal's development stack below.

- [FastAPI](https://fastapi.tiangolo.com/) for the backend.
- [NextJS](https://nextjs.org/) for the frontend.
- [Celery](https://docs.celeryq.dev/en/stable/getting-started/introduction.html) for long-running, asychronous backend tasks.
- [Docker](https://docs.docker.com/) for all the different microservices.
- [MongoDB](https://www.mongodb.com/docs/) for the database.
- [Redis](https://redis.io/) for caching.
- [Meilisearch](https://www.meilisearch.com/docs) for search.
- [NGINX Proxy Manager](https://nginxproxymanager.com/) for the reverse-proxy.
- [Sentry](https://sentry.io/) for telemetry.

## Self-Hosting

A production version of the site is hosted at [`wallstreetlocal.com`](https://wallstreetlocal.com), but it is also possible to self-host.

### Frontend

1. Navigate to the frontend folder.

   ```bash
   cd frontend
   ```

2. Install dependencies.

   ```bash
   npm install
   ```

3. Deploy.

   ```bash
   npm run dev
   ```

   Or for a production build, run

   ```bash
   npm run build
   npm run start
   ```

Once the above steps are completed, the frontend should be hosted at [`localhost:3000`](http://localhost:3000), with the backend automatically configured to [`content.wallstreetlocal.com`](https://content.wallstreetlocal.com).

Hosting the frontend alone is the reccomended way to self-host, but if you want to self-host the backend too, see [below](#backend).

### Backend

#### Third Party APIs

To run both the development and production builds, you will need to have environment variables for third party APIs. Most of the environment variables in the provided example files you can keep as is, but for the API keys you will need to visit the following services.

- [Alpha Vantage](https://www.alphavantage.co/)
- [OpenFIGI](https://www.openfigi.com/)
- [Finnhub](https://finnhub.io/)

These three different services allow for the most up-to-date and accurate data, while also avoiding rate-limiting.

#### Telemetry

Although it is recommended that you turn off telemetry for self-hosting, you can enable telemetry through the `TELEMETRY` environment variable.

For telemetry/tracing/logs, wallstreetlocal uses [Sentry](https://sentry.io/). You can sign up [here](https://sentry.io/signup/), or self-host that too.

#### Development

The development build is mainly made for testing, so it is ideal for self-hosting.

To run the full app, you need the microservices running through Docker, and the main application running seperately.

You can find the development compose file [here](./backend/docker-compose.dev.yaml). You will also need a `.env` file that can be found [here](./backend/.env.example).

Once you have all the configuration files ready, to start the app, run the following.

1. Navigate to the backend directory.

   ```bash
   cd backend
   ```

2. Run the microservices by calling the development compose file.

   ```bash
   docker compose -f docker-compose.dev.yaml up -d
   ```

   **Note:** You should stop these microservices after you're done using them (otherwise they will waste resources indefinitely). To stop them, run the following.

   ```
   docker compose -f docker-compose.dev.yaml down # Run after you've finished
   ```

3. Install dependencies with [uv](https://docs.astral.sh/uv/getting-started/installation/).

   ```bash
  pipx install uv # More options at https://docs.astral.sh/uv/getting-started/installation/
  uv sync
   ```

4. Create and edit the `.env` file using `.env.example`.

5. Run the main application.

   ```bash
   uv run python main.py
   ```

#### Production

The production build is made for deploying at scale, so running it will be more cumbersome.

You can find the compose file [here](./backend/docker-compose.prod.yaml). There is no `.env` file though, as all the environment variables are included in the compose file.

Unless you are runnng the production build for many people, you should change the following settings.

- Run on a single worker
- Disable telemetry
- Map all Docker ports to `localhost`

Once you have all the configuration files ready, to start the app, run the following.

1. Navigate to the backend directory.

   ```bash
   cd backend
   ```

2. Run the entire application with one command.

   ```bash
   docker compose -f docker-compose.prod.yaml up
   ```

## Contributing

If you feel you can contribute to this project, or you've found a bug, create an issue or pull request.

This project is soley mantained so it is prone to bugs and anti-patterns, please call them out where you see them. [All contributions are highly appreciated!](./CONTRIBUTING.md)

<div align="center">
  <img src="https://api.star-history.com/svg?repos=leftmove/wallstreetlocal,leftmove/pinestreetlocal&type=Date)](https://star-history.com/#leftmove/wallstreetlocal&leftmove/pinestreetlocal&Date" />
</div>

## License

[MIT License](./LICENSE)

[Code of Conduct](./CODE_OF_CONDUCT.MD)
