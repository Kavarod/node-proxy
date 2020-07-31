const url = require('url');
const http = require('http');
const fs = require('fs');
const CameraList = JSON.parse(fs.readFileSync("storage.json","utf-8")).data;

function extractBoundary(contentType) {
  contentType = contentType.replace(/\s+/g, '');

  let startIndex = contentType.indexOf('boundary=');
  let endIndex = contentType.indexOf(';', startIndex);
  if (endIndex == -1) { 
    if ((endIndex = contentType.indexOf('\r', startIndex)) == -1) {
      endIndex = contentType.length;
    }
  }
  return contentType.substring(startIndex + 9, endIndex).replace(/"/gi,'').replace(/^\-\-/gi, '');
}

const  ProxyMjpeg = exports.ProxyMjpeg = function() {
  const self = this;
  self.audienceResponses = [];
  self.newAudienceResponses = [];

  self.boundary = null;
  self.globalMjpegResponse = null;
  self.mjpegRequest = null;

  self.proxyRequest = function(req, res) {

    let mjpegUrl = CameraList[req.params.id];
    if (!mjpegUrl.url) throw new Error('Valid mjpeg URL needed ');//?Here
    let mjpegOptions = url.parse(mjpegUrl.url);
    if (res.socket==null) {
      return;
    }

    // *There is already another client consuming the MJPEG response
    if (self.mjpegRequest !== null) {
      self._newClient(req, res);
    }
     else {
      //* Send source MJPEG request
      self.mjpegRequest = http.request(mjpegOptions, function(mjpegResponse) {
        self.globalMjpegResponse = mjpegResponse;
        self.boundary = extractBoundary(mjpegResponse.headers['content-type']);

        self._newClient(req, res);

        let lastByte1 = null;
        let lastByte2 = null;
        
        //! Consume Stream from response
        mjpegResponse.on('data', function(chunk) {
          //Really retarded stuff incoming
          //*Dealing with buffer response
          if (lastByte1 != null && lastByte2 != null) {
            let oldheader = '--' + self.boundary;
            let p = chunk.indexOf(oldheader);
            
            if (p == 0 && !(lastByte2 == 0x0d && lastByte1 == 0x0a) || p > 1 && !(chunk[p - 2] == 0x0d && chunk[p - 1] == 0x0a)) {
              let b1 = chunk.slice(0, p);
              let b2 = Buffer.from('\r\n--' + self.boundary);
              let b3 = chunk.slice(p + oldheader.length);
              chunk = Buffer.concat([b1, b2, b3]);
            }
           
          }
        
          lastByte1 = chunk[chunk.length - 1];
          lastByte2 = chunk[chunk.length - 2];

          for (let i = self.audienceResponses.length; i--;) {
            let res = self.audienceResponses[i];

            if (self.newAudienceResponses.indexOf(res) >= 0) {
              let p =chunk.indexOf( '--' + self.boundary);
              if (p >= 0) {
                res.write(chunk.slice(p));
                self.newAudienceResponses.splice(self.newAudienceResponses.indexOf(res), 1);
              }
            } else {
              res.write(chunk);
            }
          }
          // I am not doing this ever again
        });

        mjpegResponse.on('end', function () {
  
          for (let i = self.audienceResponses.length; i--;) {
            let res = self.audienceResponses[i];
            res.end();
          }
        });
        mjpegResponse.on('close', function () {
           console.log("client removed");
        });
      });

      self.mjpegRequest.on('error', function(e) {
        console.error('problem with request: ', e);
      });
      self.mjpegRequest.end();
    }
  }

  //! New Client Func
  self._newClient = function(req, res) {
    res.writeHead(200, {
      'Expires': 'Mon, 01 Jul 1980 00:00:00 GMT',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Content-Type': 'multipart/x-mixed-replace;boundary=' + self.boundary
    });

    self.audienceResponses.push(res);
    self.newAudienceResponses.push(res);

    res.socket.on('close', function () {
      self.audienceResponses.splice(self.audienceResponses.indexOf(res), 1);
      if (self.newAudienceResponses.indexOf(res) >= 0) {
        self.newAudienceResponses.splice(self.newAudienceResponses.indexOf(res), 1); // remove from new
      }

      if (self.audienceResponses.length == 0) {
        self.mjpegRequest = null;
        self.globalMjpegResponse.destroy();
      }
    });
  }
}