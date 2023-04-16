using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PopnScoreTool2.Data;

namespace PopnScoreTool2.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProfileController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProfileController(AppDbContext context)
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

            return await _context.Profiles
                .Where(a => a.UserIntId == userIntId)
                .Select(a => new object[]{ a.PlayerName, a.PopnFrendId, a.UseCharacterName,
                    a.NormalModeCreditCount, a.BattleModeCreditCount, a.LocalModeCreditCount, a.Comment, a.LastUpdateTime.ToString("yyyy/MM/dd HH:mm:ss") })
                .ToArrayAsync();
        }
    }
}
