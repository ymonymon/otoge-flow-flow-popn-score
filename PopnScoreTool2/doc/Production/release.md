# otoge-flow-flow.com release 手順

## docker 上でのビルドと起動し、問題ないか確認

一度 Docker Desktop 上で該当 Container を削除

開発者用 PowerShell 上で作業フォルダを \repos\PopnScoreTool2 にする。

    > docker compose build

    > docker compose up -d

テスト

## ECR の登録

### arm 用ビルドとタグ付け

    > cd PopnScoreTool2\Proxy1
    > docker buildx build --platform linux/arm64 .　-t {aws_account_id}.dkr.ecr.ap-northeast-1.amazonaws.com/pst2_proxy:latest
    > cd PopnScoreTool2\
    > docker buildx build --platform linux/arm64 .　-t {aws_account_id}.dkr.ecr.ap-northeast-1.amazonaws.com/pst2_web:latest --no-cache

### まずは認証

PowerShell 7 上で

    PS> (Get-ECRLoginCommand).Password | docker login --username AWS --password-stdin {aws_account_id}.dkr.ecr.ap-northeast-1.amazonaws.com

    Login Succeeded

#### image の push

    docker image push {aws_account_id}.dkr.ecr.{region}.amazonaws.com/{ecr_repository_name}

    docker image push {aws_account_id}.dkr.ecr.ap-northeast-1.amazonaws.com/ym_web_pst2
    docker image push {aws_account_id}.dkr.ecr.ap-northeast-1.amazonaws.com/ym_proxy_pst2

#### AWS MC で該当するクラスターのタスクを終了。再起動まで待つ

TODO : console login 無しでやりたい。
