using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PopnScoreTool2.Models
{
    public class NotFoundMusic
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserIntId { get; set; }

        [Required]
        public string Title { get; set; }

        [Required]
        public string Genre { get; set; }

        [Required]
        public DateTime LastUpdateTime { get; set; }
    }
}
