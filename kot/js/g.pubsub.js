/*jslint white:false*/

var G = (function(g){

    g.pubsub = {f:{}};

    g.pubsub.pub = function(msg){
        var i, fs,
	args = Array.prototype.slice.call(arguments);
	console.log(msg);
        if ( g.pubsub.f[msg] ){
	    fs = g.pubsub.f[msg];
            for (i=0; i<fs.length; i+=1){
                fs[i](args.slice(1));
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