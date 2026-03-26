namespace JwtAuthDotNet9.Services
{
    public interface IGenericService<T> where T : class
    {
        Task<T?> CreateAsync(T entity);
        Task<bool> DeleteAsync(Guid id, Guid userId);
        Task<List<T>> GetAllAsync(Guid userId);
    }
}
