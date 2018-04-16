//Colors:
var violet = "DeepPink";
var purple = "MediumOrchid";
var yellow = "yellow";
var blue = "DeepSkyBlue";
var wallBlue = "#1E90FF";
var darkBlue = "Aqua";
var white = "MintCream";
var ballColor = "white";
var transparent = "rgba(0,0,0,0.1)";

//Codes:
var nullCode = 0;
var wallCode = 1;
var flipperCode = 2;
var leftOctagonCode = 3;
var rightOctagonCode = 4;
var paddleCode = 5;

var cvs;//canvas
var ctx;//cvs.getContext("2d")
var p = new Array();//info of each pixel
var value = new Array(200);//The score of an element.
var brickW = 45, brickH = 20;//Width and height of a brick.
var bricks = new Array(200);//The status of each brick.
var ball = {x:400, y:680, a:0.5*Math.PI, v:2, r:6};
var paddleX = 400, paddle1Y = 460, paddle2Y = 780-15, paddleWidth = 80, paddleHeight = 15;
var leftBoarder = 147 + paddleWidth / 2, rightBoarder = 653 - paddleWidth / 2;
var score = 0, life = 0;
var flipperStatus = 0;// the size of flipper, for animation.
var collisionCount = 0;
var leftEmpty = false, rightEmpty = false, upperEmpty = false;
var gamePause = true;
var frames = 10800;
var initialBallSpeed = 3;
var paddleMove = 0;

//document.addEventListener("mousemove", mouseMoveHandler, false);
document.addEventListener("touchmove", touchMoveHandler, false);
document.addEventListener("touchstart", touchStartHandler, false);
document.addEventListener("touchend", touchLeaveHandler, false);
window.addEventListener('keydown', keyDownHandler, false);
window.addEventListener('keyup', keyUpHandler, false);

function drawRect(color,x1,y1,x2,y2,type=1){
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.fillRect(x1,y1,x2-x1,y2-y1);
    var i,j;
    for(i = x1; i < x2; i++){
        for(j = y1; j < y2; j++){
            p[i][j] = type;
        }
    }
}
function drawBrick (x, y, color, type, vert = false) {
    if (vert) drawRect(color,x,y,x+brickH,y+brickW,type);//vertical
    else drawRect(color,x,y,x+brickW,y+brickH,type);
}
function drawUpperBricks(reset=true){//reset=true: when initializing or when all bricks were killed.
    if(upperEmpty && !reset) return;
    upperEmpty = true;
    var i,j,tx,ty,count;
    count = 10; tx=122+25+5; ty=75+5;
    for(i=0;i<2;i++){
        for(j=0;j<10;j++){
            if(bricks[count] || reset){
                drawBrick(tx,ty,violet,count);
                value[count]=20;
                bricks[count]=true;
                upperEmpty=false;
            }
            count++;
            tx+=50;
        }
        tx-=500;
        ty+=25;
    }
    // ==== yellow part ====
    for(j=0;j<10;j++){
        if(bricks[count] || reset){
            drawBrick(tx,ty,yellow,count);
            value[count]=10;
            bricks[count]=true;
            upperEmpty=false;
        }
        count++;
        tx+=50;
    }
    if(upperEmpty) value[flipperCode] *= 10;
}
function drawLeftBricks(reset=true){
    if(leftEmpty && !reset) return;
    leftEmpty = true;
    var i,j,tx,ty,count;
    count = 40; tx=47+30; ty=125+30;
    for(i=0;i<5;i++){
        for(j=0;j<3;j++){
            if(bricks[count] || reset){
                drawBrick(tx,ty,blue,count,true);
                value[count]=20;
                bricks[count]=true;
                leftEmpty = false;
            }
            count++;
            tx+=25;
        }
        tx-=75;
        ty+=50;
    }
    if(leftEmpty) value[leftOctagonCode] *= 10;
}
function drawRightBricks(reset=true){
    if(rightEmpty && !reset) return;
    rightEmpty = true;
    var i,j,tx,ty,count;
    count = 55; tx=653; ty=125+30;
    for(i=0;i<5;i++){
        for(j=0;j<3;j++){
            if(bricks[count] || reset){
                drawBrick(tx,ty,blue,count,true);
                value[count]=20;
                bricks[count]=true;
                rightEmpty = false;
            }
            count++;
            tx+=25;
        }
        tx-=75;
        ty+=50;
    }
    if(rightEmpty) value[rightOctagonCode] *= 10;
}
function drawLeftButtomBricks(reset=true){
    var i,j,tx,ty,count;
    count = 70; tx=47+25+2; ty=430+5;
    for(i=0;i<5;i++){
        for(j=0;j<1;j++){
            if(bricks[count] || reset){
                drawBrick(tx,ty,blue,count);
                value[count]=50;
                bricks[count]=true;
            }
            count++;
        }
        ty+=25;
    }
}
function drawRightButtomBricks(reset=true){
    var i,j,tx,ty,count;
    count = 75; tx=653+25+3; ty=430+5;
    for(i=0;i<5;i++){
        for(j=0;j<1;j++){
            if(bricks[count] || reset){
                drawBrick(tx,ty,blue,count);
                value[count]=50;
                bricks[count]=true;
            }
            count++;
        }
        ty+=25;
    }
}
function drawOctagon(color,x,y,a){
    var b = Math.floor(a/1.414);
    ctx.fillStyle=color;
    ctx.beginPath();//right
    ctx.moveTo(x,y);
    ctx.lineTo(x+b,y+b);
    ctx.lineTo(x+b+a,y+b);
    ctx.lineTo(x+b+a+b,y);
    ctx.lineTo(x+b+a+b,y-a);
    ctx.lineTo(x+b+a,y-a-b);
    ctx.lineTo(x+b,y-a-b);
    ctx.lineTo(x,y-a);
    ctx.fill();
}
function drawTriangle(color,x,y,a,right=false){
    var b = Math.floor(a/2);
    var c = Math.ceil(b*1.732);
    ctx.fillStyle=color;
    ctx.beginPath();
    ctx.moveTo(x,y);
    if(right) ctx.lineTo(x-c,y-b);
    else ctx.lineTo(x+c,y-b);
    ctx.lineTo(x,y-a);
    ctx.fill();
}
function drawWalls(){
    // ======== white part ========
    drawRect(white,390,400,410,460);
    drawTriangle(white,330,340,25);
    drawTriangle(white,800-330,340,25,true);

    // ======== violet part ========
    drawRect(violet,122,50,800-122,75);
    drawRect(violet,122,75,122+25,75+50);
    drawRect(violet,800-122-25,75,800-122,75+50);
    
    // ======== purple part ========
    drawRect(purple,47,125,47+100,150);
    drawRect(purple,653,125,753,150);

    //bottom two
    drawRect(purple,47,730,47+25,730+50);
    drawRect(purple,728,730,728+25,730+50);
    
    //drawRect(transparent,47,125,47+25,580+25);//for setting pixels
    ctx.fillStyle=purple;
    ctx.beginPath();//left
    ctx.moveTo(47,125);
    ctx.lineTo(47,580);
    ctx.lineTo(47+25,580+25);
    ctx.lineTo(47+25,125+25);
    ctx.fill();
    
    //drawRect(transparent,753,125,753-25,580+25);
    ctx.fillStyle=purple;
    ctx.beginPath();//right
    ctx.moveTo(753,125);
    ctx.lineTo(753,580);
    ctx.lineTo(753-25,580+25);
    ctx.lineTo(753-25,125+25);
    ctx.fill();

    ctx.fillStyle=purple;
    ctx.beginPath();//right
    ctx.moveTo(147,740);
    ctx.lineTo(147,780);
    ctx.lineTo(147-25,780);
    ctx.lineTo(147-25,740+25);
    ctx.fill();

    ctx.fillStyle=purple;
    ctx.beginPath();//right
    ctx.moveTo(653,740);
    ctx.lineTo(653,780);
    ctx.lineTo(653+25,780);
    ctx.lineTo(653+25,740+25);
    ctx.fill();

    // ========= blue part ========
    drawRect(wallBlue,47+25,405,47+100,405+25);
    drawRect(wallBlue,753-25,405,653,405+25);
    drawRect(wallBlue,47+50,580+50,47+50+25,580+50+50);
    drawRect(wallBlue,753-25-50,580+50,753-50,580+100);

    //ADD SOMETHING FOR PIXELS HERE!!!
    //drawRect(transparent,753,125,753-25,580+25);
    ctx.fillStyle=wallBlue;
    ctx.beginPath();//right
    ctx.moveTo(147,430);
    ctx.lineTo(147,580);
    ctx.lineTo(147-25,580-25);
    ctx.lineTo(147-25,430);
    ctx.fill();

    //ADD SOMETHING FOR PIXELS HERE!!!
    //drawRect(transparent,753,125,753-25,580+25);
    ctx.fillStyle=wallBlue;
    ctx.beginPath();//right
    ctx.moveTo(653,430);
    ctx.lineTo(653,580);
    ctx.lineTo(653+25,580-25);
    ctx.lineTo(653+25,430);
    ctx.fill();

    //ADD SOMETHING FOR PIXELS HERE!!!
    ctx.fillStyle=wallBlue;
    ctx.beginPath();//right
    ctx.moveTo(47,580);
    ctx.lineTo(47+50,580+50);
    ctx.lineTo(47+50+25,580+50);
    ctx.lineTo(47+25,580);
    ctx.fill();

    //ADD SOMETHING FOR PIXELS HERE!!!
    ctx.fillStyle=wallBlue;
    ctx.beginPath();//left
    ctx.moveTo(753,580);
    ctx.lineTo(753-25,580);
    ctx.lineTo(753-25-50,580+50);
    ctx.lineTo(753-50,580+50);
    ctx.fill();

    //ADD SOMETHING FOR PIXELS HERE!!!
    ctx.fillStyle=wallBlue;
    ctx.beginPath();//right
    ctx.moveTo(753,580);
    ctx.lineTo(753-25,580);
    ctx.lineTo(753-25-50,580+50);
    ctx.lineTo(753-50,580+50);
    ctx.fill();

    //ADD SOMETHING FOR PIXELS HERE!!!
    ctx.fillStyle=wallBlue;
    ctx.beginPath();//left
    ctx.moveTo(47+50,680);
    ctx.lineTo(47,680+50);
    ctx.lineTo(47+25,680+50);
    ctx.lineTo(47+50+25,680);
    ctx.fill();
    
    //ADD SOMETHING FOR PIXELS HERE!!!
    ctx.fillStyle=wallBlue;
    ctx.beginPath();//right
    753-25-50,580+50,753-50,580+100
    ctx.moveTo(678,680);
    ctx.lineTo(678+50,680+50);
    ctx.lineTo(678+75,680+50);
    ctx.lineTo(678+25,680);
    ctx.fill();
}

function drawFlipper(){
    if (flipperStatus != 0) {
        if(flipperStatus % 10 == 0) flipperStatus += 10;
        else flipperStatus -= 10;
    }
    if (flipperStatus > 95) flipperStatus = 95;
    if (flipperStatus < 5) flipperStatus = 0;
    drawRect(darkBlue,330+20,323-Math.floor(flipperStatus/10),800-330-20,332+Math.floor(flipperStatus/10),flipperCode);//3 for flipper
    //drawRect("rgb(0,50,220-Math.floor(flipperStatus/2))",330+20,320,800-330-20,335,flipperCode);//3 for flipper
}

function drawInfo(info,x=400,y=680,size=30,fill="#FCD",shadow="#000"){
    ctx.font = size/10+"em Arial";
    ctx.fillStyle = shadow;
    ctx.fillText(info, x-2, y-2);
    ctx.fillStyle = fill;
    ctx.fillText(info, x, y);
}

function drawTime(){
    var sec = Math.floor(frames/60);
    ctx.font = "2.4em Arial";
    ctx.fillStyle = "#000";
    ctx.fillText(sec+" sec left", 400-2, 40-2);
    if(sec>60) ctx.fillStyle = "#AEA";
    else if(sec>10) ctx.fillStyle = "#EEA";
    else ctx.fillStyle = "#FBB";
    ctx.fillText(sec+" sec left", 400, 40);
}

function setAllPixel(value){
    var imgData=ctx.getImageData(0,0,cvs.width,cvs.height);//800
    var x=0,y=0,t;
    var flag = false;
    for (var i = 0; i < imgData.data.length; i += 4)//25600=800*800*4
    {//data[i]:r, i+1:g, i+2:b, i+3:a
        if(imgData.data[i+3] != 0 && p[x][y] == 0){
            p[x][y] = value;
            flag = true;
        }
        x++;
        if(x >= cvs.width) { x = 0; y++; }
    }
    //if(flag==false) alert("Error: No pixel has been set.");
}

function removePixel(code,x1=0,y1=0,x2=cvs.width,y2=cvs.height) {
    var i,j;
    for(i = x1; i < x2; i++){
        for(j = y1; j < y2; j++){
            if(p[i][j] == code) p[i][j]=0;
        }
    }
}

function initBall() {
    ball.x = 400; ball.y = 680;
    ball.a = Math.PI * (0.5 + (Math.random() * 0.1 + 0.2) * (Math.floor(Math.random() * 1.99)*2 - 1));
    ball.v = initialBallSpeed;
    ball.r = 6;
    setSpeed();
    //0.2~0.3 0.7~0.8 -> -0.3~-0.2 0.2~0.3
}

function init(){
    cvs = document.getElementById("cvs-cyr");
    document.getElementById("resetButton").blur();
    cvs.focus();
    ctx = cvs.getContext("2d");
    ctx.textAlign="center";
    ctx.clearRect(0, 0, cvs.width, cvs.height);
    var i,x,y;
    for(x = 0; x <= cvs.width+50; x ++) {//In case of ball hitting the boarder (value[805] will be NaN).
        p[x] = new Array();
        for(y = 0; y <= cvs.width+50; y ++){
            p[x][y] = 0;
        }
    }
    for(i=0;i<200;i++) { value[i]=0; bricks[i]=false; }
    value[flipperCode] = 10;
    value[leftOctagonCode] = 10;
    value[rightOctagonCode] = 10;
    value[paddleCode] = 10;
    paddleX = cvs.width / 2;
    paddleMove = 0;
    score = 0;
    life = 3;
    flipperStatus = 0;
    collisionCount = 0;
    leftEmpty = false, rightEmpty = false;
    gamePause = true;
    frames = 10800;

    initBall();

    drawWalls();
    setAllPixel(wallCode);//1 for walls, this line must exist earlier than others.

    //Draw Octagons
    drawOctagon(white,230,260,30);
    setAllPixel(leftOctagonCode);//2 for octangons
    drawOctagon(white,800-230,230,-30);
    setAllPixel(rightOctagonCode);//2 for octangons

    drawFlipper();
    drawInfo("Click Continue Button to START!");
    drawInfo("Move Paddle: Touch Screen or Use KEY [←][→] / [A][D]",400,720,20,"yellow");
    drawScore();
    drawInfo("Press a number (1~5) to set initial ball speed.",400,550,20,"#EEA");
    drawTime();
    
    drawUpperBricks();
    drawLeftBricks();
    drawRightBricks();
    drawLeftButtomBricks();
    drawRightButtomBricks();

}

function setSpeed() {
    ball.v = Math.floor((3 + Math.log10(score+1)) / 3 * initialBallSpeed);
    if(ball.v>10)ball.v=10;
    ball.dx = ball.v * Math.cos(ball.a);
    ball.dy = -ball.v * Math.sin(ball.a);
}

function drawBall() {
    ctx.beginPath();
    ctx.fillStyle = ballColor;
    ctx.arc(ball.x,ball.y,ball.r,0,2*Math.PI);//ball size;
    ctx.fill();
}

function drawPaddle() {
    removePixel(paddleCode,0,400,cvs.width,550);
    removePixel(paddleCode,0,700,cvs.width,cvs.height);

    var relativeX = Math.round(paddleX + ball.v * 1.5 * paddleMove);
    if(relativeX < leftBoarder) paddleX = leftBoarder;
    else if(relativeX > rightBoarder) paddleX = rightBoarder;
    else paddleX = relativeX;

    drawRect(white, paddleX-paddleWidth/2, paddle1Y, paddleX+paddleWidth/2, paddle1Y+paddleHeight, paddleCode);
    drawRect(white, paddleX-paddleWidth/2, paddle2Y, paddleX+paddleWidth/2, paddle2Y+paddleHeight, paddleCode);
}

function drawScore() {
    var t=Math.floor(Math.log10(score+1));
    ctx.font = "3.0em Arial";
    ctx.fillStyle = "rgb("+(150+t*20)+","+(220-t*12)+","+(220-t*8)+")";
    ctx.fillText("Score  "+score, 400, 600);
    ctx.font = "2.4em Arial";
    ctx.fillStyle = "#EEE";
    ctx.fillText(value[leftOctagonCode], 263, 254);
    ctx.fillText(value[rightOctagonCode], 800-266, 254);
    ctx.fillStyle = "#333";
    ctx.fillText(value[leftOctagonCode], 264, 255);
    ctx.fillText(value[rightOctagonCode], 800-267, 255);
}

function collisionDetection() {
    if(ball.x + ball.dx > cvs.width - ball.r || ball.x + ball.dx < ball.r) {
        ball.x = 400; ball.y = 500;
        ball.a -= Math.floor(ball.a/2/Math.PI)*2*Math.PI;
        ball.a *= -1;
        ball.a += Math.PI;
    }
    if(ball.y + ball.dy < ball.r || ball.y + ball.dy > cvs.height - ball.r) {
        ball.x = 400; ball.y = 500;
        ball.a -= Math.floor(ball.a/2/Math.PI)*2*Math.PI;
        ball.a *= -1;
    }
    
    var nx = Math.round(ball.x + ball.dx*2), ny = Math.round(ball.y + ball.dy*2);
    if(p[nx][ny] != 0 && p[nx][ny] != flipperCode) {
        var tdx, tdy, tx, ty, reflectionCount = 0, sx = 0, sy = 0;
        //The for loop below is to find the normal line of collision line.
        for(tx=nx-10; tx<nx+10; tx++) {
            for(ty=ny-10; ty<ny+10; ty++) {
                if ((tx-nx) * (tx-nx) + (ty-ny) * (ty-ny) > 100) continue;
                if (p[tx][ty] != 0) {
                    reflectionCount ++;
                    sx += tx;
                    sy += ty;
                }
            }
        }
        //alert("dx,dy:("+ball.dx+","+ball.dy+")"+" a="+(ball.a/Math.PI));
        if(reflectionCount != 0) {
            sx /= reflectionCount;
            sy /= reflectionCount;
            tdx = (nx - sx) * 100;
            tdy = (ny - sy) * 100;
            // 修改：反速度是(nx - sx) * 10;需要与原速度叠加.
            var k = Math.sqrt(1.0/(tdx*tdx+tdy*tdy));
            tdx *= k;
            tdy *= k;
            k = -2 * (tdx * ball.dx + tdy * ball.dy);
            ball.dy += tdy * k;
            ball.dx += tdx * k;
        }
        else {
            ball.dx *= -1;
            ball.dy *= -1;
        }
        ball.a = Math.atan(-ball.dy/ball.dx);
        if (ball.dx < 0) ball.a += Math.PI;
        //alert("("+nx+","+ny+") ("+sx+","+sy+") count="+reflectionCount+" a="+(ball.a/Math.PI));
    }

    setSpeed();
    ball.x = Math.round(ball.x + ball.dx);
    ball.y = Math.round(ball.y + ball.dy);
    if(ball.dy < 0.5 && ball.dy > -0.5) ball.a+=0.1; //In case of horizontal moving.
    if(ball.dx < 0.5 && ball.dx > -0.5) ball.a-=0.1; //In case of horizontal moving.
    return p[nx][ny];
}

function refresh() {
    frames--;
    var t;

    ctx.clearRect(0, 0, cvs.width, cvs.height);
    drawWalls();
    /*3 lines below: to be modified with animation*/
    drawOctagon(white, 230, 260, 30);
    drawOctagon(white, 800-230, 230, -30);
    
    drawUpperBricks(false);
    drawLeftBricks(false);
    drawRightBricks(false);
    drawLeftButtomBricks(false);
    drawRightButtomBricks(false);
    
    drawBall();
    drawPaddle();
    drawFlipper();
    drawScore();
    drawTime();
    drawInfo("Life: "+life,60,40,20);
    
    //speed changes here.
    t = collisionDetection();
    collisionCount ++;
    switch (t) {
        case paddleCode: playAudio("paddle-audio"); break;
        case wallCode: playAudio("wall-audio"); break;
        case nullCode: collisionCount = 0; break;
        case flipperCode:
            playAudio("flipper-audio", false);
            score += value[t];
            flipperStatus = 10;
            break;
        case leftOctagonCode:
        case rightOctagonCode:
            playAudio("octagon-audio");
            if (leftEmpty) drawLeftBricks(true);
            if (rightEmpty) drawRightBricks(true);
            if (upperEmpty) drawUpperBricks(true);
            score += value[t];
            break;
        default:
            playAudio("brick-audio");
            score += value[t];
            removePixel(t);
            bricks[t]=false;
            break;
    }
    if(collisionCount>20) {
        //In case of ball getting trapped in a not-zero area.
        if (ball.x < cvs.width - 20) ball.x += 20;
        else ball.x -= 20;
        score -= value[t] * 5;
    }
    if(ball.y > 785) {
        playAudio("gameover-audio");
        //alert("(X_X) 1 ball lost.");
        initBall();
        life --;
        if(life == 0) drawInfo("No ball left. Game Over!");
        else drawInfo(life+" ball"+(life==1?"":"s")+" left. Click to continue.");
        gamePause = true;
    }
    if(frames < 15){
        life = 0;
        drawInfo("Time's up. Good game!");
        gamePause = true;
    }
    //if(ball.y < 20) { ball.y=400; ball.x=400;}
    if(!gamePause) requestAnimationFrame(refresh);
}

function gameContinue(){
    if(gamePause){
        if(life==0) init();
        else initBall();
        gamePause = false;
        refresh();
    }
}

/*function mouseMoveHandler(e) {
    var relativeX = e.clientX - cvs.offsetLeft;
    if(relativeX < leftBoarder) paddleX = leftBoarder;
    else if(relativeX > rightBoarder) paddleX = rightBoarder;
    else paddleX = relativeX;
}*/

function keyUpHandler(e) {
    var keyID = e.keyCode ? e.keyCode :e.which;
    if((keyID === 39 || keyID === 68) && paddleMove == 1)  { // right arrow and D
        paddleMove = 0;
        return;
    }
    if((keyID === 37 || keyID === 65) && paddleMove == -1)  { // left arrow and A
        paddleMove = 0;
        return;
    }
}

function keyDownHandler(e) {
    var keyID = e.keyCode ? e.keyCode :e.which;
    //if(keyID === 38 || keyID === 87)  { /* up arrow and W*/ }
    if(keyID === 39 || keyID === 68)  { // right arrow and D
        paddleMove = 1;
    }  
    //if(keyID === 40 || keyID === 83)  { /* down arrow and S */}
    if(keyID === 37 || keyID === 65)  { // left arrow and A
        paddleMove = -1;
    }
    /*if(gamePause && life === 3 && (keyID >= 97 && keyID <= 101 || keyID >= 49 && keyID <= 53)) {
        drawInfo("Initial Ball Speed: "+initialBallSpeed,400,520,28,"#333","#333");
        initialBallSpeed = keyID-96 > 0 ? keyID-96 : keyID-48;
        drawInfo("Initial Ball Speed: "+initialBallSpeed,400,520,28);
    }*/
    if(keyID === 32) {
        paddleMove = 0;
        if (gamePause) gameContinue();
    }
}

function touchLeaveHandler(e){
    paddleMove = 0;
    //e.preventDefault();
}

function touchMoveHandler(e){
    /*var relativeX = e.targetTouches[0].pageX - cvs.offsetLeft;    
    if(relativeX < (leftBoarder+rightBoarder)/2) {
        paddleMove = -1;
    }
    else{
        paddleMove = 1;
    }*/
    if(gamePause) return;
    e.preventDefault();
}

function touchStartHandler(e){
    if(gamePause) return;
    var relativeX = e.targetTouches[0].clientX;
    if(relativeX < document.body.clientWidth/2) {
        paddleMove = -1;
    }
    else{
        paddleMove = 1;
    }
    e.preventDefault();
}

function selectSpeed(){
    var t = document.getElementById("speed-selector").value;
    drawInfo("Initial Ball Speed: "+initialBallSpeed,400,520,28,"#333","#333");
    initialBallSpeed = t;
    drawInfo("Initial Ball Speed: "+initialBallSpeed,400,520,28);
}

function playAudio(type, reset=true){
    if(type=="gameover-audio") document.getElementById(type).volume=0.3;
    if(reset) document.getElementById(type).currentTime = 0;
    document.getElementById(type).play();
}
