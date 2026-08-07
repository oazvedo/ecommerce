namespace api.Domain.Interfaces
{
    /// <summary>
    /// Executa um bloco de trabalho dentro de uma única transação de banco.
    /// Se o bloco lançar, tudo é revertido (rollback); caso contrário, commit.
    /// </summary>
    public interface IUnitOfWork
    {
        Task<T> ExecuteInTransactionAsync<T>(Func<Task<T>> action, CancellationToken cancellationToken = default);
    }
}
