# local test 用 ドキュメント

## データベース

### ビルドと起動

    > docker compose build
    > docker compose up -d

### テスト用ネットワーク作成

    > docker network create app_net

### DB 接続

127.0.0.1 に SSMS で接続

### DB 更新

#### 本番環境から持ってくる

#### githubから持ってくる

TODO:

## Web&proxy

    > docker compose build
    > docker compose up -d

### IPをローカルに向ける

hosts file manager などで 127.0.0.1 を otoge-flow-flow.com にする。

接続。

### キャッシュ削除

必要に応じて閲覧履歴データ→基本設定

- 全期間
- キャッシュされた画像とファイル

を削除する。

開発者ツールの Network タブの Remote Address で確認。

