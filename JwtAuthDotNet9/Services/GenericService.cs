using JwtAuthDotNet9.Data;
using JwtAuthDotNet9.Services.IServico;
using Microsoft.EntityFrameworkCore;

namespace JwtAuthDotNet9.Services
{
    public class GenericService<T>(UserDbContext context) : IGenericService<T> where T : class
    {
        protected readonly UserDbContext _context = context;
        protected readonly DbSet<T> _dbSet = context.Set<T>();

        public async Task<T?> CreateAsync(T entity)
        {
            if (entity is null)
                return null;

            _dbSet.Add(entity);
            await _context.SaveChangesAsync();

            return entity;
        }

        public async Task<bool> DeleteAsync(Guid id, Guid userId)
        {
            var entity = await _dbSet.FindAsync(id);

            if (entity is null)
                return false;

            // 🔥 tenta pegar propriedade UserId dinamicamente
            var userIdProp = entity.GetType().GetProperty("UserId");

            if (userIdProp is not null)
            {
                var value = userIdProp.GetValue(entity);

                if (value is not Guid entityUserId || entityUserId != userId)
                    return false;
            }

            _dbSet.Remove(entity);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<List<T>> GetAllAsync(Guid userId)
        {
            // 🔥 filtrar por UserId dinamicamente
            return await _dbSet
                .Where(e => EF.Property<Guid>(e, "UserId") == userId)
                .ToListAsync();
        }
    }
}
