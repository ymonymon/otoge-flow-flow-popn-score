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
        public string Name { get; set; }

        [Required]
        public string Genre { get; set; }

        [Required]
        public int Position { get; set; }

        // TODO : [Required]
        public int TitleIndexCompareForPosition { get; set; }
        // TODO : [Required]
        public int GenreIndexCompareForPosition { get; set; }

        [Required]
        public int Level { get; set; }
        // 1	easy
        // 2	normal
        // 3	hyper
        // 4	ex
        [Required]
        public int LevelId { get; set; }

        // version?
        [Required]
        public int Version { get; set; }

        [Required]
        public int AddVersion { get; set; }

        // TODO : [Required]
        public bool Deleted { get; set; }

        // [Required]
        // public int Deleted { get; set; }
    }
}
