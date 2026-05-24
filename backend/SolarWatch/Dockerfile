# =========================
# Build stage
# =========================
FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src

# Copy project file and restore dependencies
COPY *.csproj ./
RUN dotnet restore

# Copy everything else and publish
COPY . ./
RUN dotnet publish -c Release -o /app/publish

# =========================
# Runtime stage
# =========================
FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview
WORKDIR /app

# Copy published app
COPY --from=build /app/publish .

# Force container to use port 8080 (default modern .NET container port)
ENV ASPNETCORE_URLS=http://+:8080

ENV ASPNETCORE_ENVIRONMENT=Production


EXPOSE 8080

ENTRYPOINT ["dotnet", "SolarWatch.dll"]