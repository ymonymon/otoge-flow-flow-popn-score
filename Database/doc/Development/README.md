# 開発とテスト用DB

## 要件

- コンテナ上でRDBMSを動かす。
  - DBファイル自体は外部ファイルシステム。
- 本番と可能な限り環境を合わせる。
- 他のマイクロサービスでも使えるような構成にする。

## 構成

- [SQL Server on Linux](https://hub.docker.com/_/microsoft-mssql-server) 2019 Express Edition
Express版の制限は10GB,1CPU4コアまで,RAM 1GBまで

## 初回設定

### 外部ファイルシステムの準備

テスト環境では C:\data1\ フォルダは自動生成され、データベースファイルが無い場合は自動作成される。

### テスト用のデータベースをどこかから用意する

#### githubにコミットされているデータベースを利用する

##### 初回作成

- C:\data1\ に \Database\Backup\PopnScoreTool2.bak をコピー。
- SSMS で PopnScoreTool2 →タスク→復元→データベース
  - デバイス→...→追加→ PopnScoreTool2.bak → OK
  - オプション→
    - 復元オプション→既存のデータベースを上書きする→ checked
    - ログ末尾のバックアップ→復元の前にログ末尾のバックアップを実行する→ unchecked
    - サーバー接続→接続先データベースへの既存の接続を閉じる→ checked
    - OK
- wait
- Dialog:データベース 'PopnScoreTool2' の復元に成功しました。→ OK
- データベースのテーブルが見れたら復元完了。
- 念のためコンテナ再起動
- 念のため Web からログインできたらOK。

#### 本番用のデータベースをもってくる

- 権限ある人に相談する。

## ビルドと起動と終了

### ビルド

> docker compose build

### 起動

> docker compose up -d

### 終了

> docker compose down

## 接続

SSMSなどで127.0.0.1(127.0.0.1,1433)で接続する。

ログインはsa

テスト環境のパスワードは環境変数を設定していなければ<YourStrong!Passw0rd>

## 譜面データの更新

譜面データのGoogle Spredsheet(TODO: URL)からmergesql列をすべてコピーし実行する事で
削除レコードがないかぎり冪等性を担保した更新が行える。
Musicsテーブルは誤操作が無い限りレコードの削除は行わない。譜面の削除があった場合は削除フラグ。

（MergeMusicストアドプロシージャがDB上に無い場合はCreateMergeMusicProcedure.sqlを実行。）

