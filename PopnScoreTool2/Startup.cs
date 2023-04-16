using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using PopnScoreTool2.Data;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Http;

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
            services.Configure<ForwardedHeadersOptions>(options =>
            {
                options.ForwardedHeaders =
                    ForwardedHeaders.XForwardedProto;
            });

            services.AddDbContext<AppDbContext>(options =>
                options.UseSqlServer(
                    Configuration.GetConnectionString("DefaultConnection") + Configuration["Authentication:MSSQL:UserPST2Password"]
                    // ));
                    + ";" + "TrustServerCertificate=True"));
            services.AddDefaultIdentity<IdentityUser>(/* options => options.SignIn.RequireConfirmedAccount = true */)
                .AddEntityFrameworkStores<AppDbContext>();
            services.AddRazorPages();

            services.AddAuthentication().AddTwitter(twitterOptions =>
            {
                twitterOptions.ConsumerKey = Configuration["Authentication:Twitter:ConsumerAPIKey"];
                twitterOptions.ConsumerSecret = Configuration["Authentication:Twitter:ConsumerSecret"];
                twitterOptions.RetrieveUserDetails = true;
            });
        }
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            app.UseForwardedHeaders();

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.Use(async (context, next) =>
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

            app.UseHttpsRedirection();

            var provider = new FileExtensionContentTypeProvider();
            // Add new mappings
            provider.Mappings[".js"] = "application/javascript; charset=utf-8";

            app.UseStaticFiles(new StaticFileOptions
            {
                ContentTypeProvider = provider
            });

            app.UseRouting();

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
                endpoints.MapRazorPages();
            });

            // app.UseCors(MyAllowSpecificOrigins);
            // app.UseCors();
        }
    }
}
