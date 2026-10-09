export function allowedRequest(host,origin,port,publicHostname){
 const origins=new Map([[`127.0.0.1:${port}`,`http://127.0.0.1:${port}`],[`localhost:${port}`,`http://localhost:${port}`]]);
 if(publicHostname)origins.set(publicHostname,`https://${publicHostname}`);
 return origins.has(host)&&(!origin||origin===origins.get(host));
}
