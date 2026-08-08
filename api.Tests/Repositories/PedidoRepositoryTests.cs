using api.Application.DTOs.Pedido;
using api.domain;
using api.Domain;
using api.Domain.Enums;
using api.Domain.Enums.UsuarioEnums;
using api.infra;
using api.infra.repository;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace api.Tests.Repositories
{
    public class PedidoRepositoryTests
    {
        private static DatabaseContext CreateContext() =>
            new(new DbContextOptionsBuilder<DatabaseContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options);

        private static Usuario CriarUsuario() =>
            new("Test User", $"test{Guid.NewGuid()}@test.com", "Senha123!", UsuarioCargo.Operador, Guid.NewGuid());

        private static Empresa CriarEmpresa() =>
            new("Empresa Test", "00.000.000/0001-00", "Responsavel Test", Guid.NewGuid(), "11999999999", EmpresaTipo.Central);

        private static Pedido CriarPedido(Guid usuarioId, Guid empresaId) =>
            new(empresaId, usuarioId, new List<PedidoItem>(), PedidoTipoContratacaoEnum.Mensal);

        private static async Task<(Usuario, Empresa)> SeedContextAsync(DatabaseContext ctx)
        {
            var usuario = CriarUsuario();
            var empresa = CriarEmpresa();
            ctx.Usuarios.Add(usuario);
            ctx.Empresas.Add(empresa);
            await ctx.SaveChangesAsync();
            return (usuario, empresa);
        }

        [Fact]
        public async Task GetPedidosAsync_DeveRetornarTodosOsPedidos()
        {
            using var ctx = CreateContext();
            var (usuario, empresa) = await SeedContextAsync(ctx);
            ctx.Pedidos.AddRange(CriarPedido(usuario.Id, empresa.Id), CriarPedido(usuario.Id, empresa.Id));
            await ctx.SaveChangesAsync();

            var result = await new PedidoRepository(ctx).GetPedidosAsync();

            Assert.Equal(2, result.Count());
        }

        [Fact]
        public async Task GetPedidosPagedAsync_SemFiltro_DeveRetornarTodos()
        {
            using var ctx = CreateContext();
            var (usuario, empresa) = await SeedContextAsync(ctx);
            ctx.Pedidos.AddRange(
                CriarPedido(usuario.Id, empresa.Id),
                CriarPedido(usuario.Id, empresa.Id),
                CriarPedido(usuario.Id, empresa.Id));
            await ctx.SaveChangesAsync();

            var filtro = new PedidoFiltroRequest { Page = 1, PageSize = 10 };
            var (items, total) = await new PedidoRepository(ctx).GetPedidosPagedAsync(filtro);

            Assert.Equal(3, total);
            Assert.Equal(3, items.Count());
        }

        [Fact]
        public async Task GetPedidosPagedAsync_ComFiltroStatus_DeveRetornarFiltrado()
        {
            using var ctx = CreateContext();
            var (usuario, empresa) = await SeedContextAsync(ctx);
            var pedido1 = CriarPedido(usuario.Id, empresa.Id);
            var pedido2 = CriarPedido(usuario.Id, empresa.Id);
            pedido2.UpdateStatus(PedidoStatus.EmProcessamento);
            ctx.Pedidos.AddRange(pedido1, pedido2);
            await ctx.SaveChangesAsync();

            var filtro = new PedidoFiltroRequest { Page = 1, PageSize = 10, Status = PedidoStatus.Criado };
            var (items, total) = await new PedidoRepository(ctx).GetPedidosPagedAsync(filtro);

            Assert.Equal(1, total);
            Assert.All(items, p => Assert.Equal(PedidoStatus.Criado, p.Status));
        }

        [Fact]
        public async Task GetPedidosPagedAsync_ComPaginacao_DeveRetornarPaginado()
        {
            using var ctx = CreateContext();
            var (usuario, empresa) = await SeedContextAsync(ctx);
            ctx.Pedidos.AddRange(
                CriarPedido(usuario.Id, empresa.Id),
                CriarPedido(usuario.Id, empresa.Id),
                CriarPedido(usuario.Id, empresa.Id));
            await ctx.SaveChangesAsync();

            var filtro = new PedidoFiltroRequest { Page = 1, PageSize = 2 };
            var (items, total) = await new PedidoRepository(ctx).GetPedidosPagedAsync(filtro);

            Assert.Equal(3, total);
            Assert.Equal(2, items.Count());
        }

        [Fact]
        public async Task GetPedidosByUsuarioIdAsync_DeveRetornarApenasDoUsuario()
        {
            using var ctx = CreateContext();
            var (usuario1, empresa) = await SeedContextAsync(ctx);
            var usuario2 = CriarUsuario();
            ctx.Usuarios.Add(usuario2);
            await ctx.SaveChangesAsync();

            ctx.Pedidos.AddRange(CriarPedido(usuario1.Id, empresa.Id), CriarPedido(usuario2.Id, empresa.Id));
            await ctx.SaveChangesAsync();

            var result = await new PedidoRepository(ctx).GetPedidosByUsuarioIdAsync(usuario1.Id);

            Assert.Single(result);
            Assert.All(result, p => Assert.Equal(usuario1.Id, p.UsuarioId));
        }

        [Fact]
        public async Task GetPedidoById_QuandoExiste_DeveRetornarPedido()
        {
            using var ctx = CreateContext();
            var (usuario, empresa) = await SeedContextAsync(ctx);
            var pedido = CriarPedido(usuario.Id, empresa.Id);
            ctx.Pedidos.Add(pedido);
            await ctx.SaveChangesAsync();

            var result = await new PedidoRepository(ctx).GetPedidoById(pedido.Id);

            Assert.NotNull(result);
            Assert.Equal(pedido.Id, result.Id);
        }

        [Fact]
        public async Task GetPedidoById_QuandoNaoExiste_DeveRetornarNull()
        {
            using var ctx = CreateContext();

            var result = await new PedidoRepository(ctx).GetPedidoById(Guid.NewGuid());

            Assert.Null(result);
        }

        [Fact]
        public async Task AdicionarPedido_DevePersistirPedidoNoBanco()
        {
            using var ctx = CreateContext();
            var (usuario, empresa) = await SeedContextAsync(ctx);

            var pedido = new Pedido(empresa.Id, usuario.Id, new List<PedidoItem>(), PedidoTipoContratacaoEnum.Anual);
            var result = await new PedidoRepository(ctx).AdicionarPedido(pedido);

            Assert.Equal(1, await ctx.Pedidos.CountAsync());
            Assert.Equal(pedido.Id, result.Id);
            Assert.Equal(PedidoTipoContratacaoEnum.Anual, result.Contracacao);
        }

        [Fact]
        public async Task AtualizarPedido_QuandoExiste_DeveAtualizarStatus()
        {
            using var ctx = CreateContext();
            var (usuario, empresa) = await SeedContextAsync(ctx);
            var pedido = CriarPedido(usuario.Id, empresa.Id);
            ctx.Pedidos.Add(pedido);
            await ctx.SaveChangesAsync();

            pedido.UpdateStatus(PedidoStatus.EmProcessamento);
            var result = await new PedidoRepository(ctx).AtualizarPedido(pedido.Id, pedido);

            Assert.NotNull(result);
            Assert.Equal(PedidoStatus.EmProcessamento, result.Status);
        }

        [Fact]
        public async Task AtualizarPedido_QuandoExiste_DeveAtualizarContratacao()
        {
            using var ctx = CreateContext();
            var (usuario, empresa) = await SeedContextAsync(ctx);
            var pedido = CriarPedido(usuario.Id, empresa.Id);
            ctx.Pedidos.Add(pedido);
            await ctx.SaveChangesAsync();

            pedido.UpdateContratacao(PedidoTipoContratacaoEnum.Anual);
            var result = await new PedidoRepository(ctx).AtualizarPedido(pedido.Id, pedido);

            Assert.NotNull(result);
            Assert.Equal(PedidoTipoContratacaoEnum.Anual, result.Contracacao);
        }

        [Fact]
        public async Task RemoverPedido_QuandoExiste_DeveRemoverERetornarTrue()
        {
            using var ctx = CreateContext();
            var (usuario, empresa) = await SeedContextAsync(ctx);
            var pedido = CriarPedido(usuario.Id, empresa.Id);
            ctx.Pedidos.Add(pedido);
            await ctx.SaveChangesAsync();

            var result = await new PedidoRepository(ctx).RemoverPedido(pedido.Id);

            Assert.True(result);
            Assert.Equal(0, await ctx.Pedidos.CountAsync());
        }

        [Fact]
        public async Task RemoverPedido_QuandoNaoExiste_DeveRetornarFalse()
        {
            using var ctx = CreateContext();

            var result = await new PedidoRepository(ctx).RemoverPedido(Guid.NewGuid());

            Assert.False(result);
        }
    }
}
