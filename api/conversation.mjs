import handler from '../api-handler.mjs';
export default {fetch(request){return handler(request,{ip:request.headers.get('x-real-ip')||'unknown'})}};
