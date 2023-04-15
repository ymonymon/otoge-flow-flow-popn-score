USE [PopnScoreTool2]
GO

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

IF OBJECT_ID('dbo.MergeMusic', 'P') IS NOT NULL
    DROP PROCEDURE dbo.MergeMusic;
GO

CREATE PROCEDURE MergeMusic
    @Id int,
    @MusicId int,
    @Name nvarchar(max),
    @Genre nvarchar(max),
    @Position int,
    @Level int,
    @LevelId int,
    @Version int,
    @AddVersion int,
    @GenreIndexCompareForPosition int,
    @TitleIndexCompareForPosition int,
    @Deleted bit
AS
BEGIN
    MERGE INTO [dbo].[Musics] AS target
    USING (
        VALUES (
            @Id,
            @MusicId,
            @Name,
            @Genre,
            @Position,
            @Level,
            @LevelId,
            @Version,
            @AddVersion,
            @GenreIndexCompareForPosition,
            @TitleIndexCompareForPosition,
            @Deleted
        )
    ) AS source (
        [Id],
        [MusicId],
        [Name],
        [Genre],
        [Position],
        [Level],
        [LevelId],
        [Version],
        [AddVersion],
        [GenreIndexCompareForPosition],
        [TitleIndexCompareForPosition],
        [Deleted]
    )
    ON target.[Id] = source.[Id]
    WHEN MATCHED THEN
        UPDATE SET
            target.[MusicId] = source.[MusicId],
            target.[Name] = source.[Name],
            target.[Genre] = source.[Genre],
            target.[Position] = source.[Position],
            target.[Level] = source.[Level],
            target.[LevelId] = source.[LevelId],
            target.[Version] = source.[Version],
            target.[AddVersion] = source.[AddVersion],
            target.[GenreIndexCompareForPosition] = source.[GenreIndexCompareForPosition],
            target.[TitleIndexCompareForPosition] = source.[TitleIndexCompareForPosition],
            target.[Deleted] = source.[Deleted]
    WHEN NOT MATCHED BY TARGET THEN
        INSERT (
            [Id],
            [MusicId],
            [Name],
            [Genre],
            [Position],
            [Level],
            [LevelId],
            [Version],
            [AddVersion],
            [GenreIndexCompareForPosition],
            [TitleIndexCompareForPosition],
            [Deleted]
        )
        VALUES (
            source.[Id],
            source.[MusicId],
            source.[Name],
            source.[Genre],
            source.[Position],
            source.[Level],
            source.[LevelId],
            source.[Version],
            source.[AddVersion],
            source.[GenreIndexCompareForPosition],
            source.[TitleIndexCompareForPosition],
            source.[Deleted]
        );
END
GO
