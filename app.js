const express = require('express')
const app = express();
const server = require('http').createServer(app);
const router = express.Router();
const path = require('path');
const MjpegProxy = require("./mjpeg-proxy").ProxyMjpeg;
const bodyParser = require('body-parser');
const needle = require('needle')
const fs = require('fs');
const CameraList = JSON.parse(fs.readFileSync("storage.json","utf-8")).data;
app.use("/", router);

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname,'views')));

  router.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,"views/index.html"));
   })
app.get("/video:id",new MjpegProxy().proxyRequest);

app.get("/cameras",(req,res)=>{
  let TemplateList = [];
  for(let i =0; i<CameraList.length;i++){
    let camera = CameraList[i]
    let Template ={
      id:camera.id,
      name:camera.name,
      host:camera.host
    }
    TemplateList.push(Template);
  }
res.send(TemplateList).status(200);
})

const port = process.env.PORT || 8080;
server.listen(port,'0.0.0.0');