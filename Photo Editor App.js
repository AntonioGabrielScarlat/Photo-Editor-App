
var canvas = document.getElementById('myCanvas');
var ctx=canvas.getContext("2d");

//UPLOAD
let fileInput = document.getElementById('fileinput');
fileInput.addEventListener('change', function(ev) {
   if(ev.target.files) {
      let file = ev.target.files[0];//luăm primul(în cazul nostru și singurul) fișier selectat de pe PC
      var reader  = new FileReader();
      reader.readAsDataURL(file);//citim fișierul
      reader.onloadend = function (e) {
          var image = new Image(600,400);
          image.src = e.target.result;//populăm imaginea cu conținutul fișierului
          image.onload = function(ev) {
             canvas.width = image.width;
             canvas.height = image.height;
             ctx.drawImage(image,0,0,600,400);
}   
      }
   }
});

//DOWNLOAD
function downloadCanvas(){  
    //Extragem datele din canvas:
    let image = canvas.toDataURL();  
    //Creăm un link temporar:
    let tmpLink = document.createElement( 'a' );  
    tmpLink.download = 'image.png'; // Setăm numele fișierului downloadat
    tmpLink.href = image;  
    // Inițializăm operația de download:
    document.body.appendChild( tmpLink );  
    tmpLink.click();  
    document.body.removeChild( tmpLink );  
}

//MOUSE COORD
function getMousePos(canvas, e) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.x,
      y: e.clientY - rect.y
    };
}

//DRAW RECT
var pozitieInitiala={x:0,y:0};
var pozitieFinala={x:600,y:400};
var width;var height;//vom calcula lungimea și lățimea dreptunghiului în funcție de coordonatele inițiale și cele finale a 2 puncte

function getInitialPoint(e){
    pozitieInitiala=getMousePos(canvas, e); 
}

function getFinalPoint(e){
    pozitieFinala=getMousePos(canvas, e);
    draw(pozitieInitiala.x,pozitieInitiala.y,pozitieFinala.x,pozitieFinala.y);
}

function draw(startX,startY,stopX,stopY){
    width=stopX-startX;
    height=stopY-startY;

      //desenam dreptunghiul folosind coordonatele punctului iniția, lungime și lățimea
      ctx.strokeRect(startX,startY,width,height);
}

//HISTOGRAMĂ DE CULOARE PERMANENTĂ - O VOM FOLOSI LA MUTAREA MOUSE-ULUI
function getContinousPoints(e){
    var pozitieCurenta=getMousePos(canvas, e);
    var pixel = ctx.getImageData(pozitieCurenta.x, pozitieCurenta.y, 1, 1); //extragem pixelul pe care se află mouse-ul
    var data = pixel.data;
    const rgba = `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3] / 255})`;//extragem compoziția RGBA a pixelului
    document.getElementById("colorButton").style="background-color:".concat(rgba);//schimbăm culoarea butonului pentru fiecare pixel pe care este mouse-ul pozționat
}

//CROP 
function crop() {
    width=pozitieFinala.x-pozitieInitiala.x;
    height=pozitieFinala.y-pozitieInitiala.y;
    var imgData = ctx.getImageData(pozitieInitiala.x,pozitieInitiala.y,width,height);//decupăm porțiunea din imagine din interiorul dreptunghiului desenat
    ctx.clearRect(0, 0, canvas.width, canvas.height);//golim canvasul
    canvas.width = imgData.width;
    canvas.height = imgData.height;
    ctx.putImageData(imgData, 0, 0);//punem imaginea decupată pe toată suprafața canvasului
  }

  //ADD TEXT
document.getElementById("adaugaText").style.display ="none";

function showAddTextOptions(){
    document.getElementById("adaugaText").style.display = "block";
    document.getElementById("dimensiune").value='';
    document.getElementById("textIntrodus").value='';
    document.getElementById("culoare").value='';
}

function addText(e){
  //extragem valorile pentru text, mărime și culoare din câmpuri:
    let size=document.getElementById("dimensiune").value;
    ctx.font=size.concat("px Poppins");
    ctx.fillStyle = document.getElementById("culoare").value;
    let textIntr=document.getElementById("textIntrodus").value;
    //la click pe canvas, pune textul pe poziția mouse-ului:
    var pos = getMousePos(canvas, e);
    ctx.fillText(textIntr, pos.x, pos.y);
    document.getElementById("adaugaText").style.display ="none";
}

//ADD EFFECT
document.getElementById("adaugaEfect").style.display ="none";

function showAddEffectOptions(){
    document.getElementById("adaugaEfect").style.display ="block";
    document.getElementById("efect").value='';
}

  function negativeEffect(){
    width=pozitieFinala.x-pozitieInitiala.x;
    height=pozitieFinala.y-pozitieInitiala.y;
    var imgData = ctx.getImageData(pozitieInitiala.x,pozitieInitiala.y,width,height);//extragem imaginea din interiorul dreptunghiului desenat
  //inversăm culorile:
    var i;
  for (i = 0; i < imgData.data.length; i += 4) {
    imgData.data[i] = 255 - imgData.data[i];
    imgData.data[i+1] = 255 - imgData.data[i+1];
    imgData.data[i+2] = 255 - imgData.data[i+2];
    imgData.data[i+3] = 255;
  }
  ctx.putImageData(imgData, pozitieInitiala.x,pozitieInitiala.y);//afișăm noua imagine în canvas
  document.getElementById("adaugaEfect").style.display ="none";
}

function grayscaleEffect(){

    width=pozitieFinala.x-pozitieInitiala.x;
    height=pozitieFinala.y-pozitieInitiala.y;
    var imgData = ctx.getImageData(pozitieInitiala.x,pozitieInitiala.y,width,height);//extragem imaginea din interiorul dreptunghiului desenat
    //modificăm pixelii din cadrul selecției:
    for(var y = 0; y < height; y++){
        for(var x = 0; x < width; x++){
            var i = (y * 4) * width + x * 4;
            var avg = (imgData.data[i] + imgData.data[i + 1] + imgData.data[i + 2]) / 3;
            imgData.data[i] = avg;
            imgData.data[i + 1] = avg;
            imgData.data[i + 2] = avg;
        }
    }
  ctx.putImageData(imgData, pozitieInitiala.x,pozitieInitiala.y);//afișăm noua imagine în canvas
  document.getElementById("adaugaEfect").style.display ="none";
}

//ERASE
function eraseSection(){
    width=pozitieFinala.x-pozitieInitiala.x;
    height=pozitieFinala.y-pozitieInitiala.y;
    var imgData = ctx.getImageData(pozitieInitiala.x,pozitieInitiala.y,width,height);//extragem imaginea din interiorul dreptunghiului desenat
    //facem pixelii selecției albi:
    var i;
  for (i = 0; i < imgData.data.length; i += 4) {
    imgData.data[i] = 255;
    imgData.data[i+1] = 255;
    imgData.data[i+2] = 255;
    imgData.data[i+3] = 255;
  }
  ctx.putImageData(imgData, pozitieInitiala.x,pozitieInitiala.y);//afișăm noua imagine (albă) în canvas
  
}

//DELETE IMAGE
function deleteImage(){
    ctx.clearRect(0,0,600,400);//golim canvasul
}