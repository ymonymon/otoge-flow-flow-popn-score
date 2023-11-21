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

IF OBJECT_ID('dbo.MergeMusic2', 'P') IS NOT NULL
    DROP PROCEDURE dbo.MergeMusic2;
GO

CREATE PROCEDURE [dbo].[MergeMusic2]
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
    @Deleted bit,
	@AddDate datetime2,
	@DeletedDate datetime2,
	@MinBPM int,
	@MaxBPM int,
	@DisplayedBPM nvarchar(max),
	@DetailedBPM nvarchar(max),
	@LPFlag bit,
	@ArtistsName nvarchar(max)
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
            @Deleted,
			@AddDate,
			@DeletedDate,
			@MinBPM,
			@MaxBPM,
			@DisplayedBPM,
			@DetailedBPM,
			@LPFlag,
			@ArtistsName
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
        [Deleted],
		[AddDate],
		[DeletedDate],
		[MinBPM],
		[MaxBPM],
		[DisplayedBPM],
		[DetailedBPM],
		[LPFlag],
		[ArtistsName]
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
            target.[Deleted] = source.[Deleted],
			target.[AddDate] = source.[AddDate],
			target.[DeletedDate] = source.[DeletedDate],
			target.[MinBPM] = source.[MinBPM],
			target.[MaxBPM] = source.[MaxBPM],
			target.[DisplayedBPM] = source.[DisplayedBPM],
			target.[DetailedBPM] = source.[DetailedBPM],
			target.[LPFlag] = source.[LPFlag],
			target.[ArtistsName] = source.[ArtistsName]
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
			[Deleted],
			[AddDate],
			[DeletedDate],
			[MinBPM],
			[MaxBPM],
			[DisplayedBPM],
			[DetailedBPM],
			[LPFlag],
			[ArtistsName]
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
            source.[Deleted],
			source.[AddDate],
			source.[DeletedDate],
			source.[MinBPM],
			source.[MaxBPM],
			source.[DisplayedBPM],
			source.[DetailedBPM],
			source.[LPFlag],
			source.[ArtistsName]
        );
END
GO
