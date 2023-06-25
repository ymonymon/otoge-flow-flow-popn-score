using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using System.Diagnostics;
using System.IO;

namespace PopnScoreTool2.Data
{
    public class DesignTimeAppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
    {
        public AppDbContext CreateDbContext(string[] args)
        {
            var configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json")
                .AddUserSecrets<DesignTimeAppDbContextFactory>()
                .Build();

            var connectionString = configuration.GetValue<string>("DebugConnectionString");

            Debug.WriteLine(connectionString);
            var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
            _ = optionsBuilder.UseSqlServer(connectionString);

            return new AppDbContext(optionsBuilder.Options);
        }
    }
}
