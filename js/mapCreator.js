var ctx,GAME_WIDTH=1000,GAME_HEIGHT=600,DEFAULT_SIZE=25;
var patternDestruct,patternIndestruct;
var img_delete;
  	$rect=[];
    $move=false;
  	$(document).ready(function() {
    
    $('canvas').attr("width",GAME_WIDTH);
    $('canvas').attr("height",GAME_HEIGHT);
    $('canvas').css('margin-left',Math.floor(($(document).width()-1000)/2));
    $('canvas').css('margin-top',Math.floor(($(document).height()-600)/2));
    $('button:eq(0)').css('margin-top',-41);
  		$click=false;
  		$pos=[];
      $pos['begin']=[];
      $pos['curr']=[];
      $spawn=[
        [0,0,DEFAULT_SIZE,DEFAULT_SIZE],
        [GAME_WIDTH-DEFAULT_SIZE,GAME_HEIGHT-DEFAULT_SIZE,GAME_WIDTH,GAME_HEIGHT]
      ];
      $('#solid').css('margin-left','-200px');
      $('#destruct').css('margin-left','10px');
      var img=new Image();
      img.src='../img/grass_bg.png';
      img_delete=new Image();
      img_delete.src='../img/delete.png';
      var c=document.getElementById('creatorBg');
      var ctxbg=c.getContext('2d');
      img.onload=function(){
        var bgPat=ctxbg.createPattern(img,"repeat");
        ctxbg.fillStyle=bgPat;
        ctxbg.fillRect(0,0,GAME_WIDTH,GAME_HEIGHT);
      }

  		c=document.getElementById('can');
    	ctx=c.getContext('2d');
      var imgDes=new Image();
      imgDes.src='../img/wall_destruct.png';
      imgDes.onload=function() {patternDestruct=ctx.createPattern(imgDes,"repeat");}
      var imgIndes=new Image();
      imgIndes.src='../img/wall_indestruct.png';
      imgIndes.onload=function() {
        patternIndestruct=ctx.createPattern(imgIndes,"repeat");
        ctx.fillStyle=patternIndestruct;
      }
      for (var i in $spawn) {//Draw spawning places
        ctx.fillStyle='red';
        var c=$spawn[i];
        ctx.fillRect(c[0],c[1],DEFAULT_SIZE,DEFAULT_SIZE);
      }
      $(".walls").click(function(e) {//dectructible/indestructible click
        $('.walls').attr('check','0');
        $(e.target).attr('check','1');
        if($(e.target).is('#solid')) ctx.fillStyle=patternIndestruct;
        else ctx.fillStyle=patternDestruct;
      });
      $('#can').mousemove(function(e) {//mouse move on canvas
        if($click) {//mouse was clicked before=draw wall
          $move=true;
          $mX=e.clientX-$('#can').offset().left;
          $mY=e.clientY-$('#can').offset().top;
          for (var i in $spawn) {
            var t=$spawn[i];
            if(($mX>=t[0] && $mX<=t[2] && $mY>=t[1] && $mY<=t[3]) || $mX<0 || $mX>GAME_WIDTH || $mY<0 || $mY>GAME_HEIGHT) return;
          }
          var currRect=[];
          currRect[0]=$mX>$pos['begin'][0]?$pos['begin'][0]:$mX;
          currRect[2]=$mX>$pos['begin'][0]?$mX:$pos['begin'][0];
          currRect[1]=$mY>$pos['begin'][1]?$pos['begin'][1]:$mY;
          currRect[3]=$mY>$pos['begin'][1]?$mY:$pos['begin'][1];
          for (var i in $rect) {
            var t=$rect[i];
            if(!(currRect[0]>=t[2] || currRect[2]<=t[0] || currRect[3]<=t[1] || currRect[1]>=t[3])) {
              $mX=$pos['curr'][0];
              $mY=$pos['curr'][1];
            }
          }
          if($pos['curr']) {//Clear previous rect
            $w=$pos['curr'][0]-$pos['begin'][0];
            $h=$pos['curr'][1]-$pos['begin'][1];
            ctx.clearRect($pos['begin'][0],$pos['begin'][1],$w,$h);
            if($rect.length) drawRect();
          }
          $w=$mX-$pos['begin'][0];
          $h=$mY-$pos['begin'][1];
          ctx.fillRect($pos['begin'][0],$pos['begin'][1],$w,$h);
          $pos['curr']=[$mX,$mY];
        }
        else {//mouse is just hovering the canvas=delete walls
          var rectIndex=isInRect(e.clientX-$('#can').offset().left,e.clientY-$('#can').offset().top);
          if(rectIndex>-1) {
            highlightRect(rectIndex);
            $('body').css('cursor','pointer');
          }
          else {
            $('body').css('cursor','default');
            for (var i in $rect) {
              unlightRect(i);
            }
          }
        }
      });
      $('#can').mousedown(function(e) {
        $click=true;
        $pos['begin']=[e.clientX-$('#can').offset().left,e.clientY-$('#can').offset().top];
      });

      $('#back_main_menu').mousedown(function(e){
      $(e.target).css('border','3px solid darkorange');
      $(e.target).css('color','darkorange');
      });
      $('#back_main_menu').mouseup(function(e){
        $(e.target).css('border','3px solid white');
        $(e.target).css('color','white');
        window.location='index.html';
      });
  	});
    $(document).mouseup(function(e) {
      if($click) {//mouse clicked on canvas before
        if(!$move) {//didn't draw=delete wall
          var inRect=isInRect(e.clientX-$('#can').offset().left,e.clientY-$('#can').offset().top);
          if(inRect>-1) rem(inRect);
          $click=false;
          $move=false;
          return;
        }
        $click=false;
        $move=false;
        var inSpawn=isInSpawn($pos['curr'][0],$pos['curr'][1]);
        if(!inSpawn<0) {
          $pos['curr'][0]=$spawn[inSpawn][0]==0?$spawn[inSpawn][2]:$spawn[inSpawn][0];
          $pos['curr'][1]=$spawn[inSpawn][1]==0?$spawn[inSpawn][3]:$spawn[inSpawn][1];
        }
        if($pos['begin'][0]==$pos['curr'][0] || $pos['begin'][1]==$pos['curr'][1]) return;
        if($pos['curr'][0]>GAME_WIDTH) $pos['curr'][0]=GAME_WIDTH;
        if($pos['curr'][1]>GAME_HEIGHT) $pos['curr'][1]=GAME_HEIGHT;
        if($pos['curr'][0]<0) $pos['curr'][0]=0;
        if($pos['curr'][1]<0) $pos['curr'][1]=0;
        if(Math.abs($pos['begin'][0]-$pos['curr'][0])<20 || Math.abs($pos['begin'][1]-$pos['curr'][1])<20 ) {
          toastr.info('Walls must be 20px wide at least.','Too thin walls');
          ctx.clearRect($pos['begin'][0],$pos['begin'][1],$pos['curr'][0]-$pos['begin'][0],$pos['curr'][1]-$pos['begin'][1]);
          $pos['begin']=[];
          $pos['curr']=[];
          return;
        }
        var currRect=[];
        currRect[0]=$pos['curr'][0]>$pos['begin'][0]?$pos['begin'][0]:$pos['curr'][0];
        currRect[2]=$pos['curr'][0]>$pos['begin'][0]?$pos['curr'][0]:$pos['begin'][0];
        currRect[1]=$pos['curr'][1]>$pos['begin'][1]?$pos['begin'][1]:$pos['curr'][1];
        currRect[3]=$pos['curr'][1]>$pos['begin'][1]?$pos['curr'][1]:$pos['begin'][1];
        currRect[4]=parseInt($('.walls[check=1]').attr('value'));
        $rect.push(currRect);
      }
    });
function isInRect(x,y) {//return wall index if coord [x,y] are in a wall else return -1
  for (var i in $rect) {
    var t=$rect[i];
    if (x>=t[0] && x<=t[2] && y>=t[1] && y<=t[3]) return i;
  }
  return -1;
}
function isInSpawn(x,y) {//return spawn index if coord [x,y] are in a spanw else return -1
  for (var i in $spawn) {
    var t=$spawn[i];
    if (x>=t[0] && x<=t[2] && y>=t[1] && y<=t[3]) return i;
  }
  return -1;
}
function highlightRect(i) {//display X on wall => to delete
		$obj=$rect[i];
    var prev=ctx.fillStyle;
    var w=$obj[2]-$obj[0];
    var h=$obj[3]-$obj[1];
    var x,y;
    if(w>h) {
      x=$obj[0]+w/2-h/2;
      y=$obj[1];
      w=h;
    }
    else {
      x=$obj[0];
      y=$obj[1]+h/2-w/2;
      h=w;
    }
    ctx.globalAlpha=0.8;
    ctx.drawImage(img_delete,x,y,w,h);
    ctx.globalAlpha=1;
}
	function unlightRect(i) {//remove X on wall
		$obj=$rect[i];
    var prev=ctx.fillStyle;
    ctx.fillStyle=$obj[4]==0?patternIndestruct:patternDestruct;
		ctx.fillRect($obj[0],$obj[1],$obj[2]-$obj[0],$obj[3]-$obj[1]);
    ctx.fillStyle=prev;
	}
	function rem(i) {//remove wall
		$rect.splice(i,1);
		ctx.clearRect(0,0,GAME_WIDTH,GAME_HEIGHT);
		drawRect();
	}
  	function drawRect() {//draw every walls
    var prev=ctx.fillStyle;
		for ($i in $rect) {
			$currWall=$rect[$i];
      ctx.fillStyle=$currWall[4]==0?patternIndestruct:patternDestruct;
			ctx.fillRect($currWall[0],$currWall[1],$currWall[2]-$currWall[0],$currWall[3]-$currWall[1]);
		}
    ctx.fillStyle='red';
    ctx.fillRect(0,0,DEFAULT_SIZE,DEFAULT_SIZE);
    ctx.fillRect(GAME_WIDTH-DEFAULT_SIZE,GAME_HEIGHT-DEFAULT_SIZE,DEFAULT_SIZE,DEFAULT_SIZE);
    ctx.fillStyle=prev;
  	}
  	function saveMap() {
  		if(!$rect.length) {
  			toastr.info("The map wasn't save","Blank Map");
  			return;
  		}
  		$i=0;
  		while(localStorage.getItem("Map"+$i)) $i++;
  		localStorage.setItem('Map'+$i,JSON.stringify($rect));
      clearMap();
  	}
  	function clearMap() {
  		ctx.clearRect(0,0,GAME_WIDTH,GAME_HEIGHT);
      ctx.fillStyle='red';
      for (var i in $spawn) {
        var c=$spawn[i];
        ctx.fillRect(c[0],c[1],DEFAULT_SIZE,DEFAULT_SIZE);
      }
      ctx.fillStyle=patternIndestruct;
  		$rect=[];
  		$('p').html('');
  	}