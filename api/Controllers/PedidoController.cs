using api.Application.DTOs.Common;
using api.Application.DTOs.Pedido;
using api.Application.DTOs.Pedido.Relatorio;
using api.Application.Handlers.Relatorio;
using api.Application.Services.Interfaces;
using api.Application.Utils;
using api.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PedidoController : ControllerBase
    {
        private readonly IPedidoService _service;
        private readonly RelatorioPedidosHandler _handler;

        public PedidoController(IPedidoService service, RelatorioPedidosHandler handler)
        {
            _service = service;
            _handler = handler;
        }

        [HttpGet("relatorio")]
        [Authorize(Policy = "Pedido.Read")]
        public async Task<ActionResult<RelatorioPedidoResponse>> GetRelatorio([FromQuery] RelatorioPedidoRequest request)
        {
            try
            {
                var relatorio = await _handler.Handle(request);
                return Ok(relatorio);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = ex.Message });
            }
        }

        [HttpGet("relatorio/csv")]
        [Authorize(Policy = "Pedido.Read")]
        public async Task<IActionResult> GetRelatorioCsv([FromQuery] RelatorioPedidoRequest request)
        {
            try
            {
                var pedidos = await _service.GetPedidosByPeriodo(request.DataInicio, request.DataFim);
                var csv = PedidoCsvExporter.ToCsv(pedidos);
                var fileName = $"relatorio-pedidos-{request.DataInicio:yyyy-MM-dd}-a-{request.DataFim:yyyy-MM-dd}.csv";
                return File(csv, "text/csv", fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = ex.Message });
            }
        }

        [HttpGet]
        [Authorize(Policy = "Pedido.Read")]
        public async Task<ActionResult<PagedResult<PedidoDto>>> GetAll([FromQuery] PedidoFiltroRequest filtro)
        {
            try
            {
                if (filtro.Page < 1) filtro.Page = 1;
                if (filtro.PageSize < 1) filtro.PageSize = 10;

                var pedidos = await _service.GetAllPedidos(filtro);
                return Ok(pedidos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = ex.Message });
            }
        }

        [HttpGet("{id}")]
        [Authorize(Policy = "Pedido.Read")]
        public async Task<ActionResult<PedidoDto>> GetById(Guid id)
        {
            try
            {
                var pedido = await _service.GetPedidoById(id);
                if (pedido == null)
                    return NotFound(new { mensagem = "Pedido não encontrado." });

                return Ok(pedido);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = ex.Message });
            }
        }

        [HttpGet("empresa/minha-empresa")]
        [Authorize(Policy = "Pedido.Read")]
        public async Task <ActionResult<PagedResult<PedidoDto>>> GetByMinhaEmpresa([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                if (page < 1) page = 1;
                if (pageSize < 1) pageSize = 10;

                var empresaId = User.GetEmpresaId();
                var pedidos = await _service.GetPedidosByEmpresaId(empresaId, page, pageSize);
                return Ok(pedidos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = ex.Message });
            }
        }


        [HttpGet("empresa/{empresaId}")]
        [Authorize(Policy = "Pedido.Read")]
        public async Task<ActionResult<PagedResult<PedidoDto>>> GetByEmpresa(Guid empresaId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                if (page < 1) page = 1;
                if (pageSize < 1) pageSize = 10;

                var pedidos = await _service.GetPedidosByEmpresaId(empresaId, page, pageSize);
                return Ok(pedidos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = ex.Message });
            }
        }

        [HttpGet("empresa/cnpj/{cnpj}")]
        [Authorize(Policy = "Pedido.Read")]
        public async Task<ActionResult<PagedResult<PedidoDto>>> GetByEmpresaCNPJ (string cnpj, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                if (page < 1) page = 1;
                if (pageSize < 1) pageSize = 10;

                var pedidos = await _service.GetByEmpresaCNPJ(cnpj, page, pageSize);
                return Ok(pedidos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = ex.Message });
            }
        }


        [HttpGet("usuario/{usuarioId}")]
        [Authorize(Policy = "Pedido.Read")]
        public async Task<ActionResult<PagedResult<PedidoDto>>> GetByUsuario(Guid usuarioId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                if (page < 1) page = 1;
                if (pageSize < 1) pageSize = 10;

                var pedidos = await _service.GetPedidosByUsuarioId(usuarioId, page, pageSize);
                return Ok(pedidos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = ex.Message });
            }
        }

        [HttpGet("meus")]
        [Authorize(Policy = "Pedido.Read")]
        public async Task<ActionResult<PagedResult<PedidoDto>>> GetMeus([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                if (page < 1) page = 1;
                if (pageSize < 1) pageSize = 10;

                var usuarioId = User.GetId();
                var pedidos = await _service.GetPedidosByUsuarioId(usuarioId, page, pageSize);
                return Ok(pedidos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = ex.Message });
            }
        }

        [HttpPost]
        [Authorize(Policy = "Pedido.Create")]
        public async Task<ActionResult<IReadOnlyList<PedidoDto>>> Create(CreatePedidoRequest request)
        {
            try
            {
                var usuarioId = User.GetId();
                // Carrinho multi-loja gera um pedido por loja vendedora.
                var pedidos = await _service.CreatePedido(usuarioId, request);
                return StatusCode(201, pedidos);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { mensagem = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { mensagem = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Policy = "Pedido.UpdateAdmin")]
        public async Task<IActionResult> UpdatePedido(Guid id, UpdatePedidoRequest request)
        {
            try
            {
                var pedido = await _service.UpdatePedido(id, request);
                if (pedido == null)
                    return NotFound(new { mensagem = "Pedido não encontrado." });
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = ex.Message });
            }
        }

        [HttpPatch("{id}/status")]
        [Authorize(Policy = "Pedido.Update")]
        public async Task<ActionResult<PedidoDto>> UpdateStatus(Guid id, UpdateStatusPedidoRequest request)
        {
            try
            {
                var pedido = await _service.UpdatePedidoStatus(id, request.Status);
                if (pedido == null)
                    return NotFound(new { mensagem = "Pedido não encontrado." });

                return Ok(pedido);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { mensagem = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = ex.Message });
            }
        }

        [HttpPatch("{id}/contratacao")]
        [Authorize(Policy = "Pedido.Update")]
        public async Task<IActionResult> Update(Guid id, PutPedidoRequest request)
        {
            try
            {
                var pedido = await _service.UpdatePedidoContratacao(id, request.Contratacao);
                if (pedido == null)
                    return NotFound(new { mensagem = "Pedido não encontrado." });

                return Ok(pedido);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { mensagem = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "Pedido.Delete")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                var removido = await _service.DeleteAsync(id);
                if (!removido)
                    return NotFound(new { mensagem = "Pedido não encontrado." });

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = ex.Message });
            }
        }

        [HttpPost("cancelar")]
        [Authorize]
        public async Task<IActionResult> Cancelar(Guid id)
        {
            try
            {
                // Só o dono do pedido cancela; gestores precisam de Pedido.Update.
                var existente = await _service.GetPedidoById(id);
                if (existente == null)
                    return NotFound(new { mensagem = "Pedido não encontrado." });
                if (existente.UsuarioId != User.GetId() && !User.HasPermissao("Pedido.Update"))
                    return Forbid();

                var pedido = await _service.CancelarPedido(id);
                if (pedido == null)
                    return NotFound(new { mensagem = "Pedido não encontrado." });

                return Ok(pedido);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { mensagem = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = ex.Message });
            }
        }
    }
}
