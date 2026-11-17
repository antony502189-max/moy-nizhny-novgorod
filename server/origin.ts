export function acceptOrigin(req:{headers?:Record<string,string|string[]|undefined>},res:{setHeader(k:string,v:string):void}) {
  const origin=String(req.headers?.origin || '');
  try {
    const parsed=new URL(origin);
    const allowed=(process.env.PUBLIC_APP_ORIGINS || '').split(',').map(s=>s.trim()).filter(Boolean);
    if(parsed.origin!==origin || (parsed.host!==req.headers?.host && !allowed.includes(origin))) return false;
    res.setHeader('access-control-allow-origin',origin);res.setHeader('vary','Origin');
    res.setHeader('access-control-allow-methods','POST, OPTIONS');
    res.setHeader('access-control-allow-headers','Content-Type');
    return true;
  } catch {return false}
}
