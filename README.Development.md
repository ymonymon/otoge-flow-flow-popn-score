# 開発用ドキュメント

## 構成

- nginx reverse proxy(SSL) - kestrel(on linux) - db(sql server on linux)

## 開発環境

方針：なるべく最新。日本語版があれば利用しているが言語の設定は問わない。

- Windows 10 (21H1)
- Microsoft Visual Studio Community 2022 Version 17.1.3
  - .NET 5.0 -> .NET 6.0
- Microsoft Visual Studio Code 1.67.0
  - markdown書き。
  - js書き。
- Docker Desktop 4.8.1 (78998)
- SQL Server Management Studio 18.11.1
- WSL2(Ubuntu)
- Google Chrome
- Hosts File Manager 2.0.327.0
- Git for Windows 2.36.0 64bit
- TortoiseGit 2.13.0.1
- PowerShell 17.1.6

### 開発環境用自己証明書の作成

see Proxy1/README.md

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

### SQL Server Management Studio 18.11.1 日本語版

<https://docs.microsoft.com/ja-jp/sql/ssms/download-sql-server-management-studio-ssms?view=sql-server-ver15>
<https://go.microsoft.com/fwlink/?linkid=2168063&clcid=0x411>
