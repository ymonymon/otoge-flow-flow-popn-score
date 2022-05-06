using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace PopnScoreTool2.Models
{
    [Keyless]
    public class PercentileScore
    {
        public int FumenId { get; set; }

        public int No75 { get; set; }
        public int No50 { get; set; }
        public int No25 { get; set; }
        public int No1 { get; set; }
    }
}
