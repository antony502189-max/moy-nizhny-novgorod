// One atomic reservation shared by all instances. Only counters leave the proxy.
const reserve = `
local minute = tonumber(redis.call('GET', KEYS[1]) or '0')
local day = tonumber(redis.call('GET', KEYS[2]) or '0')
if minute >= tonumber(ARGV[1]) or day >= tonumber(ARGV[2]) then return 0 end
redis.call('INCR', KEYS[1])
redis.call('EXPIRE', KEYS[1], 120)
redis.call('INCR', KEYS[2])
redis.call('EXPIRE', KEYS[2], 172800)
return 1`;

export async function reserveModelCall(): Promise<boolean> {
  const base = process.env.UPSTASH_REDIS_REST_URL, token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!base || !token) throw new Error('quota_unavailable');
  const now = Date.now();
  const response = await fetch(base, {
    method: 'POST', signal: AbortSignal.timeout(3000),
    headers: {authorization: 'Bearer ' + token, 'content-type': 'application/json'},
    body: JSON.stringify(['EVAL', reserve, 2, 'ng:tour:minute:'+Math.floor(now/60000),
      'ng:tour:day:'+Math.floor(now/86400000), 5, 100]),
  });
  if (!response.ok) throw new Error('quota_unavailable');
  const { result } = await response.json();
  if (result !== 0 && result !== 1) throw new Error('quota_unavailable');
  return result === 1;
}
