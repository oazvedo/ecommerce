namespace api.Domain.Enums
{
    /// <summary>
    /// Contratacoes (<see cref="PedidoTipoContratacaoEnum"/>) que a loja aceita
    /// para o produto. Aplicado na criacao do pedido pela issue #53.
    /// </summary>
    public enum ProdutoContratacaoPermitidaEnum
    {
        Mensal = 1,
        Anual = 2,
        Ambas = 3
    }
}
