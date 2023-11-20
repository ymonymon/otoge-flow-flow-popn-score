using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PopnScoreTool2.Models
{
    public class MusicScoreBasis
    {
        [Required]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        [Key]
        public int Id { get; set; }

        [Required]
        public int MusicId { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Genre { get; set; } = string.Empty;

        [Required]
        public int Position { get; set; } = 0;

        [Required]

        public int TitleIndexCompareForPosition { get; set; } = 0;

        [Required]
        public int GenreIndexCompareForPosition { get; set; } = 0;

        [Required]
        public int Level { get; set; }
        // 1	easy
        // 2	normal
        // 3	hyper
        // 4	ex
        [Required]
        public int LevelId { get; set; }

        [Required]
        public int Version { get; set; }

        [Required]
        public int AddVersion { get; set; }
        [Required]
        public DateTime AddDate { get; set; } = DateTime.MinValue;

        [Required]
        public bool Deleted { get; set; } = false;

        [Required]
        public DateTime DeletedDate { get; set; } = DateTime.MinValue;

        [Required]
        public int MinBPM { get; set; } = 0;

        [Required]
        public int MaxBPM { get; set; } = 0;

        [Required]
        public string DisplayedBPM { get; set; } = string.Empty;
        [Required]
        public string DetailedBPM { get; set; } = string.Empty;


        [Required]
        public bool LPFlag { get; set; } = false;

        [Required]
        public string ArtistsName { get; set; } = string.Empty;

    }
}
