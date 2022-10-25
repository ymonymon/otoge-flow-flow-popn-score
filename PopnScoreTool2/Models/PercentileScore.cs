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
