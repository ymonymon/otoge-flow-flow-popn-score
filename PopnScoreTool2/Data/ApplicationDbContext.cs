using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using PopnScoreTool2.Controllers;
using PopnScoreTool2.Models;

namespace PopnScoreTool2.Data
{
    public class AppDbContext : IdentityDbContext
    {
        public DbSet<UserInt> UserInts { get; set; }

        public DbSet<MusicScoreBasis> Musics { get; set; }

        public DbSet<MusicScore> MusicScores { get; set; }

        public DbSet<OldStats> OldStatses { get; set; }
        public DbSet<Profile> Profiles { get; set; }

        public DbSet<PercentileScore> PercentileScores { get; set; }

        public DbSet<NotFoundMusic> NotFoundMusics { get; set; }

        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<UserInt>()
                .HasOne<IdentityUser>()
                .WithOne()
                .HasForeignKey<UserInt>(b => b.AspNetUsersFK);

            modelBuilder.Entity<Profile>()
            .HasOne<UserInt>()
            .WithOne()
            .HasForeignKey<Profile>(a => a.UserIntId);

            modelBuilder.Entity<MusicScore>()
                .HasKey(o => new { o.UserIntId, o.FumenId });

            modelBuilder.Entity<OldStats>()
                .HasOne<MusicScoreBasis>()
                .WithOne()
                .HasForeignKey<OldStats>(b => b.FumenId);

            modelBuilder
                .Entity<PercentileScore>(eb =>
                {
                    eb.HasNoKey();
                    eb.ToView("PercentileScore");
                });

            modelBuilder.Entity<NotFoundMusic>()
                .HasOne<UserInt>()
                .WithMany()
                .HasForeignKey(a => a.UserIntId);
        }
    }
}
