# db release 手順

## docker 上でのビルドと起動し、問題ないか確認

一度 Docker Desktop 上で該当 Container を削除

開発者用 PowerShell 上で作業フォルダを \repos\PopnScoreTool2 にする。

    > docker compose build

    > docker compose up -d

## ECR の登録

### まずは認証

PowerShell 7 上で

    PS> (Get-ECRLoginCommand).Password | docker login --username AWS --password-stdin {aws_account_id}.dkr.ecr.ap-northeast-1.amazonaws.com

    Login Succeeded

### upload する container image を確認

    PS> docker image ls

    REPOSITORY                                                                TAG           IMAGE ID       CREATED          SIZE
    database_db.pst2                                                          latest        641c41201b02   6 minutes ago    1.54GB

#### step 4: tag 付け

    docker tag {IMAGE ID} {aws_account_id}.dkr.ecr.{region}.amazonaws.com/{ecr_repository_name}

    docker tag 641c41201b02 {aws_account_id}.dkr.ecr.ap-northeast-1.amazonaws.com/db1

    docker tag 4fa8c752dffa {aws_account_id}.dkr.ecr.ap-northeast-1.amazonaws.com/db1

#### step 5: image の push

    docker push {aws_account_id}.dkr.ecr.{region}.amazonaws.com/{ecr_repository_name}

    docker push {aws_account_id}.dkr.ecr.ap-northeast-1.amazonaws.com/db1

#### step 6: AWS MC で該当するクラスターのタスクを終了。再起動まで待つ

TODO : console login 無しでやりたい。
