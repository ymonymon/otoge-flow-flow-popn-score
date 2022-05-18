# db release 手順

## docker compose 上でのビルドと起動し、問題ないか確認

    > docker compose build
    > docker compose up -d

## ECR の登録

### ビルドとタグ付け

    > cd .\Database\
    > docker build . -t {aws_account_id}.dkr.ecr.ap-northeast-1.amazonaws.com/db1:latest

### 認証

PowerShell 7 上で

    PS> (Get-ECRLoginCommand).Password | docker login --username AWS --password-stdin {aws_account_id}.dkr.ecr.ap-northeast-1.amazonaws.com
    Login Succeeded

#### image の push

    docker push {aws_account_id}.dkr.ecr.{region}.amazonaws.com/{ecr_repository_name}

    docker push {aws_account_id}.dkr.ecr.ap-northeast-1.amazonaws.com/db1

#### AWS MC で該当するクラスターのタスクを終了。再起動まで待つ

TODO : console login 無しでやりたい。
