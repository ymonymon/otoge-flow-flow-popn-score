USE [PopnScoreTool2]
GO

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE VIEW [dbo].[PercentileScore] AS 
WITH UserIntIds AS (
    SELECT MAX(LastUpdateTime) AS LastUpdateTime, PopnFriendId
    FROM Profiles
    GROUP BY PopnFriendId
),
FilteredProfiles AS (
    SELECT p.UserIntId
    FROM Profiles p
    INNER JOIN UserIntIds ui ON p.PopnFriendId = ui.PopnFriendId AND p.LastUpdateTime = ui.LastUpdateTime
)
SELECT DISTINCT ms.[FumenId]
      ,CAST(PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY ms.Score DESC) OVER (PARTITION BY ms.FumenID) AS int) AS [No75]
      ,CAST(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY ms.Score DESC) OVER (PARTITION BY ms.FumenID) AS int) AS [No50]
      ,CAST(PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY ms.Score DESC) OVER (PARTITION BY ms.FumenID) AS int) AS [No25]
      ,CAST(PERCENTILE_CONT(0) WITHIN GROUP (ORDER BY ms.Score DESC) OVER (PARTITION BY ms.FumenID) AS int) AS [No1]
FROM [dbo].[MusicScores] ms
INNER JOIN [dbo].[Musics] m ON m.[ID] = ms.[FumenID]
INNER JOIN FilteredProfiles fp ON ms.UserIntId = fp.UserIntId
WHERE 0 < ms.[Score] AND m.[Deleted] = 0
GO
