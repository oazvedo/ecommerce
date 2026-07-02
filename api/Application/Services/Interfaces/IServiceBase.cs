using api.Application.DTOs.Common;

namespace api.application.services.interfaces
{
    public interface IServiceBase<TEntity, TDto>
        where TEntity : class
        where TDto : class
    {
        Task<IEnumerable<TDto>> GetAllAsync();
        Task<PagedResult<TDto>> GetPagedAsync(int page, int pageSize);
        Task<TDto?> GetByIdAsync(Guid id);
        Task<TDto> CreateAsync(TEntity entity);
        Task<TDto?> UpdateAsync(TEntity entity);
        Task<bool> DeleteAsync(Guid id);
    }
}
