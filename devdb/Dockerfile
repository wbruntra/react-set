# Instructions copied from - https://hub.docker.com/_/python/
FROM mariadb:10

ENV MYSQL_ROOT_PASSWORD devpw
ENV MYSQL_DATABASE reactdb

# tell the port number the container should expose
EXPOSE 3306

# Copy needed files
COPY ./files/dump.sql /docker-entrypoint-initdb.d/
