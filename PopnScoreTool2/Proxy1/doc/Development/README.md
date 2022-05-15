# 自己証明書の作り方

WSL2(Ubuntu)上で作成する。

- [Nginx で HTTPS を有効にする](https://techexpert.tips/ja/nginx-ja/nginx-%E3%81%A7-https-%E3%82%92%E6%9C%89%E5%8A%B9%E3%81%AB%E3%81%99%E3%82%8B/)
- [爆速でChrome対応オレオレ証明書を作成する](https://thr3a.hatenablog.com/entry/20171203/1512229150)

## Ubuntu いれる

- [WSL2のUbuntuでDockerを使う](https://zenn.dev/sprout2000/articles/95b125e3359694)

1. Microsoft Store から Ubuntu で検索｡
2. Ubuntu 22.04 LTS を選択

## cmd

    $ sudo apt-get update
    $ sudo apt-get install openssl
    $ mkdir temp
    $ cd temp
    $ openssl genrsa 2048 > nginx.key
    $ openssl req -new -key nginx.key > nginx-certificate.csr
    Country Name (2 letter code) []:US
    State or Province Name (full name) []:California
    Locality Name (eg, city) []:Monrovia
    Organization Name (eg, company) []:
    Organizational Unit Name (eg, section) []:Development
    Common Name (eg, your websites domain name) []
        :otoge-flow-flow.com
    Email Address []:root@otoge-flow-flow.com
    # SAN（サブジェクトの別名）もきちんと入力
    $ echo subjectAltName=DNS:otoge-flow-flow.com > san.ext
    $ openssl x509 -days 3650 -req -signkey nginx.key < nginx-certificate.csr > nginx-certificate.crt -extfile san.ext
    # rename
    $ cp nginx-certificate.crt fullchain.pem
    $ mv nginx.key privkey.pem

- \\wsl$\Ubuntu-22.04\home\{user_name}\temp から fullchain.crt, privkey.pem を取り出す。
- \PopnScoreTool2\Proxy1\nginx\certs\ に配置する。

## 信頼されたルート証明機関に登録する

1. nginx-certificate.crt をダブルクリック
2. 証明書のインストール→ローカルコンピューター→次へ
3. 証明書をすべて次のストアに配置する→check
4. 証明書ストア:信頼されたルート証明機関→次へ→完了
