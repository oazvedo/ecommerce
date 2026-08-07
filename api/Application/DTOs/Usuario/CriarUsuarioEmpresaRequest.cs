using System.Text.Json.Serialization;

namespace api.application.dtos.usuario
{
    /// <summary>
    /// Criação de um usuário diretamente dentro de uma empresa gerenciada
    /// (a empresa vem da rota; o cargo é validado pelo servidor).
    /// </summary>
    public class CriarUsuarioEmpresaRequest
    {
        [JsonPropertyName("nome")]
        public required string Nome { get; set; }

        [JsonPropertyName("email")]
        public required string Email { get; set; }

        [JsonPropertyName("password")]
        public required string Password { get; set; }

        [JsonPropertyName("cargo")]
        public string Cargo { get; set; } = "Operador";
    }
}
