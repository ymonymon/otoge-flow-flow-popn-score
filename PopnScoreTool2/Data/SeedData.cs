using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using PopnScoreTool2.Models;

namespace PopnScoreTool2.Data
{
    public class SeedData
    {
        // internal static async Task SeedingAsync(MusicScoreBasis context)
        public static async Task SeedingAsync(AppDbContext context)
        {
            await context.Database.EnsureCreatedAsync();
            if (await context.Musics.AnyAsync())
                return;
            await context.SaveChangesAsync();
        }
    }
}
