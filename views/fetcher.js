CameraFetch=function(){
        let xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
          if (this.readyState == 4 && this.status == 200) {
            GenerateHtml(this.response);
          }
        };
        xmlhttp.open("GET", "/cameras", true);
        xmlhttp.send();
        
}
GenerateHtml = function(res){
 let Response = JSON.parse(res);
 let holder = document.getElementById('holder');
 Response.forEach(element => {
   const div = document.createElement('div');
   div.className = 'Camera';
   div.innerHTML = `
   <p><a class="title">Name:<a> ${element.name} <br><a class="title">Host:</a> ${element.host}</p>
  <div class="flex"><button onclick='ChooseCamera(${element.id})' class="choose"><i class="fa fa-video-camera" aria-hidden="true"></i></button></div>
   `;
   holder.appendChild(div);
 });
}
ChooseCamera= async function(id){
 let imgholder  = document.getElementById('img-cont');
 if(imgholder.hasChildNodes()) imgholder.querySelectorAll('*').forEach(n =>
  n.remove());

 const img = document.createElement("img");
 img.src=`/video${id}`;
 img.alt=`camera ${id+1}`;
 imgholder.appendChild(img);
 
 }