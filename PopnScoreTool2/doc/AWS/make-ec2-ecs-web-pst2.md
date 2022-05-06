# ECS

## EIP 作成

allocation-id をメモ

### tag

#### Name

- otoge-flow-flow

## ECS 用 EC2 インスタンスの作成

### 起動テンプレート名とバージョンの説明

#### 起動テンプレート名

- ym-ecs-instance-web-pst2-template
TODO
  
### Amazon マシンイメージ (AMI)

#### AMI

- amzn2-ami-ecs-hvm-2.0.20210805-x86_64-ebs - ami-07932765b08ae3232

最新は Amazon Linux AMI x86_64 ECS HVM 2021 等で検索

### インスタンスタイプ

- t3a.nano

### キーペア

- ym-ecs-instance

### ネットワーキングプラットフォーム

- VPC

### ストレージ

- GP3

### リソースタグ

#### リソースタグ-Name

- ym-ecs-instance-web-pst2
- インスタンス、スポットインスタンスリクエスト、ボリューム、ネットワークインタフェース

### ネットワークインタフェース

セキュリティグループの設定

- ping
- asp.net in vpc

### 高度な設定

#### スポットインスタンスをリクエスト

#### 最高料金 起動テンプレートに含めないでください

#### 中断動作

- 終了

#### IAM インスタンスプロフィール

- ym-web1-ecsInstanceRole

#### ユーザーデータ

TODO

## インスタンステンプレートから起動

する

## ECS Cluster の作成
