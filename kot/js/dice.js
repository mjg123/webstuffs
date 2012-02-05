/*jslint white:false*/
/*global document,G*/

var kot = (function(k){

    var sides = ["1", "2", "3", "&#8961;", "&#9996;", "&#10084;"],
    rollDice = function(){
        return sides[Math.floor(Math.random()*6)];
    },
    getRollMessage = function(rem){
        if ( rem === 3 ){
            return "Click ROLL to begin";
        } else if ( rem === 2 ){
            return "Roll or Hold";
        } else if ( rem === 1 ){
            return "One more roll";
        } else {
            return "That's it";
        }
    },
    startTurn = function(){
        k.state.turn.rollsRemaining = 3;
        k.state.turn.message = getRollMessage(k.state.turn.rollsRemaining);
    };

    k.initState = function(){
        k.state = {
            dice:[
                { val: "", state: "unrolled" },
                { val: "", state: "unrolled" },
                { val: "", state: "unrolled" },
                { val: "", state: "unrolled" },
                { val: "", state: "unrolled" },
                { val: "", state: "unrolled" }
            ],
            turn:{}
        };
        startTurn();
    };

    k.dieHit = function(i){
        if ( k.state.dice[i].state === "rolled" ){
            k.state.dice[i].state = "hold";
        } else if ( k.state.dice[i].state === "hold" ){
            k.state.dice[i].state = "rolled";
        }
    };

    k.roll = function(){
        if ( k.state.turn.rollsRemaining === 0 ) { return; }

        var i, allHeld;
        for (i=0; i<6; i+=1){
            if (k.state.dice[i].state === "unrolled" || k.state.dice[i].state === "rolled"){
                k.state.dice[i].val = rollDice();
                k.state.dice[i].state = "rolled";
            } else if (k.state.dice[i].state === "hold"){
                k.state.dice[i].state = "held";
            }
        }

        k.state.turn.rollsRemaining -= 1;

        allHeld = true;
        for (i=0; i<6; i+=1){
            if (k.state.dice[i].state !== "held"){
                allHeld = false;
                break;
            }
        }
        if (allHeld){
            k.state.turn.rollsRemaining = 0;
        }

        if ( k.state.turn.rollsRemaining === 0 ) {
            for (i=0; i<6; i+=1){
                k.state.dice[i].state = "finished";
            }
	    G.pubsub.pub("roll-finished");
        }

        k.state.turn.message = getRollMessage(k.state.turn.rollsRemaining);
    };

    k.rollFinished = function(){
        return k.state.turn.rollsRemaining === 0;
    };

    k.getDiceVals = function(){
        return [
            k.state.dice[0].val,
            k.state.dice[1].val,
            k.state.dice[2].val,
            k.state.dice[3].val,
            k.state.dice[4].val,
            k.state.dice[5].val
        ];
    };

    return k;
}(kot || {}));


var kotui = (function(k,u){
    var i, e = function(id){ return document.getElementById(id); };

    u.drawDiceArea = function(){
        for (i=0; i<6; i+=1){
            e("die"+i).className = "die-container " + k.state.dice[i].state;
            e("die"+i+"face").innerHTML = k.state.dice[i].val;
        }
        e("dice-msg").innerHTML = k.state.turn.message;
        e("roll-button").className = k.rollFinished() ? "no-roll" : "can-roll";
    };

    u.hideResult = function(){
        e("result").className="hide";
    };

    u.showResult = function(dice){
        e("roll-result").innerHTML = k.getDiceVals().sort().join(",");
        e("result").className="show";
    };

    return u;
}(kot, kotui || {}));


/*  Let's begin  */
(function(){
    document.body.onclick = function(e){
        G.pubsub.pub("click:"+e.target.id);
    };

    (function(){
        var i, getHitFn = function(i){
	    return function(){ kot.dieHit(i); };
	};

	G.pubsub.sub("roll-start", kot.initState);
	G.pubsub.sub("roll-start", kotui.drawDiceArea);

	G.pubsub.sub("roll-finished", kotui.showResult);

        G.pubsub.sub("click:reset-link", kot.initState);
        G.pubsub.sub("click:reset-link", kotui.drawDiceArea);

        G.pubsub.sub("click:roll-button", kot.roll);
        G.pubsub.sub("click:roll-button", kotui.drawDiceArea);

        for (i=0; i<6; i+=1){
            G.pubsub.sub("click:die"+i+"face", getHitFn(i));
            G.pubsub.sub("click:die"+i+"face", kotui.drawDiceArea);
        }

    }());

    G.pubsub.pub("roll-start");

}());