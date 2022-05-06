# docker file debug environment

FROM mcr.microsoft.com/mssql/server:2019-latest AS base
# EXPOSE 1433
# mkdir data2
# RUN yum install icu-libs
# WORKDIR /data2
# RUN apt-get update
# RUN apt-get upgrade
# RUN apt-get install locales locales-all

# ENV LANG=C.UTF-8 \
#    LC_ALL=C.UTF-8 \
#    LC_CTYPE="utf-8"

WORKDIR /startup
COPY db-init.sh .
# RUN chmod +x db-init.sh
COPY db-init.sql .
COPY entrypoint.sh .
# RUN chmod +x entrypoint.sh

ENTRYPOINT /startup/entrypoint.sh

# WORKDIR /script2
# COPY startup.ps1 .
# CMD cmd /k powershell .\startup.ps1
