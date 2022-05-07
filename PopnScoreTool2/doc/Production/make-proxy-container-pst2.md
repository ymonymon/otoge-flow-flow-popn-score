# proxy container-pst2

## ログイン

    sudo su - ec2-user
    docker ps -a
    # docker logs <CONTAINER_ID>
    # docker exec -it {CONTAINER ID} /bin/bash
    docker exec -it --user root {CONTAINER ID} /bin/sh

    apk add certbot
    certbot certonly --webroot -w /usr/share/nginx/html/ssl-proof -d otoge-flow-flow.com -m ymonymon@gmail.com
    *2

manual copy from /etc/letsencrypt/live/.com/
otoge-flow-flow.com-0001/

copy fullchain.pem
privkey.pem
