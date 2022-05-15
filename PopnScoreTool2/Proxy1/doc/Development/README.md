# 自己証明書の作り方

WSL2(Ubuntu)上で作成する。

- [Nginx で HTTPS を有効にする](https://techexpert.tips/ja/nginx-ja/nginx-%E3%81%A7-https-%E3%82%92%E6%9C%89%E5%8A%B9%E3%81%AB%E3%81%99%E3%82%8B/)
- [爆速でChrome対応オレオレ証明書を作成する](https://thr3a.hatenablog.com/entry/20171203/1512229150)

$ sudo apt-get update
$ sudo apt-get install openssl
$ mkdir temp
$ cd temp
$ openssl genrsa 2048 > nginx.key
$ openssl req -new -key nginx.key > nginx-certificate.csr
$ echo subjectAltName=DNS:otoge-flow-flow.com > san.ext
$ openssl x509 -days 3650 -req -signkey nginx.key < nginx-certificate.csr > nginx-certificate.crt -extfile san.ext

SAN（サブジェクトの別名）もきちんと入力

\\wsl$\Ubuntu\home\{user_name}\temp から取り出す。

信頼されたルート証明機関に登録する。

