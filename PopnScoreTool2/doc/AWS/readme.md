# AWS の設定

AWS 詳しくないです。
クラウドサービスとして AWS を利用しています。

## Route 53

ECS の配置されたVPCでの名前解決に使用しています。

### ホストゾーンの作成

- ym.local
- プライベートホストゾーン
- リージョン - ap-northeast-1
- VPC - EC2 のインスタンスのあるVPCID

ホストゾーン ID をメモ

### レコード

EC2 インスタンス起動時に自動追加

## Proxy

see ecs-proxy.md

## Web

## DB

TODO :
