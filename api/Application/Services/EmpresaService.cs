using api.application.services;
using api.Application.DTOs.Common;
using api.Application.DTOs.Empresa;
using api.Application.DTOs.Produto;
using api.Application.DTOs.Usuario;
using api.Application.Services.Interfaces;
using api.Domain;
using api.Domain.Interfaces;

namespace api.Application.Services
{
    public class EmpresaService : ServiceBase<Empresa, EmpresaDto>, IEmpresaService
    {
        private readonly IEmpresaRepository _empresaRepository;

        public EmpresaService(IEmpresaRepository repository) : base(repository)
        {
            _empresaRepository = repository;
        }

        protected override EmpresaDto ToDto(Empresa entity) => new()
        {
            Id = entity.Id,
            Nome = entity.Nome,
            Cnpj = entity.Cnpj,
            Responsavel = entity.Responsavel,
            ResponsavelId = entity.ResponsavelId,
            Telefone = entity.Telefone,
            Tipo = entity.Tipo,
            Status = entity.Status,
            CriadoEm = entity.CriadoEm,
            AtualizadoEm = entity.AtualizadoEm,
            LogoUrl = entity.LogoUrl,
            EmpresaPaiId = entity.EmpresaPaiId
        };

        public async Task<PagedResult<ProdutoDto>> GetProdutosAsync(Guid empresaId, int page, int pageSize)
        {
            var (items, total) = await _empresaRepository.GetProdutosAsync(empresaId, page, pageSize);
            return new PagedResult<ProdutoDto>
            {
                Page = page,
                PageSize = pageSize,
                TotalCount = total,
                Items = items.Select(p => new ProdutoDto
                {
                    Id = p.Id,
                    Nome = p.Nome,
                    Descricao = p.Descricao,
                    Codigo = p.Codigo,
                    Status = p.Status,
                    Preco = p.Preco,
                    CriadoEm = p.CriadoEm,
                    AtualizadoEm = p.AtualizadoEm,
                    EmpresaId = p.EmpresaId,
                    ImagemUrl = p.ImagemUrl
                })
            };
        }

        public async Task<PagedResult<UsuarioDto>> GetUsuariosAsync(Guid empresaId, int page, int pageSize)
        {
            var (items, total) = await _empresaRepository.GetUsuariosAsync(empresaId, page, pageSize);
            return new PagedResult<UsuarioDto>
            {
                Page = page,
                PageSize = pageSize,
                TotalCount = total,
                Items = items.Select(u => new UsuarioDto
                {
                    Id = u.Id,
                    Nome = u.Nome,
                    Email = u.Email,
                    Status = u.Status.ToString(),
                    Cargo = u.Cargo.ToString(),
                    CriadoEm = u.CriadoEm,
                    AtualizadoEm = u.AtualizadoEm,
                    EmpresaId = u.EmpresaId,
                    FotoUrl = u.FotoUrl
                })
            };
        }

        public async Task<PagedResult<EmpresaDto>> GetFiliaisAsync(Guid empresaPaiId, int page, int pageSize)
        {
            var (items, total) = await _empresaRepository.GetFiliaisAsync(empresaPaiId, page, pageSize);
            return new PagedResult<EmpresaDto>
            {
                Page = page,
                PageSize = pageSize,
                TotalCount = total,
                Items = items.Select(ToDto)
            };
        }

        public async Task<bool> PodeGerenciarAsync(Guid usuarioEmpresaId, Guid targetEmpresaId)
        {
            // A própria empresa sempre pode gerenciar a si mesma.
            if (usuarioEmpresaId == targetEmpresaId) return true;

            // 1 nível: a central gerencia suas filiais diretas.
            var target = await _repository.GetByIdAsync(targetEmpresaId);
            return target?.EmpresaPaiId == usuarioEmpresaId;
        }

        public Task<bool> AdicionarUsuarioAsync(Guid empresaId, Guid usuarioId)
            => _empresaRepository.AdicionarUsuarioAsync(empresaId, usuarioId);

        public Task<bool> DeleteComCascadeAsync(Guid empresaId)
            => _empresaRepository.DeleteComCascadeAsync(empresaId);

        public async Task<EmpresaDto?> UpdateCamposAsync(Guid id, UpdateEmpresaRequest request)
        {
            var entity = await _empresaRepository.UpdateCamposAsync(id, request.Nome, request.Cnpj, request.Responsavel, request.ResponsavelId, request.Telefone, request.Tipo, request.Status, request.EmpresaPaiId);
            return entity == null ? null : ToDto(entity);
        }

        public async Task AtualizarLogoAsync(Guid id, string url)
        {
            var empresa = await _repository.GetByIdAsync(id);
            if (empresa == null) return;
            empresa.LogoUrl = url;
            await _repository.UpdateAsync(empresa);
        }
    }
}
