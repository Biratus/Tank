$clicked=[];
var bg,patternDestruct,patternIndestruct;
var song,song_timeout;
$(document).ready(function() {
  bg=new Image();
  bg.src='../img/grass_bg.png';
  var c=document.createElement('canvas');
  var ctx=c.getContext('2d');
  var imgDes=new Image();
  imgDes.src='../img/wall_destruct.png';
  imgDes.onload=function() {patternDestruct=ctx.createPattern(imgDes,"repeat");}
  var imgIndes=new Image();
  imgIndes.src='../img/wall_indestruct.png';
  imgIndes.onload=function() {patternIndestruct=ctx.createPattern(imgIndes,"repeat");}
  if(!localStorage.getItem('keyCode')) {
    var a=[["87","65","83","68","32"],["104","100","101","102","13"]];
    localStorage.setItem('keyCode',JSON.stringify(a));
  }
  else {
    var k=JSON.parse(localStorage.getItem('keyCode'));
    for (var i in k[0]) {
      var val=parseInt(k[0][i]);
      $('.player1:eq('+i+') td[val]').text(txtFromCode(val));
      $('.player1:eq('+i+') td[val]').attr('val',val);
    }
    for (var i in k[1]) {
      var val=parseInt(k[1][i]);
      $('.player2:eq('+i+') td[val]').text(txtFromCode(val));
      $('.player2:eq('+i+') td[val]').attr('val',val);
    }

  }
  $('body').css('height',$(document).height());
  $('body').css('width',$(document).width());
  var GAME_WIDTH=1000,GAME_HEIGHT=600;
  $('#title ul').css('margin-top',$('#title ul').height()/-2);
  $('#title ul').css('margin-left',$('#title ul').width()/-2);
  $('.back_main_menu').mousedown(function(e){
    $(e.target).css('border','3px solid darkorange');
    $(e.target).css('color','darkorange');
  });
  $('.back_main_menu').mouseup(function(e){
    $(e.target).css('border','3px solid white');
    $(e.target).css('color','white');
    if(checkEntry()) {
      $('#title').show();
      $('#controls').hide();
    }
  });
  $('#load .back_main_menu').click(function() {
      $('#title').show();
      $('#load').hide();
  })

  $('#title li img').hover(function(e) {
    var src=$(e.target).attr('src');
    $(e.target).attr('src',src.replace("default","click"));
  },
  function(e) {
    var src=$(e.target).attr('src');
    $(e.target).attr('src',src.replace("click","default"));    
  });
  $('#title li img').click(function(e) {
    var li=$(e.target).parent();
    if(li.is($('#title li:eq(0)'))) {
      $('#title').hide();
      $('#load').show();
      initLoad();
    }
    else if(li.is($('#title li:eq(1)'))) {
      $('#title').hide();
      $('#controls').show();
      $('#controls img').css('margin-left',500-$('#controls img').width()/2);
      $('#control_container').css('margin-top',10+$('#control_container').height()/-2);
      $('#control_container').css('margin-left',$('#control_container').width()/-2);
    }
    else {
      window.location.href='mapCreator.html';
    }
  });
  $('#control_container td[val]').click(function(e) {
    console.log("click");
    $p=$(e.target).parent().attr('class');
    $(e.target).text('_');
    $clicked[0]=$p;
    $clicked[1]=$(e.target).attr('class');
  });
  $('#load').mouseup(function(e) {
      if($(e.target).is('td')) {
        window.location.href="game.html?map=Map"+$(e.target).text();
        clearTimeout(song_timeout);
        song.pause();
        return;
      }
      if(!$('#savedMap').is(':hidden')) $('#savedMap').hide();
      else {
        if($(e.target).is('#load span:eq(0)')) {
          window.location.href='game.html';
          clearTimeout(song_timeout);
          song.pause();
        }
        else if($(e.target).is('#load span:eq(1)')) $('#savedMap').show();
      }
  });
  song=new Audio('../audio/menu_song.mp3');
  playBgSong();
});
$(document).keyup(function(e) {
  if($clicked.length) {
    var p=$clicked[0];
    var c=$clicked[1];
    if((e.keyCode>=37 && e.keyCode<=40) || e.keyCode==96) {
      toastr.warning('Unfortunately you cannot use the arrow keys or Numpad 0','Forbidden key');
      $("."+p+" ."+c).text(txtFromCode($("."+p+" ."+c).attr('val')));
      return;
    }
    $("."+p+" ."+c).attr('val',e.keyCode);
    $("."+p+" ."+c).text(txtFromCode(e.keyCode));
    $clicked=[];
  }
});
function playBgSong() {
  song.play();
  song_timeout=setTimeout(function(){playBgSong();},song.duration);
}
function txtFromCode(val) {
      var txt=String.fromCharCode(val);
      if(val==32) txt="Space";
      else if(val==13) txt="Numpad Enter";
      else if(val==16) txt="ShiftLeft";
      else if(val>=97 && val<=105) txt="Numpad "+(val-96);
      return txt;
}
function checkEntry() {
  $keyCode=[];
  $go=true;
  $control='#controls td[val]';
  $seen={};
  $($control).each(function() {
    $val=$(this).attr('val');
    if($seen[$val]) {
      $go=false;
      $(this).css('border','2px solid red');
    }
    else {
      $seen[$val]=true;
      $(this).css('border','2px solid white');
    }
  });
  if(!$go) {
    toastr.error("A key is used for two or more control.","Duplicate controls");
    return false;
  }
  $($control).each(function() {
    $p=$(this).parent().attr('class');
    $p=$p.replace('player','');
    if(!$keyCode[parseInt($p)-1]) $keyCode[parseInt($p)-1]=[];
    $keyCode[parseInt($p)-1].push($(this).attr('val'));
  });
  localStorage.setItem('keyCode',JSON.stringify($keyCode));
  return true;
}
function initLoad() {
  if(localStorage.getItem('Map0')) {
    $('span:eq(2)').attr("enabled","yes");
    $i=0;
    $map=[];
    while(localStorage.getItem('Map'+$i)) {
      $map.push(JSON.parse(localStorage.getItem('Map'+$i)));
      $i++;
    }
    var html='';
    for ($j in $map) {
      $rect=$map[$j];
      $c=document.createElement('canvas');
      $c.width=1000;
      $c.height=600;
      $ctx=$c.getContext("2d");
      $ctx.drawImage(bg,0,0,1000,600);
      for (var i=0;i<$rect.length;i++) {
        $curr=$rect[i];
        $ctx.fillStyle=$curr[4]==0?patternIndestruct:patternDestruct;
        $ctx.fillRect($curr[0],$curr[1],$curr[2]-$curr[0],$curr[3]-$curr[1]);
      }
      html+='<td>'+$j+'</td>';
      if(($j-1)%8==0 && $j!=1) html+='<tr>';
    }
    $('#savedMap').html(html);
    $('#load').css('font-family','main_font');
  }
  $('#savedMap').hide();
}