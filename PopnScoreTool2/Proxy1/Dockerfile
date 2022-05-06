#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM arm64v8/nginx:stable-alpine as base
# FROM amd64/nginx:stable-alpine
EXPOSE 80 443
WORKDIR /usr/share/nginx/html
RUN mkdir ssl-proof
RUN chmod 755 ssl-proof
WORKDIR /
RUN apk update
RUN apk upgrade
RUN apk add tzdata --no-cache
ENV TZ=Asia/Tokyo
COPY ["nginx/certs/fullchain.pem", "/etc/letsencrypt/live/otoge-flow-flow.com/fullchain.pem"]
COPY ["nginx/certs/privkey.pem", "/etc/letsencrypt/live/otoge-flow-flow.com/privkey.pem"]
# COPY ["nginx/certs/nginx.key", "/etc/letsencrypt/live/otoge-flow-flow.com/nginx.key"]
# COPY ["nginx/certs/nginx-certificate.crt", "/etc/letsencrypt/live/otoge-flow-flow.com/nginx-certificate.crt"]
COPY ["nginx/proxy.conf", "/etc/nginx/proxy.conf"]
COPY ["nginx/nginx.conf", "/etc/nginx/nginx.conf"]
COPY ["nginx/otoge-flow-flow.com", "/etc/nginx/sites-available/otoge-flow-flow.com"]
RUN mkdir /etc/nginx/sites-enabled/
RUN ln -s /etc/nginx/sites-available/otoge-flow-flow.com /etc/nginx/sites-enabled/otoge-flow-flow.com

ENTRYPOINT ["nginx", "-g", "daemon off;"]