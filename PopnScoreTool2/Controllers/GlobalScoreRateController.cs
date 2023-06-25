using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PopnScoreTool2.Data;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace PopnScoreTool2.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GlobalScoreRateController : ControllerBase
    {
        private readonly AppDbContext _context;

        public GlobalScoreRateController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Values
        [HttpGet]
        public async Task<ActionResult<object[]>> GetValues()
        {
            // ログイン不要API。
            var userIntIdsQuery = _context.Profiles
                .GroupBy(p => p.PopnFriendId)
                .Select(g => g.OrderByDescending(p => p.LastUpdateTime).FirstOrDefault().UserIntId);

            var musicScoresQuery = _context.MusicScores.Where(m => userIntIdsQuery.Contains(m.UserIntId))
                .GroupBy(g => g.FumenId)
                .Select(h => new
                {
                    FumenId = (int?)h.Key,
                    Score4 = (double?)h.Average(i => (85000 <= i.Score) ? 100.0 : 0.0),
                    Score5 = (double?)h.Average(i => (90000 <= i.Score) ? 100.0 : 0.0),
                    Score6 = (double?)h.Average(i => (95000 <= i.Score) ? 100.0 : 0.0),
                    Score7 = (double?)h.Average(i => (98000 <= i.Score) ? 100.0 : 0.0),
                    Score8 = (double?)h.Average(i => (99000 <= i.Score) ? 100.0 : 0.0),
                    Score9 = (double?)h.Average(i => (99400 <= i.Score) ? 100.0 : 0.0),
                    Score10 = (double?)h.Average(i => (100000 <= i.Score) ? 100.0 : 0.0),
                    Score10n = (int?)h.Sum(i => (100000 <= i.Score) ? 1 : 0),
                    PlayerCount = (int?)h.Count()
                });

            var resultQuery = _context.Musics.Where(w => w.Deleted == false)
                .GroupJoin(musicScoresQuery, a => a.Id, b => b.FumenId, (a, b) => new { a, b })
                .SelectMany(cd => cd.b.DefaultIfEmpty(), (c, d) => new
                {
                    c.a.Id,
                    Score4 = Math.Round(!d.FumenId.HasValue ? 0 : d.Score4.Value, 2),
                    Score5 = Math.Round(!d.FumenId.HasValue ? 0 : d.Score5.Value, 2),
                    Score6 = Math.Round(!d.FumenId.HasValue ? 0 : d.Score6.Value, 2),
                    Score7 = Math.Round(!d.FumenId.HasValue ? 0 : d.Score7.Value, 2),
                    Score8 = Math.Round(!d.FumenId.HasValue ? 0 : d.Score8.Value, 2),
                    Score9 = Math.Round(!d.FumenId.HasValue ? 0 : d.Score9.Value, 2),
                    Score10 = Math.Round(!d.FumenId.HasValue ? 0 : d.Score10.Value, 2),
                    Score10n = !d.FumenId.HasValue ? 0 : d.Score10n.Value,
                    PlayerCount = !d.FumenId.HasValue ? 0 : d.PlayerCount.Value
                })
                .Select(a => new object[] { a.Id, a.Score4, a.Score5, a.Score6, a.Score7, a.Score8, a.Score9, a.Score10, a.Score10n, a.PlayerCount });

            return await resultQuery.ToArrayAsync();
        }
    }
}
