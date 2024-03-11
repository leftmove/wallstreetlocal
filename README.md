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
  This repository holds the front-end code for wallstreetlocal, for the back-end, see <a href="https://github.com/bruhbruhroblox/pinestreetlocal" target="_blank" >here</a>.
</p>


<!-- <h1 align="center" color="red">
  The site may be down currently due to excessive traffic.
</h1> -->


<p align="center">
  Creating a website is time consuming, and hosting is expensive. If you can, please consider <a href="https://ko-fi.com/wallstreetlocal" target="_blank" >donating</a>.
</p>

### Introduction
The Securities and Exchange Commission (SEC) keeps record of every company in the United States. Companies whose holdings surpass $100 million though, are required to file a special type of form: the 13F form. This form, filed quarterly, discloses the filer's holdings, providing transparency into their investment activities and allowing the public and other market participants to monitor them.

The problem though, is that these holdings are often cumbersome to access, and valuable analysis is often hidden behind a paywall. Through **wallstreetlocal**, the SEC's 13F filers become more accessible and open.

* **Large:** With over 850,000 companies archived, any filer registered with the SEC can be queried. Download the database [here](https://drive.google.com/file/d/1LT4xiFJkh6YlAPQDcov8YIKqcvevFlEE/view).
* **Recent Data:** View stocks in aggregation as the back-end collects and organizes holdings from individual filers. With thousands of cached stocks in our database, accurate and recent data is available for any evaluation.
* **Historical Data:** View individual filings and their holdings in the explorer, or visit the SEC directly.

<p align="center">
  <a href="https://wallstreetlocal.com" target="_blank">Visit</a>
</p>

## Features
 
- Query any 13F filer from the SEC throughly
- Update filers with up-to-date and extensive stock info
- View historical stocks aggregated from all possible sources
s- Sort and analyze data using versatile tools
- Download any data in either JSON or CSV

## Getting Started

View wallstreetlocal at [`wallstreetlocal.com`](https://wallstreetlocal.com), or self-host using the following instructions.

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

The back-end for this installation is already configured to [`content.wallstreetlocal.com`](https://content.wallstreetlocal.com), but if you want to self-host that too, you can find the back-end repository [here](https://github.com/bruhbruhroblox/pinestreetlocal).


For more information on configuration, see the respective docs for wallstreetlocal's development stack.

* [FastAPI](https://fastapi.tiangolo.com/) for the back-end work.
* [NextJS](https://nextjs.org/) for the front-end.
* [Docker](https://docs.docker.com/) for all the different microservices.
* [MongoDB](https://www.mongodb.com/docs/) for the database.
* [Redis](https://redis.io/) for caching.
* [Meilisearch](https://www.meilisearch.com/docs) for the search database.
* [NGINX Proxy Manager](https://nginxproxymanager.com/) for the reverse-proxy.
* [Grafana](https://grafana.com/) for telemetry, using Prometheus, Tempo, Loki, and OpenTelemetry.

## Contributing

If you feel you can contribute to this project, create an issue or a pull request.

This project is soley mantained so it is prone to bugs and anti-patterns, please call them out where you see them. All contributions are highly appreciated!

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=bruhbruhroblox/wallstreetlocal,bruhbruhroblox/pinestreetlocal&type=Date)](https://star-history.com/#bruhbruhroblox/wallstreetlocal&bruhbruhroblox/pinestreetlocal&Date)

## License
[MIT License](./LICENSE)

[Community Code of Conduct](./CODE_OF_CONDUCT.MD)
