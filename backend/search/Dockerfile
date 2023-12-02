FROM getmeili/meilisearch:v1.5

COPY search_db ./search_db
COPY config.toml ./config.toml

EXPOSE 7700

CMD ["meilisearch", "--master-key=***REMOVED***"]
