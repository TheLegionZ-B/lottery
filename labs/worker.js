importScripts('legacy-models.js','engine.js?v=0.2.2');
self.onmessage=e=>{try{self.postMessage({ok:true,result:LabEngine.run(e.data.rows,e.data.limit)});}catch(err){self.postMessage({ok:false,error:String(err.message||err)});}};
