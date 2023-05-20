using Microsoft.AspNetCore.Authentication.Twitter;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Text.Encodings.Web;
using System.Threading.Tasks;
using System;

namespace PopnScoreTool2.Authentication.Twitter
{
    public class CustomTwitterHandler : TwitterHandler
    {
        public CustomTwitterHandler(IOptionsMonitor<TwitterOptions> options, ILoggerFactory logger, UrlEncoder encoder, ISystemClock clock)
            : base(options, logger, encoder, clock)
        {
        }

        protected override async Task HandleChallengeAsync(AuthenticationProperties properties2)
        {
            try
            {
                await base.HandleChallengeAsync(properties2);
            }
            catch (InvalidOperationException ex)
            {
                if (ex.Message.Contains("Could not authenticate you."))
                {
                    Context.Response.Redirect("/TwitterAuthenticationError");
                }
                else
                {
                    throw;
                }
            }
        }
    }
}
