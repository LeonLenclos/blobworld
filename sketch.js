const REZ = 32;
const COLS = 32;
const ROWS = 18;

const NOISE_REZ = 0.3;
const Z_NOISE_INCR = 0.02;
const NOISE_SEED = 1312;

let noise;
let xpos = 0;
let ypos = 0;
let score = 0;
let bestScore = 0;
let field = [[]];
let nextField = [[]];
let lastMoveTime = 0;
let lastKey;
let playing = false;

let blobSprites = [];
let babyBlobSprites = [];
let heroSprites = [];
let textFrameSprite;
let font;


function preload(argument) {
    // Load assets
    font = loadFont('assets/ProggyClean.ttf');
    textFrameSprite = loadImage("assets/frame.png");
    for (let i = 1; i <= 2; i++) {
        heroSprites.push(loadImage("assets/hero"+i+".png"));
    }
    for (let i = 1; i <= 2; i++) {
        blobSprites.push(loadImage("assets/blob"+i+".png"));
    }
    for (let i = 1; i <= 2; i++) {
        babyBlobSprites.push(loadImage("assets/babyblob"+i+".png"));
    }
}


function setup() {
    let canvasElement = createCanvas(COLS*REZ,ROWS*REZ).elt;
    // Pixel perfect settings
    let context = canvasElement.getContext('2d');
    context.mozImageSmoothingEnabled = false;
    context.webkitImageSmoothingEnabled = false;
    context.msImageSmoothingEnabled = false;
    context.imageSmoothingEnabled = false;

    // Typo
    textFont(font);
    textSize(REZ);
    fill("#1986f2")

    // Noise
    noise = new OpenSimplexNoise(NOISE_SEED);

    // 2D arrays init
    for (let i = 0; i < COLS+1; i++) {
        field[i]=[];
        nextField[i]=[];
        for (let j = 0; j < ROWS+1; j++) {
            field[i][j] = 0;
            nextField[i][j] = 0;
        }
    }
}


function keyPressed() {
    move(keyCode);
    return false;
}

function draw() {

    if(keyIsDown(lastKey) && Date.now() - lastMoveTime > 100){
        move(lastKey);
    }

    randomSeed(score);
    
    for (let i = 0; i < COLS; i++) {
        for (let j = 0; j < ROWS; j++) {
            let x = i * REZ;
            let y = j * REZ;
            let state = getState(
                ceil(field[i][j]),
                ceil(field[i+1][j]),
                ceil(field[i+1][j+1]),
                ceil(field[i][j+1]),
            );

            image(blobSprites[floor(random(2))],x,y,REZ,REZ,0,state*16,16,16);

            if(ceil(nextField[i][j]) && !ceil(field[i][j])){
                image(babyBlobSprites[floor(random(2))],x-REZ/4,y-REZ/4,REZ/2,REZ/2);
            }
        }
    }

    if(!playing){
        let message = score===0 ? "B L O B W O R L D" : "G A M E   O V E R";
        displayTextFrame(COLS-9,1,message,"  - HIT SPACE -  ");
    }
    displayTextFrame(1, 1, "SCORE : " + pad(score), "BEST :  " +  pad(bestScore));

    if(playing){
        image(heroSprites[score%heroSprites.length], (COLS/2-0.5)*REZ, (ROWS/2-0.5)*REZ, REZ, REZ)
    }
}


function getState(a,b,c,d) {
    return a*8 + b*4 + c*2 + d*1;
}

function pad(num, size){
    return ('000000000' + num).substr(-9);
}

function displayTextFrame (x, y, line1, line2) {
    image(textFrameSprite, REZ*x, REZ*y, REZ*8, REZ*2);
    fill("#ebe4a4")
    text(line1, 2+ REZ*x + REZ*0.25,  REZ*y + REZ*0.75)
    text(line2, 2+ REZ*x + REZ*0.25,  REZ*y + REZ*1.75)
    fill("#fffff")
    text(line1, REZ*x + REZ*0.25 -2, REZ*y + REZ*0.75)
    text(line2, REZ*x + REZ*0.25 -2, REZ*y + REZ*1.75)
    fill("#293941")
    text(line1, REZ*x + REZ*0.25, REZ*y + REZ*0.75)
    text(line2, REZ*x + REZ*0.25, REZ*y + REZ*1.75)                                 
}

function newGame(argument) {
    score = 0
    xpos = 0;
    ypos = 0;
    playing = true;
    lastKey = undefined;
}


function move(keyCode) {
    lastMoveTime = Date.now();
    lastKey = keyCode;

    if       (!playing && keyCode === 32) { // Space
        newGame();
    } else if (playing && keyCode === LEFT_ARROW) {
        xpos--;

    } else if (playing && keyCode === RIGHT_ARROW) {
        xpos++;
    } else if (playing && keyCode === UP_ARROW) {
        ypos--;
    } else if (playing && keyCode === DOWN_ARROW) {
        ypos++;
    } else if (playing && keyCode === 32) { // Space
        // Pass
    } else {
        return;
        lastKey = undefined;
    }

    // Score
    score ++;
    bestScore = score > bestScore ? score : bestScore;



    for (let i = 0; i < COLS+1; i++) {
        for (let j = 0; j < ROWS+1; j++) {
            field[i][j] = noise.noise3D(
                (i+xpos)*NOISE_REZ,
                (j+ypos)*NOISE_REZ,
                score*Z_NOISE_INCR) ;

            nextField[i][j] = noise.noise3D(
                (i+xpos)*NOISE_REZ,
                (j+ypos)*NOISE_REZ,
                (score+1)*Z_NOISE_INCR) ;
        }
    }

    if (ceil(field[floor(COLS/2)][floor(ROWS/2)]) == 1) {
        playing = false;
    }
}

