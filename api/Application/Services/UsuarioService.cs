using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using api.Application.DTOs.Common;
using api.application.dtos.usuario;
using api.application.services.interfaces;
using api.Application.DTOs.Usuario;
using api.domain;
using api.domain.interfaces;

namespace api.application.services
{
    public class UsuarioService : IUsuarioService
    {
        private readonly IUsuarioRepository _repository;

        public UsuarioService(IUsuarioRepository repository)
        {
            _repository = repository;
        }

        public async Task<UsuarioDto> CreateAsync(Usuario usuario)
        {
            await _repository.CreateAsync(usuario);
            return await Task.FromResult(new UsuarioDto
            {
                Id = usuario.Id,
                Nome = usuario.Nome,
                Email = usuario.Email,
                CriadoEm = usuario.CriadoEm,
                AtualizadoEm = usuario.AtualizadoEm,
                Status = usuario.Status.ToString(),
                Cargo = usuario.Cargo.ToString(),
                EmpresaId = usuario.EmpresaId,
                FotoUrl = usuario.FotoUrl
            });
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            await _repository.DeleteAsync(id);
            return await Task.FromResult(true);}

        public async Task<IEnumerable<UsuarioDto>> GetAllAsync()
        {
            var usuarios = await _repository.GetAllAsync();
            return usuarios.Select(ToDto);
        }

        public async Task<PagedResult<UsuarioDto>> GetAllAsync(int page, int pageSize)
        {
            var (usuarios, totalCount) = await _repository.GetPagedAsync(page, pageSize);
            return new PagedResult<UsuarioDto>
            {
                Page = page,
                PageSize = pageSize,
                TotalCount = totalCount,
                Items = usuarios.Select(ToDto)
            };
        }

        public async Task<UsuarioDto?> GetByEmailAsync(string email)
        {
            var usuario = await _repository.GetByEmailAsync(email);
            if (usuario == null) return null;

            return ToDto(usuario);
        }

        public async Task<UsuarioDto?> GetByIdAsync(Guid id)
        {
            var usuario = await _repository.GetByIdAsync(id);
            if (usuario == null) return null;

            return ToDto(usuario);
        }

        public async Task<UsuarioDto?> UpdateAsync(Guid id, UpdateUsuarioRequest request)
        {
            var usuario = await _repository.GetByIdAsync(id);
            if (usuario == null) return null;

            usuario.Nome = request.Nome;
            usuario.Email = request.Email;
            if (request.Cargo.HasValue)
                usuario.Cargo = request.Cargo.Value;
            usuario.AtualizadoEm = DateTime.UtcNow;

            await _repository.UpdateAsync(usuario);
            return ToDto(usuario);
        }

        public async Task<UsuarioDto?> UpdateEmail(Guid Id, string email)
        {
            var usuario = await _repository.GetByIdAsync(Id);
            if (usuario == null)
            {
                throw new Exception("Usuário não encontrado");
            }
            usuario.Email = email;
            await _repository.UpdateAsync(usuario);
            return await Task.FromResult(ToDto(usuario));
        }

        public async Task<UsuarioDto?> UpdateEmailAsync(Guid id, string email)
        {
            var usuario = await _repository.GetByIdAsync(id);
            if (usuario == null)
            {
                throw new Exception("Usuário não encontrado");
            }
            usuario.Email = email;
            await _repository.UpdateAsync(usuario);
            return await Task.FromResult(new UsuarioDto
            {
                Id = usuario.Id,
                Nome = usuario.Nome,
                Email = usuario.Email,
                CriadoEm = usuario.CriadoEm,
                AtualizadoEm = usuario.AtualizadoEm,
                Status = usuario.Status.ToString(),
                Cargo = usuario.Cargo.ToString(),
                EmpresaId = usuario.EmpresaId,
                FotoUrl = usuario.FotoUrl
            });
        }

        public async Task AtualizarFotoAsync(Guid id, string url)
        {
            var usuario = await _repository.GetByIdAsync(id);
            if (usuario == null) return;
            usuario.FotoUrl = url;
            await _repository.UpdateAsync(usuario);
        }

        public Task<bool> UpdatePasswordAsync(Guid id, string password)
            => _repository.UpdatePasswordAsync(id, password);

        public async Task<bool> UpdateStatusAsync(Guid id, api.domain.enums.UsuarioStatus status)
        {
            var usuario = await _repository.GetByIdAsync(id);
            if (usuario == null) return false;
            usuario.UpdateStatus(status);
            await _repository.UpdateAsync(usuario);
            return true;
        }

        
        private static UsuarioDto ToDto(Usuario u) => new()
        {
            Id = u.Id,
            Nome = u.Nome,
            Email = u.Email,
            CriadoEm = u.CriadoEm,
            AtualizadoEm = u.AtualizadoEm,
            Status = u.Status.ToString(),
            Cargo = u.Cargo.ToString(),
            EmpresaId = u.EmpresaId,
            FotoUrl = u.FotoUrl
        };
        
    }
}