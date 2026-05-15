FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["ExternalApiMock/ExternalApiMock.csproj", "ExternalApiMock/"]
RUN dotnet restore "ExternalApiMock/ExternalApiMock.csproj"
COPY . .
WORKDIR "/src/ExternalApiMock"
RUN dotnet publish "ExternalApiMock.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "ExternalApiMock.dll"]
