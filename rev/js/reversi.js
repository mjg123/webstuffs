/*jslint white:false*/
/*global G,document*/

var R = (function(g, r){

    var board, nextBlack=true, sz=8,
    emptyBoard = function(){ 
	var i, b=[];
	for (i=0; i<sz; i+=1){
	    b.push([]);
	}
	return b;
    },
    putPiece = function(x,y){
	board[x][y] = nextBlack ? "B" : "W";
    },
    p = function(b,x,y){
	if ( x>=0 && y>=0 && x<sz && y<sz ){
	    return b[x][y];
	} else {
	    return "";
	}
    },
    getSwaps = function(b,x,y,xo,yo,t,o){
	var xd=xo, yd=yo, mayswap = [];
	if (p(b,x+xd,y+yo) === o){
	    mayswap.push([x+xd,y+yd]);
	    xd += xo;
	    yd += yo;
	    while (p(b,x+xd,y+yd) === o){
		mayswap.push([x+xd,y+yd]);
		xd += xo;
		yd += yo;
	    }
	    if (p(b,x+xd,y+yd) === t){
		return mayswap;
	    }
	}
	return [];
    },
    gameScore = function(b){
	var i,j, s={black:0, white:0};
	for (i=0; i<sz; i+=1){
	    for (j=0; j<sz; j+=1){
		if ( b[i][j] === "B" ){ s.black += 1; }
		if ( b[i][j] === "W" ){ s.white += 1; }
	    }
	}
	return s;
    };

    r.getSize = function(){
	return sz;
    };

    r.reset = function(){
	var c = Math.floor(sz/2)-1;
	board = emptyBoard();
	nextBlack = true;
	board[c][c] = "W";
	board[c+1][c+1] = "W";
	board[c][c+1] = "B";
	board[c+1][c] = "B";
	g.pubsub.pub("board-changed");
    };

    r.play = function(x,y){
	var i, s,
	t = nextBlack ? "B" : "W",
	o = nextBlack ? "W" : "B",
	swappers = [];

	if ( p(board,x,y) ){
	    return;
	}

	// straits
	swappers = swappers.concat( getSwaps(board, x,y, -1,0, t,o) );
	swappers = swappers.concat( getSwaps(board, x,y,  1,0, t,o) );
	swappers = swappers.concat( getSwaps(board, x,y, 0,-1, t,o) );
	swappers = swappers.concat( getSwaps(board, x,y, 0,1,  t,o) );

	// diags
	swappers = swappers.concat( getSwaps(board, x,y, -1,-1, t,o) );
	swappers = swappers.concat( getSwaps(board, x,y,  1,1, t,o) );
	swappers = swappers.concat( getSwaps(board, x,y, 1,-1, t,o) );
	swappers = swappers.concat( getSwaps(board, x,y, -1,1,  t,o) );

	if ( swappers.length > 0 ){
	    for (i=0; i<swappers.length; i+=1){
		s = swappers[i];
		board[s[0]][s[1]] = t;
	    }
	    putPiece(x,y);
	    nextBlack = !nextBlack;
	    g.pubsub.pub("board-changed");

	    s = gameScore(board);
	    if (s.black + s.white === sz*sz ||
	        s.black === 0 || s.white === 0){
		g.pubsub.pub("game-finish", s);
	    }
	}
    };

    r.getCell = function(x,y){
	return board[x][y];
    };

    r.getNext = function(){
	return nextBlack ? "B" : "W";
    };

    return r;
}(G, R||{}));


var RUI = (function(g, r, u){

    var cells = [[],[],[],[],[],[],[],[]],
    create = function(t, c, i){
	var e = document.createElement(t);
	e.className = c;
	if (i){
	    e.innerHTML = i;
	}
	return e;
    },
    makePlayFn = function(x,y){
	return function(){
	    g.pubsub.pub("play", x, y);
	};
    };

    u.makeBoard = function(){
	var i, j, rw, c,
	f=document.createDocumentFragment();
	for (i=0; i<r.getSize(); i+=1){
	    rw = create('div', 'row');
	    for (j=0; j<r.getSize(); j+=1){
		c = create('div', 'cell', "&#x25CF;");
		c.onclick = makePlayFn(i,j);
		cells[i][j] = c;
		rw.appendChild(c);
	    }
	    f.appendChild(rw);
	}
	f.appendChild(create('div', 'clear'));
	document.getElementById("playarea").appendChild(f);
    };

    u.reset = function(){
	document.getElementById("result").innerHTML = "";
    };

    u.drawBoard = function(){
	var i,j;
	for (i=0; i<r.getSize(); i+=1){
	    for (j=0; j<r.getSize(); j+=1){
		if (r.getCell(i,j) === "W"){
		    cells[i][j].className = "cell white";
		} else if (r.getCell(i,j) === "B"){
		    cells[i][j].className = "cell black";
		} else {
		    cells[i][j].className = "cell";
		}
	    }
	}
    };

    u.updateMsg = function(){
	var n = document.getElementById("next");
	n.className = R.getNext() === "B" ? "black" : "white";
    };

    u.gameFinish = function(s){
	document.getElementById("result").innerHTML = 
	    "Game over. White "+s.white+" : " + s.black + " Black";
    };

    return u;
}(G, R, RUI||{}));


(function(){

    G.pubsub.sub("reset", R.reset);
    G.pubsub.sub("reset", RUI.reset);
    G.pubsub.sub("init", RUI.makeBoard);
    G.pubsub.sub("board-changed", RUI.drawBoard);
    G.pubsub.sub("board-changed", RUI.updateMsg);
    G.pubsub.sub("play", R.play);
    G.pubsub.sub("game-finish", RUI.gameFinish);

    G.pubsub.pub("init");
    G.pubsub.pub("reset");
    document.getElementById("reset").onclick = function(){ G.pubsub.pub("reset"); };
}());