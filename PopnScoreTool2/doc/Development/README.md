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
