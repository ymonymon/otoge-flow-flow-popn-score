using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PopnScoreTool2.Data;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace PopnScoreTool2.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ValuesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ValuesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Values
        [HttpGet]
        public async Task<ActionResult<object[]>> GetValues()
        {
            var userIntId = -1;
            // ログインしているか確認。
            if (User.Identity.IsAuthenticated)
            {
                // IDを特定する
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

                // UserIntID取得。なければ終わり
                var userInt = _context.UserInts.Where(a => a.AspNetUsersFK == userId);

                if (userInt.Any())
                {
                    userIntId = userInt.First().Id;
                }
            }
#if DEBUG
            // userIntId = 2;
#endif
            return await _context.Musics.Where(w => w.Deleted == false)
                .GroupJoin(_context.MusicScores.Where(b => b.UserIntId == userIntId), a => a.Id, b => b.FumenId, (a, b) => new { a, b })
                .SelectMany(ab => ab.b.DefaultIfEmpty(), (c, d) => new
                {
                    c.a.Name,
                    c.a.Genre,
                    c.a.Position,
                    c.a.LevelId,
                    c.a.Level,
                    MedalOrdinalScale = d == null ? -2 : d.MedalOrdinalScale,
                    RankOrdinalScale = d == null ? -2 : d.RankOrdinalScale,
                    Score = d == null ? -2 : d.Score,
                    c.a.Version
                })
                .Select(a => new object[]{ a.Name, a.Genre + (a.Position == 1 ? "UPPER": ""), a.LevelId, a.Level,
                    a.MedalOrdinalScale, a.RankOrdinalScale, a.Score, a.Version })
                .ToArrayAsync();
        }
    }
}
