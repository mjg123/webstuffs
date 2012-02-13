/*jslint white:false*/
/*global document*/

var DBL = (function(d){
    
    var div = document.getElementById("dbuf"),
    c0 = document.createElement("canvas"),
    c1 = document.createElement("canvas"),
    cs = [c0,c1],
    displayCanvas = 0;

    c0.className = "canvas";
    c1.className = "canvas";

    div.appendChild(c0);
    div.appendChild(c1);

    d.getSize = function(){
	return [ c0.clientWidth, c0.clientHeight ];
    };

    d.getCtx = function(){
	return cs[displayCanvas].getContext('2d');
    };

    d.flip = function(){
	displayCanvas = 1-displayCanvas;
	cs[displayCanvas].style.zIndex = 1;
	cs[1-displayCanvas].style.zIndex = 0;
    };
    d.flip();

    return d;
}(DBL || {}));



(function(){
 
    var x=0,y=0,t=0,f=1,
    w=DBL.getSize()[0],
    h=DBL.getSize()[1],
    tick,
    mspf = 25,
    wait = mspf,
    lastSampleTime = new Date().getTime(),
    blocks = [],

    init = function(){
	var i;
	for (i=0; i<100; i+=1){
	    blocks.push({xf:Math.random(), yf:Math.random()});
	}
    },

    innerTick = function(){
	var i,l=blocks.length;

	for (i=0; i<l; i+=1){
	    blocks[i].x = Math.sin(t * blocks[i].xf) * w*0.4 + w*0.5;
	    blocks[i].y = Math.cos(t * blocks[i].yf) * h*0.4 + h*0.5;
	}

	t += 0.001*mspf;
    },

    draw = function(){
	var i,l=blocks.length;

	for (i=0; i<l; i+=1){
	    DBL.getCtx().fillRect(blocks[i].x, blocks[i].y,10,10);
	}

	DBL.flip();
	DBL.getCtx().clearRect(0,0,w,h);
    },

    report = function(m){
	document.getElementById("mspf").innerHTML = m;
    };

    tick = function(){
	if (f%100 === 0){
	    var tm = new Date().getTime(),
	    dur = tm - lastSampleTime;
	    wait -= (dur-100*mspf)/100;
	    console.log("sleep per frame is: " + wait);
	    report(wait);
	    lastSampleTime = tm;
	}

	innerTick();

	draw();
	setTimeout(tick, wait);
	f += 1;
    };

    init();
    tick();

}());