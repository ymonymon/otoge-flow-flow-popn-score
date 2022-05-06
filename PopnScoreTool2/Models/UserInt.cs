using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;

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
