#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/aspnet:7.0-alpine AS base
RUN apk add icu-libs --no-cache
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:5101
EXPOSE 5101

FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
WORKDIR /src
COPY ["PopnScoreTool2.csproj", "PopnScoreTool2/"]
RUN dotnet restore "PopnScoreTool2/PopnScoreTool2.csproj"
COPY . PopnScoreTool2/
WORKDIR "/src/PopnScoreTool2"
RUN dotnet build "PopnScoreTool2.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "PopnScoreTool2.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "PopnScoreTool2.dll"]
