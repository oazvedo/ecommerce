using api.application.services;
using api.Application.DTOs.Produto;
using api.Application.Services.Interfaces;
using api.Domain;
using api.Domain.Interfaces;

namespace api.Application.Services
{
    public class ProdutoService : ServiceBase<Produto, ProdutoDto>, IProdutoService
    {
        public ProdutoService(IProdutoRepository repository) : base(repository) { }

        protected override ProdutoDto ToDto(Produto entity) => new()
        {
            Id = entity.Id,
            Nome = entity.Nome,
            Descricao = entity.Descricao,
            Codigo = entity.Codigo,
            Status = entity.Status,
            Preco = entity.Preco,
            CriadoEm = entity.CriadoEm,
            AtualizadoEm = entity.AtualizadoEm,
            EmpresaId = entity.EmpresaId,
            ImagemUrl = entity.ImagemUrl,
            Estoque = entity.Estoque,
            FreteGratis = entity.FreteGratis,
            Variantes = entity.Variantes
        };

        public async Task<ProdutoDto?> UpdateAsync(Guid id, UpdateProdutoRequest request)
        {
            var produto = await _repository.GetByIdAsync(id);
            if (produto == null) return null;

            produto.AtualizarProduto(request.Nome, request.Descricao, request.Status, request.Codigo, request.Preco, request.Estoque, request.FreteGratis, request.Variantes);
            await _repository.UpdateAsync(produto);
            return ToDto(produto);
        }

        public async Task AtualizarImagemAsync(Guid id, string url)
        {
            var produto = await _repository.GetByIdAsync(id);
            if (produto == null) return;
            produto.ImagemUrl = url;
            produto.AtualizadoEm = DateTime.UtcNow;
            await _repository.UpdateAsync(produto);
        }
    }
}
