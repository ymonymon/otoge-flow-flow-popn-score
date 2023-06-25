# Web サーバー用ドキュメント

## Twitter 認証用環境設定

### 開発環境用の Key / Secret をもらう場合

（お手軽）Discordで聞いてください。

### 1から設定して生成する場合

（たいへん）Twitter Developer Portal で設定をする必要があります。

#### 専用アカウント作成

#### Twitter開発アプリポータルで色々する。たぶんElevated accessを申し込む必要があり。日数がかかる

ドメインとかも新しくする必要あるかも。

#### User authentication settings

- OAuth 1.0a - ON
- Request email from users - ON

  今後オフにする予定。

- App permissions - Read

  認証にしか使用していない。

- Callback URI / Redirect URL

  <https://otoge-flow-flow.com/signin-twitter>

- Website URL

  <https://otoge-flow-flow.com/>

- Organization name (optional)

  pop'n score tool 2

- Organization URL (optional)

  <https://otoge-flow-flow.com/>

- Terms of service

  <https://otoge-flow-flow.com/tos>

- Privacy policy

  <https://otoge-flow-flow.com/privacy>

### もらった or 生成した ConsumerAPIKey / ConsumerSecret を UserSecrets で設定

UserSecret の設定方法は検索。JSON形式であることに注意。

- "Authentication:Twitter:ConsumerSecret": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
- "Authentication:Twitter:ConsumerAPIKey": "xxxxxxxxxxxxxxxxxxxxxxxxx"

## DB への接続パスワード設定

同じく UserSecrets での設定：

- "Authentication:MSSQL:UserPST2Password": "<MyStrong!Passw0rd1>"

環境変数を設定していなければ docker-compose.yml ファイルに指定してあるデフォルトの値が使用されます。

## テスト用DBへのマイグレーション適用 

"DebugConnectionString": "Server=localhost,1433;Database=PopnScoreTool3;User Id=sa;TrustServerCertificate=true;MultipleActiveResultSets=true;Password=<YourStrong!Passw0rd>;"

### PMCでマイグレーション操作を行う前の準備

- スタートアッププロジェクトをdocker-compose->PopnScoreTool2に設定する。


### よくPMCでつかうコマンド（何か問題発生時は-Verboseをつける。）

1. Add-Migration {MigrationName}: 新しいマイグレーションを作成します。{MigrationName}は作成するマイグレーションの名前です。

2. Remove-Migration: 最後に追加されたマイグレーションを削除します。

3. Update-Database: 最新のマイグレーションをデータベースに適用します。

4. Script-Migration: マイグレーションからSQLスクリプトを生成します。

5. Drop-Database: 現在のデータベースを削除します。

### DBの変更を本番に適用する際

- Script-Migrationで作ったSQLを理解し手動で適用する。

### 既知の問題

<https://stackoverflow.com/questions/59366069/identity-migration-changes-aspnetusertokens-aspnetuserlogins-for-no-reason>
<https://github.com/dotnet/efcore/issues/28106>

