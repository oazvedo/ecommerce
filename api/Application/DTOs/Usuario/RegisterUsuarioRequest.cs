namespace api.application.dtos.usuario
{
    /// <summary>
    /// Auto-cadastro público de cliente no marketplace. Cargo e empresa são
    /// definidos pelo servidor (Cliente + empresa padrão) — nunca pelo cliente.
    /// </summary>
    public class RegisterUsuarioRequest
    {
        public required string Nome { get; set; }
        public required string Email { get; set; }
        public required string Password { get; set; }
    }
}
