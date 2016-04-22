function Player(control) {
	this.tank=0;
	this.control=control;
	this.life=100;
}
Player.prototype.getControl = function(direction) {
	if(direction=='up') return parseInt(this.control[0]);
	else if(direction=='left') return parseInt(this.control[1]);
	else if(direction=='down') return parseInt(this.control[2]);
	else if(direction=='right') return parseInt(this.control[3]);
	else if(direction=='shoot') return parseInt(this.control[4]);
	else return 0;
};
Player.prototype.setTank = function(tank) {
	this.tank=tank;
};
Player.prototype.setLife=function(difference) {
	this.life+=difference;
}
Player.prototype.confuse=function() {
	var tmp=this.control[0];
	this.control[0]=this.control[2];
	this.control[2]=tmp;
	tmp=this.control[1];
	this.control[1]=this.control[3];
	this.control[3]=tmp;
	if(this.tank.confuse) this.tank.sprite_value-=spr_values.confusion;
	else {
		var a=new Audio('../audio/dizzy.mp3');
		a.play();
		this.tank.sprite_value+=spr_values.confusion;
	}
	this.tank.sprite.src=src[this.tank.sprite_value];
	this.tank.confuse=!this.tank.confuse;
}

function Wall(param,destructible) {
	//param= coord left/top/right/bottom
	this.param=param;
	this.destructible=destructible;
	if(destructible) {
		$w=param[2]-param[0];
		$h=param[3]-param[1];
		$lastx=param[0];
		$lasty=param[1];
		$f=[];
		//split wall in area
		if($w>20) {
			for (var i=param[0]+20;i<=param[2];i+=20) {
				for (var j=param[1]+20;j<=param[3];j+=20) {
					$f.push([i-20,j-20,i,j]);
					$lasty=j;
				}
			}
			if($w%20!=0) {
				$lastx=param[2]-$w%20;
				for (var j=param[1]+20;j<=param[3];j+=20) {
					$f.push([$lastx,j-20,param[2],j]);
				}
			}
			if($h%20!=0) {
				$lasty=param[3]-$h%20;
				for (var i=param[0]+20;i<=param[2];i+=20) {
					$f.push([i-20,$lasty,i,param[3]]);
				}
			}
			if($w%20!=0 && $h%20!=0) {
				$f.push([param[2]-$w%20,param[3]-$h%20,param[2],param[3]])
			}
		}
		else {
			for (var j=param[1]+20;j<=param[3];j+=20) {
				$f.push([param[0],j-20,param[2],j]);
			}
			if($h%20!=20) $f.push([param[0],param[3]-$h%20,param[2],param[3]]);
		}
		if($f.length) this.param=$f;
		//this.param is now array of area where area is define by [left,top,right,bottom]
	}
}
Wall.prototype.collide=function(obj) {
	if(this.param[0].length) {
		for (i in this.param) {
			$c=this.param[i];
			if(!($c[0]>=obj[2] || $c[1]>=obj[3] || $c[2]<=obj[0] || $c[3]<=obj[1])) return true;
		}
	}
	else return !(this.param[0]>=obj[2] || this.param[2]<=obj[0] || this.param[1]>=obj[3] || this.param[3]<=obj[1]);
}
Wall.prototype.destructAt = function(ctx,obj) {
	for (i in this.param) {
		$c=this.param[i];
		if(!($c[0]>=obj[2] || $c[1]>=obj[3] || $c[2]<=obj[0] || $c[3]<=obj[1])) {
			ctx.clearRect($c[0],$c[1],$c[2]-$c[0],$c[3]-$c[1]);
			this.param.splice(i,1);
		}
	}
};
Wall.prototype.draw=function(ctx) {
	ctx.fillStyle=this.destructible?patternDestruct:patternIndestruct;
	for (i in this.param) {
		$c=this.param[i];
		ctx.fillRect($c[0],$c[1],$c[2]-$c[0],$c[3]-$c[1]);
	}
	if(!this.param[0].length) ctx.fillRect(this.param[0],this.param[1],this.param[2]-this.param[0],this.param[3]-this.param[1])
}