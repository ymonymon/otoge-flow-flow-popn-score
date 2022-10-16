using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

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
