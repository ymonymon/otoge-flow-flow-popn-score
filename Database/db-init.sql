
DECLARE @param2 varchar(256)
SELECT @param2 = CONVERT (varchar(256), SERVERPROPERTY('collation'));  
IF @param2 <> 'Japanese_CI_AS'
BEGIN
    RAISERROR ('hoge2_collation', 20, -1) WITH LOG
END

DECLARE @param1 int
SELECT @param1 = COUNT(*) FROM sys.databases WHERE [name] = 'Sandbox'
IF @param1 = 0
BEGIN
    CREATE DATABASE [Sandbox] ON 
    ( FILENAME = N'/data2/Sandbox.mdf' ),
    ( FILENAME = N'/data2/Sandbox_log.ldf' )
    FOR ATTACH;
END;

SELECT @param1 = COUNT(*) FROM sys.databases WHERE [name] = 'PopnScoreTool2'
IF @param1 = 0
BEGIN
    CREATE DATABASE [PopnScoreTool2] ON 
    ( FILENAME = N'/data2/PopnScoreTool2.mdf' ),
    ( FILENAME = N'/data2/PopnScoreTool2_log.ldf' )
    FOR ATTACH;
END;


-- login userの作成
USE [master]
GO

CREATE LOGIN [PopnScoreTool2_Login] WITH PASSWORD=N'$(USER_PST2_PASSWORD)', DEFAULT_DATABASE=[PopnScoreTool2], DEFAULT_LANGUAGE=[日本語], CHECK_EXPIRATION=OFF, CHECK_POLICY=ON
GO
DENY VIEW ANY DATABASE TO [PopnScoreTool2_Login];
GO

-- 特定のDBにUSERを作成
USE [PopnScoreTool2]
GO

DROP USER IF EXISTS [PopnScoreTool2_User]
GO

CREATE USER [PopnScoreTool2_User] FOR LOGIN [PopnScoreTool2_Login] WITH DEFAULT_SCHEMA=[dbo]
GO

EXEC sp_addrolemember 'db_datareader', 'PopnScoreTool2_User'
GO
EXEC sp_addrolemember 'db_datawriter', 'PopnScoreTool2_User'
GO
