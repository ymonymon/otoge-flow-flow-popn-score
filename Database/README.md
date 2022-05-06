# fs06fc プロジェクト用 DB Server

ウェブサービスを沢山作るための共用 DB サーバーを docker 上に作成する。

現在予定しているサービス

- otoge-flow-flow.com - popnscoretool2 - pst2

## 要件

各DBは特定のDBしかアクセスできないようにID/パスワードを設定したい。
終了時保護。
ECS instance は捨てて再度runするというアップデート構成にしたい。
余計なEBSが毎月かかるが許容する。（30GBで月300円程度）
コンテナの共用とか考えるのやめて、モノシリックな構成にする。
サービスが増えたらコンテナ共用を考える。どちらかというとアクセスが増えたらだと思う。

## 起動後のDBアタッチ

/opt/mssql-tools/bin/sqlcmd

## 特定のDBしかアクセスできないユーザーの設定

### sa などでログインしユーザーを追加

パスワードポリシーを適用
期限の適用は無し
ログイン時のパスワード変更は無し
既定のデータベースの指定。
サーバーロール：public(default)
ユーザーマッピング。指定のデータベース。
db_datareader,db_datawriter,public
セキュリティ保護可能なリソース：
データベースの表示を拒否。

これでいけそう：
<https://kikki.hatenablog.com/entry/2015/07/27/200000>

view
public role から VIEWANYDATABASEを外せば行ける。

<https://social.msdn.microsoft.com/Forums/sqlserver/en-US/0fcff19b-696f-4f04-97c0-c8f6e1d0a458/user-permission-to-list-databases?forum=sqlsecurity>

### たぶん復帰後もいけるはずだがわからない

やってみて。

## ECS クラスタの作成

<README-makeCluster.md>

## 何かあった時のroot login

        docker ps
        docker exec -it --user root {CONTAINER ID} /bin/bash

## local build

    開発者用PowerShell上で作業フォルダを \repos\PopnScoreTool2\Database にする。

        > docker compose build
        > docker compose up -d

## 初回起動

    Docker Desktop 上のログで起動が完了したのを確認して
    SSMSでsaで接続。パスワードは環境変数を設定していなければ<YourStrong!Passw0rd>。
    SandBoxデータベースとPopnScoreTool2データベースを作成する。

        > docker compose down
        > docker compose up -d

    Docker Desktop 上のログで起動が完了したのを確認して
    SSMSでsaで接続
        データベースSandBox,PopnScoreTool2が見えるのを確認。

    SSMSでpopnscoretool_Loginで接続(オプション→接続のプロパティ→データベースへの接続popnscoretool)
        データベースpopnscoretoolのみ見えたらOK

### バックアップからの復元

    本番サーバーからバックアップファイルを取得
    popnscoretool_{dddd}.bakをc:\dataに置く。
    SSMSでsaで接続(localhostではなく127.0.0.1で接続)
    popnscoretoolデータベースを一度削除。
    popnscoretoolデータベースを作成。
    popnscoretool→タスク→復元→データベース
    デバイス→...→追加→popnscoretool_{dddd}.bak→OK
    File→すべてのファイルをフォルダーに移動する
    オプション→
        復元オプション→既存のデータベースを上書きする
        ログ末尾のバックアップ→復元の前にログ末尾のバックアップを実行する(uncheck)
        サーバ接続→接続先データベースへの既存の接続を閉じる→OK
    復元に失敗した場合は最初からミスなしでやると上手くいくかもしれない。

#### 復元に成功したらユーザーの再作成

        > docker compose down
        > docker compose up -d

    Docker Desktop 上のログで起動が完了したのを確認して
    SSMSでsaで接続
        データベースSandBox,popnscoretoolが見えるのを確認。

    SSMSでpopnscoretool_Loginで接続(オプション→接続のプロパティ→データベースへの接続popnscoretool)
        データベースpopnscoretoolのみ見えたらOK
        見えない場合は一度popnscoretool_Login、popnscoretool_Userを消してから再実行。
        上手くいかない……。
            TODO:
            popnscoretool_Loginからpopnscoretool_Userを再作成または
            セキュリティ保護可能なリソースの作り直しで上手くいく。
            上手くいったあとは既定のデータベースの指定でも見える。
