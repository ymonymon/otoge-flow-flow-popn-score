using System.ComponentModel.DataAnnotations;

namespace PopnScoreTool2.Models
{
    public class OldStats
    {
        [Key]
        public int FumenId { get; set; }

        [Required]
        public int TopScore { get; set; }
        [Required]
        public int TopMedal { get; set; }
        [Required]
        public int TopRank { get; set; }

        [Required]
        public int PlayerCount { get; set; }

        [Required]
        public double AverageScore { get; set; }
        [Required]
        public double MedalCumulativeRate4 { get; set; }
        [Required]
        public double MedalCumulativeRate5 { get; set; }
        [Required]
        public double MedalCumulativeRate6 { get; set; }
        [Required]
        public double MedalCumulativeRate7 { get; set; }
        [Required]
        public double MedalCumulativeRate8 { get; set; }
        [Required]
        public double MedalCumulativeRate9 { get; set; }
        [Required]
        public double MedalRate10 { get; set; }
    }
}
