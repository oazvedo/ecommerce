using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Migrations
{
    /// <inheritdoc />
    public partial class AddCargoPermissoes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "cargo_permissoes",
                columns: table => new
                {
                    cargo = table.Column<int>(type: "integer", nullable: false),
                    permissao_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_cargo_permissoes", x => new { x.cargo, x.permissao_id });
                    table.ForeignKey(
                        name: "FK_cargo_permissoes_permissoes_permissao_id",
                        column: x => x.permissao_id,
                        principalTable: "permissoes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_cargo_permissoes_permissao_id",
                table: "cargo_permissoes",
                column: "permissao_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "cargo_permissoes");
        }
    }
}
