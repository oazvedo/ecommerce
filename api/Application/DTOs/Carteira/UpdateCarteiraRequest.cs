using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace api.Application.DTOs.Carteira
{
    public class UpdateCarteiraRequest
    {
        [JsonPropertyName("saldo")]
        public double Saldo {get; set;}
        [JsonPropertyName("cupom")]
        public string? Cupom {get; set;}
    }
}