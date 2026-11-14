using Microsoft.Data.SqlClient;

namespace Taller.Infrastructure.Database;

public sealed class SqlConnectionFactory(string connectionString)
{
    public SqlConnection Create() => new(connectionString);
}
