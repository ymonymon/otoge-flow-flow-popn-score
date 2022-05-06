using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace PopnScoreTool2.Models
{
    public class MusicScore
    {
        [Required]
        public int UserIntId { get; set; }

        [Required]
        public int FumenId { get; set; }

        [ForeignKey("FumenId")]
        public MusicScoreBasis Basis { get; set; }

        // 10 meda_a gold star perfect
        // 9 meda_b silver star
        // 8 meda_c silver rhomboid
        // 7 meda_d silver circle
        // 6 meda_e copper star
        // 5 meda_f copper rhomboid
        // 4 meda_g copper circle
        // 3 meda_h ash star
        // 2 meda_i ash rhomboid
        // 0 meda_k kusa
        // 1 meda_j ash circle
        // -1 meda_none.png no play
        [Required]
        public int MedalOrdinalScale { get; set; }

        // manual medal
        // 3 meda_h ash star
        // 2 meda_i ash rhomboid
        // -1 meda_none.png no set
        // int ManualMedalOrdinalScale { get; set; }

        // 10 rank_s.png
        // 9 rank_a3.png
        // 8 rank_a2.png
        // 7 rank_a1.png
        // 6 rank_b.png
        // 5 rank_c.png
        // 4 rank_d.png
        // 3 rank_e.png
        // -1 rank_none.png 
        [Required]
        public int RankOrdinalScale { get; set; }
        [Required]
        public int Score { get; set; }
    }
}
