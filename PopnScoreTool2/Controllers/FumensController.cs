using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PopnScoreTool2.Data;
using System.Linq;
using System.Threading.Tasks;

namespace PopnScoreTool2.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FumensController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FumensController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Values
        [HttpGet]
        public async Task<ActionResult<object[]>> GetValues()
        {
            return await _context.Musics.Where(w => w.Deleted == false)
                .Select(a => new object[]{ a.Id, a.Name, a.Genre, a.LevelId, a.Level,
                    a.Version, a.Position == 1 ? "UPPER": "", a.AddVersion })
                .ToArrayAsync();
        }
    }
}
