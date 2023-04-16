using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PopnScoreTool2.Data;

namespace PopnScoreTool2.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GlobalPercentileScoreController : ControllerBase
    {
        private readonly AppDbContext _context;

        public GlobalPercentileScoreController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Values
        [HttpGet]
        public async Task<ActionResult<object[]>> GetValues()
        {
            // ログイン不要API。
           return await _context.PercentileScores
                .Select(a => new object[] { a.FumenId, a.No75, a.No50, a.No25, a.No1 } )
                .ToArrayAsync();
        }
    }
}
