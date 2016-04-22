var difference={
  shield:247,
  confusion:512
};
function Tank(context,pos,color,game) {
  this.ctx=context;
  this.sprite_value=0;
  this.sprite=new Image();
  this.sprite.src=src[0];
  //the position is the center of the sprite
  this.currState=[pos[0],pos[1],pos[2],3];//centerX,centerY,angle,size
  this.size=1;//size ratio
  this.speed=1.5;
  //can shoot,shoot rate,shoot range,shoot color
  this.shootParam=[true,500,200,color];
  this.shootTimeout=[];
  this.ghost=[]
  this.ghost[0]=false;
  this.shield=[]
  this.shield[0]=false;
  this.confuse=false;
  this.game=game;
}
Tank.prototype.draw = function(angle) {
  var pos=this.canMove(angle);
  if(angle==null || !pos) {
    this.ctx.save();
    this.ctx.translate(this.currState[0],this.currState[1]);
    if(this.currState[2]%Math.PI!=0) this.ctx.rotate(-this.currState[2]);
    else this.ctx.rotate(this.currState[2]);
    var ratio=1;
    if(this.confuse) ratio=difference.confusion/232;
    else if(this.shield[0]) ratio=difference.shield/232;
    this.ctx.translate(-DEFAULT_SIZE*this.size*ratio/2,-DEFAULT_SIZE*this.size*ratio/2);
    if(this.ghost[0]) this.ctx.globalAlpha=0.7;
    this.ctx.drawImage(this.sprite,0,0,DEFAULT_SIZE*this.size*ratio,DEFAULT_SIZE*this.size*ratio);
    this.ctx.globalAlpha=1;
    this.ctx.restore();
    return;
  }
  //Draw
  this.ctx.save();
  this.currState=[pos[0],pos[1],angle,this.size];
  this.ctx.translate(this.currState[0],this.currState[1]);//Translate to tank center
  if(angle%Math.PI!=0) this.ctx.rotate(-angle);
  else this.ctx.rotate(angle);
  var ratio=1;
  if(this.confuse) ratio=difference.confusion/232;
  else if(this.shield[0]) ratio=difference.shield/232;
  this.ctx.translate(-DEFAULT_SIZE*this.size*ratio/2,-DEFAULT_SIZE*this.size*ratio/2);//translate to top-left corner depending on spr drawn
  if(this.ghost[0]) this.ctx.globalAlpha=0.7;
  this.ctx.drawImage(this.sprite,0,0,DEFAULT_SIZE*this.size*ratio,DEFAULT_SIZE*this.size*ratio);
  this.ctx.globalAlpha=1;
  this.ctx.restore();
};
Tank.prototype.setSize = function(coef) {
  if(coef<0) this.size=(this.size-0.4)<0?0.4:this.size-0.4;
  else this.size+=0.4;
  this.sprite.width=DEFAULT_SIZE*this.size;
  this.sprite.height=DEFAULT_SIZE*this.size;
};
Tank.prototype.setRate = function(coef) {
  if(coef<0) this.shootParam[1]=(this.shootParam[1]-200)<0?100:this.shootParam[1]-200;
  else this.shootParam[1]+=200;
};
Tank.prototype.setRange = function(coef) {
  if(coef<0) this.shootParam[2]=(this.shootParam[2]-50)<50?50:this.shootParam[2]-50;
  else this.shootParam[2]+=50;
};
Tank.prototype.setSpeed = function(coef) {
  if(coef<1) this.speed=(this.speed-1)<0?0.5:this.speed-1;
  else this.speed+=1;
};
Tank.prototype.shoot = function() {
  if(this.shootParam[0]) {
    var a=new Audio('../audio/cannon2.mp3');
    a.play();
    this.shootParam[0]=false;
    var angle=this.currState[2];
    var x=this.currState[0];
    var y=this.currState[1];
    var cos=Math.cos(angle);
    var sin=Math.sin(angle);
    x+=cos*DEFAULT_SIZE*0.7*this.size;
    y-=sin*DEFAULT_SIZE*0.7*this.size;
    this.shootAnim(0,path(x,y,angle,this.shootParam[2]),this.size);
    setTimeout(function(tank) {tank.shootParam[0]=true;},this.shootParam[1],this);
  }
};
Tank.prototype.shootAnim = function(index,path,size) {
  var curr=path[index];
  var obj=[curr[0]-size*2,curr[1]-size*2,curr[0]+size*2,curr[1]+size*2,"shoot"];
  var wall=this.game.isInObstacle(obj);
  if(wall) {//collision with wall or tank
    if(wall.split('.')[0]=='destroy') this.game.destructWall(parseInt(wall.split('.')[1]),obj);
    else if(wall.split('.')[0]=='shoot') this.game.shoot(parseInt(wall.split('.')[1]));
    return;
  }
  if(index==path.length-1) return;
  this.ctx.beginPath();
  this.ctx.arc(curr[0],curr[1],size*2,0,2*Math.PI);
  this.ctx.fillStyle=this.shootParam[3];
  this.ctx.fill();
  this.ctx.closePath();
  if(index!=path.length-1) setTimeout(function(t,index,path,size){t.shootAnim(index,path,size);},10,this,index+1,path,size);
};
Tank.prototype.canMove = function(angle) {
  var left=Math.cos(angle);
  var top=Math.sin(angle);
  var next=[this.currState[0]+left*this.speed , this.currState[1]-top*this.speed];
  var p=this.speed>=5?path(this.currState[0],this.currState[1],angle,this.speed):[next];
  for (var i in p) {
    var curr=p[i];
    var obj=[curr[0]-DEFAULT_SIZE*this.size/2 , curr[1]-DEFAULT_SIZE*this.size/2 , curr[0]+DEFAULT_SIZE*this.size/2 , curr[1]+DEFAULT_SIZE*this.size/2,this];
    var obstacle=this.game.isInObstacle(obj);
    var index;
    if(obstacle) {//can be either "true" or "pickup" or "shoot"
      index=obstacle.split(".")[1];
      obstacle=obstacle.split(".")[0];
      if(obstacle=="pickup") this.game.collidePickUp(this,parseInt(index));
      else if(!this.ghost[0]) return i==0?0:p[i-1];
    }
    if(this.game.isInLimit(obj)) return i==0?0:p[i-1];
  }
  return p[p.length-1];
};
Tank.prototype.ghostify=function(param) {
  if(param) {//End of ghost
    var obj=[this.currState[0]-DEFAULT_SIZE*this.size/2 , this.currState[1]-DEFAULT_SIZE*this.size/2 , this.currState[0]+DEFAULT_SIZE*this.size/2 , this.currState[1]+DEFAULT_SIZE*this.size/2,this];
    var obstacle=this.game.isInObstacle(obj);
    if(!obstacle) this.ghost[0]=false;
    else if(obstacle=="wall.l") setTimeout(function(t){t.ghostify("out")},10,this);
    return;
  }
  if(!this.ghost[0]) {//normal to ghost
      this.ghost[0]=true;
      this.ghost[1]=setTimeout(function(t){t.ghostify("out")},10000,this);
  }
  else {//Already ghost
    clearTimeout(this.ghost[1]);
    this.ghost[1]=setTimeout(function(t){t.ghostify("out")},10000,this);
  }
};

Tank.prototype.shieldify=function() {
  if(!this.shield[0]) {//doesn't have shield
      this.shield[0]=true;
      this.sprite_value+=spr_values.shield;
      this.sprite.src=src[this.sprite_value];
      this.shield[1]=setTimeout(function(t){
        t.ctx.clearRect(t.currState[0]-DEFAULT_SIZE*t.currState[3]-15,t.currState[1]-DEFAULT_SIZE*t.currState[3]-15,40+DEFAULT_SIZE*t.currState[3],40+DEFAULT_SIZE*t.currState[3]);
        t.draw();
        t.sprite_value-=spr_values.shield;
        t.sprite.src=src[t.sprite_value];
        t.shield[0]=false;
      },10000,this);
      
  }
  else {//already has shield
    clearTimeout(this.shield[1]);
    this.shield[1]=setTimeout(function(t){
        t.shield[0]=false;
        t.sprite_value-=spr_values.shield;
        t.sprite.src=src[t.sprite_value];
        t.ctx.clearRect(t.currState[0]-DEFAULT_SIZE*t.currState[3]-15,t.currState[1]-DEFAULT_SIZE*t.currState[1]-15,40+DEFAULT_SIZE*t.currState[3],40+DEFAULT_SIZE*t.currState[3]);
      },10000,this);
  }
};

function path(x,y,angle,length) {
  var ret=[];
  var coefx=Math.cos(angle);
  var coefy=Math.sin(angle);
  if(coefx<=6.123233995736766*Math.pow(10,-16) && coefx>=-6.123233995736766*Math.pow(10,-16)) coefx=0;
  if(coefy<=1.2246467991473532*Math.pow(10,-15) && coefy>=-1.2246467991473532*Math.pow(10,-15)) coefy=0;
  var tx=x+5*coefx,ty=y-5*coefy;
  var step=coefx==0?coefy*5:coefx*5;
  for (var i=0;i<=(length-Math.abs(step));i+=Math.abs(step)) {
    ret.push([tx,ty]);
    tx+=5*coefx;
    ty-=5*coefy;
  }
  return ret;
}