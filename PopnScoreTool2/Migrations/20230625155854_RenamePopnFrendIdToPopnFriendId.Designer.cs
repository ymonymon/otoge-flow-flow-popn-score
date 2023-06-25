﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using PopnScoreTool2.Data;

#nullable disable

namespace PopnScoreTool2.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20230625155854_RenamePopnFrendIdToPopnFriendId")]
    partial class RenamePopnFrendIdToPopnFriendId
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "7.0.8")
                .HasAnnotation("Relational:MaxIdentifierLength", 128);

            SqlServerModelBuilderExtensions.UseIdentityColumns(modelBuilder);

            modelBuilder.Entity("Microsoft.AspNetCore.DataProtection.EntityFrameworkCore.DataProtectionKey", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<string>("FriendlyName")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Xml")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.ToTable("DataProtectionKeys");
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityRole", b =>
                {
                    b.Property<string>("Id")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("ConcurrencyStamp")
                        .IsConcurrencyToken()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Name")
                        .HasMaxLength(256)
                        .HasColumnType("nvarchar(256)");

                    b.Property<string>("NormalizedName")
                        .HasMaxLength(256)
                        .HasColumnType("nvarchar(256)");

                    b.HasKey("Id");

                    b.HasIndex("NormalizedName")
                        .IsUnique()
                        .HasDatabaseName("RoleNameIndex")
                        .HasFilter("[NormalizedName] IS NOT NULL");

                    b.ToTable("AspNetRoles", (string)null);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityRoleClaim<string>", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<string>("ClaimType")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("ClaimValue")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("RoleId")
                        .IsRequired()
                        .HasColumnType("nvarchar(450)");

                    b.HasKey("Id");

                    b.HasIndex("RoleId");

                    b.ToTable("AspNetRoleClaims", (string)null);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUser", b =>
                {
                    b.Property<string>("Id")
                        .HasColumnType("nvarchar(450)");

                    b.Property<int>("AccessFailedCount")
                        .HasColumnType("int");

                    b.Property<string>("ConcurrencyStamp")
                        .IsConcurrencyToken()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Email")
                        .HasMaxLength(256)
                        .HasColumnType("nvarchar(256)");

                    b.Property<bool>("EmailConfirmed")
                        .HasColumnType("bit");

                    b.Property<bool>("LockoutEnabled")
                        .HasColumnType("bit");

                    b.Property<DateTimeOffset?>("LockoutEnd")
                        .HasColumnType("datetimeoffset");

                    b.Property<string>("NormalizedEmail")
                        .HasMaxLength(256)
                        .HasColumnType("nvarchar(256)");

                    b.Property<string>("NormalizedUserName")
                        .HasMaxLength(256)
                        .HasColumnType("nvarchar(256)");

                    b.Property<string>("PasswordHash")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("PhoneNumber")
                        .HasColumnType("nvarchar(max)");

                    b.Property<bool>("PhoneNumberConfirmed")
                        .HasColumnType("bit");

                    b.Property<string>("SecurityStamp")
                        .HasColumnType("nvarchar(max)");

                    b.Property<bool>("TwoFactorEnabled")
                        .HasColumnType("bit");

                    b.Property<string>("UserName")
                        .HasMaxLength(256)
                        .HasColumnType("nvarchar(256)");

                    b.HasKey("Id");

                    b.HasIndex("NormalizedEmail")
                        .HasDatabaseName("EmailIndex");

                    b.HasIndex("NormalizedUserName")
                        .IsUnique()
                        .HasDatabaseName("UserNameIndex")
                        .HasFilter("[NormalizedUserName] IS NOT NULL");

                    b.ToTable("AspNetUsers", (string)null);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserClaim<string>", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<string>("ClaimType")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("ClaimValue")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("UserId")
                        .IsRequired()
                        .HasColumnType("nvarchar(450)");

                    b.HasKey("Id");

                    b.HasIndex("UserId");

                    b.ToTable("AspNetUserClaims", (string)null);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserLogin<string>", b =>
                {
                    b.Property<string>("LoginProvider")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("ProviderKey")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("ProviderDisplayName")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("UserId")
                        .IsRequired()
                        .HasColumnType("nvarchar(450)");

                    b.HasKey("LoginProvider", "ProviderKey");

                    b.HasIndex("UserId");

                    b.ToTable("AspNetUserLogins", (string)null);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserRole<string>", b =>
                {
                    b.Property<string>("UserId")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("RoleId")
                        .HasColumnType("nvarchar(450)");

                    b.HasKey("UserId", "RoleId");

                    b.HasIndex("RoleId");

                    b.ToTable("AspNetUserRoles", (string)null);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserToken<string>", b =>
                {
                    b.Property<string>("UserId")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("LoginProvider")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("Name")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("Value")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("UserId", "LoginProvider", "Name");

                    b.ToTable("AspNetUserTokens", (string)null);
                });

            modelBuilder.Entity("PopnScoreTool2.Models.MusicScore", b =>
                {
                    b.Property<int>("UserIntId")
                        .HasColumnType("int");

                    b.Property<int>("FumenId")
                        .HasColumnType("int");

                    b.Property<int>("MedalOrdinalScale")
                        .HasColumnType("int");

                    b.Property<int>("RankOrdinalScale")
                        .HasColumnType("int");

                    b.Property<int>("Score")
                        .HasColumnType("int");

                    b.HasKey("UserIntId", "FumenId");

                    b.HasIndex("FumenId");

                    b.ToTable("MusicScores");
                });

            modelBuilder.Entity("PopnScoreTool2.Models.MusicScoreBasis", b =>
                {
                    b.Property<int>("Id")
                        .HasColumnType("int");

                    b.Property<int>("AddVersion")
                        .HasColumnType("int");

                    b.Property<bool>("Deleted")
                        .HasColumnType("bit");

                    b.Property<string>("Genre")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<int>("GenreIndexCompareForPosition")
                        .HasColumnType("int");

                    b.Property<int>("Level")
                        .HasColumnType("int");

                    b.Property<int>("LevelId")
                        .HasColumnType("int");

                    b.Property<int>("MusicId")
                        .HasColumnType("int");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<int>("Position")
                        .HasColumnType("int");

                    b.Property<int>("TitleIndexCompareForPosition")
                        .HasColumnType("int");

                    b.Property<int>("Version")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.ToTable("Musics");
                });

            modelBuilder.Entity("PopnScoreTool2.Models.NotFoundMusic", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<string>("Genre")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<DateTime>("LastUpdateTime")
                        .HasColumnType("datetime2");

                    b.Property<string>("Title")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<int>("UserIntId")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("UserIntId");

                    b.ToTable("NotFoundMusics");
                });

            modelBuilder.Entity("PopnScoreTool2.Models.OldStats", b =>
                {
                    b.Property<int>("FumenId")
                        .HasColumnType("int");

                    b.Property<double>("AverageScore")
                        .HasColumnType("float");

                    b.Property<double>("MedalCumulativeRate4")
                        .HasColumnType("float");

                    b.Property<double>("MedalCumulativeRate5")
                        .HasColumnType("float");

                    b.Property<double>("MedalCumulativeRate6")
                        .HasColumnType("float");

                    b.Property<double>("MedalCumulativeRate7")
                        .HasColumnType("float");

                    b.Property<double>("MedalCumulativeRate8")
                        .HasColumnType("float");

                    b.Property<double>("MedalCumulativeRate9")
                        .HasColumnType("float");

                    b.Property<double>("MedalRate10")
                        .HasColumnType("float");

                    b.Property<int>("PlayerCount")
                        .HasColumnType("int");

                    b.Property<int>("TopMedal")
                        .HasColumnType("int");

                    b.Property<int>("TopRank")
                        .HasColumnType("int");

                    b.Property<int>("TopScore")
                        .HasColumnType("int");

                    b.HasKey("FumenId");

                    b.ToTable("OldStatses");
                });

            modelBuilder.Entity("PopnScoreTool2.Models.PercentileScore", b =>
                {
                    b.Property<int>("FumenId")
                        .HasColumnType("int");

                    b.Property<int>("No1")
                        .HasColumnType("int");

                    b.Property<int>("No25")
                        .HasColumnType("int");

                    b.Property<int>("No50")
                        .HasColumnType("int");

                    b.Property<int>("No75")
                        .HasColumnType("int");

                    b.ToTable((string)null);

                    b.ToView("PercentileScore", (string)null);
                });

            modelBuilder.Entity("PopnScoreTool2.Models.Profile", b =>
                {
                    b.Property<int>("UserIntId")
                        .HasColumnType("int");

                    b.Property<int>("BattleModeCreditCount")
                        .HasColumnType("int");

                    b.Property<int>("BrowsingSettingProfile")
                        .HasColumnType("int");

                    b.Property<int>("BrowsingSettingProfileActivitiyTime")
                        .HasColumnType("int");

                    b.Property<int>("BrowsingSettingProfilePopnFriendId")
                        .HasColumnType("int");

                    b.Property<int>("BrowsingSettingScore")
                        .HasColumnType("int");

                    b.Property<string>("Comment")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("LastPlayAboutDateTime")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<DateTime>("LastUpdateTime")
                        .HasColumnType("datetime2");

                    b.Property<int>("LocalModeCreditCount")
                        .HasColumnType("int");

                    b.Property<int>("NormalModeCreditCount")
                        .HasColumnType("int");

                    b.Property<string>("PlayerName")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("PopnFriendId")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("UseCharacterName")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("UserIntId");

                    b.ToTable("Profiles");
                });

            modelBuilder.Entity("PopnScoreTool2.Models.UserInt", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<string>("AspNetUsersFK")
                        .IsRequired()
                        .HasColumnType("nvarchar(450)");

                    b.HasKey("Id");

                    b.HasIndex("AspNetUsersFK")
                        .IsUnique();

                    b.ToTable("UserInts");
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityRoleClaim<string>", b =>
                {
                    b.HasOne("Microsoft.AspNetCore.Identity.IdentityRole", null)
                        .WithMany()
                        .HasForeignKey("RoleId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserClaim<string>", b =>
                {
                    b.HasOne("Microsoft.AspNetCore.Identity.IdentityUser", null)
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserLogin<string>", b =>
                {
                    b.HasOne("Microsoft.AspNetCore.Identity.IdentityUser", null)
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserRole<string>", b =>
                {
                    b.HasOne("Microsoft.AspNetCore.Identity.IdentityRole", null)
                        .WithMany()
                        .HasForeignKey("RoleId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Microsoft.AspNetCore.Identity.IdentityUser", null)
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserToken<string>", b =>
                {
                    b.HasOne("Microsoft.AspNetCore.Identity.IdentityUser", null)
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("PopnScoreTool2.Models.MusicScore", b =>
                {
                    b.HasOne("PopnScoreTool2.Models.MusicScoreBasis", "Basis")
                        .WithMany()
                        .HasForeignKey("FumenId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Basis");
                });

            modelBuilder.Entity("PopnScoreTool2.Models.NotFoundMusic", b =>
                {
                    b.HasOne("PopnScoreTool2.Models.UserInt", null)
                        .WithMany()
                        .HasForeignKey("UserIntId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("PopnScoreTool2.Models.OldStats", b =>
                {
                    b.HasOne("PopnScoreTool2.Models.MusicScoreBasis", null)
                        .WithOne()
                        .HasForeignKey("PopnScoreTool2.Models.OldStats", "FumenId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("PopnScoreTool2.Models.Profile", b =>
                {
                    b.HasOne("PopnScoreTool2.Models.UserInt", null)
                        .WithOne()
                        .HasForeignKey("PopnScoreTool2.Models.Profile", "UserIntId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("PopnScoreTool2.Models.UserInt", b =>
                {
                    b.HasOne("Microsoft.AspNetCore.Identity.IdentityUser", null)
                        .WithOne()
                        .HasForeignKey("PopnScoreTool2.Models.UserInt", "AspNetUsersFK")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });
#pragma warning restore 612, 618
        }
    }
}
