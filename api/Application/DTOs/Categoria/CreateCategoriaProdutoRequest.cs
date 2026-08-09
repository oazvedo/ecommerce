using System.Text.Json.Serialization;

namespace api.Application.DTOs.Categoria
{
    public class CreateCategoriaProdutoRequest
    {
        [JsonPropertyName("nome")]
        public string Nome { get; set; } = null!;
    }

    public class UpdateCategoriaProdutoRequest
    {
        [JsonPropertyName("nome")]
        public string Nome { get; set; } = null!;

        [JsonPropertyName("ativo")]
        public bool Ativo { get; set; }
    }
}
