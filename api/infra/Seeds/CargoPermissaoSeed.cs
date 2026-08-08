using api.Domain;
using api.Domain.Enums.UsuarioEnums;
using Microsoft.EntityFrameworkCore;

namespace api.infra
{
    public static class CargoPermissaoSeed
    {
        private static readonly Dictionary<UsuarioCargo, string[]> Defaults = new()
        {
            [UsuarioCargo.Administrador] = PermissaoSeed.PermissionNames,
            [UsuarioCargo.Diretor] =
            [
                "Usuario.Read", "Usuario.Update",
                "Permissao.Read",
                "Pedido.Read", "Pedido.Update", "Pedido.UpdateAdmin",
                "Produto.Read", "Produto.Create", "Produto.Update",
                "Carteira.Read",
                "Empresa.Read", "Empresa.Update",
                "Auditoria.Read"
            ],
            [UsuarioCargo.Gerente] =
            [
                "Usuario.Read",
                "Pedido.Read", "Pedido.Create", "Pedido.Update",
                "Produto.Read", "Produto.Create", "Produto.Update",
                "Carteira.Read",
                "Empresa.Read"
            ],
            [UsuarioCargo.Operador] =
            [
                "Pedido.Read", "Pedido.Create",
                "Produto.Read",
                "Carteira.Read",
                "Empresa.Read"
            ],
            // Cliente do marketplace: compra e vê a própria carteira/pedidos.
            // Sem Empresa.Read — não pertence a uma loja vendedora.
            [UsuarioCargo.Cliente] =
            [
                "Pedido.Read", "Pedido.Create",
                "Produto.Read",
                "Carteira.Read"
            ]
        };

        public static async Task SeedAsync(DatabaseContext context)
        {
            foreach (var (cargo, permNames) in Defaults)
            {
                if (await context.CargoPermissoes.AnyAsync(cp => cp.Cargo == cargo))
                    continue;

                var permissoes = await context.Permissoes
                    .Where(p => permNames.Contains(p.Nome))
                    .ToListAsync();

                foreach (var perm in permissoes)
                {
                    context.CargoPermissoes.Add(new CargoPermissao
                    {
                        Cargo = cargo,
                        PermissaoId = perm.Id
                    });
                }
            }

            await context.SaveChangesAsync();
        }
    }
}
