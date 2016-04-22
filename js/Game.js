var SIZE_PICKUP=1;
var SPEED_PICKUP=2;
var RANGE_PICKUP=3;
var RATE_PICKUP=4;
var GHOST_PICKUP=5;
var SHIELD_PICKUP=6;
var BOMB_PICKUP=7;
var CONFUSION_PICKUP=8;


function Game(p1,p2,ctx,map,ctxBomb) {
  this.player=[p1,p2];
  //[left,top,right,bottom]
  this.wall=[];
  this.ctx=ctx;
  this.ctxBomb=ctxBomb;
  //[x,y,type,target,coef,timeoutId]
  this.pickup=[];
  this.initGame(map);
}
Game.prototype.initGame = function(map) {
	if(map!='') {
		//custom map
		this.wall=JSON.parse(localStorage.getItem(map));
		for (var i=0;i<this.wall.length;i++) {
			$c=this.wall[i];
			if($c[0]>$c[2]) {
				$tmp=$c[2];
				$c[2]=$c[0];
				$c[0]=$tmp;
			}
			if($c[1]>$c[3]) {
				$tmp=$c[3];
				$c[3]=$c[1];
				$c[1]=$tmp;
			}
			this.wall[i]=new Wall($c,$c[4]==1);
		}
	}
	//default walls
	else {
		this.wall.push(new Wall([521,318,553,600],false));
		this.wall.push(new Wall([148,198,215,235],true));
		this.wall.push(new Wall([215,198,332,235],false));
		this.wall.push(new Wall([0,198,148,234],false));	
		this.wall.push(new Wall([676,76,934,260],false));	
	}
};
Game.prototype.spawnObject=function() {
	var target,type,coef;
	type=Math.random()*100;
	var src='../img/pick_up/';
	if(type<=60) {
		type=Math.round(Math.random()*3+1);
		if(type==1) src+='size';
		else if(type==2) src+='speed';
		else if(type==3) src+='range';
		else src+='rate';
	}
	else if(type<=75) {
		type=GHOST_PICKUP;
		src+='ghost';
	}
	else if(type<=85) {
		type=BOMB_PICKUP;
		src+='bomb';
	}
	else if(type<=93) {
		type=SHIELD_PICKUP;
		src+='shield';
	}
	else {
		type=CONFUSION_PICKUP;
		src+='confusion';
	}
	coef=Math.round(Math.random())==0?-1:1;
	if(type<=4) src+=coef>0?'_up':"_low";
	//true=for self || false=for ennemy
	target=Math.round(Math.random());
	src+=target?'_s.png':'_e.png';
	$x=null,$y=null;
	//determine random coordinates on the map
	while (true) {
		$x=Math.floor((Math.random()*GAME_WIDTH*0.95)+50);
		$y=Math.floor((Math.random()*GAME_HEIGHT*0.95)+50);
		if(!this.isInObstacle([$x,$y,$x+30,$y+30,'pickup']) && !this.isInLimit([$x,$y,$x+30,$y+30])) break;
	}
	var img=new Image();
	img.src=src;
	img.onload=function() {
		game.ctx.drawImage(img,$x,$y,30,30);
	}
	this.pickup.push([$x,$y,type,target,coef,"#"]);
	this.pickup[this.pickup.length-1][5]=setTimeout(function(game,index) {game.despawnPickUp(index);},4500,this,[$x,$y,type,target,coef,"#"]);
	var nextPickup=Math.round(Math.random()*6000)+1500;
	pickup_timeout=setTimeout(function(g){g.spawnObject();},nextPickup,this);
}
Game.prototype.isInObstacle = function(obj) {
	//obj=[left,top,right,bottom]
	var currWall;
	for (var i=0;i<this.wall.length;i++) {
		currWall=this.wall[i];
		if(currWall.collide(obj)) {
			if(currWall.destructible && obj[4]=="shoot") return "destroy."+i;
			else return "wall.l";
		}				
	}
	//param obj didn't collide a wall

	if(obj[4]=='pickup') { //Prevent 2 pick up from overlaping
		for(i in this.pickup) {
			var c=this.pickup[i];
			if(!(obj[0]>=(c[0]+30) || obj[1]>=(c[1]+30) || obj[2]<=c[0] || obj[3]<=c[1])) return "true";
		}
	}

	for(var i in this.pickup) {//tank collide pickup
		if(!obj[4].currState) break;
		var p=this.pickup[i];
		if(!(obj[0]>=(p[0]+30) || obj[1]>=(p[1]+30) || obj[2]<=p[0] || obj[3]<=p[1])) return "pickup."+i;
	}
	for (i in this.player) {//obj collide tank
		var c=$.extend(this.player[i].tank.currState);
		var c1=[];
		c1[0]=c[0]-DEFAULT_SIZE*c[3]/2;
		c1[1]=c[1]-DEFAULT_SIZE*c[3]/2;
		c1[2]=c1[0]+DEFAULT_SIZE*c[3];
		c1[3]=c1[1]+DEFAULT_SIZE*c[3];
		if(!(obj[0]>=c1[2] || obj[1]>=c1[3] || obj[2]<=c1[0] || obj[3]<=c1[1])) {
			if(obj[4]=="shoot") return "shoot."+i;
			else if(obj[4].sprite!=this.player[i].tank.sprite) return "true.l";
		}
	}
	return "";
};
Game.prototype.collidePickUp=function(tank,index) {
	var a=new Audio('../audio/pickup.mp3');
	a.play();
	$c=this.pickup[index];
	$target=[];
	clearTimeout($c[5]);
	this.ctx.clearRect($c[0],$c[1],30,30);
	if(!$c[3]) {//if target is ennemy
		$target=[p1.tank,p2.tank];
		$target.splice($target.indexOf(tank),1);
	}
	else $target.push(tank);
	$target=$target[0];
	switch($c[2]) {
		case SPEED_PICKUP:
			$target.setSpeed($c[4]);
			setTimeout(function(a,t) {t.setSpeed(a);},3000,-1*$c[4],$target);
		break;
		case RANGE_PICKUP:
			$target.setRange($c[4]);
			setTimeout(function(a,t) {t.setRange(a);},3000,-1*$c[4],$target);
		break;
		case RATE_PICKUP:
			$target.setRate($c[4]);
			setTimeout(function(a,t) {t.setRate(a);},3000,-1*$c[4],$target);
		break;
		case SIZE_PICKUP:
			$target.setSize($c[4]);
			setTimeout(function(a,t) {t.setSize(a);},6000,-1*$c[4],$target);
		break;
		case BOMB_PICKUP:
			this.spawnBomb($target.currState[0],$target.currState[1],0);
		break;
		case GHOST_PICKUP:
			$target.ghostify();
		break;
		case SHIELD_PICKUP:
			var a=new Audio('../audio/shield.mp3');
			a.play();
			$target.shieldify();
		break;
		case CONFUSION_PICKUP:
			$p=[p1,p2];
			for (i in $p) {
				if($p[i].tank==$target) {
					$target=$p[i];
					break;
				}
			}
			$target.confuse();
			setTimeout(function(t) {t.confuse();},6000,$target);
		break;
	}
	this.pickup.splice(index,1);
}
Game.prototype.shoot=function(index) {//Shoot collide other tank
	if(!this.player[index].tank.shield[0]) {
		this.player[index].setLife(-5);
		var a=new Audio('../audio/tank_hit.mp3');
		a.play();
	}
	else this.player[index].tank.draw();
	updateStat();
}
Game.prototype.isInLimit = function(obj) {
	//obj=[left,top,right,bottom]
	return (obj[0]<0 || obj[1]<0 || obj[2]>GAME_WIDTH || obj[3]>GAME_HEIGHT);
}
Game.prototype.drawWall = function() {
	for (var i=0;i<this.wall.length;i++) {
		this.wall[i].draw(this.ctx);
	}
};
Game.prototype.destructWall = function(index,obj) {//Shoot collide destructible wall
	var a=new Audio('../audio/wall_break.mp3');
	a.play();
	this.wall[index].destructAt(this.ctx,obj);
	if(this.wall[index].param.length==0) this.wall.splice(index,1);
};
Game.prototype.despawnPickUp=function(elmt) {
	var index;
	for (var i in this.pickup) {
		if(this.pickup[i][0]==elmt[0] && this.pickup[i][1]==elmt[1]) index=i;
	}
	var left=this.pickup[index][0],top=this.pickup[index][1];
	this.ctx.clearRect(left,top,30,30);
	this.pickup.splice(index,1);
}
Game.prototype.spawnBomb=function(x,y,index) {
	if(index>=3) {//The bomb has exploded
		var sprW=explosionSprite.width/5;
		var startX=(index-3)*sprW;
		this.ctxBomb.clearRect(x-151,y-151,302,302);
		this.ctxBomb.drawImage(explosionSprite,startX,0,sprW,explosionSprite.height,x-150,y-150,300,300);
		if(Math.floor(index)==3) {//The bomb just touch the ground
			var a=new Audio('../audio/bomb_explosion.mp3');
			a.play();
			for (var i in this.player) {
				var c=this.player[i].tank.currState;
				var a=x>c[0]?Math.pow(x-c[0],2):Math.pow(c[0]-x,2);
				var b=y>c[1]?Math.pow(y-c[1],2):Math.pow(c[1]-y,2);
				if(Math.sqrt(a+b)<=150) this.player[i].setLife(-10);
			}
			updateStat();
		}
		if(index<8) setTimeout(function(g,x,y,index){g.spawnBomb(x,y,index);},100,this,x,y,index+1);
		else setTimeout(function(ctx,l,t,w){ctx.clearRect(l,t,w,w);},100,this.ctxBomb,x-151,y-151,302);
	}
	else {//The bomb is falling
		var prevW=50-(index-0.5)*10;
		this.ctxBomb.clearRect(x-prevW/2,y-prevW/2,prevW,prevW);
		var width=50-index*10;
		this.ctxBomb.drawImage(bombSprite,x-width/2,y-width/2,width,width);
		setTimeout(function(g,x,y,index){g.spawnBomb(x,y,index);},100,this,x,y,index+0.5);
	}
}