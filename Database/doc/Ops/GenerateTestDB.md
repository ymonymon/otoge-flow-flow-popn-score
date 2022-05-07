# 本番用のDBからテスト用DBの作成

## 機密情報の削除

公開を許可していないユーザーのデータを削除

    USE [PopnScoreTool2]
    GO

    DELETE FROM [dbo].[UserInts]
        WHERE AspNetUsersFK <> '94caec39-b6cd-401f-a536-bd60af30925a'
    GO

    UPDATE [dbo].[AspNetUsers]
    SET [UserName] = 'xxx@xxx.com'
        ,[NormalizedUserName] = 'xxx@xxx.com'
        ,[Email] = 'xxx@xxx.com'
        ,[NormalizedEmail] = 'xxx@xxx.com'
    WHERE Id = '94caec39-b6cd-401f-a536-bd60af30925a'
    GO

    DELETE FROM [dbo].[MusicScores]
        WHERE UserIntId <> 1
    GO

カスケードでだいたい消える

TODO : テスト用にスコアデータの詳細を公開を許可していいかどうかのフラグを作る

## DBのパスワードの変更

TODO

## バックアップの作成
