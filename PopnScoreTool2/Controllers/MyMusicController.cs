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
    public class MyMusicController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MyMusicController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Values
        [HttpGet]
        public async Task<ActionResult<object[]>> GetValues()
        {
            // ログインしているか確認。
            if (!User.Identity.IsAuthenticated)
            {
                return NotFound();
            }

            // IDを特定する
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            // UserIntID取得。なければ終わり
            var userInt = _context.UserInts.Where(a => a.AspNetUsersFK == userId);

            if (!userInt.Any())
            {
                return NotFound();
            }

            var userIntId = userInt.First().Id;

            return await _context.Musics.Where(w => w.Deleted == false)
                .GroupJoin(_context.MusicScores.Where(w => w.UserIntId == userIntId), a => a.Id, b => b.FumenId, (a, b) => new { a, b })
                .SelectMany(ab => ab.b.DefaultIfEmpty(), (a, b) => new
                {
                    a.a.Id,
                    MedalOrdinalScale = b == null ? -2 : b.MedalOrdinalScale,
                    RankOrdinalScale = b == null ? -2 : b.RankOrdinalScale,
                    Score = b == null ? -2 : b.Score
                }).Select(a => new object[] { a.Id, a.MedalOrdinalScale, a.RankOrdinalScale, a.Score })
                // }).Select(a => new object[] { a.Id, a.MedalOrdinalScale })
                .ToArrayAsync();
        }
    }
}
