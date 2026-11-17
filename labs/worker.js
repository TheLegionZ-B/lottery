importScripts('legacy-models.js','engine.js');
self.onmessage=e=>{try{self.postMessage({ok:true,result:LabEngine.run(e.data.rows,e.data.limit)});}catch(err){self.postMessage({ok:false,error:String(err.message||err)});}};
