# pst2 用 nginx reverse proxy

## 要件

- arm。
- なるべくメモリ使用量を少なくする。alpineを使用しているがほかにいいのがあれば変更を検討する。
- 証明書の自動更新はONにしたい。
- 1プロキシ1アプリの前提。
- 自動復旧など可能な限り自動化する。

## build

    cd Proxy1
    docker image build -t proxy1 .

## run

    docker container run -dt -p 80:80 -p 443:443 --name Proxy1 Proxy1:latest
