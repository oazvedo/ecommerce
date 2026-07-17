using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Migrations
{
    /// <inheritdoc />
    public partial class AddPixRecargas : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "pix_recargas",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    carteira_id = table.Column<Guid>(type: "uuid", nullable: false),
                    abacate_pay_id = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    valor = table.Column<double>(type: "double precision", nullable: false),
                    status = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    criado_em = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    pago_em = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_pix_recargas", x => x.id);
                    table.ForeignKey(
                        name: "FK_pix_recargas_carteiras_carteira_id",
                        column: x => x.carteira_id,
                        principalTable: "carteiras",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_pix_recargas_abacate_pay_id",
                table: "pix_recargas",
                column: "abacate_pay_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_pix_recargas_carteira_id",
                table: "pix_recargas",
                column: "carteira_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "pix_recargas");
        }
    }
}
