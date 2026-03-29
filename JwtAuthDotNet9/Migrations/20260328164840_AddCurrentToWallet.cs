using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JwtAuthDotNet9.Migrations
{
    /// <inheritdoc />
    public partial class AddCurrentToWallet : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "Current",
                table: "WalletInformation",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Current",
                table: "WalletInformation");
        }
    }
}
