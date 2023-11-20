using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PopnScoreTool2.Migrations
{
    /// <inheritdoc />
    public partial class AddMusicsColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "AddDate",
                table: "Musics",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "ArtistsName",
                table: "Musics",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedDate",
                table: "Musics",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "DetailedBPM",
                table: "Musics",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "DisplayedBPM",
                table: "Musics",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "LPFlag",
                table: "Musics",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "MaxBPM",
                table: "Musics",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "MinBPM",
                table: "Musics",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AddDate",
                table: "Musics");

            migrationBuilder.DropColumn(
                name: "ArtistsName",
                table: "Musics");

            migrationBuilder.DropColumn(
                name: "DeletedDate",
                table: "Musics");

            migrationBuilder.DropColumn(
                name: "DetailedBPM",
                table: "Musics");

            migrationBuilder.DropColumn(
                name: "DisplayedBPM",
                table: "Musics");

            migrationBuilder.DropColumn(
                name: "LPFlag",
                table: "Musics");

            migrationBuilder.DropColumn(
                name: "MaxBPM",
                table: "Musics");

            migrationBuilder.DropColumn(
                name: "MinBPM",
                table: "Musics");
        }
    }
}
