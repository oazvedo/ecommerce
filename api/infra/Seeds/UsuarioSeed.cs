using api.domain;
using api.Domain.Enums.UsuarioEnums;
using Microsoft.EntityFrameworkCore;

namespace api.infra
{
    public static class UsuarioSeed
    {
        public const string AdminEmail = "admin";
        public const string AdminPassword = "admin";

        public static async Task SeedAsync(DatabaseContext context)
        {
            var adminUser = await context.Usuarios
                .Include(u => u.UsuarioPermissoes)
                .FirstOrDefaultAsync(u => u.Email == AdminEmail);

            if (adminUser == null)
            {
                adminUser = new Usuario("Administrador", AdminEmail, AdminPassword, UsuarioCargo.Administrador, EmpresaSeed.DefaultEmpresaId);
                context.Usuarios.Add(adminUser);
                await context.SaveChangesAsync();
            }

            adminUser = await context.Usuarios
                .Include(u => u.UsuarioPermissoes)
                .FirstOrDefaultAsync(u => u.Email == AdminEmail)
                ?? throw new InvalidOperationException("Falha ao criar o usuário admin.");

            var permissions = await context.Permissoes
                .Where(p => PermissaoSeed.PermissionNames.Contains(p.Nome))
                .ToListAsync();

            foreach (var permission in permissions)
            {
                if (!adminUser.UsuarioPermissoes.Any(up => up.PermissaoId == permission.Id))
                {
                    adminUser.UsuarioPermissoes.Add(new UsuarioPermissao
                    {
                        UsuarioId = adminUser.Id,
                        PermissaoId = permission.Id,
                        Usuario = adminUser,
                        Permissao = permission
                    });
                }
            }

            await context.SaveChangesAsync();
        }
    }
}
