using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PopnScoreTool2.Models
{
    public class UserInt
    {
        [Key]
        public int Id { get; set; }

        [Column(TypeName = "nvarchar(450)"), Required]
        public string AspNetUsersFK { get; set; }
    }
}
