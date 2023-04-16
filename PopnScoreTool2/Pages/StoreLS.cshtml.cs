using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace PopnScoreTool2.Pages
{
    [IgnoreAntiforgeryToken]
    public class StoreLSModel : PageModel
    {
        public IActionResult OnPostAsync()
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }

            var origin = "https://p.eagate.573.jp";

            if (HttpContext.Request.Headers["origin"] == origin)
            {
                ViewData["value"] = HttpContext.Request.Form["datalist"];
            }
            return Page();
        }

    }
}
