using System.Reflection;
using api.domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace api.infra
{
    public static class PermissaoSeed
    {
        // Descoberto por reflexão a partir dos [Authorize(Policy = "Recurso.Acao")]
        // presentes nas Controllers. Basta anotar um endpoint com uma nova policy
        // que ela passa a existir aqui automaticamente, sem precisar editar este arquivo.
        public static readonly string[] PermissionNames = DiscoverPermissionNames();

        public static string[] DiscoverPermissionNames(Assembly? assembly = null)
        {
            assembly ??= Assembly.GetExecutingAssembly();

            var policies = new HashSet<string>(StringComparer.Ordinal);

            var controllerTypes = assembly.GetTypes()
                .Where(t => typeof(ControllerBase).IsAssignableFrom(t) && !t.IsAbstract);

            foreach (var controllerType in controllerTypes)
            {
                CollectPolicies(controllerType.GetCustomAttributes<AuthorizeAttribute>(inherit: true), policies);

                foreach (var method in controllerType.GetMethods(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly))
                {
                    CollectPolicies(method.GetCustomAttributes<AuthorizeAttribute>(inherit: true), policies);
                }
            }

            return [.. policies.OrderBy(p => p, StringComparer.Ordinal)];
        }

        private static void CollectPolicies(IEnumerable<AuthorizeAttribute> attributes, HashSet<string> policies)
        {
            foreach (var attr in attributes)
            {
                // Policies no formato "Recurso.Acao" são permissões; outras (ex.: roles) são ignoradas.
                if (!string.IsNullOrWhiteSpace(attr.Policy) && attr.Policy.Contains('.'))
                    policies.Add(attr.Policy);
            }
        }

        public static async Task SeedAsync(DatabaseContext context)
        {
            foreach (var permissionName in PermissionNames)
            {
                if (!await context.Permissoes.AnyAsync(p => p.Nome == permissionName))
                {
                    context.Permissoes.Add(new Permissao
                    {
                        Id = Guid.NewGuid(),
                        Nome = permissionName,
                        Descricao = $"Permissão para {permissionName}"
                    });
                }
            }

            await context.SaveChangesAsync();
        }
    }
}
