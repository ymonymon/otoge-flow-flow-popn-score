using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PopnScoreTool2.Data;

namespace PopnScoreTool2.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GlobalOldTopScoreController : ControllerBase
    {
        private readonly AppDbContext _context;

        public GlobalOldTopScoreController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Values
        [HttpGet]
        public async Task<ActionResult<object[]>> GetValues()
        {
            // ログイン不要API。
            return await _context.Musics.Where(w => w.Deleted == false)
                .GroupJoin(_context.OldStatses, a => a.Id, b => b.FumenId, (a, b) => new { a, b })
                .SelectMany(ab => ab.b.DefaultIfEmpty(), (a, b) => new {
                    a.a.Id,
                    TopScore = b == null ? 0 : b.TopScore,
                })
                .Select(a => new object[] { a.Id, a.TopScore })
                .ToArrayAsync();
        }
    }
}
