# fs06fc プロジェクト本番用Cluster構成

## SQL Server Docker Image を AWS ECR に登録

TODO : 必要になったら

現状は mcr.microsoft.com/mssql/server:2019-latest をそのまま登録

## AWS ECS にクラスターを作成

基本的に AWS マネジメントコンソールで作成可能ですが、一部JSONを直接指定する箇所があります。

<https://ap-northeast-1.console.aws.amazon.com/ecs/home?region=ap-northeast-1#/clusters>

- 初回実行ウィザード (<https://console.aws.amazon.com/ecs/home#/firstRun>)の画面がでたら「キャンセル」を押下

  初回実行ウィザード == 「Fargate を使用して Amazon Elastic Container Service (Amazon ECS) の使用を開始」と表示される画面

- ECS/クラスターのページを開き「クラスターの作成」を押下
  
  <https://ap-northeast-1.console.aws.amazon.com/ecs/home?region=ap-northeast-1#/clusters>

  左上のNew ECS ExperienceはOFFを推奨。現在クラスターの削除が出来ないため。

- ステップ 1. クラスターテンプレートの選択

  「ネットワーキングのみ」を選択。「次のステップ」を押下

- ステップ 2.
  - クラスターの設定
    - クラスター名

      {account_name}-cluster-on-ec2

  - CloudWatch Container Insights
    - CloudWatch Container Insights

      Container Insights を有効にする

      TODO : どういう機能であるかまだ未調査。

## 手動でEBSボリュームの作成

- EC2/Elastic Block Store->ボリュームのページを開き「ボリュームの作成」を押下
  
  <https://ap-northeast-1.console.aws.amazon.com/ec2/v2/home?region=ap-northeast-1#Volumes:sort=desc:createTime>

  - ボリュームタイプ

    コスパがgp2よりよい場合がある。

    General Purpose SSD (gp3)

  - サイズ(GiB)

    30

    (30GiB)

  - アベイラビリティーゾーン

    ap-northeast-1a

  - キー

    Name

    {account_name}-volume

### ECS インスタンス用の EC2 インスタンスを立ち上げる

#### ステップ 1: Amazon マシンイメージ (AMI)

amzn2-ami-ecs-hvm-2.0.2021 x86_64 で検索。新しそうなのを選択。

e.g.

        amzn2-ami-ecs-hvm-2.0.20210504-x86_64-ebs - ami-0d4cb7ae9a06c40c9
        Amazon Linux AMI 2.0.20210504 x86_64 ECS HVM GP2

> 重要
> Amazon ECS-optimized Amazon Linux AMI は、2021 年 4 月 15 日に非推奨となります。その日以降、Amazon ECS は AMI に対して重大かつ重要なセキュリティ更新プログラムを提供し続けますが、新機能に対するサポートは追加されません。
> <https://docs.aws.amazon.com/ja_jp/AmazonECS/latest/developerguide/launch_container_instance.html>

TODO : ほかのやり方を探す必要ありそう。

#### ステップ 2: インスタンスタイプの選択

実行するコンテナの数と種類によって決定する。

現時点ではモノシリックにDBだけのため
t3a.microにしている。

#### ステップ 3: インスタンスの詳細の設定

購入のオプション スポットインスタンスのリクエスト
中断動作 停止
IAM ロール ecsInstanceRolePlus2(TODO)

##### ユーザーデータ

    #cloud-config

    packages:
    # 通常の Amazon Linux 2 にある unzip が無いため
    - unzip

    # JST
    timezone: "Asia/Tokyo"

    runcmd:
    # とりあえず最新に
    - yum update -y
    # 通常の Amazon Linux 2 にある aws cli が無いため
    - curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    - unzip -q awscliv2.zip
    - sudo ./aws/install
    # attach volume
    - aws configure set region ap-northeast-1
    - aws ec2 attach-volume --volume-id {volume_id} --instance-id `cat /sys/devices/virtual/dmi/id/board_asset_tag` --device /dev/sdf
    # sleep 3 でもOK
    - sleep 15
    # 念のためログ残し
    - lsblk
    # 実際のマウント
    - mkdir /data
    - mount /dev/nvme1n1 /data
    # クラスタ名の指定
    - echo ECS_CLUSTER={account_name}-cluster-on-ec2 >> /etc/ecs/ecs.config

#### ステップ 4: ストレージの追加

- サイズ (GiB)→30（最低）
- ボリュームタイプ→General Purpose SSD (gp3)
- IOPS→3000（最低）
- スループット (MB/秒)→125（最低）

#### ステップ 5: タグの追加

- Name {account_name}-ecs-instance
- TODO : 必要に応じてタグ追加

#### ステップ 6: セキュリティグループの設定

すべてブロックしたセキュリティグループを作成||選択

セキュリティグループ名:for_Session_Manager

#### 作成後 Session Manager で接続確認

接続→
インスタンスに接続→セッションマネージャー→接続

#### (option)起動テンプレートを作成

目的：今後の軽微な変更のため

インスタンスを選択→
アクション→イメージとテンプレート→インスタンスからテンプレートを作成

- 起動テンプレート名

{account_name}-ecs-instance-template

- 最高料金 情報

0.049000→
起動テンプレートに含めないでください (推奨)

- ユーザーデータ

適宜変更

### ECS インスタンス内でフォーマット

- ECS インスタンスにログイン（Session Manager）

  - Mount & Format

TODO : フォーマットのみに変更する。

    <https://docs.aws.amazon.com/ja_jp/AWSEC2/latest/UserGuide/ebs-using-volumes.html>

        lsblk
        sudo file -s /dev/nvme1n1
        sudo lsblk -f
        # この行だけ初回のみ
        sudo mkfs -t xfs /dev/nvme1n1
        
        sudo mkdir /data
        sudo mount /dev/nvme1n1 /data

## DB パスワードをパラメータストアに保存

<https://qiita.com/hayao_k/items/e34c706464d562d8b8f0>

## タスク定義

### ステップ 1: 起動タイプの互換性の選択

- 起動タイプの互換性の選択

起動タイプの互換性の選択→EC2

### ステップ 2: タスクとコンテナの定義の設定

- タスク定義名

{account_name}-db-task

- タスクロール

ecsTaskExecutionRolePlusAccessParameter

- ネットワークモード

default==bridge

- task size
  - memory:1024(MiB)
  - cpu:2048

- タスクの実行 IAM ロール
  - タスク実行 IAM ロール

    ecsTaskExecutionRole

#### json setting

***replace "volumes"***
   "volumes": [
        {
            "fsxWindowsFileServerVolumeConfiguration": null,
            "efsVolumeConfiguration": null,
            "name": "ecs-bind-mount",
            "host": {
                "sourcePath": "/data"
            },
            "dockerVolumeConfiguration": null
        }
    ],

#### コンテナの定義

- コンテナ名

{account_name}-db-container

- イメージ

mcr.microsoft.com/mssql/server:2019-latest

- ポートマッピング

1433

1433

- 環境変数

  - ACCEPT_EULA Y
  - SA_PASSWORD ValueForm ecs-db-sa-password
  - MSSQL_PID Express
  - MSSQL_COLLATION Japanese_CI_AS
  - MSSQL_LCID 1041
  - MSSQL_BACKUP_DIR /data2
  - MSSQL_DATA_DIR /data2/
  - MSSQL_LOG_DIR /data2/

- マウントポイント

ecs-test-bind-mount

- コンテナパス

/data2

## サービスの立ち上げ

### ステップ 1: サービスの設定

- 起動タイプ

EC2

- タスク定義

{account_name}-db-task-define-name

- サービス名

{account_name}-service-name

- サービスタイプ

DAEMON

Wait Run Task

## Chown

$ sudo su - ec2-user
$ docker container ls
$ docker container exec -it --user root {CONTAINER ID} /bin/bash
$ chown mssql:root /data2

TODO : ユーザーデータ化 || dockerfile化

## SQL Server に接続

### Session Manager 経由のログインのため IAM 作成

#### ポリシー

    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": [
                    "ssm:StartSession"
                ],
                "Resource": [
                    "arn:aws:ec2:ap-northeast-1:{aws_account_id}:instance/*"
                ]
            },
            {
                "Effect": "Allow",
                "Action": [
                    "ssm:StartSession"
                ],
                "Resource": [
                    "arn:aws:ssm:ap-northeast-1:*:document/AWS-StartPortForwardingSession"
                ]
            },
            {
                "Effect": "Allow",
                "Action": [
                    "ssm:TerminateSession"
                ],
                "Resource": [
                    "arn:aws:ssm:*:*:session/${aws:username}-*"
                ]
            }
        ]
    }

### 必要なソフトのインストール

参考：<https://qiita.com/1Kano/items/1496d58b1293ff70c5ec>

- AWS CLI v2

<https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/install-cliv2-windows.html>

- SSM用のプラグイン

<https://s3.amazonaws.com/session-manager-downloads/plugin/latest/windows/SessionManagerPluginSetup.exe>

### ポートフォワード

    aws ssm start-session --target {instance_id} --document-name AWS-StartPortForwardingSession --parameters "portNumber=1433, localPortNumber=11433"
