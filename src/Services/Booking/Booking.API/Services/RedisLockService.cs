using StackExchange.Redis;

namespace Booking.API.Services;

public sealed class RedisLockService
{
    private readonly IConnectionMultiplexer _redis;

    public RedisLockService(IConnectionMultiplexer redis)
    {
        _redis = redis;
    }

    public async Task<RedisLockHandle?> TryAcquireAsync(string key, TimeSpan timeout)
    {
        var token = Guid.NewGuid().ToString("N");
        var acquired = await _redis.GetDatabase().LockTakeAsync(key, token, timeout);
        return acquired ? new RedisLockHandle(_redis, key, token) : null;
    }
}

public sealed class RedisLockHandle : IAsyncDisposable
{
    private readonly IConnectionMultiplexer _redis;
    private readonly string _key;
    private readonly string _token;

    public RedisLockHandle(IConnectionMultiplexer redis, string key, string token)
    {
        _redis = redis;
        _key = key;
        _token = token;
    }

    public async ValueTask DisposeAsync()
    {
        await _redis.GetDatabase().LockReleaseAsync(_key, _token);
    }
}
