using api.Application.DTOs.Common;
using api.Application.DTOs.Pedido;
using api.Application.Services.Interfaces;
using api.domain;
using api.domain.interfaces;
using api.Domain;
using api.Domain.Enums;
using api.Domain.Interfaces;

namespace api.Application.Services
{
    public class PedidoService : IPedidoService
    {
        private readonly IPedidoRepository _repository;
        private readonly IRepositoryBase<Produto> _produtoRepository;
        private readonly ICarteiraRepository _carteiraService;

        public PedidoService(IPedidoRepository repository, IRepositoryBase<Produto> produtoRepository, ICarteiraRepository carteiraService)
        {
            _repository = repository;
            _produtoRepository = produtoRepository;
            _carteiraService = carteiraService;
        }

        public async Task<PagedResult<PedidoDto>> GetAllPedidos(PedidoFiltroRequest filtro)
        {
            var (pedidos, totalCount) = await _repository.GetPedidosPagedAsync(filtro);
            return new PagedResult<PedidoDto>
            {
                Page = filtro.Page,
                PageSize = filtro.PageSize,
                TotalCount = totalCount,
                Items = pedidos.Select(ToDto)
            };
        }

        public async Task<IEnumerable<PedidoDto>> GetPedidosByUsuarioId(Guid usuarioId)
        {
            var pedidos = await _repository.GetPedidosByUsuarioIdAsync(usuarioId);
            return pedidos.Select(ToDto);
        }

        public async Task<PagedResult<PedidoDto>> GetPedidosByUsuarioId(Guid usuarioId, int page, int pageSize)
        {
            var pedidos = await _repository.GetPedidosByUsuarioIdAsync(usuarioId);
            var totalCount = pedidos.Count();
            var items = pedidos.Skip((page - 1) * pageSize).Take(pageSize);

            return new PagedResult<PedidoDto>
            {
                Page = page,
                PageSize = pageSize,
                TotalCount = totalCount,
                Items = items.Select(ToDto)
            };
        }

        public async Task<PedidoDto?> GetPedidoById(Guid id)
        {
            var pedido = await _repository.GetPedidoById(id);
            return pedido == null ? null : ToDto(pedido);
        }

        public async Task<PagedResult<PedidoDto>> GetPedidosByEmpresaId(Guid empresaId, int page, int pageSize)
        {
            var pedidos = await _repository.GetPedidosByEmpresaIdAsync(empresaId);
            var totalCount = pedidos.Count();
            var items = pedidos.Skip((page - 1) * pageSize).Take(pageSize);

            return new PagedResult<PedidoDto>
            {
                Page = page,
                PageSize = pageSize,
                TotalCount = totalCount,
                Items = items.Select(ToDto)
            };
        }

        public async Task<PagedResult<PedidoDto>> GetByEmpresaCNPJ(string cnpj, int page, int pageSize)
        {
            var pedidos = await _repository.GetByEmpresaCNPJ(cnpj);
            var totalCount = pedidos.Count();
            var items = pedidos.Skip((page - 1) * pageSize).Take(pageSize);

            return new PagedResult<PedidoDto>
            {
                Page = page,
                PageSize = pageSize,
                TotalCount = totalCount,
                Items = items.Select(ToDto)
            };
        }

        public async Task<PedidoDto> CreatePedido(Guid usuarioId, CreatePedidoRequest request)
        {
            var pedido = new Pedido(request.EmpresaId, usuarioId, new List<PedidoItem>(), request.contratacao);

            foreach (var item in request.itens)
            {
                var produto = await _produtoRepository.GetByIdAsync(item.produtoId)
                    ?? throw new KeyNotFoundException($"Produto '{item.produtoId}' não encontrado.");
                pedido.AdicionarItem(produto, item.quantidade);
            }
            var carteiraUsuario = await _carteiraService.GetCarteiraByUsuarioId(usuarioId);

            if (((double)pedido.ValorTotal) > carteiraUsuario!.Saldo)
            {
                throw new KeyNotFoundException("Saldo insuficiente");
            }
            else
            {
                carteiraUsuario.UpdateBalance(-(double)pedido.ValorTotal);
                await _carteiraService.UpdateAsync(carteiraUsuario);
                await _repository.AdicionarPedido(pedido);
                return ToDto(pedido);
            }

        }

        public async Task<PedidoDto?> UpdatePedidoStatus(Guid id, PedidoStatus newStatus)
        {
            var pedido = await _repository.GetPedidoById(id);
            if (pedido == null) return null;

            pedido.UpdateStatus(newStatus);
            var updated = await _repository.AtualizarPedido(id, pedido);
            return updated == null ? null : ToDto(updated);
        }

        public async Task<PedidoDto?> UpdatePedidoContratacao(Guid id, PedidoTipoContratacaoEnum novaContratacao)
        {
            var pedido = await _repository.GetPedidoById(id);
            if (pedido == null) return null;

            pedido.UpdateContratacao(novaContratacao);
            var updated = await _repository.AtualizarPedido(id, pedido);
            return updated == null ? null : ToDto(updated);
        }

        public Task<bool> DeleteAsync(Guid id)
            => _repository.RemoverPedido(id);

        public async Task<IEnumerable<PedidoDto>> GetPedidosByPeriodo(DateTime dataInicio, DateTime dataFim)
        {
            var pedidos = await _repository.GetPedidosAsync();
            return pedidos
                .Where(p => p.CriadoEm >= dataInicio && p.CriadoEm <= dataFim.Date.AddDays(1).AddTicks(-1))
                .Select(ToDto);
        }

       

        public async Task<PedidoDto?> UpdatePedido(Guid pedidoId, UpdatePedidoRequest request)
        {
            var pedido = await _repository.GetPedidoById(pedidoId);
            if (pedido == null) return null;

            pedido.UpdatePedido(request.Contratacao, request.Status);

            var newItems = new List<PedidoItem>();
            foreach (var item in request.Itens)
            {
                var produto = await _produtoRepository.GetByIdAsync(item.produtoId)
                    ?? throw new KeyNotFoundException($"Produto '{item.produtoId}' não encontrado.");
                newItems.Add(new PedidoItem(pedidoId, produto, item.quantidade));
            }

            var updated = await _repository.AtualizarPedido(pedidoId, pedido, newItems);
            return updated == null ? null : ToDto(updated);
        }

        public async Task<PedidoDto?> CancelarPedido(Guid pedidoId)
        {
            var pedido = await _repository.GetPedidoById(pedidoId);
            if (pedido == null) throw new KeyNotFoundException("Pedido não encontrado.");

            pedido.CancelarPedido();
            var updated = await _repository.AtualizarPedido(pedidoId, pedido);
            return updated == null ? null : ToDto(updated);
        }

         private static PedidoDto ToDto(Pedido p) => new()
        {
            Id = p.Id,
            EmpresaId = p.EmpresaId,
            EmpresaNome = p.Empresa?.Nome,
            EmpresaCNPJ = p.Empresa?.Cnpj,
            UsuarioId = p.UsuarioId,
            UsuarioNome = p.Usuario?.Nome,
            Status = p.Status,
            Contracacao = p.Contracacao,
            ValorTotal = p.ValorTotal,
            CriadoEm = p.CriadoEm,
            AtualizadoEm = p.AtualizadoEm,
            Itens = p.Itens.Select(i => new PedidoItemDto
            {
                ProdutoId = i.ProdutoId,
                NomeProduto = i.Produto.Nome,
                Quantidade = i.Quantidade,
                PrecoUnitario = i.PrecoUnitario,
                Subtotal = i.Subtotal
            }).ToList()
        };
        

    }
}
