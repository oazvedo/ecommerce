using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace api.infra.auth
{
    public class SwaggerSecurityScheme : IOperationFilter
    {
        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            var hasAuthorize = context.MethodInfo.DeclaringType?.GetCustomAttributes(typeof(Microsoft.AspNetCore.Authorization.AuthorizeAttribute), false).Length > 0
                || context.MethodInfo.GetCustomAttributes(typeof(Microsoft.AspNetCore.Authorization.AuthorizeAttribute), false).Length > 0;

            var hasAllowAnonymous = context.MethodInfo.GetCustomAttributes(typeof(Microsoft.AspNetCore.Authorization.AllowAnonymousAttribute), false).Length > 0;

            if (hasAuthorize && !hasAllowAnonymous)
            {
                operation.Security = new List<OpenApiSecurityRequirement>
                {
                    new OpenApiSecurityRequirement
                    {
                        {
                            new OpenApiSecuritySchemeReference("Bearer", context.Document),
                            new List<string>()
                        }
                    }
                };
            }
        }
    }
}
