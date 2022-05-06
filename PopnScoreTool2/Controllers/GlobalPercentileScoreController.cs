using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PopnScoreTool2.Data;
using PopnScoreTool2.Models;

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
            var item = await _context.PercentileScores
                .Select(a => new object[] { a.FumenId, a.No75, a.No50, a.No25, a.No1 } )
                .ToArrayAsync();

            if (item == null)
            {
                return NotFound();
            }

            return item;
        }
    }
}
