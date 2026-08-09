using System.Diagnostics.CodeAnalysis;

namespace api.Domain
{
    public class CategoriaProduto
    {
        public Guid Id { get; set; }
        public required string Nome { get; set; }
        public bool Ativo { get; set; }
        public DateTime CriadoEm { get; set; }

        public CategoriaProduto() { }

        [SetsRequiredMembers]
        public CategoriaProduto(string nome)
        {
            Id = Guid.NewGuid();
            Nome = nome;
            Ativo = true;
            CriadoEm = DateTime.UtcNow;
            Validar();
        }

        public void Atualizar(string nome, bool ativo)
        {
            Nome = nome;
            Ativo = ativo;
            Validar();
        }

        public void Validar()
        {
            if (string.IsNullOrWhiteSpace(Nome))
                throw new InvalidOperationException("Nome da categoria não pode estar vazio.");
        }
    }
}
