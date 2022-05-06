# メンテ用 RDP ログイン方法

- TODO : 直接本番の DB につなげられるようにフォワードを設定
- TODO : GUI いらないので RDP は使わないようにする

## 手順

<https://qiita.com/1Kano/items/1496d58b1293ff70c5ec>

### 必要なもの

- {aws_access_key}
- {aws_secret_access_key}
- {instance_id} 現在のインスタンス ID
- {admin_password} rdp するさいのアドミンのパスワード。

### 接続手順

    aws ssm start-session --target {instance_id} --document-name AWS-StartPortForwardingSession --parameters "portNumber=3389, localPortNumber=13389"

rdp で接続。

- localhost:13389
- Administrator
- {admin_password}

## 障害

- サーバー側の SSD 容量不足により接続できなかった場合があり。
