function snap(w,h)
{
    console.log("Called Snap");
    var snapShot=document.getElementById('snapShot');
    snapShot.width=w;
    snapShot.height=h;
}
function takeSnaps()
{
    var live=document.getElementById('webcam');
    var snapShot=document.getElementById('snapShot');
    var w=snapShot.width;
    var h=snapShot.height;
    c=snapShot.getContext("2d");
    c.drawImage(live,0,0,w,h);
}
function onsuccess(stream)
{
    var video=document.getElementById('webcam');
    var videoSource;
    var ratio, w, h;
    if(window.webkitURL)
	videoSource=window.webkitURL.createObjectURL(stream);
    else
	videoSource=stream;
    video.autoplay=true;
    video.src=videoSource;
    video.addEventListener('loadedmetadata',function(){
        console.log("Loaded Metadata");
        ratio=video.videoWidth/video.videoHeight;
        w=video.videoWidth-100;
        h=parseInt(w/ratio,10);
        snap(w,h);
    },false);
}
function onerror(err)
{
    console.log(err);
    alert('There has been a problem retrieving the streams - did you allow access?');
}
function downloadCanvas(link,canvasId,filename) 
{ 
    console.log(link);
    link.href=document.getElementById(canvasId).toDataURL();
    link.download=filename;
}
window.onload=function()
{
    var video=document.getElementById('webcam'),
    canvas=document.getElementById('snapShot');
    canvas.width=256;
    canvas.height=256;
    navigator.getUserMedia || (navigator.getUserMedia = navigator.mozGetUserMedia || navigator.webkitGetUserMedia || navigator.msGetUserMedia);
    if(navigator.getUserMedia)
    {
	navigator.getUserMedia({
	    video: true,
	    audio: false
	},onsuccess,onerror);
	/*var image=document.getElementById("image");
	var ctx=canvas.getContext("2d");
	ctx.drawImage(image,0,0,256,256);
	var downButton=document.createElement("a");
	downButton.id="downButton";
	downButton.innerHTML="Download!";
	document.getElementById("imageDiv").appendChild(downButton);
	downButton.addEventListener('click',function(){downloadCanvas(this,'snapShot','test.jpeg');},false)*/
    }
    else
	alert("Video Not Supported on Browser!");
}
