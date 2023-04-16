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
    public class GlobalAvgScoreController : ControllerBase
    {
        private readonly AppDbContext _context;

        public GlobalAvgScoreController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Values
        [HttpGet]
        public async Task<ActionResult<object[]>> GetValues()
        {
            // ログイン不要API。
            /*
            var item = await _context.Musics.Where(w => w.Deleted == false)
                .GroupJoin(_context.OldStatses, a => a.Id, b => b.FumenId, (a, b) => new { a, b })
                .SelectMany(ab => ab.b.DefaultIfEmpty(), (a, b) => new { a, b })
                // != 0 重要
                .GroupJoin(_context.MusicScores.Where(w => w.Score != 0).GroupBy(g => g.FumenId).Select(h => new {
                    FumenId = h.Key,
                    PlayerCount = h.Count(),
                    AverageScore = h.Average(i => i.Score),
                }), c => c.a.a.Id, d => d.FumenId, (c, d) => new { c, d })
                .SelectMany(cd => cd.d.DefaultIfEmpty(), (c, d) => new
                {
                    c.c.a.a.Id,
                    PlayerCount = (c.c.b == null ? 0 : c.c.b.PlayerCount) + (d == null ? 0 : d.PlayerCount),
                    AverageScore = Math.Round(
                        
                        ((c.c.b == null ? 0 : c.c.b.AverageScore * c.c.b.PlayerCount) +
                        (d == null ? 0 : d.AverageScore * d.PlayerCount)) /
                    (((c.c.b == null ? 0 : c.c.b.PlayerCount) +
                    (d == null ? 0 : d.PlayerCount) == 0) ?
                    1 :
                    ((c.c.b == null ? 0 : c.c.b.PlayerCount) + (d == null ? 0 : d.PlayerCount))
                    
                    ), 0),
                    PlayerCountNow = (d == null ? 0 : d.PlayerCount),
                })
                .Select(a => new object[] { a.Id, a.PlayerCount, a.AverageScore, a.PlayerCountNow })
                .ToArrayAsync();
            */
            return await _context.Musics.Where(w => w.Deleted == false)
                .GroupJoin(_context.OldStatses, a => a.Id, b => b.FumenId, (a, b) => new { a, b })
                .SelectMany(ab => ab.b.DefaultIfEmpty(), (a, b) => new { a, b })
                // != 0 重要
                .GroupJoin(_context.MusicScores.Where(w => w.Score != 0).GroupBy(g => g.FumenId).Select(h => new
                {
                    FumenId = (int?)h.Key,
                    PlayerCount = (int?)h.Count(),
                    AverageScore = (double?)h.Average(i => i.Score),
                }), c => c.a.a.Id, d => d.FumenId, (c, d) => new { c, d })
                .SelectMany(cd => cd.d.DefaultIfEmpty(), (c, d) => new
                {
                    c.c.a.a.Id,
                    PlayerCount = (c.c.b == null ? 0 : c.c.b.PlayerCount) + (!d.FumenId.HasValue ? 0 : d.PlayerCount.Value),
                    AverageScore = Math.Round(

                        ((c.c.b == null ? 0 : c.c.b.AverageScore * c.c.b.PlayerCount) +
                        (!d.FumenId.HasValue ? 0 : d.AverageScore.Value * d.PlayerCount.Value)) /
                    (((c.c.b == null ? 0 : c.c.b.PlayerCount) +
                    (!d.FumenId.HasValue ? 0 : d.PlayerCount.Value) == 0) ?
                    1 :
                    ((c.c.b == null ? 0 : c.c.b.PlayerCount) + (!d.FumenId.HasValue ? 0 : d.PlayerCount.Value))

                    ), 0),
                    PlayerCountNow = (!d.FumenId.HasValue ? 0 : d.PlayerCount.Value),
                })
                .Select(a => new object[] { a.Id, a.PlayerCount, a.AverageScore, a.PlayerCountNow })
                .ToArrayAsync();
        }
    }
}
