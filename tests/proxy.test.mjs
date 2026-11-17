import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/tour.ts';

test('optional proxy skips the provider when disabled, exhausted or unmetered', async () => {
  const settings = {TOUR_API_ENABLED:'1',TOUR_MODEL:'test',ANTHROPIC_API_KEY:'example',
    UPSTASH_REDIS_REST_URL:'https://quota.invalid',UPSTASH_REDIS_REST_TOKEN:'example'};
  const previous = Object.fromEntries(Object.keys(settings).map(k=>[k,process.env[k]]));
  const realFetch = globalThis.fetch;
  let quota = 0, modelCalls = 0;
  globalThis.fetch = async url => {
    if(url === settings.UPSTASH_REDIS_REST_URL) return Response.json({result:quota});
    modelCalls++;
    return Response.json({content:[{text:JSON.stringify({stops:[]})}]});
  };
  async function request() {
    let code;
    const res={status(c){code=c;return this},json(){},setHeader(){}};
    await handler({method:'POST',headers:{host:'example.test',origin:'https://example.test'},
      body:{prompt:'walk',catalog:[{id:'a'},{id:'b'},{id:'c'}]}},res);
    return code;
  }
  try {
    Object.assign(process.env, settings);
    process.env.TOUR_API_ENABLED='0'; assert.equal(await request(),503);
    process.env.TOUR_API_ENABLED='1'; assert.equal(await request(),429);
    quota=null; assert.equal(await request(),503); assert.equal(modelCalls,0);
    quota=1; assert.equal(await request(),200); assert.equal(modelCalls,1);
  } finally {
    globalThis.fetch=realFetch;
    for(const [k,v] of Object.entries(previous)) {
      if(v===undefined) delete process.env[k]; else process.env[k]=v;
    }
  }
});
