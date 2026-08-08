using api.domain;

namespace api.Domain
{
    public class Avaliacao
    {
        public Guid Id { get; set; }
        public Guid? ProdutoId { get; set; }
        public Guid? EmpresaId { get; set; }
        public Guid UsuarioId { get; set; }
        public int Nota { get; set; }
        public string? Comentario { get; set; }
        public DateTime CriadoEm { get; set; }
        public DateTime? AtualizadoEm { get; set; }

        public Usuario? Usuario { get; set; }

        public Avaliacao() { }

        public Avaliacao(Guid? produtoId, Guid? empresaId, Guid usuarioId, int nota, string? comentario)
        {
            Id = Guid.NewGuid();
            UsuarioId = usuarioId;
            CriadoEm = DateTime.UtcNow;
            Validar(produtoId, empresaId, nota);
            ProdutoId = produtoId;
            EmpresaId = empresaId;
            Nota = nota;
            Comentario = comentario;
        }

        // Usado no upsert: mesmo usuário reavaliando o mesmo produto/loja atualiza a nota existente.
        public void AtualizarConteudo(int nota, string? comentario)
        {
            Validar(ProdutoId, EmpresaId, nota);
            Nota = nota;
            Comentario = comentario;
            AtualizadoEm = DateTime.UtcNow;
        }

        private static void Validar(Guid? produtoId, Guid? empresaId, int nota)
        {
            if (produtoId.HasValue == empresaId.HasValue)
                throw new InvalidOperationException("Informe produtoId OU empresaId, nunca os dois nem nenhum.");

            if (nota < 1 || nota > 5)
                throw new InvalidOperationException("Nota deve estar entre 1 e 5.");
        }
    }
}
