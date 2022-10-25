using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PopnScoreTool2.Data;

namespace PopnScoreTool2.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GlobalMedalRateController : ControllerBase
    {
        private readonly AppDbContext _context;

        public GlobalMedalRateController(AppDbContext context)
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
                .GroupJoin(_context.OldStatses, c => c.Id, d => d.FumenId, (c, d) => new { c, d })
                .SelectMany(cd => cd.d.DefaultIfEmpty(), (c, d) => new { c, d })
                .GroupJoin(_context.MusicScores.GroupBy(g => g.FumenId).Select(h => new {
                    FumenId = h.Key,
                    PlayerCount = h.Count(),
                    AverageScore = h.Average(i => i.Score),
                    AverageMedal4 = h.Average(i => (4 <= i.MedalOrdinalScale) ? 100.0 : 0.0),
                    AverageMedal5 = h.Average(i => (5 <= i.MedalOrdinalScale) ? 100.0 : 0.0),
                    AverageMedal6 = h.Average(i => (6 <= i.MedalOrdinalScale) ? 100.0 : 0.0),
                    AverageMedal7 = h.Average(i => (7 <= i.MedalOrdinalScale) ? 100.0 : 0.0),
                    AverageMedal8 = h.Average(i => (8 <= i.MedalOrdinalScale) ? 100.0 : 0.0),
                    AverageMedal9 = h.Average(i => (9 <= i.MedalOrdinalScale) ? 100.0 : 0.0),
                    AverageMedal10 = h.Average(i => (10 == i.MedalOrdinalScale) ? 100.0 : 0.0)
                }), e => e.c.c.Id, f => f.FumenId, (e, f) => new { e, f })
                .SelectMany(ef => ef.f.DefaultIfEmpty(), (e, f) => new
                {
                    e.e.c.c.Id,
                    PlayerCount = (e.e.d == null ? 0 : e.e.d.PlayerCount) + (f == null ? 0 : f.PlayerCount),
                    AverageScore = Math.Round(((e.e.d == null ? 0 : e.e.d.AverageScore * e.e.d.PlayerCount) + (f == null ? 0 : f.AverageScore * f.PlayerCount)) / ((e.e.d == null ? 0 : e.e.d.PlayerCount) + (f == null ? 0 : f.PlayerCount) == 0 ? 1 : (e.e.d == null ? 0 : e.e.d.PlayerCount) + (f == null ? 0 : f.PlayerCount)), 0),
                    Medal4 = Math.Round(((e.e.d == null ? 0 : e.e.d.MedalCumulativeRate4 * e.e.d.PlayerCount) + (f == null ? 0 : f.AverageMedal4 * f.PlayerCount)) / ((e.e.d == null ? 0 : e.e.d.PlayerCount) + (f == null ? 0 : f.PlayerCount) == 0 ? 1 : (e.e.d == null ? 0 : e.e.d.PlayerCount) + (f == null ? 0 : f.PlayerCount)), 2),
                    Medal5 = Math.Round(((e.e.d == null ? 0 : e.e.d.MedalCumulativeRate5 * e.e.d.PlayerCount) + (f == null ? 0 : f.AverageMedal5 * f.PlayerCount)) / ((e.e.d == null ? 0 : e.e.d.PlayerCount) + (f == null ? 0 : f.PlayerCount) == 0 ? 1 : (e.e.d == null ? 0 : e.e.d.PlayerCount) + (f == null ? 0 : f.PlayerCount)), 2),
                    Medal6 = Math.Round(((e.e.d == null ? 0 : e.e.d.MedalCumulativeRate6 * e.e.d.PlayerCount) + (f == null ? 0 : f.AverageMedal6 * f.PlayerCount)) / ((e.e.d == null ? 0 : e.e.d.PlayerCount) + (f == null ? 0 : f.PlayerCount) == 0 ? 1 : (e.e.d == null ? 0 : e.e.d.PlayerCount) + (f == null ? 0 : f.PlayerCount)), 2),
                    Medal7 = Math.Round(((e.e.d == null ? 0 : e.e.d.MedalCumulativeRate7 * e.e.d.PlayerCount) + (f == null ? 0 : f.AverageMedal7 * f.PlayerCount)) / ((e.e.d == null ? 0 : e.e.d.PlayerCount) + (f == null ? 0 : f.PlayerCount) == 0 ? 1 : (e.e.d == null ? 0 : e.e.d.PlayerCount) + (f == null ? 0 : f.PlayerCount)), 2),
                    Medal8 = Math.Round(((e.e.d == null ? 0 : e.e.d.MedalCumulativeRate8 * e.e.d.PlayerCount) + (f == null ? 0 : f.AverageMedal8 * f.PlayerCount)) / ((e.e.d == null ? 0 : e.e.d.PlayerCount) + (f == null ? 0 : f.PlayerCount) == 0 ? 1 : (e.e.d == null ? 0 : e.e.d.PlayerCount) + (f == null ? 0 : f.PlayerCount)), 2),
                    Medal9 = Math.Round(((e.e.d == null ? 0 : e.e.d.MedalCumulativeRate9 * e.e.d.PlayerCount) + (f == null ? 0 : f.AverageMedal9 * f.PlayerCount)) / ((e.e.d == null ? 0 : e.e.d.PlayerCount) + (f == null ? 0 : f.PlayerCount) == 0 ? 1 : (e.e.d == null ? 0 : e.e.d.PlayerCount) + (f == null ? 0 : f.PlayerCount)), 2),
                    Medal10 = Math.Round(((e.e.d == null ? 0 : e.e.d.MedalRate10 * e.e.d.PlayerCount) + (f == null ? 0 : f.AverageMedal10 * f.PlayerCount)) / ((e.e.d == null ? 0 : e.e.d.PlayerCount) + (f == null ? 0 : f.PlayerCount) == 0 ? 1 : (e.e.d == null ? 0 : e.e.d.PlayerCount) + (f == null ? 0 : f.PlayerCount)), 2),
                    PlayerCountNow = (f == null ? 0 : f.PlayerCount),
                })
                .Select(a => new object[]{ a.Id, a.PlayerCount, a.AverageScore, a.Medal4, a.Medal5, a.Medal6, a.Medal7, a.Medal8, a.Medal9, a.Medal10, a.PlayerCountNow })
                .ToArrayAsync();
            */

            var item = await _context.Musics.Where(w => w.Deleted == false)
                .GroupJoin(_context.OldStatses, c => c.Id, d => d.FumenId, (c, d) => new { c, d })
                .SelectMany(cd => cd.d.DefaultIfEmpty(), (c, d) => new { c, d })
                .GroupJoin(_context.MusicScores.GroupBy(g => g.FumenId).Select(h => new {
                    FumenId = (int?)h.Key,
                    PlayerCount = (int?)h.Count(),
                    AverageScore = (int?)h.Average(i => i.Score),
                    AverageMedal4 = (double?)h.Average(i => (4 <= i.MedalOrdinalScale) ? 100.0 : 0.0),
                    AverageMedal5 = (double?)h.Average(i => (5 <= i.MedalOrdinalScale) ? 100.0 : 0.0),
                    AverageMedal6 = (double?)h.Average(i => (6 <= i.MedalOrdinalScale) ? 100.0 : 0.0),
                    AverageMedal7 = (double?)h.Average(i => (7 <= i.MedalOrdinalScale) ? 100.0 : 0.0),
                    AverageMedal8 = (double?)h.Average(i => (8 <= i.MedalOrdinalScale) ? 100.0 : 0.0),
                    AverageMedal9 = (double?)h.Average(i => (9 <= i.MedalOrdinalScale) ? 100.0 : 0.0),
                    AverageMedal10 = (double?)h.Average(i => (10 == i.MedalOrdinalScale) ? 100.0 : 0.0)
                }), e => e.c.c.Id, f => f.FumenId, (e, f) => new { e, f })
                .SelectMany(ef => ef.f.DefaultIfEmpty(), (e, f) => new
                {
                    e.e.c.c.Id,
                    PlayerCount = (e.e.d == null ? 0 : e.e.d.PlayerCount) + (f == null ? 0 : f.PlayerCount),
                    AverageScore = Math.Round(((e.e.d == null ? 0 : e.e.d.AverageScore * e.e.d.PlayerCount) + (!f.FumenId.HasValue ? 0 : f.AverageScore.Value * f.PlayerCount.Value)) / ((e.e.d == null ? 0 : e.e.d.PlayerCount) + (!f.FumenId.HasValue ? 0 : f.PlayerCount.Value) == 0 ? 1 : (e.e.d == null ? 0 : e.e.d.PlayerCount) + (!f.FumenId.HasValue ? 0 : f.PlayerCount.Value)), 0),
                    Medal4 = Math.Round(((e.e.d == null ? 0 : e.e.d.MedalCumulativeRate4 * e.e.d.PlayerCount) + (!f.FumenId.HasValue ? 0 : f.AverageMedal4.Value * f.PlayerCount.Value)) / ((e.e.d == null ? 0 : e.e.d.PlayerCount) + (!f.FumenId.HasValue ? 0 : f.PlayerCount) == 0 ? 1 : (e.e.d == null ? 0 : e.e.d.PlayerCount) + (!f.FumenId.HasValue ? 0 : f.PlayerCount.Value)), 2),
                    Medal5 = Math.Round(((e.e.d == null ? 0 : e.e.d.MedalCumulativeRate5 * e.e.d.PlayerCount) + (!f.FumenId.HasValue ? 0 : f.AverageMedal5.Value * f.PlayerCount.Value)) / ((e.e.d == null ? 0 : e.e.d.PlayerCount) + (!f.FumenId.HasValue ? 0 : f.PlayerCount) == 0 ? 1 : (e.e.d == null ? 0 : e.e.d.PlayerCount) + (!f.FumenId.HasValue ? 0 : f.PlayerCount.Value)), 2),
                    Medal6 = Math.Round(((e.e.d == null ? 0 : e.e.d.MedalCumulativeRate6 * e.e.d.PlayerCount) + (!f.FumenId.HasValue ? 0 : f.AverageMedal6.Value * f.PlayerCount.Value)) / ((e.e.d == null ? 0 : e.e.d.PlayerCount) + (!f.FumenId.HasValue ? 0 : f.PlayerCount) == 0 ? 1 : (e.e.d == null ? 0 : e.e.d.PlayerCount) + (!f.FumenId.HasValue ? 0 : f.PlayerCount.Value)), 2),
                    Medal7 = Math.Round(((e.e.d == null ? 0 : e.e.d.MedalCumulativeRate7 * e.e.d.PlayerCount) + (!f.FumenId.HasValue ? 0 : f.AverageMedal7.Value * f.PlayerCount.Value)) / ((e.e.d == null ? 0 : e.e.d.PlayerCount) + (!f.FumenId.HasValue ? 0 : f.PlayerCount) == 0 ? 1 : (e.e.d == null ? 0 : e.e.d.PlayerCount) + (!f.FumenId.HasValue ? 0 : f.PlayerCount.Value)), 2),
                    Medal8 = Math.Round(((e.e.d == null ? 0 : e.e.d.MedalCumulativeRate8 * e.e.d.PlayerCount) + (!f.FumenId.HasValue ? 0 : f.AverageMedal8.Value * f.PlayerCount.Value)) / ((e.e.d == null ? 0 : e.e.d.PlayerCount) + (!f.FumenId.HasValue ? 0 : f.PlayerCount) == 0 ? 1 : (e.e.d == null ? 0 : e.e.d.PlayerCount) + (!f.FumenId.HasValue ? 0 : f.PlayerCount.Value)), 2),
                    Medal9 = Math.Round(((e.e.d == null ? 0 : e.e.d.MedalCumulativeRate9 * e.e.d.PlayerCount) + (!f.FumenId.HasValue ? 0 : f.AverageMedal9.Value * f.PlayerCount.Value)) / ((e.e.d == null ? 0 : e.e.d.PlayerCount) + (!f.FumenId.HasValue ? 0 : f.PlayerCount) == 0 ? 1 : (e.e.d == null ? 0 : e.e.d.PlayerCount) + (!f.FumenId.HasValue ? 0 : f.PlayerCount.Value)), 2),
                    Medal10 = Math.Round(((e.e.d == null ? 0 : e.e.d.MedalRate10 * e.e.d.PlayerCount) + (!f.FumenId.HasValue ? 0 : f.AverageMedal10.Value * f.PlayerCount.Value)) / ((e.e.d == null ? 0 : e.e.d.PlayerCount) + (!f.FumenId.HasValue ? 0 : f.PlayerCount.Value) == 0 ? 1 : (e.e.d == null ? 0 : e.e.d.PlayerCount) + (!f.FumenId.HasValue ? 0 : f.PlayerCount.Value)), 2),
                    PlayerCountNow = (!f.FumenId.HasValue ? 0 : f.PlayerCount.Value),
                })
                .Select(a => new object[]{ a.Id, a.PlayerCount, a.AverageScore, a.Medal4, a.Medal5, a.Medal6, a.Medal7, a.Medal8, a.Medal9, a.Medal10, a.PlayerCountNow })
                .ToArrayAsync();

            if (item == null)
            {
                return NotFound();
            }

            return item;
        }
    }
}
