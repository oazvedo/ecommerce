using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.infra.Migrations
{
    /// <inheritdoc />
    public partial class AddCategoriaProdutoTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "categoria",
                table: "produtos");

            migrationBuilder.AddColumn<Guid>(
                name: "categoria_id",
                table: "produtos",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "categorias_produto",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    nome = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ativo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    criado_em = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_categorias_produto", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_produtos_categoria_id",
                table: "produtos",
                column: "categoria_id");

            migrationBuilder.CreateIndex(
                name: "IX_categorias_produto_nome",
                table: "categorias_produto",
                column: "nome",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_produtos_categorias_produto_categoria_id",
                table: "produtos",
                column: "categoria_id",
                principalTable: "categorias_produto",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_produtos_categorias_produto_categoria_id",
                table: "produtos");

            migrationBuilder.DropTable(
                name: "categorias_produto");

            migrationBuilder.DropIndex(
                name: "IX_produtos_categoria_id",
                table: "produtos");

            migrationBuilder.DropColumn(
                name: "categoria_id",
                table: "produtos");

            migrationBuilder.AddColumn<string>(
                name: "categoria",
                table: "produtos",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);
        }
    }
}
