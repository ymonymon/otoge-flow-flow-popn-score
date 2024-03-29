# 開発用ドキュメント

ローカルのWindowsデスクトップ環境(Docker)でテストし、何らかのクラウドサービス上で動かす想定で開発している。

## 構成

- reverse proxy(TLS,nginx) - web(kestrel on linux) - db(sql server on linux)

今回は不要ではあるが、アクセス増を考慮した構成にしている。

## 開発環境

方針：なるべく最新。日本語版があれば利用しているが言語の設定は問わない。

- Windows 10 (21H1)
- Microsoft Visual Studio Community 2022 Version 17.8.0
  - ASP.NET と Web 開発（.NET 5.0 -> .NET 6.0 -> .NET 7.0 -> .NET 8.0?）
  - Node.js 開発
  - .NET デスクトップ開発
- Microsoft Visual Studio Code 1.84.2
  - markdown書き。
  - js書き。
- Docker Desktop 4.25.1 (128006)
  - [Linux カーネル更新プログラム パッケージ](https://docs.microsoft.com/ja-jp/windows/wsl/install-manual#step-4---download-the-linux-kernel-update-package)
- [SQL Server Management Studio](https://learn.microsoft.com/ja-jp/sql/ssms/download-sql-server-management-studio-ssms?view=sql-server-ver16) 19.2.56.2 [日本語版](https://learn.microsoft.com/ja-jp/sql/ssms/download-sql-server-management-studio-ssms?view=sql-server-ver16#available-languages)
- WSL2(Ubuntu)
- Google Chrome
- git version 2.41.0.windows.1 64bit
- TortoiseGit 2.14.0.0 (Hotfix 2.14.0.1) 64bit
- PowerShell 7.3.9
- Hosts File Manager 2.0.327.0
- Discord WebHook
- Node.js LTS 64bit 18.16.0 (同梱 npm 9.5.1)
    Module Bundler - Parcel

### code cleanup

いちおう全て適用している。Code Analysisの基準を上げるのは今後。

### clone

<https://github.com/ymonymon/otoge-flow-flow-popn-score.git> をC:\Users\\{user_name}\source\repos\otoge-flow-flow-popn-score などに clone.

### *.sln を開く

### Docker Network 設定

    PS> docker network create app_net

### Database セットアップ

- backup の復元が必要。
- [開発用テスト用DB設定](./Database/doc/Development/README.md)

### Proxy セットアップ

- 自己証明書の作成が必要。
- [自己証明書の作り方](./PopnScoreTool2/Proxy1/doc/Development/README.md)

### Web セットアップ

- TwitterAPI Key の設定が必要。
- [Web サーバー用ドキュメント](./PopnScoreTool2/doc/Development/README.md)

- TODO : APIKeyなくても動く方法

### hosts いじる

- Hosts File Manager などで otoge-flow-flow.com を 127.0.0.1 にする。

## DEBUG構成

- Visual Studio の docker-compose の構成で実行している。
  - js などのリソースのbuildはnpm run devで更新。（hot reload 未使用）

### DB

- サーバーの照合順序 - Japanese_CI_AS
- 製品 - Microsoft SQL Server Express (64-bit)
- オペレーティング システム - Ubuntu (20.04)
- プラットフォーム - Linux
- バージョン - 15.0.4123.1 -> 15.0.4153.1
- 言語 - 日本語
