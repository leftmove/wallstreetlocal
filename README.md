<p align="center">
  <a href="https://wallstreetlocal.com" target="_blank">
    <picture>
      <img alt="wallstreetlocal" src="https://raw.githubusercontent.com/bruhbruhroblox/wallstreetlocal/main/public/static/logo.png" style="max-width: 100%;">
    </picture>
  </a>
</p>

<p align="center">
  A website that allows you to view the investments of America's largest investors.
</p>
<p align="center">
  This repository holds the front-end code for wallstreetlocal, for the back-end, see <a href="https://github.com/bruhbruhroblox/pinestreetlocal" target="_blank" >here</a>
</p>

<!-- ![wallstreetlocal logo](./public//static/logo.png) -->





### SEC Filings
The Securities and Exchange Commission (SEC) keeps record of every company in the United States. Companies whose holdings surpass $100 million though, are required to file a special type of form: the 13F form. This form, filed quarterly, discloses the filer's holdings, providing transparency into their investment activities and allowing the public and other market participants to monitor them.

The problem though, is that these holdings are often cumbersome to access, and valuable analysis is often hidden behind a paywall. Through **wallstreetlocal**, the SEC's 13F filers become more accessible and open.

* **Large:** With over 850,000 companies archived, any company registered with the SEC can be queried. Download the database [here](https://drive.google.com/file/d/1LT4xiFJkh6YlAPQDcov8YIKqcvevFlEE/view).
* **Recent Data:** View stocks in aggregation as the back-end collects and organizes holdings from individual filers. With thousands of cached stocks in our database, accurate and recent data is available for any evaluations.
* **Historical Data:** View individual filings and their holdings in the explorer, or visit the SEC directly.

## Features
 
- Query 13F filers from the SEC
- Update filers with up-to-date stock info
- View filer stocks in an accessible format
- Download any data in either JSON or CSV
- View filer historical filings and compare them

## Getting Started

View wallstreetlocal at `http://wallstreetlocal.com`, or self-host using the following instructions.

1. Install dependencies.
   
   ```bash
   npm install
   ```

2. Deploy.
   
   ```bash
   npm run dev
   ```
   Or for a production build, run
   ```bash
   npm run build && npm run start
   ```

The back-end for wallstreetlocal is already configured to `https://content.wallstreetlocal.com`, but if you want to self-host that too, you can find the back-end repository [here](https://github.com/bruhbruhroblox/pinestreetlocal).


For more information on configuration, see the respective docs for wallstreetlocal's development stack.

* [FastAPI](https://fastapi.tiangolo.com/) for the back-end work.
* [NextJS](https://nextjs.org/) for the front-end.
* [Docker](https://docs.docker.com/) for all the different microservices.
* [MongoDB](https://www.mongodb.com/docs/) for the database.
* [Meilisearch](https://www.meilisearch.com/docs) for the search database.
* [NGINX Proxy Manager](https://nginxproxymanager.com/) for the reverse-proxy.
* [Grafana](https://grafana.com/) for telemetry, using Prometheus, Tempo, Loki, and OpenTelemetry.

## Contributing

If you feel you can contribute to this project, create an issue or a pull request.

This project is soley mantained so it is prone to bugs and anti-patterns, please call them out where you see them. All contributions are highly appreciated!

### License

wallstreetlocal is [MIT licensed](./LICENSE).
