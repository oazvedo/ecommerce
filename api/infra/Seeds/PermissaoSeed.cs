using api.domain;
using Microsoft.EntityFrameworkCore;

namespace api.infra
{
    public static class PermissaoSeed
    {
        public static readonly string[] PermissionNames =
        {
            // usuarios
            "Usuario.Read",
            "Usuario.Create",
            "Usuario.Update",
            "Usuario.Delete",
            "Usuario.EmailUpdate",
            "Usuario.PasswordUpdate",
            //permissoes
            "Permissao.Read",
            "Permissao.Assign",
            "Permissao.Remove",
            "Permissao.RemoveAll",
            //pedidos
            "Pedido.Read",
            "Pedido.Create",
            "Pedido.Update",
            "Pedido.Delete",
            "Pedido.UpdateAdmin",
            //produtos
            "Produto.Read",
            "Produto.Create",
            "Produto.Update",
            "Produto.Delete",
            // carteiras
            "Carteira.Read",
            "Carteira.Create",
            "Carteira.Update",
            "Carteira.Delete",
            // empresas
            "Empresa.Read",
            "Empresa.Create",
            "Empresa.Update",
            "Empresa.Delete",
            // avaliacoes
            "Avaliacao.Read",
            "Avaliacao.Create",
            // auditoria
            "Auditoria.Read",
            // favoritos
            "Favorito.Read",
            "Favorito.Manage"
        };

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
