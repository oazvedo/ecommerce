using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.infra.Migrations
{
    /// <inheritdoc />
    public partial class AddProdutoTipoEContratacao : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "contratacao_permitida",
                table: "produtos",
                type: "integer",
                nullable: false,
                defaultValue: 3);

            migrationBuilder.AddColumn<int>(
                name: "max_parcelas",
                table: "produtos",
                type: "integer",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.AddColumn<int>(
                name: "tipo",
                table: "produtos",
                type: "integer",
                nullable: false,
                defaultValue: 1);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "contratacao_permitida",
                table: "produtos");

            migrationBuilder.DropColumn(
                name: "max_parcelas",
                table: "produtos");

            migrationBuilder.DropColumn(
                name: "tipo",
                table: "produtos");
        }
    }
}
