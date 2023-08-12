# Pull base image.
FROM mongo:4.4.6

# Define working directory.
WORKDIR /data

# COPY /dump/ ./dump/

# # Define default command.
# RUN systemctl start mongod
# RUN mongorestore
# RUN systemctl stop mongod

COPY initdb.sh ./docker-entrypoint-initdb.d/initdb.sh

# # Expose ports.
# #   - 27017: process
# #   - 28017: http

EXPOSE 27017
EXPOSE 28017

CMD ["mongod", "--quiet", "--logpath",  "/dev/null"]
