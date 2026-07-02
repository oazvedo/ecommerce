using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using api.Application.DTOs.Common;
using api.Application.DTOs.Usuario;
using api.application.dtos.usuario;
using api.domain;

namespace api.application.services.interfaces
{
    public interface IUsuarioService
    {
        Task <UsuarioDto?> UpdateEmail (Guid Id, string email);
        Task<UsuarioDto> CreateAsync(Usuario usuario);
        Task<bool> DeleteAsync(Guid id);
        Task<IEnumerable<UsuarioDto>> GetAllAsync();
        Task<PagedResult<UsuarioDto>> GetAllAsync(int page, int pageSize);
        Task<UsuarioDto?> GetByIdAsync(Guid id);
        Task<UsuarioDto?> GetByEmailAsync(string email);
        Task<UsuarioDto?> UpdateAsync(Guid id, UpdateUsuarioRequest request);
        Task<UsuarioDto?> UpdateEmailAsync(Guid id, string email);
        Task<bool> UpdatePasswordAsync(Guid id, string password);
    }
}