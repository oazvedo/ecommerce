using api.application.services.interfaces;
using api.Application.DTOs.Common;
using api.domain.interfaces;

namespace api.application.services
{
    public abstract class ServiceBase<TEntity, TDto> : IServiceBase<TEntity, TDto>
        where TEntity : class
        where TDto : class
    {
        protected readonly IRepositoryBase<TEntity> _repository;

        protected ServiceBase(IRepositoryBase<TEntity> repository)
        {
            _repository = repository;
        }

        protected abstract TDto ToDto(TEntity entity);

        public async Task<IEnumerable<TDto>> GetAllAsync()
        {
            var entities = await _repository.GetAllAsync();
            return entities.Select(ToDto);
        }

        public async Task<PagedResult<TDto>> GetPagedAsync(int page, int pageSize)
        {
            var (entities, totalCount) = await _repository.GetPagedAsync(page, pageSize);
            return new PagedResult<TDto>
            {
                Page = page,
                PageSize = pageSize,
                TotalCount = totalCount,
                Items = entities.Select(ToDto)
            };
        }

        public async Task<TDto?> GetByIdAsync(Guid id)
        {
            var entity = await _repository.GetByIdAsync(id);
            return entity == null ? null : ToDto(entity);
        }

        public async Task<TDto> CreateAsync(TEntity entity)
        {
            var created = await _repository.CreateAsync(entity);
            return ToDto(created);
        }

        public async Task<TDto?> UpdateAsync(TEntity entity)
        {
            var updated = await _repository.UpdateAsync(entity);
            return updated == null ? null : ToDto(updated);
        }

        public async Task<bool> DeleteAsync(Guid id)
            => await _repository.DeleteAsync(id);
    }
}
