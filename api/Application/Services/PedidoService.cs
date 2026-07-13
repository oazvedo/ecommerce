using api.Application.DTOs.Common;
using api.Application.DTOs.Pedido;
using api.Application.Events;
using api.Application.Jobs;
using api.Application.Services.Interfaces;
using api.domain;
using api.domain.interfaces;
using api.Domain;
using api.Domain.Enums;
using api.Domain.Enums.CarteiraEnums;
using api.Domain.Interfaces;
using Hangfire;
using MassTransit;

namespace api.Application.Services
{
    public class PedidoService : IPedidoService
    {
        private readonly IPedidoRepository _repository;
        private readonly IRepositoryBase<Produto> _produtoRepository;
        private readonly ICarteiraRepository _carteiraService;
        private readonly ICarteiraTransacaoRepository _transacaoRepository;
        private readonly IBackgroundJobClient _backgroundJobs;
        private readonly IPublishEndpoint _publishEndpoint;
        private readonly ILogger<PedidoService> _logger;

        public PedidoService(
            IPedidoRepository repository,
            IRepositoryBase<Produto> produtoRepository,
            ICarteiraRepository carteiraService,
            ICarteiraTransacaoRepository transacaoRepository,
            IBackgroundJobClient backgroundJobs,
            IPublishEndpoint publishEndpoint,
            ILogger<PedidoService> logger)
        {
            _repository = repository;
            _produtoRepository = produtoRepository;
            _carteiraService = carteiraService;
            _transacaoRepository = transacaoRepository;
            _backgroundJobs = backgroundJobs;
            _publishEndpoint = publishEndpoint;
            _logger = logger;
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
            var pedido = new Pedido(request.EmpresaId, usuarioId, new List<PedidoItem>(), request.contratacao,
                                    request.FormaPagamento, request.Parcelas);

            foreach (var item in request.itens)
            {
                var produto = await _produtoRepository.GetByIdAsync(item.produtoId)
                    ?? throw new KeyNotFoundException($"Produto '{item.produtoId}' não encontrado.");

                if (produto.Estoque < item.quantidade)
                    throw new InvalidOperationException(
                        $"Estoque insuficiente para '{produto.Nome}'. Disponível: {produto.Estoque}.");

                pedido.AdicionarItem(produto, item.quantidade);
                produto.Estoque -= item.quantidade;
            }
            var carteiraUsuario = await _carteiraService.GetCarteiraByUsuarioId(usuarioId);

            if (request.FormaPagamento == FormaPagamentoEnum.Carteira)
            {
                if (((double)pedido.ValorTotal) > carteiraUsuario!.Saldo)
                    throw new InvalidOperationException("Saldo insuficiente na carteira.");

                carteiraUsuario.UpdateBalance(-(double)pedido.ValorTotal);
                await _carteiraService.UpdateAsync(carteiraUsuario);
                await _transacaoRepository.AddAsync(new CarteiraTransacao(
                    carteiraUsuario.Id, CarteiraTransacaoTipo.Debito, (double)pedido.ValorTotal,
                    $"Pedido #{pedido.Id.ToString()[..8].ToUpper()}", pedido.Id));
            }
            else if (request.FormaPagamento == FormaPagamentoEnum.Parcelado && request.Parcelas.HasValue)
            {
                var numeroParcelas = request.Parcelas.Value;
                var valorParcela = pedido.ValorTotal / numeroParcelas;

                if ((double)valorParcela > carteiraUsuario!.Saldo)
                    throw new InvalidOperationException(
                        $"Saldo insuficiente para a 1ª parcela de {valorParcela:C}. Saldo atual: {carteiraUsuario.Saldo:C}.");

                carteiraUsuario.UpdateBalance(-(double)valorParcela);
                await _carteiraService.UpdateAsync(carteiraUsuario);
                await _transacaoRepository.AddAsync(new CarteiraTransacao(
                    carteiraUsuario.Id, CarteiraTransacaoTipo.Parcela, (double)valorParcela,
                    $"Parcela 1/{numeroParcelas} — Pedido #{pedido.Id.ToString()[..8].ToUpper()}", pedido.Id));

                for (int i = 2; i <= numeroParcelas; i++)
                {
                    var delay = TimeSpan.FromDays(30 * (i - 1));
                    _backgroundJobs.Schedule<PagamentoParcelasJob>(
                        job => job.Executar(pedido.Id, usuarioId, valorParcela, i, numeroParcelas),
                        delay);
                }
            }

            {
                await _repository.AdicionarPedido(pedido);

                var eventoCriado = new PedidoStatusAlteradoEvent
                {
                    PedidoId = pedido.Id,
                    UsuarioId = usuarioId,
                    EmpresaId = pedido.EmpresaId,
                    StatusAnterior = null,
                    StatusNovo = PedidoStatus.Criado,
                    ValorTotal = pedido.ValorTotal,
                    OcorridoEm = DateTime.UtcNow
                };
                await _publishEndpoint.Publish(eventoCriado);
                _logger.LogInformation(
                    "[RabbitMQ] Publicado PedidoStatusAlteradoEvent — pedido {PedidoId} criado, valor R$ {ValorTotal:F2}.",
                    pedido.Id, pedido.ValorTotal);

                return ToDto(pedido);
            }

        }

        public async Task<PedidoDto?> UpdatePedidoStatus(Guid id, PedidoStatus newStatus)
        {
            var pedido = await _repository.GetPedidoById(id);
            if (pedido == null) return null;

            var statusAnterior = pedido.Status;
            pedido.UpdateStatus(newStatus);
            var updated = await _repository.AtualizarPedido(id, pedido);

            if (updated != null)
            {
                var eventoStatus = new PedidoStatusAlteradoEvent
                {
                    PedidoId = id,
                    UsuarioId = pedido.UsuarioId,
                    EmpresaId = pedido.EmpresaId,
                    StatusAnterior = statusAnterior,
                    StatusNovo = newStatus,
                    ValorTotal = pedido.ValorTotal,
                    OcorridoEm = DateTime.UtcNow
                };
                await _publishEndpoint.Publish(eventoStatus);
                _logger.LogInformation(
                    "[RabbitMQ] Publicado PedidoStatusAlteradoEvent — pedido {PedidoId}: {StatusAnterior} → {StatusNovo}.",
                    id, statusAnterior, newStatus);
            }

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

            double valorReembolso;
            if (pedido.FormaPagamento == FormaPagamentoEnum.Parcelado && pedido.Parcelas.HasValue && pedido.Parcelas.Value > 0)
            {
                var valorParcela = pedido.ValorTotal / pedido.Parcelas.Value;
                var diasDecorridos = (DateTime.UtcNow - pedido.CriadoEm).TotalDays;
                var parcelasPagas = Math.Min((int)Math.Floor(diasDecorridos / 30) + 1, pedido.Parcelas.Value);
                valorReembolso = (double)valorParcela * parcelasPagas;
            }
            else
            {
                valorReembolso = (double)pedido.ValorTotal;
            }

            var usuarioId = pedido.UsuarioId;
            var statusAnterior = pedido.Status;

            foreach (var item in pedido.Itens)
            {
                var produto = await _produtoRepository.GetByIdAsync(item.ProdutoId);
                if (produto != null)
                    produto.Estoque += item.Quantidade;
            }

            pedido.CancelarPedido();
            var updated = await _repository.AtualizarPedido(pedidoId, pedido);

            if (updated != null)
            {
                if (valorReembolso > 0)
                {
                    _backgroundJobs.Enqueue<CarteiraReembolsoJob>(
                        job => job.Executar(usuarioId, valorReembolso, pedidoId));
                }

                var eventoCancelado = new PedidoStatusAlteradoEvent
                {
                    PedidoId = pedidoId,
                    UsuarioId = usuarioId,
                    EmpresaId = pedido.EmpresaId,
                    StatusAnterior = statusAnterior,
                    StatusNovo = PedidoStatus.Cancelado,
                    ValorTotal = pedido.ValorTotal,
                    OcorridoEm = DateTime.UtcNow
                };
                await _publishEndpoint.Publish(eventoCancelado);
                _logger.LogInformation(
                    "[RabbitMQ] Publicado PedidoStatusAlteradoEvent — pedido {PedidoId} cancelado, reembolso de R$ {ValorTotal:F2} enfileirado.",
                    pedidoId, pedido.ValorTotal);
            }

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
            FormaPagamento = p.FormaPagamento,
            Parcelas = p.Parcelas,
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
