using api.domain;
using api.Domain.Enums;
using Newtonsoft.Json;

namespace api.Domain
{
    public class Pedido
    {
        [JsonProperty("id")]
        public Guid Id { get; set; }

        [JsonProperty("status")]
        public PedidoStatus Status { get; set; }

        [JsonProperty("contratacao")]
        public PedidoTipoContratacaoEnum Contracacao { get; set; }

        [JsonProperty("usuario_id")]
        public Guid UsuarioId { get; set; }

        [JsonProperty("usuario")]
        public Usuario? Usuario { get; set; }

        [JsonProperty("itens")]
        public List<PedidoItem> Itens { get; set; } = new();

        [JsonProperty("valor_total")]
        public decimal ValorTotal => Itens.Sum(i => i.Subtotal);

        [JsonProperty("criado_em")]
        public DateTime CriadoEm { get; set; }

        [JsonProperty("atualizado_em")]
        public DateTime? AtualizadoEm { get; set; }

        public Pedido() { }

        public Pedido(Guid usuarioId, List<PedidoItem> itens, PedidoTipoContratacaoEnum contratacao)
        {
            Id = Guid.NewGuid();
            Status = PedidoStatus.Criado;
            Contracacao = contratacao;
            UsuarioId = usuarioId;
            Itens = itens;
            CriadoEm = DateTime.UtcNow;
        }

        public void AdicionarItem(Produto produto, int quantidade)
        {
            var itemExistente = Itens.FirstOrDefault(i => i.ProdutoId == produto.Id);
            if (itemExistente != null)
                itemExistente.Quantidade += quantidade;
            else
                Itens.Add(new PedidoItem(Id, produto, quantidade));
            AtualizadoEm = DateTime.UtcNow;
        }

        public void RemoverItem(Guid produtoId)
        {
            var item = Itens.FirstOrDefault(i => i.ProdutoId == produtoId)
                ?? throw new InvalidOperationException("Produto não encontrado no pedido.");
            Itens.Remove(item);
            AtualizadoEm = DateTime.UtcNow;
        }

        public void UpdatePedido(PedidoTipoContratacaoEnum newContratacao, PedidoStatus newStatus)
        {
            ValidarStatus();
            Status = newStatus;
            Contracacao = newContratacao;
            AtualizadoEm = DateTime.UtcNow;
        }

        public void UpdateStatus(PedidoStatus novoStatus)
        {
            ValidarStatus();
            Status = novoStatus;
            AtualizadoEm = DateTime.UtcNow;
        }

        public void UpdateContratacao(PedidoTipoContratacaoEnum novaContratacao)
        {
            ValidarStatus();
            Contracacao = novaContratacao;
            AtualizadoEm = DateTime.UtcNow;
        }

        private void ValidarStatus()
        {
            if (Status == PedidoStatus.Cancelado)
                throw new InvalidOperationException("Pedidos cancelados não podem ter atualização de status");
        }

        public void CancelarPedido()
        {
            ValidarPedidoPodeSerCancelado();
            Status = PedidoStatus.Cancelado;
            AtualizadoEm = DateTime.UtcNow;
        }

        private void ValidarPedidoPodeSerCancelado()
        {
            if (Status == PedidoStatus.Cancelado)
                throw new InvalidOperationException("Pedido já está cancelado.");

            if (Status == PedidoStatus.Finalizado)
                throw new InvalidOperationException("Pedidos finalizados não podem ser cancelados.");

        }
    }
}
