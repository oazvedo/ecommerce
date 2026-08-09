using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.infra.Migrations
{
    /// <inheritdoc />
    public partial class MultipleAvaliations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_avaliacoes_usuario_id_empresa_id",
                table: "avaliacoes");

            migrationBuilder.DropIndex(
                name: "IX_avaliacoes_usuario_id_produto_id",
                table: "avaliacoes");

            migrationBuilder.CreateIndex(
                name: "IX_avaliacoes_usuario_id",
                table: "avaliacoes",
                column: "usuario_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_avaliacoes_usuario_id",
                table: "avaliacoes");

            migrationBuilder.CreateIndex(
                name: "IX_avaliacoes_usuario_id_empresa_id",
                table: "avaliacoes",
                columns: new[] { "usuario_id", "empresa_id" },
                unique: true,
                filter: "empresa_id IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_avaliacoes_usuario_id_produto_id",
                table: "avaliacoes",
                columns: new[] { "usuario_id", "produto_id" },
                unique: true,
                filter: "produto_id IS NOT NULL");
        }
    }
}
