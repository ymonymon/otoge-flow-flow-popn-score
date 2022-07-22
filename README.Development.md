# 開発用ドキュメント

## 構成

- nginx reverse proxy(SSL) - kestrel(on linux) - db(sql server on linux)

今回は不要ではあるが、アクセス増を考慮した構成にしている。

## 開発環境

方針：なるべく最新。日本語版があれば利用しているが言語の設定は問わない。

- Windows 10 (21H1)
- Microsoft Visual Studio Community 2022 Version 17.2.1
  - ASP.NET と Web 開発（.NET 5.0 -> .NET 6.0）
  - .NET デスクトップ開発
- Microsoft Visual Studio Code 1.67.2
  - markdown書き。
  - js書き。
- Docker Desktop 4.10.1 (82475)
  - [Linux カーネル更新プログラム パッケージ](https://docs.microsoft.com/ja-jp/windows/wsl/install-manual#step-4---download-the-linux-kernel-update-package)
- [SQL Server Management Studio](https://docs.microsoft.com/ja-jp/sql/ssms/download-sql-server-management-studio-ssms?view=sql-server-ver15)  18.11.1 [日本語版](https://go.microsoft.com/fwlink/?linkid=2168063&clcid=0x411)
- WSL2(Ubuntu)
- Google Chrome
- Hosts File Manager 2.0.327.0
- Git for Windows 2.36.1 64bit
- TortoiseGit 2.13.0.1
- PowerShell 7.2.4

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
