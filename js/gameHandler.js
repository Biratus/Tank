//player:[up,left,down,right,shoot]
var GAME_WIDTH=1000,GAME_HEIGHT=600,DEFAULT_SIZE=25;
var keyCode=JSON.parse(localStorage.getItem('keyCode'));
var key=[],player=[],ctx0,bg,map='',ctx2,explosionSprite,bombSprite;
var p1,p2,t1,t2;
var game;
var patternIndestruct,patternDestruct;
var pickup_timeout,bg_sound_timeout,bg_sound,loop_timeout;
var src={
  0:'../img/sprite/TankDefault.png',
  1:'../img/sprite/TankShield.png',
  2:'../img/sprite/ConfusionTank.png',
  3:'../img/sprite/ConfusionShieldTank.png'
}
var spr_values={
  default:0,
  shield:1,
  confusion:2,
}

document.onkeydown=document.onkeyup=function(e) {key[e.keyCode]=e.type=="keydown";};
function loop() {
  loop_timeout=setTimeout(function(){loop();},10);
  ctx2.clearRect(0,0,GAME_WIDTH,GAME_HEIGHT);
  if(p1.life>0) {
    if(key[p1.getControl('up')] && key[p1.getControl('left')]) t1.draw(0.75*Math.PI);//left top
    else if(key[p1.getControl('left')] && key[p1.getControl('down')]) t1.draw(-0.75*Math.PI);//left down
    else if(key[p1.getControl('right')] && key[p1.getControl('up')]) t1.draw(0.25*Math.PI);//right top
    else if(key[p1.getControl('right')] && key[p1.getControl('down')]) t1.draw(-0.25*Math.PI);//right down
    else if(key[p1.getControl('left')]) t1.draw(Math.PI);//left
    else if(key[p1.getControl('up')]) t1.draw(0.5*Math.PI);//up
    else if(key[p1.getControl('right')]) t1.draw(0);//right
    else if(key[p1.getControl('down')]) t1.draw(-0.5*Math.PI);//down
    else t1.draw();
    if(key[p1.getControl('shoot')]) t1.shoot();
  }
  if(p2.life>0) {
    if(key[p2.getControl('up')] && key[p2.getControl('left')]) t2.draw(0.75*Math.PI);//left top
    else if(key[p2.getControl('left')] && key[p2.getControl('down')]) t2.draw(-0.75*Math.PI);//left down
    else if(key[p2.getControl('right')] && key[p2.getControl('up')]) t2.draw(0.25*Math.PI);//right top
    else if(key[p2.getControl('right')] && key[p2.getControl('down')]) t2.draw(-0.25*Math.PI);//right down
    else if(key[p2.getControl('left')]) t2.draw(Math.PI);//left
    else if(key[p2.getControl('up')]) t2.draw(Math.PI/2);//up
    else if(key[p2.getControl('right')]) t2.draw(0);//right
    else if(key[p2.getControl('down')]) t2.draw(-Math.PI/2);//down
    else t2.draw();
    if(key[p2.getControl('shoot')]) t2.shoot();
  }
  if(p1.life<=0 || p2.life<=0) end();
 };
$(document).ready(function() {
  var c=document.getElementById('layer0');
  ctx0=c.getContext('2d');
  c=document.getElementById('layer1');
  var ctx1=c.getContext('2d');
  c=document.getElementById('layer2');
  ctx2=c.getContext('2d');
  c=document.getElementById('layer-1');//Background
  bg=c.getContext('2d');
  var bg_img=new Image();
  bg_img.src='../img/grass_bg.png';
  bg_img.onload=function() {
    bg.drawImage(bg_img,0,0,GAME_WIDTH,GAME_HEIGHT);
  }
  bombSprite=new Image();
  bombSprite.src='../img/sprite/bomb.png';
  explosionSprite=new Image();
  explosionSprite.src='../img/sprite/explosion_sprite.png';

  $('#p1Life').css('left',$('#gameContainer').offset().left);
  $('#p2Life').css('right',$('#gameContainer').offset().left);
  var indes=new Image();
  indes.src='../img/wall_indestruct.png';
  var des=new Image();
  des.src='../img/wall_destruct.png';
  indes.onload=function() {patternIndestruct=ctx1.createPattern(indes,'repeat');game.drawWall();}
  des.onload=function() {patternDestruct=ctx1.createPattern(des,'repeat');game.drawWall();}

  p1=new Player(keyCode[0]);
  p2=new Player(keyCode[1]);

  if($(location).attr('search')!='') map=$(location).attr('search').substring(5,$(location).attr('search').length);
  
  game=new Game(p1,p2,ctx1,map,ctx0);
  t1=new Tank(ctx2,[DEFAULT_SIZE/2,DEFAULT_SIZE/2,0],'red',game);
  p1.setTank(t1);
  t2=new Tank(ctx2,[GAME_WIDTH-DEFAULT_SIZE/2,GAME_HEIGHT-DEFAULT_SIZE/2,Math.PI/2],'blue',game);
  p2.setTank(t2);
  t1.sprite.onload=function(){t1.draw();}
  t2.sprite.onload=function(){t2.draw();}
  pickup_timeout=setTimeout(function(game){game.spawnObject();},17500,game); 
  playBgSound();
  loop(0);
  $('.back_main_menu').click(function(){window.location.href='index.html';});
  var a=new Audio('../audio/start_game.mp3');
  a.play();
});
function updateStat() {
  $('#p1Life div').css('width',p1.life+"%");
  $('#p2Life div').css('width',p2.life+"%");
}
function playBgSound() {
  bg_sound=new Audio('../audio/bg_sound.mp3');
  bg_sound.addEventListener('loadedmetadata',function() {
    bg_sound_timeout=setTimeout(function() {playBgSound();},bg_sound.duration*1000);
    bg_sound.play();
  });
}
function end() {
  bg_sound.pause();
  clearTimeout(bg_sound_timeout);
  clearTimeout(pickup_timeout);
  clearTimeout(loop_timeout);
  $("#victory").show();
  if(p1.life) $('#victory').html('PLAYER 1<br/>WINS');
  else $("#victory").html('PLAYER 2<br/>WINS');
  var a=new Audio('../audio/victory.mp3');
  a.play();
}