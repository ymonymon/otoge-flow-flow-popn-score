# 証明書手動更新手順

## ログイン

    sudo su - ec2-user
    # docker container ls -a -f name=proxy -q
    ## docker container logs <CONTAINER_ID>
    ## docker container exec -it {CONTAINER ID} /bin/bash
    # docker container exec -it --user root {CONTAINER ID} /bin/sh
    docker container exec -it --user root `docker container ls -a -f name=proxy -q` /bin/sh

    apk add certbot
    certbot certonly --webroot -w /usr/share/nginx/html/ssl-proof -d otoge-flow-flow.com -m {mail_address}
    *2

manual copy from /etc/letsencrypt/live/.com/
otoge-flow-flow.com-0001/

copy fullchain.pem
privkey.pem

## 証明書自動更新

### 設定例

- [Let’s EncryptによるSSLサーバー証明書の取得、自動更新設定（2021年3月版） | 稲葉サーバーデザイン](https://inaba-serverdesign.jp/blog/20210331/snap-lets-encrypt-ssl-certificate-update.html)

### 要件

- alpine用の設定にする必要がある。
- container上で更新するので、どこか外部ストレージなどを用意したい。
- AWS Certificate Manager を使うのはあり。
