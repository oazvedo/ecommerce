using api.Domain;
using api.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace api.infra
{
    public static class EmpresaSeed
    {
        public static readonly Guid DefaultEmpresaId = new("00000000-0000-0000-0000-000000000001");

        public static async Task SeedAsync(DatabaseContext context)
        {
            var empresaPadrao = await context.Empresas
                .FirstOrDefaultAsync(e => e.Id == DefaultEmpresaId);

            if (empresaPadrao == null)
            {
                empresaPadrao = new Empresa("Venturus", "123456789", "Usuario Responsavel", Guid.Empty, "", EmpresaTipo.Central)
                {
                    Id = DefaultEmpresaId
                };
                context.Empresas.Add(empresaPadrao);
                await context.SaveChangesAsync();
            }
        }
    }
}
