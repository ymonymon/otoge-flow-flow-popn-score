using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PopnScoreTool2.Migrations
{
    /// <inheritdoc />
    public partial class CollectedSpellingMistake : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "BrowsingSettingProfileActivitiyTime",
                table: "Profiles",
                newName: "BrowsingSettingProfileActivityTime");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "BrowsingSettingProfileActivityTime",
                table: "Profiles",
                newName: "BrowsingSettingProfileActivitiyTime");
        }
    }
}
