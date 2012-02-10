/*jslint white:false*/

var twist = (function(){

}());

(function(t){

    var area = document.getElementById("twist");

    var i = document.createElement('img');

    i.style.position = "absolute";
    i.style.left = "100px";
    i.style.top  = "100px";

    i.src = "pic.jpg";
    
    var holding = false;


    i.onclick = function(){console.log("click");};
    i.onmousedown = function(){ console.log("HELLOE"); holding = true; };
    i.onmouseup   = function(){ holding = false; };

    document.body.onmousemove = function(e){
	console.log(holding);
	if ( holding ){
	    i.style.left = (e.clientX-60) + "px";
	    i.style.top  = (e.clientY-60) + "px";
	}
    };

    console.log("ee?");

    area.appendChild(i);

}(twist));





// register onLoad event with anonymous function
window.onload = function (e) {
    var evt = e || window.event,// define event (cross browser)
        imgs,                   // images collection
        i;                      // used in local loop
    // if preventDefault exists, then define onmousedown event handlers
    if (evt.preventDefault) {
        // collect all images on the page
        imgs = document.getElementsByTagName('img');
        // loop through fetched images
        for (i = 0; i < imgs.length; i++) {
            // and define onmousedown event handler
            imgs[i].onmousedown = disableDragging;
        }
    }
};
 
// disable image dragging
function disableDragging(e) {
    e.preventDefault();
}