# 開発用ドキュメント

## 構成

- nginx reverse proxy(SSL) - kestrel(on linux) - db(sql server on linux)

今回は不要ではあるが、アクセス増を考慮した構成にしている。

## 開発環境

方針：なるべく最新。日本語版があれば利用しているが言語の設定は問わない。

- Windows 10 (21H1)
- Microsoft Visual Studio Community 2022 Version 17.5.4
  - ASP.NET と Web 開発（.NET 5.0 -> .NET 6.0 -> .NET 7.0）
  - .NET デスクトップ開発
- Microsoft Visual Studio Code 1.77.3
  - markdown書き。
  - js書き。
- Docker Desktop 4.18.0 (104112)
  - [Linux カーネル更新プログラム パッケージ](https://docs.microsoft.com/ja-jp/windows/wsl/install-manual#step-4---download-the-linux-kernel-update-package)
- [SQL Server Management Studio](https://docs.microsoft.com/ja-jp/sql/ssms/download-sql-server-management-studio-ssms?view=sql-server-ver15)  19.0.1 [日本語版](https://go.microsoft.com/fwlink/?linkid=2168063&clcid=0x411)
- WSL2(Ubuntu)
- Google Chrome
- Git for Windows 2.39.2.windows.1 64bit
- TortoiseGit 2.14.0.0 64bit
- PowerShell 7.3.3
- Hosts File Manager 2.0.327.0
- Discord WebHook

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

- Windows 上の Docker Desktop で確認。一部デバッグは他の構成を使用する事があり。（現在他の構成のプロファイルは全削除）

### DB

- サーバーの照合順序 - Japanese_CI_AS
- 製品 - Microsoft SQL Server Express (64-bit)
- オペレーティング システム - Ubuntu (20.04)
- プラットフォーム - Linux
- バージョン - 15.0.4123.1 -> 15.0.4153.1
- 言語 - 日本語

## 運用環境

- WinSCP
