namespace api.Application.DTOs.Common
{
    public class PagedResult<T>
    {
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalCount { get; set; }
        public int TotalPages => PageSize > 0 ? (int)Math.Ceiling(TotalCount / (double)PageSize) : 0;
        public IEnumerable<T> Items { get; set; } = Enumerable.Empty<T>();
    }
}
