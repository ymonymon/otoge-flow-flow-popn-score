using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics;

namespace PopnScoreTool2.Models
{
    public class Profile
    {
        [Key]
        [Required]
        public int UserIntId { get; set; }

        [Required]
        public string PlayerName { get; set; }

        [Required]
        public string PopnFriendId { get; set; }

        [Required]
        public string UseCharacterName { get; set; }

        // 使用オプション
        // EXTRAランプ

        [Required]
        public int NormalModeCreditCount { get; set; }

        [Required]
        public int BattleModeCreditCount { get; set; }

        [Required]
        public int LocalModeCreditCount { get; set; }

        [Required]
        public string LastPlayAboutDateTime { get; set; }

        // 手動設定系
        [Required]
        public string Comment { get; set; } = string.Empty;

        // スコアツール上のプレイヤー名
        // twitter等のSNSアカウント名
        // 推しキャラ名

        [Required]
        public DateTime LastUpdateTime { get; set; } = DateTime.Now;

        // 閲覧設定系
        [Required]
        public int BrowsingSettingProfile { get; set; } = 0;

        [Required]
        public int BrowsingSettingProfilePopnFriendId { get; set; } = 0;

        [Required]
        public int BrowsingSettingProfileActivityTime { get; set; } = 0;

        [Required]
        public int BrowsingSettingScore { get; set; } = 0;

        // 有効無効系
        // ここではなくUserIntテーブルが望ましい。
        // [Required]
        // public bool Enabled { get; set; }
        // [Required]
        // public bool Deleted { get; set; }

        public Profile(int userIntId)
        {
            UserIntId = userIntId;
        }

        public bool VerifyUploadedData(List<string> profile)
        {
            try
            {
                // TODO : サニタイズ
                PlayerName = profile[0];
                PopnFriendId = profile[1];
                UseCharacterName = profile[2];
                NormalModeCreditCount = int.Parse(profile[3]);
                BattleModeCreditCount = int.Parse(profile[4]);
                LocalModeCreditCount = int.Parse(profile[5]);
                LastPlayAboutDateTime = profile[6];
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex.Message);
                return false;
            }

            return true;
        }

        public static bool EqualsUploadedData(Profile profileA, Profile profileB)
        {
            return
                profileA.PlayerName == profileB.PlayerName &&
                profileA.PopnFriendId == profileB.PopnFriendId &&
                profileA.UseCharacterName == profileB.UseCharacterName &&
                profileA.NormalModeCreditCount == profileB.NormalModeCreditCount &&
                profileA.BattleModeCreditCount == profileB.BattleModeCreditCount &&
                profileA.LocalModeCreditCount == profileB.LocalModeCreditCount &&
                profileA.LastPlayAboutDateTime == profileB.LastPlayAboutDateTime;
        }

        public void ApplyUploadedData(Profile uploadProfile)
        {
            PlayerName = uploadProfile.PlayerName;
            PopnFriendId = uploadProfile.PopnFriendId;
            UseCharacterName = uploadProfile.UseCharacterName;
            NormalModeCreditCount = uploadProfile.NormalModeCreditCount;
            BattleModeCreditCount = uploadProfile.BattleModeCreditCount;
            LocalModeCreditCount = uploadProfile.LocalModeCreditCount;
            LastPlayAboutDateTime = uploadProfile.LastPlayAboutDateTime;
        }
    }
}
