# Salvar no banco

dotnet tool install --global dotnet-ef
dotnet add package Microsoft.EntityFrameworkCore.Design
cd SUA_PASTA_DO_BACKEND
dotnet ef migrations add CreateTagTable
dotnet ef database update
