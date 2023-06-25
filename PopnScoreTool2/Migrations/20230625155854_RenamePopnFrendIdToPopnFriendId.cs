using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PopnScoreTool2.Migrations
{
    /// <inheritdoc />
    public partial class RenamePopnFrendIdToPopnFriendId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "PopnFrendId",
                table: "Profiles",
                newName: "PopnFriendId");

            migrationBuilder.RenameColumn(
                name: "BrowsingSettingProfilePopnFrendId",
                table: "Profiles",
                newName: "BrowsingSettingProfilePopnFriendId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "PopnFriendId",
                table: "Profiles",
                newName: "PopnFrendId");

            migrationBuilder.RenameColumn(
                name: "BrowsingSettingProfilePopnFriendId",
                table: "Profiles",
                newName: "BrowsingSettingProfilePopnFrendId");
        }
    }
}
