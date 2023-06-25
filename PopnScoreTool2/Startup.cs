using Microsoft.AspNetCore.Authentication.Twitter;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using PopnScoreTool2.Authentication.Twitter;
using PopnScoreTool2.Data;

namespace PopnScoreTool2
{
    public class Startup
    {
        // readonly string MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            _ = services.Configure<ForwardedHeadersOptions>(options =>
            {
                options.ForwardedHeaders =
                    ForwardedHeaders.XForwardedProto;
            });

            _ = services.AddDbContext<AppDbContext>(options =>
            {
                var connectionStringBuilder = new SqlConnectionStringBuilder(Configuration.GetConnectionString("DefaultConnection"))
                {
                    Password = Configuration["Authentication:MSSQL:UserPST2Password"],
                    TrustServerCertificate = true
                };

                _ = options.UseSqlServer(connectionStringBuilder.ConnectionString);
            });

            _ = services.AddDataProtection()
                .PersistKeysToDbContext<AppDbContext>();

            _ = services.AddHealthChecks()
                .AddDbContextCheck<AppDbContext>("database");

            _ = services.AddDefaultIdentity<IdentityUser>(/* options => options.SignIn.RequireConfirmedAccount = true */)
                .AddEntityFrameworkStores<AppDbContext>();
            _ = services.AddRazorPages();

            var builder = services.AddAuthentication();
            builder.Services.TryAddEnumerable(ServiceDescriptor.Singleton<IPostConfigureOptions<TwitterOptions>, TwitterPostConfigureOptions>());
            _ = builder.AddRemoteScheme<TwitterOptions, CustomTwitterHandler>(TwitterDefaults.AuthenticationScheme, TwitterDefaults.DisplayName, twitterOptions =>
                {
                    twitterOptions.ConsumerKey = Configuration["Authentication:Twitter:ConsumerAPIKey"];
                    twitterOptions.ConsumerSecret = Configuration["Authentication:Twitter:ConsumerSecret"];
                    twitterOptions.RetrieveUserDetails = true;
                });

        }
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            _ = app.UseForwardedHeaders();

            if (env.IsDevelopment())
            {
                _ = app.UseDeveloperExceptionPage();
            }
            else
            {
                _ = app.UseExceptionHandler("/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                _ = app.UseHsts();
            }

            _ = app.Use(async (context, next) =>
            {
                var config = context.RequestServices.GetService<IConfiguration>();
                if (config["Authentication:MSSQL:UserPST2Password"] == null)
                {
                    context.Response.StatusCode = 500;
                    await context.Response.WriteAsync("Secrets.json or environment variables are not configured. Please configure them.");
                }
                else
                {
                    await next();
                }
            });


            _ = app.UseHttpsRedirection();

            var provider = new FileExtensionContentTypeProvider();
            // Add new mappings
            provider.Mappings[".js"] = "application/javascript; charset=utf-8";

            _ = app.UseStaticFiles(new StaticFileOptions
            {
                ContentTypeProvider = provider
            });

            _ = app.UseRouting();

            _ = app.UseAuthentication();
            _ = app.UseAuthorization();

            _ = app.UseEndpoints(endpoints =>
            {
                _ = endpoints.MapControllers();
                _ = endpoints.MapRazorPages();
                _ = endpoints.MapHealthChecks("/health");
            });

            // app.UseCors(MyAllowSpecificOrigins);
            // app.UseCors();
        }
    }
}
