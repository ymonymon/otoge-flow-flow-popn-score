﻿using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using PopnScoreTool2.Data;
using PopnScoreTool2.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics;
using System.Linq;
using System.Net.Http;
using System.Security.Claims;
using System.Text;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.Unicode;

namespace PopnScoreTool2.Controllers;

public class UploadController : Controller
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly HashSet<(string, string)> decresedScoreFumen = new();


    public UploadController(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    [Route("/api/[controller]")]
    [HttpPost]
    public IActionResult OnPostUploadAsync()
    {
        if (CheckLogin(out var userIntId))
        {
            var options = new JsonSerializerOptions
            {
                Encoder = JavaScriptEncoder.Create(UnicodeRanges.All),
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = true
            };

            var content = HttpContext.Request.Form["datalist"];

            var obj5 = JsonSerializer.Deserialize<UploadedData>(Uri.UnescapeDataString(content[0]), options);
            UpdateProfile(userIntId, obj5.Profile);
            UpdateScore(userIntId, obj5.Scores);
        }

        return Redirect("/");
    }

    private bool CheckLogin(out int userIntId)
    {
        userIntId = -1;
        // ログインしているか確認。
        if (!User.Identity.IsAuthenticated)
        {
            return false;
        }

        // IDを特定する
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        // UserIntID取得。なければ作成。
        var userInt = _context.UserInts.Where(a => a.AspNetUsersFK == userId);

        if (!userInt.Any())
        {
            var newUserInt = new UserInt
            {
                AspNetUsersFK = userId
            };

            _ = _context.UserInts.Add(newUserInt);
            _ = _context.SaveChanges();

            userInt = _context.UserInts.Where(a => a.AspNetUsersFK == userId);

            if (!userInt.Any())
            {
                // fail
                return false;
            }
        }

        userIntId = userInt.First().Id;
        return true;
    }

    private void UpdateProfile(int userIntId, List<string> profile)
    {
        var profileQuery = _context.Profiles.Where(a => a.UserIntId == userIntId);

        var uploadProfile = new Profile(userIntId);
        if (!uploadProfile.VerifyUploadedData(profile))
        {
            return;
        }

        if (!profileQuery.Any())
        {
            _ = _context.Profiles.Add(uploadProfile);
        }
        else
        {
            var nowProfile = profileQuery.First();

            if (!Profile.EqualsUploadedData(nowProfile, uploadProfile))
            {
                nowProfile.ApplyUploadedData(uploadProfile);
            }

            // アップロードしたら必ず更新
            nowProfile.LastUpdateTime = DateTime.Now;

            _ = _context.Profiles.Update(nowProfile);
        }

        // 入れる。
        _ = _context.SaveChanges();
    }

    private void UpdateScore(int userIntId, List<object[]> obj4)
    // private void UpdateScore(int userIntId, List<MusicScore> obj4)
    {
        // 入れるかどうかを判定する。
        var scores = _context.MusicScores.Where(a => a.UserIntId == userIntId).ToList();
        var basis = _context.Musics.Where(a => true).ToList(); // 削除されたデータもぶち込むで正しい。where deleted == false

        var insertUpdateCount = 0;
        foreach (var obj in obj4)
        {
            var fumens = ((JsonElement)obj[4]).EnumerateArray();
            var levelId = 0;

            foreach (var fumen in fumens)
            {
                var medal_score = fumen.EnumerateArray();
                levelId++;
                var genre = ((JsonElement)obj[1]).GetString();
                var title = ((JsonElement)obj[2]).GetString();
                var medal = medal_score.ElementAt(0).GetInt32();
                var rank = medal_score.ElementAt(1).GetInt32();
                var score = medal_score.ElementAt(2).GetInt32();

                var result = ScoreUpdateCore(userIntId, scores, basis, title, genre, levelId, medal, rank, score);
                insertUpdateCount += result;

                if (result == 0)
                {
                    // upper fumen
                    if (basis.Where(a => a.Name == title && a.Genre == genre && a.LevelId == levelId).Count() == 2)
                    {
                        var index = ((JsonElement)obj[3]).GetInt32();
                        var q = obj4.Where(a => ((JsonElement)a[1]).GetString() == genre &&
                                                ((JsonElement)a[2]).GetString() == title &&
                                                ((JsonElement)a[3]).GetInt32() != index);
                        if (q.Count() == 0)
                        {
                            // 仕様：アッパーか非アッパーのどちらかの譜面しかプレイしていない場合。
                            // 非アッパーのほうにスコアを書き込む。（非アッパーであれば問題ないが、アッパーだけプレイの場合が問題）
                            // 双方の譜面をプレイしたときに問題は解消される。
                            // Debug.WriteLine("uppr fumen fail");
                            // var otherIndex = ((JsonElement)q.First()[3]).GetInt32();
                            Debug.WriteLine("force unupper.");
                            insertUpdateCount +=
                                ScoreUpdateCore(userIntId, scores, basis, title, genre, levelId, medal, rank, score,
                                    0, true);
                        }
                        else
                        {
                            var otherIndex = ((JsonElement)q.First()[3]).GetInt32();

                            insertUpdateCount +=
                                ScoreUpdateCore(userIntId, scores, basis, title, genre, levelId, medal, rank, score,
                                    index < otherIndex ? -1 : 1);
                        }
                    }
                }
            }
        }

        if (0 < decresedScoreFumen.Count)
        {

            try
            {
                // Notify.
                var webhookUrl = _configuration["Discord:WebHook:DecreasedScoreWarningHookURL"];
                if (webhookUrl != null)
                {
                    var profileQuery = _context.Profiles.Where(a => a.UserIntId == userIntId);
                    var pro = profileQuery.FirstOrDefault();
                    var userName = userIntId.ToString();
                    if (pro != null)
                    {
                        userName = pro.PlayerName;
                    }

                    var representative = decresedScoreFumen.First();
                    var jsonPayload = $@"{{""content"": ""DecresedScore\tcount:{decresedScoreFumen.Count}\t{representative.Item1}\t{representative.Item2}\tfrom {userName}""}}";

                    var httpClient = new HttpClient();
                    var httpContent = new StringContent(jsonPayload, Encoding.UTF8, "application/json");
                    var response = httpClient.PostAsync(webhookUrl, httpContent).Result;
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex.Message);
            }
        }

        // 入れる。
        if (0 < insertUpdateCount)
        {
            Debug.WriteLine("insertUpdateCount:{0}", insertUpdateCount);
            _ = _context.SaveChanges();
        }
    }

    private int ScoreUpdateCore(int userIntId, List<MusicScore> scores, List<MusicScoreBasis> basis, string title,
        string genre, int levelId,
        int medal, int rank, int score,
        int indexCompare = 0, bool forceUnUpper = false)
    {
        // score == -1はそもそも譜面が無いパターン。
        if (score == -1)
        {
            return 0;
        }

        // スコア 0,medal == -1はアップロードしない。
        // medal != -1,score0はありうるが、意図的なfailメダル。またはスコアが記録されていない昔のデータ。平均等の集計からは除外する。
        if (score == 0 && medal == -1)
        {
            return 0;
        }

        // TODO : MusicScoreBasisテーブルに存在しなければどこかに保存しておく
        // MusicScoreBasisテーブルに存在し、MusicScoreテーブルに存在し、変更があればUpdate
        // MusicScoreBasisテーブルに存在し、MusicScoreテーブルに存在しなければInsert

        var fumen = forceUnUpper
            ? basis.Where(a => a.Name == title && a.Genre == genre && a.LevelId == levelId && a.Position == 0)
            : indexCompare == 0
            ? basis.Where(a => a.Name == title && a.Genre == genre && a.LevelId == levelId)
            : basis.Where(a =>
                a.Name == title && a.Genre == genre && a.LevelId == levelId &&
                a.GenreIndexCompareForPosition == indexCompare);
        if (!fumen.Any())
        {
            Debug.WriteLine("not found: {0}, {1}, {2}", title, genre, levelId);
            var notFoundMusic = new NotFoundMusic
            {
                UserIntId = userIntId,
                Title = title,
                Genre = genre,
                LastUpdateTime = DateTime.Now
            };

            _ = _context.NotFoundMusics.Add(notFoundMusic);

            try
            {
                // Notify if an non-existent fumen data is uploaded.
                var webhookUrl = _configuration["Discord:WebHook:NotFoundMusicHookURL"];
                if (webhookUrl != null)
                {
                    var profileQuery = _context.Profiles.Where(a => a.UserIntId == userIntId);
                    var pro = profileQuery.FirstOrDefault();
                    var userName = userIntId.ToString();
                    if (pro != null)
                    {
                        userName = pro.PlayerName;
                    }

                    var jsonPayload = $@"{{""content"": ""NotFound:{title}\t{genre}\t{levelId}\tfrom {userName}""}}";

                    var httpClient = new HttpClient();
                    var httpContent = new StringContent(jsonPayload, Encoding.UTF8, "application/json");
                    var response = httpClient.PostAsync(webhookUrl, httpContent).Result;
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex.Message);
            }


            return 1;
        }

        if (1 < fumen.Count())
        {
            // Debug.WriteLine("upper fumen: {0}, {1}, {2}", title, genre, levelId);
            return 0;
        }

        var fumenId = fumen.First().Id;
        var fumenScore = scores.Where(a => a.FumenId == fumenId);

        if (!fumenScore.Any())
        {
            var firstScore = new MusicScore
            {
                UserIntId = userIntId,
                FumenId = fumenId,
                MedalOrdinalScale = medal,
                RankOrdinalScale = rank,
                Score = score
            };

            try
            {
                _ = _context.MusicScores.Add(firstScore);
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex.Message);
            }

            return 1;
        }

        var updateFumenScore = fumenScore.First();

        // If the score decreases. This is usually not expected.
        if (score < updateFumenScore.Score)
        {
            _ = decresedScoreFumen.Add((title, genre));
        }

        if (updateFumenScore.MedalOrdinalScale != medal ||
            updateFumenScore.RankOrdinalScale != rank ||
            updateFumenScore.Score != score)
        {
            updateFumenScore.MedalOrdinalScale = medal;
            updateFumenScore.RankOrdinalScale = rank;
            updateFumenScore.Score = score;

            _ = _context.MusicScores.Update(updateFumenScore);

            return 1;
        }

        return 0;
    }

    public class UploadedData
    {
        [JsonPropertyName("info")] public List<string> Information { get; set; }

        [JsonPropertyName("profile")] public List<string> Profile { get; set; }

        [JsonPropertyName("scores")] public List<object[]> Scores { get; set; }
    }

    public class BufferedSingleFileUploadDb
    {
        [Required][Display(Name = "File")] public IFormFile FormFile { get; set; }
    }
}