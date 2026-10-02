const http = require('http');
const fixture = {anonymizedText:'Contact [NAME] at [EMAIL].',piiDetected:{names:['Jean Dupont'],emails:['jean.dupont@example.com'],addresses:[],phoneNumbers:[],dates:[],organizations:[],other:[]}};
http.createServer((req,res)=>{
  req.resume();
  req.on('end',()=>{
    res.writeHead(200,{'Content-Type':'application/x-ndjson'});
    res.write(JSON.stringify({model:'fixture',created_at:new Date().toISOString(),response:JSON.stringify(fixture),message:{role:'assistant',content:JSON.stringify(fixture)},done:false})+'\n');
    res.end(JSON.stringify({model:'fixture',done:true,prompt_eval_count:10,eval_count:10,total_duration:1000000})+'\n');
  });
}).listen(11434,'0.0.0.0');
