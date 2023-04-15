
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
    BEGIN TRY
        CREATE DATABASE [Sandbox] ON
        ( FILENAME = N'/data2/Sandbox.mdf' ),
        ( FILENAME = N'/data2/Sandbox_log.ldf' )
        FOR ATTACH;
    END TRY
    BEGIN CATCH
        CREATE DATABASE [Sandbox]
    END CATCH
END;

SELECT @param1 = COUNT(*) FROM sys.databases WHERE [name] = 'PopnScoreTool2'
IF @param1 = 0
BEGIN
    BEGIN TRY
        CREATE DATABASE [PopnScoreTool2] ON 
        ( FILENAME = N'/data2/PopnScoreTool2.mdf' ),
        ( FILENAME = N'/data2/PopnScoreTool2_log.ldf' )
        FOR ATTACH;
    END TRY
    BEGIN CATCH
        CREATE DATABASE [PopnScoreTool2]
    END CATCH
END;
GO

-- login userの作成
USE [master]
GO

IF EXISTS (SELECT * FROM sys.server_principals WHERE name = 'PopnScoreTool2_Login' AND type = 'S')
BEGIN
    DROP LOGIN [PopnScoreTool2_Login]
END
GO

CREATE LOGIN [PopnScoreTool2_Login] WITH PASSWORD=N'$(USER_PST2_PASSWORD)', DEFAULT_DATABASE=[PopnScoreTool2], DEFAULT_LANGUAGE=[日本語], CHECK_EXPIRATION=OFF, CHECK_POLICY=ON
GO
DENY VIEW ANY DATABASE TO [PopnScoreTool2_Login];
GO

-- 特定のDBにUSERを作成
USE [PopnScoreTool2]
GO

IF EXISTS (SELECT * FROM sys.database_principals WHERE name = 'PopnScoreTool2_User')
BEGIN
    -- You can ignore the following error message. The user has been successfully deleted.
    -- Currently, there is no known method to suppress this error message from appearing.
    -- Error Message: Couldn't remove the user (n) from database (n) from the external libraries folder, error: 0x80070003
    DROP USER [PopnScoreTool2_User];
END
GO

CREATE USER [PopnScoreTool2_User] FOR LOGIN [PopnScoreTool2_Login] WITH DEFAULT_SCHEMA=[dbo]
GO

EXEC sp_addrolemember 'db_datareader', 'PopnScoreTool2_User'
GO
EXEC sp_addrolemember 'db_datawriter', 'PopnScoreTool2_User'
GO

GRANT EXECUTE ON [dbo].[MergeMusic] TO [PopnScoreTool2_User]
GO

RAISERROR('End of db-init.sql', 0, 1) WITH NOWAIT;
GO
