/*jslint white:false*/

var G = (function(g){

    g.pubsub = {f:{}};

    g.pubsub.pub = function(msg){
        var i, fs,
	args = Array.prototype.slice.call(arguments).slice(1);
	console.log("pubsub: " + msg, args);
        if ( g.pubsub.f[msg] ){
	    fs = g.pubsub.f[msg];
            for (i=0; i<fs.length; i+=1){
                fs[i].apply(null, args);
            }
        }
    };

    g.pubsub.sub = function(msg, f){

        if ( g.pubsub.f[msg] ){
            g.pubsub.f[msg].push(f);
        } else {
            g.pubsub.f[msg] = [f];
        }

    };

    return g;
}(G || {}));