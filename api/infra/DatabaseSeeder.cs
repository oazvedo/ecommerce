using api.domain;
using Microsoft.EntityFrameworkCore;

namespace api.infra
{
    public static class DatabaseSeeder
    {
        public static async Task SeedAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<DatabaseContext>();

            await PermissaoSeed.SeedAsync(context);
            await CargoPermissaoSeed.SeedAsync(context);
            await EmpresaSeed.SeedAsync(context);
            await UsuarioSeed.SeedAsync(context);
        }
    }
}
