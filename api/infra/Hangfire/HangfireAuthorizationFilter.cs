using Hangfire.Dashboard;

namespace api.infra.Hangfire
{
    public class HangfireAuthorizationFilter(IWebHostEnvironment env) : IDashboardAuthorizationFilter
    {
        public bool Authorize(DashboardContext context)
        {
            if (env.IsDevelopment()) return true;

            var httpContext = context.GetHttpContext();
            return httpContext.User.Identity?.IsAuthenticated == true;
        }
    }
}
