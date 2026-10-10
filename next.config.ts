import type { NextConfig } from 'next';
const config:NextConfig={allowedDevOrigins:['127.0.0.1'],async headers(){return [{source:'/announcement-sw.js',headers:[{key:'Cache-Control',value:'no-cache, no-store, must-revalidate'},{key:'Content-Type',value:'application/javascript; charset=utf-8'}]}]}};
export default config;
