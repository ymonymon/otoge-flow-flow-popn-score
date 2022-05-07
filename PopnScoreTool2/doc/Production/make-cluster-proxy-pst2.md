# ECS で proxy の初期設定

## クラスター→クラスターの作成

### ステップ 1: クラスターテンプレートの選択

- ネットワーキングのみ

### ステップ 2: クラスターの設定

#### クラスター名*

- ym-proxy1-cluster-on-ec2

#### 作成

## タスク定義→新しいタスク定義の作成

### ステップ 1: 起動タイプの互換性の選択

- EC2

### ステップ 2: タスクとコンテナの定義の設定

#### タスクとコンテナの定義の設定

##### タスク定義名

- ym-proxy1-task

##### タスクロール

- ecsTaskExecutionRolePlusAccessParameter(TODO)

#### タスクの実行 IAM ロール

##### タスク実行ロール

- ecsTaskExecutionRole(TODO)

#### タスクサイズ

##### タスクメモリ (MiB)

- 460

##### タスク CPU (単位)

- 2048

#### コンテナの定義

##### コンテナの追加

###### コンテナ名

- ym-proxy1-container

###### イメージ

- {aws_account_id}.dkr.ecr.ap-northeast-1.amazonaws.com/{ecr_repository_name}:latest

{aws_account_id}.dkr.ecr.ap-northeast-1.amazonaws.com/ym_proxy_pst2:latest

###### ポートマッピング

- 80 - 80
- 443 - 443

## クラスター→ym-proxy1-cluster-on-ec2→サービス→作成

### ステップ 1: サービスの設定

#### サービスの設定

##### 起動タイプ

- EC2

##### タスク定義

###### ファミリー

- ym-proxy1-task

##### サービス名

- ym-proxy-pst2-service

##### サービスタイプ

- DAEMON

## タスク起動しない場合

### EC2 container instances が 0 の場合

起動テンプレートから起動しなおし

### STOP してしまう場合

#### サービス→イベント→タスクからエラー内容を見る

#### ECS Container instance にログイン

セッションマネージャーなどで

    sudo su - ec2-user
    docker ps -a
    docker logs <CONTAINER_ID>
