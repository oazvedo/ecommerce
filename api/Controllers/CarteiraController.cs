using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using api.Application.DTOs.Carteira;
using api.Application.Services;
using api.Application.Services.Interfaces;
using api.Application.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CarteiraController(ICarteiraService service) : ControllerBase
    {
        private readonly ICarteiraService _service = service;


        [HttpGet]
        [Authorize(Policy = "Carteira.Read")]
        public async Task <IActionResult> GetAllCarteiras([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 10;

            var result = await _service.GetPagedAsync(page, pageSize);
            return Ok(result);
        }

        [HttpGet("minha-carteira")]
        [Authorize(Policy = "Carteira.Read")]
        public async Task <IActionResult> GetMyCarteira()
        {
            var usuarioId = User.GetId();
            var result = await _service.GetMyCarteiraAsync(usuarioId);
            if (result == null)
                return NotFound();
            return Ok(result);
        }


        [HttpGet("{id}")]
        [Authorize(Policy = "Carteira.Read")]
        public async Task <IActionResult> GetById(Guid id)
        {
            var result = await _service.GetByIdAsync(id);
            if (result == null)
                return NotFound();
            return Ok(result);
        }

        [HttpPut("{id}")]
        [Authorize(Policy = "Carteira.Update")]
        public async Task <IActionResult> Update(Guid id, UpdateCarteiraRequest request)
        {
            var updated = await _service.UpdateCarteira(id, request);
            return Ok(updated);
        }
        
    }
}