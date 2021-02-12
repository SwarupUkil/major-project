// CS 30 Major Project
// Swarup Ukil
// January 3rd, 2021
//
// CS 30 FINAL TO DO:
// 
// - Controls Help Screen
// - a border around the screen to symbolize your screen needs
//   to see the boundaries if you want to play the game properly
// - Easy Mode and normal mode: Arguo(easy) and Captivum(normal) Mode
// - Perhaps each phase is a different boss. And you're just going down
//   each level of like a tower. Or it's just the same boss again
//   and again, just like beating his clones or something.
//
// Phases:
// Pre-1: A walk towards upward out of your prison gate to the
//        battle grounds.
// Transition: Text of "You Cannot Escape."
// 1 - a circle the user stands on, the player simply walks
//     around the boss and shoots at them 
// 2 - the map gets bigger with a larger circle and smaller circles
//     around the screen for the player to jump to.
// 3 - 
// 4 - bullet hell phase, the boss stays at the top of the screen,
//     and unleashes waves and waves of bullets and waves. Like furi
//     boss one final phase. The map is probably just a really large
//     circle that takes up most of the screen.
// 5 - the wave hell from the grid project
//
// Post Phases:
// probably create more transitional phases like the player walking
// up to the boss. The boss says their monologue. 
// Really make sure the tower aesthetic is there.

// Phase Variables
let phase = 0;
let phaseBool = [1, 0, 0];

// Player variables
let x, y;
let radius = 25;
let speed = 4, dashSpeed = 150;
let dashTimer = 1000, dashTimerCheck = 1000;
let w = 87, a = 65, s = 83, d = 68, spacebar = 32;
let numOfKeysDown = 0;
let colour = "white";
let dmgTimer = -250, dmgTimerCheck = 250;

let invincibility = false;  
let invincibilityTimer = 0, invincibilityTimerCheck = 3000;

const PLYRHEALTH = 30;
let userHealth = PLYRHEALTH;
let numOfRevives = 3;

// Player bullet variables
let velocity = 10;
let theta = 0;
let bullets = [];
let bullet; 
let bRadius = 5;
let xSpeed = 0, ySpeed = 0, bulletMovesUp = false;
let bulletTimer = 200, bulletTimerCheck = 200
let bulletDMG = 1;

let preciseBulletDMG = 10;
let preciseBullets = [];
let preciseBulletTimer = 0, preciseBulletTimerCheck = 50;
let borderX, borderY;
let lineColour = "white";

// Boss character variables
let boss;
let bossDefenceState = "stay";
let waveAttackTime = 3000;
let lastWave = 5000, waveTimer = 5000; // DEBUG: Change back to 5000 waveTimer

const BOSHEALTH = 100;
let bossHealth = BOSHEALTH;

// The map variables
let grid = [];
let tileSize;
let startPosOfGridWidth, startPosOfGridHeight, endPosOfGridWidth, endPosOfGridHeight;
let removedTiles = [];
let tile = {indexX: 0, indexY: 0, time: 0};
let tilesTimer = 11000, removeTileTimer = 700;
let storeMaps = [];
let map;

// Animation variables
let inAnimation = false;
let aniTime;
let aniInterval = 1000;
let aniBool = true;
let aniColour;
let theText = "Press Any Key";
let textBool = false;
let textTimer = 0, textTimerCheck = 1000;
let myFont;

// Music, Dialogue, and Sounds
let makeThisRightSong;
let dangerSong;

let dialogue;
let titleScreenDialogue = [];
let titleTimer = 3000, titleTimerCheck = 10000, titleIndex = 0;
let deathDialogue = [];
let deathTimer = 0, deathTimerCheck = 750, deathDialogueBool = true;

let bulletSound;
let preciseBulletSound;
let bossBulletSound;
let waveSound;
let dashSound;
let hitSound;
let tileSound, tileSoundTrue = true, tileSoundPlaying = false;


// The maps class is used to store the map layout of every phase of the boss.
class Maps{
  constructor(key){
    this.arr = [];
    this.shape = key;
  }
}

class Boss{
  constructor(){
    this.xPos = width / 2;
    this.yPos = height / 2;
    this.colour = "blue";
    this.invinceColour = "gold";
    this.arr = []; // stores the boss' bullets
    this.circWaveArr = []; // stores the boss' waves
    this.arcZoneArr = [];
    this.radius = 2.1 * radius;
    this.invincibilityMode = false;
  }
  display(){ // displays the boss avatar
    if(this.invincibilityMode){
      this.colour = this.invinceColour;
    }
    fill(this.colour);
    noStroke();
    circle(this.xPos, this.yPos, this.radius);
    if(this.colour !== "blue"){ // If the boss was damaged, revert back to normal
      this.colour = "blue";
    }
    fill("white");
  }
  
  // This function randomly decides how the boss will defend itself.
  defenceState(isBullet){
    let randNum = random(1, 10);
    
    // Determines whether the boss will block the attack or not.
    if(randNum >= 8){
      bossDefenceState = "block";
    }else{
      bossDefenceState = "stay";
    }
  }
  
  // This function creates a new bullet for the boss.
  shot(){
    bossBulletSound.play();
    bulletDirection(this.xPos, this.yPos);
    bulletMovesUp = !bulletMovesUp;
    this.arr.push(new Bullet(2 * bRadius));
    this.arr[this.arr.length-1].xPos = this.xPos;
    this.arr[this.arr.length-1].yPos = this.yPos;
    this.arr[this.arr.length-1].xIncrement *= -1;
  }

  // Spawns a circular wave attack from the boss' position
  circularWave(){

    // The boss is teleported to a random position within the grid.
    let xStartRange = startPosOfGridWidth + this.radius;
    let xEndRange = endPosOfGridWidth - this.radius;
    let yStartRange = startPosOfGridHeight + this.radius;
    let yEndRange = endPosOfGridHeight - this.radius;
    this.xPos = random(xStartRange, xEndRange);
    this.yPos = random(yStartRange, yEndRange);

    this.circWaveArr.push(new Wave("circWave"));
    waveSound.play();
  }

  arcZone(){
    this.arcZoneArr.push(new Wave("arcZone"));
    this.arcZoneArr[this.arcZoneArr.length - 1].determineAngle();
  }
}

// The wave is a type of attack the boss can do.
class Wave{
  constructor(waveType){
    this.xPos = boss.xPos;
    this.yPos = boss.yPos;
    this.radius = boss.radius;
    this.dist = 3;
    this.dmg = 5;
    this.speed = 5;
    this.waveType = waveType;
    this.startAngle;
    this.endAngle;
    this.arcDist = 3;
  }
  display(){ // displays the wave
    if(this.waveType === "circWave"){
      this.displayCircWave();
    }else if(this.waveType === "arcZone"){
      this.displayArcZone();
    }
  }
  displayCircWave(){
    fill(0, 0);
    stroke(50, 255, 255, 150);
    strokeWeight(7);
    circle(this.xPos, this.yPos, this.radius);
    stroke("black");
    strokeWeight(1);
    noStroke();
  }
  displayArcZone(){
    fill("purple");
    noStroke();
    arc(this.xPos, this.yPos, this.radius, this.radius, this.startAngle, this.endAngle);
    stroke("black");
    strokeWeight(1);
    noStroke();
  }
  move(){
    this.radius += this.speed;
  }
  determineAngle(){
    let sideA = this.xPos - x;
    let sideB = this.yPos - y;
    let hypo = sqrt(sideA**2 + sideB**2);
    let theAngle = acos(sideA / hypo);
    // if the y position of the attack is below the user's y pos
    // both values must be inverted and swapped.
    if(sideB < 0){
      this.startAngle = -1*(theAngle - this.arcDist);
      this.endAngle = -1*(theAngle + this.arcDist);
    }else{
      this.startAngle = theAngle + this.arcDist;
      this.endAngle = theAngle - this.arcDist;
    }
  }
}

class Bullet{
  constructor(radii){
    this.xPos = x;
    this.yPos = y;
    this.xIncrement = xSpeed;
    this.yIncrement = ySpeed;
    this.yDirection = bulletMovesUp;
    this.radius = radii;
    this.bulletDmg = 1;
  }
  display(){ // displays the normal bullet
    noStroke();
    fill("white");
    circle(this.xPos, this.yPos, 2 * bRadius);
    noFill();
  }
  preciseDisplay(){ // displays the precise bullet
    noStroke();
    fill("white");
    circle(this.xPos, this.yPos, 4 * bRadius);
    noFill();
  }
  move(){
    this.xPos += this.xIncrement;
    
    // Checks if the bullet should go upward or downward.
    if(this.yDirection){
      this.yPos += this.yIncrement;
    }else{
      this.yPos -= this.yIncrement;
    }
  }
}



// Preload assets
function preload(){
  makeThisRightSong = loadSound("assets/Music/The Toxic Avenger - Make This Right (Remix).mp3");
  dangerSong = loadSound("assets/Music/Danger.mp3");
  bulletSound = loadSound("assets/Sounds/Bullet Sound Effect User.mp3");
  preciseBulletSound = loadSound("assets/Sounds/Precise Bullet Sound Effect.mp3");
  bossBulletSound = loadSound("assets/Sounds/Boss Bullet Sound Effect.mp3");
  waveSound = loadSound("assets/Sounds/Wave Sound Effect.mp3");
  dashSound = loadSound("assets/Sounds/Wave Sound Effect.mp3");
  hitSound = loadSound("assets/Sounds/Hit Sound Effect.mp3");
  tileSound = loadSound("assets/Sounds/Tile Walk Sound Effect.mp3");
  myFont = loadFont("assets/SparkleFilled.ttf");

  dialogue = loadSound("assets/Dialogue/Time to wake up.ogg");
  titleScreenDialogue.push(dialogue);
  dialogue = loadSound("assets/Dialogue/The jailer is the key.ogg");
  titleScreenDialogue.push(dialogue);
  dialogue = loadSound("assets/Dialogue/Kill him and you'll be free.ogg");
  titleScreenDialogue.push(dialogue);
  dialogue = loadSound("assets/Dialogue/We all have choices to make.ogg");
  titleScreenDialogue.push(dialogue);

  dialogue = loadSound("assets/Dialogue/I know you can do it.ogg");
  deathDialogue.push(dialogue);
  dialogue = loadSound("assets/Dialogue/Remember what's waiting for you out there.ogg");
  deathDialogue.push(dialogue);
  dialogue = loadSound("assets/Dialogue/This hell-hole place can't be the end of the road.ogg");
  deathDialogue.push(dialogue);
  
  // adjust volume
  tileSound.setVolume(3.0);
  tileSound.rate(1.75);
  hitSound.setVolume(2.5); // not a very good sound, should be replaced in the future
  bulletSound.setVolume(0.7);
  dashSound.setVolume(0.7);
  dashSound.rate(1.5);
  bossBulletSound.setVolume(0.5);
}

// Create canvas, set up a few variables, and play the song.
function setup(){
  document.addEventListener("contextmenu", event => event.preventDefault());
  createCanvas(windowWidth, windowHeight);  
  
  x = windowWidth / 2;
  y = windowHeight / 2;
  boss = new Boss();
  dangerSong.loop();
}

// The main function that executes the current game.
function draw() {
  background(0);

  spawnMap();
  phases();
}

// Executes whatever is expected to be done depending on the phase.
function phases(){

  // All the phases less than or equal to zero are every non-gamplay screen.
  if(phase <= 0){
    displayText();
    playDialogue();
  }

  // This runs the phase 2 animation.
  if(phase === 2 && aniInterval > 0){

    // Sets up the variables so that everything works post the animation.
    if(aniBool){
      aniBool = false;
      aniTime = millis();
      aniInterval = 250;
      aniColour = boss.colour;
      x = width/2;
      y = boss.yPos + 100;
      removeTileTimer = aniInterval*10 + textTimerCheck;
    }

    inAnimation = true; // @ Debugged: Normal is true and line after does not exist
    // aniInterval = 0;

    animation();

    // Sets up the game for post the animation.
    if(aniInterval <= 0){
      removedTiles.splice(0, removedTiles.length);
      inAnimation = false;
      boss.invincibilityMode = true;
      textBool = true;
      textTimer = millis();
      theText = "MOVE";
    }
  }

  // Spawns in the default game mechanics if the we are on a gameplay phase.
  if(!inAnimation && phase > 0){
    userHealthBar();
    bossHealthBar();
    spawnBall();
    tileSoundTrue = false;
    ballMove();
    if(tileSoundTrue){ // Plays the walking on tile sound effect.
      if(!tileSoundPlaying){
        tileSoundPlaying = true;
        tileSound.loop();
      }
    }else{
      if(tileSoundPlaying){
        tileSoundPlaying = false;
        tileSound.stop();
      }
    }
    spawnBullet();
    move();
    bossAction();
    displayText();
  }
}

// This function will start the game if any key is pressed.
function keyPressed(){
  if(phase === 0){
    dangerSong.stop();
    makeThisRightSong.loop();
    phase = 2;
    lastWave = millis();
  }
}

// This function will play whatever dialogue 
// is predetermined if the conditions are met.
function playDialogue(){

  // Plays a title screen dialogue
  if(phase === 0 && titleTimer + titleTimerCheck < millis()){
    titleTimer = millis();
    dialogue = titleScreenDialogue[titleIndex];
    titleIndex = (titleIndex+1)%titleScreenDialogue.length;
    dialogue.setVolume(13.0);
    dialogue.play();
  }

  // Plays a death screen dialogue
  if(phase === -1 && deathDialogueBool && deathTimer + deathTimerCheck < millis()){
    deathDialogueBool = false;
    dialogue = random(deathDialogue);
    dialogue.setVolume(10.0);
    dialogue.play();
  }
}

// Displays any text that should be on screen at a given time.
function displayText(){
  let size;
  textFont(myFont);
  textAlign(CENTER, CENTER);

  // Phases 0, -1, -2 are for the title screen, you lost screen, and you won screen.
  if(phase === 0){
    size = height / 10; 
    fill("white");
    textSize(size);
    text(theText, width/2, height/2);
  }
  if(phase === -1){
    theText = "You lost this time.";
    size = height / 10;
    fill("red"); 
    textSize(size);
    text(theText, width/2, height/2);
  }
  if(phase === -2){
    theText = "Congratulations, you have beaten the jailer.";
    size = height / 15;
    fill("yellow"); 
    textSize(size);
    text(theText, width/2, height/2);
  }
  
  // Spawns the text for phase 2.
  if(phase === 2){
    if(textBool && textTimer + textTimerCheck > millis()){
      size = height / 2;
      fill("white");
      textSize(size);
      text(theText, width/2, height/2);
    }else{
      textBool = false;
      removeTileTimer = 700;
    }
  }
}

// Executes the animation of the current phase.
function animation(){
  let diameter;
  let decrement = 10;

  // Executes the phase 2 animation.
  if(phase === 2){
    background("brown");
    diameter = height - decrement;

    // This is for the flashing animation for the boss' invincibility mode.
    // Switching from blue to gold progressively faster until the colour is gold for good.
    if(aniTime + aniInterval < millis()){
      aniTime = millis();
      aniInterval -= decrement;

      if(aniColour === boss.colour){
        aniColour = boss.invinceColour;
      }else{
        aniColour = boss.colour;
      }
    }
    if(aniInterval < 30){
      aniColour = boss.invinceColour;
    }

    fill(aniColour);
    stroke("black");
    line(width/2, 0, width/2, height);
    line(0, height/2, width, height/2);
    circle(width/2, height/2, diameter);
    noStroke();
  }
}

// Spawns the user's avatar
function spawnBall(){
  
  fill(colour);
  circle(x, y, 2*radius);

  if(dmgTimer + dmgTimerCheck < millis()){
    if(colour !== "white"){ // If the user was damaged, revert back to normal
      colour = "white";
    }else if(invincibility === true){
      colour = "darkcyan";
    }
  }
  fill("white");
  
}

// Translates the user's avatar
function ballMove(){
  
  let key = "none";

  if(keyIsDown(w)){
    y -= speed; // move upward
    key = "w";
  }
  if(keyIsDown(a)){
    x -= speed; // move left
    key = "a";
  }
  if(keyIsDown(s)){
    y += speed; // move downward
    key = "s";
  }
  if(keyIsDown(d)){
    x += speed; // move right
    key = "d";
  }

  // If the player is not moving, stop playing the walking sound effect
  if(key != "none"){
    tileSoundTrue = true;
  }
  
  userMapCollision("move", key, "none");
}

// Checks and executes the dash mechanic if conditions were met.
function keyTyped(){
  
  if(phase <= 0){
    return 0;
  }

  let key1 = "none";
  let key2 = "none";
  let dashTrue = true;

  // Checks is conditions have been met to dash.
  if(keyIsDown(spacebar) && dashTimer + dashTimerCheck <= millis()){  
    dashTimer = millis();
    numOfKeysDown = 0;
    
    // Counts the number of WASD keys being pressed.
    if(keyIsDown(w)){
      numOfKeysDown++;
    }
    if(keyIsDown(a)){
      numOfKeysDown++;
    }
    if(keyIsDown(s)){
      numOfKeysDown++;
    }
    if(keyIsDown(d)){
      numOfKeysDown++;
    }
    
    // The dash will only occur if the user is moving
    // horizontally, verically, or at a angle.
    if(numOfKeysDown <= 2){
      if(keyIsDown(w) && keyIsDown(a)){ // Dash Up-Left
        key1 = "w";
        key2 = "a";
        x -= dashSpeed;
        y -= dashSpeed;
      }else if(keyIsDown(w) && keyIsDown(d)){ // Dash Up-Right
        key1 = "w";
        key2 = "d";
        x += dashSpeed;
        y -= dashSpeed;
      }else if(keyIsDown(s) && keyIsDown(a)){ // Dash Down-Left
        key1 = "s";
        key2 = "a";
        x -= dashSpeed;
        y += dashSpeed;
      }else if(keyIsDown(s) && keyIsDown(d)){ // Dash Down-Right
        key1 = "s";
        key2 = "d";
        x += dashSpeed;
        y += dashSpeed;
      }else if(keyIsDown(w)){ // Dash Up
        key1 = "w";
        y -= dashSpeed;
      }else if(keyIsDown(a)){ // Dash Left
        key1 = "a";
        x -= dashSpeed;
      }else if(keyIsDown(s)){ // Dash Down
        key1 = "s";
        y += dashSpeed;
      }else if(keyIsDown(d)){ // Dash Right
        key1 = "d";
        x += dashSpeed;
      }else{
        // Allows user to dash again immediately post a dash-failure.
        dashTimer -= dashTimerCheck;
        dashTrue = false; 
      }   

      if(dashTrue){
        dashSound.play();
      }
    }
    
  }
  
  userMapCollision("dash", key1, key2);
}

// If the user is out of the map boundaries, push them back, this is dependent on the phase.
function userMapCollision(typeOfMovement, key1, key2){

  let checkCollision = false;
  let objShape;
  let obj;
  let tileWidth;
  let tileHeight;
  let tileSize;


  // During this phase, the user should only be kept within the grid boundaries.
  if(phase === 2){
    for(let i=0; i<storeMaps.length; i++){
      if(storeMaps[i].shape === "grid"){

        // Determines the start and end positions of the grid.
        obj = storeMaps[i].arr;
        tileWidth = obj[0];
        tileHeight = obj[1];
        tileSize = obj[2];
        startPosOfGridWidth = width/2 - tileWidth*tileSize;
        startPosOfGridHeight = height/2 - tileHeight*tileSize;
        endPosOfGridWidth = width/2 + tileWidth*tileSize;
        endPosOfGridHeight = height/2 + tileHeight*tileSize;
        break;
      }
    }
    stayInBounds(startPosOfGridWidth, startPosOfGridHeight, endPosOfGridWidth, endPosOfGridHeight);
    return 0;
  }
  
  // There are two scenarios for checking borders. If the user moved normally or else they dashed.
  if(typeOfMovement === "move"){
    // Iterates over every map object
    for(let i=0; i<storeMaps.length; i++){
      objShape = storeMaps[i].shape;
      obj = storeMaps[i].arr;

      // If the object and the user are colliding, 
      // then make sure they are not going past the objects boundaries. 
      if(objShape === "circ"){
        checkCollision = collideCircleCircle(x, y, 2*radius, obj[0], obj[1], obj[2]);
        if(checkCollision){
          userCircCollision(typeOfMovement, obj);
          break;
        }
      }

    }
  }else{
    // Keeps looping until the user is within the boundaries.
    while(!checkCollision){
      if(phase === 2){ // phase 2 does not require this check.
        return 0;
      }

      // Iterates over every map object
      for(let i=0; i<storeMaps.length; i++){
        objShape = storeMaps[i].shape;
        obj = storeMaps[i].arr;
        
        // Checks if the player was on this circle map,
        // if true then this while loop ends.
        if(objShape === "circ"){
          checkCollision = collideCircleCircle(x, y, 2*radius, obj[0], obj[1], obj[2]);
          if(checkCollision){
            if(!userCircCollision(typeOfMovement, obj)){
              checkCollision = false;
            }
            break;
          }
        }
      }

      changeDashPos(key1, key2);
    }
  }

}

// Makes sure the player is whitin the
// boundaries of this circular map.
function userCircCollision(typeOfMovement, obj){

  let dotPos = radius + 1;
  let x2 = x;
  let y2 = y;

  // Basically see's if every point around the user
  // is on the map.
  for(let i=0; i<360; i++){
    x2 = x + cos(i)*dotPos;
    y2 = y + sin(i)*dotPos;
    let collision = collidePointCircle(x2, y2, obj[0], obj[1], obj[2]);

    if(!collision && typeOfMovement === "move"){
      x -= cos(i)*1;
      y -= sin(i)*1;
    }
    if(!collision && typeOfMovement === "dash"){
      return false;
    }
  }
  return true;
}

// Mildly changes the (x,y) values of the user
// depending on the direction the dash.
function changeDashPos(key1, key2){

  if(key1 === "w"){
    y++;

    if(key2 === "a"){
      x++;
    }
    if(key2 === "d"){
      x--;
    }
  }else if(key1 === "s"){
      y--;

      if(key2 === "a"){
        x++;
      }
      if(key2 === "d"){
        x--;
      }
  }else if(key1 === "a"){
    x++;
  }else{
    x--;
  }

}

// Stops the player from escaping the map grid
function stayInBounds(borderWidth, borderHeight, endBorderWidth, endBorderHeight){

  let padding = 3;

  // Checks if the user would have escaped the grid
  // boundaries and moves them back inside.
  if(y < radius + borderHeight - padding){
    y = radius + borderHeight - padding;
  }
  if(x < radius + borderWidth - padding){
    x = radius + borderWidth - padding;
  }
  if(y > endBorderHeight - radius + padding){
    y = endBorderHeight - radius + padding;
  }
  if(x > endBorderWidth - radius + padding){
    x = endBorderWidth - radius + padding;
  }
}

// Spawns the user's bullets
function spawnBullet(){
  
  if(mouseIsPressed){
    
    // If the user left clicked, then create a new bullet object.
    if(mouseButton !== RIGHT && bulletTimer + bulletTimerCheck <= millis() ){
      bulletSound.play();
      bulletTimer = millis();
      bulletDirection(mouseX, mouseY);
      bullets.push(new Bullet(2 * bRadius));
    }
    
    // If the user right clicked, initiate the precision line.
    if(mouseButton !== LEFT){
      aimPreciseBullet();
      preciseBulletTimer++; // counts how long the precision line was active for
      if(preciseBulletTimer >= preciseBulletTimerCheck){
        lineColour = "yellow"; // signifies the precision bullet is ready
      }
    }
  }
  
  spawnPreciseBullet();
}

// Translate every object on screen
function move(){
  moveBullet(bullets, "boss", "normalBullet");
  moveBullet(preciseBullets, "boss", "precisionBullet");
  moveBullet(boss.arr, "user", "bossBullet");
  moveWave(boss.circWaveArr, "user", "circWave");
  moveWave(boss.arcZoneArr, "user", "arcZone");
}

// Translate every bullet on screen
function moveBullet(bulletArray, collisionKey, bulletKey){
  
  for(let i=0; i<bulletArray.length; i++){
    // the precise bullet has a unique display function
    if(bulletKey === "precisionBullet"){
      bulletArray[i].preciseDisplay();
      bulletArray[i].bulletDmg = 10;
    }else{
      bulletArray[i].display();
    }
    bulletArray[i].move();
    eraseBullet(bulletArray, i, "");
  }
  
  collisionCheck(bulletArray, collisionKey, bulletKey);
}

// Translate ever wave on screen
function moveWave(waveArray, collisionKey, waveKey){
  
  for(let i=0; i<waveArray.length; i++){
    waveArray[i].display();
    waveArray[i].move();
    eraseWave(waveArray, waveKey);
  }

  collisionCheck(waveArray, collisionKey, waveKey);
}

// Determines the velocity the bullets will travel
// from point A to point B and beyond.
function bulletDirection(xPosition, yPosition){
  
  let sideA = xPosition - x;
  let hypo = sqrt(sideA**2 + (yPosition - y)**2);
  theta = acos(sideA / hypo);
  xSpeed = velocity * cos(theta);
  ySpeed = velocity * sin(theta);
  
  // Determines if the bullet moves upward or downward.
  if(yPosition >= y){
    bulletMovesUp = true;
  }else{
    bulletMovesUp = false;
  }
}

// Erases bullets that either went out of bounds or had a collision.
function eraseBullet(bulletArray, pos, hit, state){
  
  // Erase the bullet if it escaped boundaries.
  if(bulletArray.length > 0){
    if((bulletArray[0].xPos+bulletArray[0].radius < 0) || 
       (bulletArray[0].xPos-bulletArray[0].radius >= width) ||
       (bulletArray[0].yPos+bulletArray[0].radius < 0) ||
       (bulletArray[0].yPos-bulletArray[0].radius >= height)){
      bulletArray.splice(0, 1);
    }
  }
  
  // Erase the bullet that collided with whichever avatar
  if(hit && state === "normalBullet"){
    bullets.splice(pos, 1);
  }
  if(hit && state === "precisionBullet"){
    preciseBullets.splice(pos, 1);
  }
  if(hit && state === "bossBullet"){
    boss.arr.splice(pos, 1);
  }
  
}

// Erases any wave that is long off screen.
function eraseWave(waveArray, waveKey){

  if(waveArray.length > 0){ // sanity check
    if(waveKey === "circWave" && waveArray[0].radius > 2*width){
      waveArray.splice(0, 1);
    }
    // else if(waveKey === "arcWave" && waveArray[0].radius > width){
    //   waveArray.splice(0, 1);
    // }
  }
}

// Calculates the direction of the precision line to the mouse
function aimPreciseBullet(){
  
  let lineDist = dist(x, y, mouseX, mouseY);
  let angle = acos((mouseX - x) / lineDist);
  let lineX = 100000 * cos(angle);
  let lineY = 100000 * sin(angle);
  borderX = x + lineX;
  
  // Determines whether the line goes upward or downward
  if(mouseY < y){
    borderY = y - lineY;
  }else{
    borderY = y + lineY;
  }

  stroke(lineColour);
  line(x, y, borderX, borderY);
  stroke(0);
}

// Spawns the precise bullet
function spawnPreciseBullet(){
  
  if(!mouseIsPressed){ // Checks if the right click was let go
    if(preciseBulletTimer >= preciseBulletTimerCheck){
      lineColour = "white";
      preciseBulletSound.play();
      bulletDirection(mouseX, mouseY);
      preciseBullets.push(new Bullet(4 * bRadius));
    }
    preciseBulletTimer = 0;
  }
  
}

// Executes the action of the boss
function bossAction(){
  
  let randNum = random(1, 10000);
  let decrement = 250;

  spawnBoss();

  // Phase one: purely shoots bullets at the player at random. 
  // Phase two: spawn waves in a timely fashion at a random position,
  //            eventually becomes like phase 1.
  if(phase === 1){
    if(randNum >= 9000){
      boss.shot();
    }
  }else if(phase === 2){
    if(waveTimer >= 1000){
      if(lastWave + waveTimer < millis()){
        boss.circularWave();
        // boss.arcZone();
        lastWave = millis();
        waveTimer -= decrement;
      }
    }else{
      boss.invincibilityMode = false;
      boss.xPos = width / 2;
      boss.yPos = height / 2;
      if(randNum >= 9000){
        boss.shot();
      }
    }
  }
  
}

// Displays the boss on screen
function spawnBoss(){
  boss.display();
}

// Determines if a collision between obejects have occured.
function collisionCheck(objectArray, collisionWith, eraseKey){
  if(invincibilityTimer + invincibilityTimerCheck < millis()){ 
    invincibility = false;
    invincibilityTimerCheck = 0;
  }

  userBossCollision(objectArray, collisionWith, eraseKey);
  bulletOnBulletCollision();
}

// Plays out the scenario when the user/boss is damaged
function userBossCollision(objectArray, collisionWith, eraseKey){

  let hit;
  let obj;
  let dmg = 0;

  // Checks if the collision was with the boss, else it must be the player.
  if(collisionWith === "boss"){
      
    for(let i=0; i<objectArray.length; i++){
      obj = objectArray[i];
      hit = collideCircleCircle(obj.xPos, obj.yPos, obj.radius, boss.xPos, boss.yPos, boss.radius);

      // Checks if the boss decided to block the attack if he was hit
      boss.defenceState();
      if(hit){
        eraseBullet(objectArray, i, hit, eraseKey);

        // If the boss is invincible, then nothing happens when it's hit.
        if(!boss.invincibilityMode){
          if(bossDefenceState === "stay"){
            boss.colour = "red";
            bossHealth -= obj.bulletDmg;
          }else if(bossDefenceState === "block"){
            boss.colour = "lightblue";
          }
        }
      }
    }
    
  }else if(collisionWith === "user"){
    
    for(let i=0; i<objectArray.length; i++){
      obj = objectArray[i];

      // Checks which object might have collided with the player. 
      if(eraseKey === "bossBullet"){
        hit = collideCircleCircle(obj.xPos, obj.yPos, obj.radius, x, y, 2 * radius);
        dmg = obj.bulletDmg;
      }else if(eraseKey === "circWave"){
        hit = collideCircleCircle(obj.xPos, obj.yPos, obj.radius, x, y, 2 * radius);
        let secondHit = collideCircleCircle(obj.xPos, obj.yPos, obj.radius - 4*radius, x, y, 2 * radius);

        // This collision check can be visualized as 2 circles, the wave and
        // one right behind it. Basically if the user collides with the
        // the inner circle, then that means the user is past the wave
        // and so should not take any damage.
        if(hit && secondHit){
          hit = false;
        }
        if(hit && !secondHit){

          // So that the user is not completely annihilated by
          // one wave attack, the user gains an invincibility for
          // a few seconds every time he is hit by a wave.
          if(!invincibility){
            dmg = obj.dmg;
            invincibility = true;
            invincibilityTimerCheck = waveAttackTime;
            invincibilityTimer = millis();
            dmgTimer = millis();
          }else{
            dmg = 0;
          }
        }
      }

      // Checks if the boss' attack hit the user
      if(hit){
        userHealth -= dmg;
        eraseBullet(objectArray, i, hit, eraseKey);
        if(dmgTimer + dmgTimerCheck > millis() || eraseKey === "bossBullet"){
          colour = "darkred";
        }
        if(dmg > 0){
          hitSound.play();
        }
      }
    }
    
  }
}

// Erases the bullets that collide and meet the conditions.
function bulletOnBulletCollision(){

  let hit;
  let obj;

  // Collision with user bullets and boss bullets
  for(let i=0; i<bullets.length; i++){
    obj = bullets[i];
    for(let j=0; j<boss.arr.length; j++){
      let obj2 = boss.arr[j];
      hit = collideCircleCircle(obj.xPos, obj.yPos, obj.radius, obj2.xPos, obj2.yPos, obj2.radius);
      
      // Erases the bullets that have collided
      if(hit){
        eraseBullet(bullets, i, hit, "normalBullet");
        eraseBullet(boss.arr, j, hit, "bossBullet");
      }
    }
  }

  // Collision with user precision bullets and boss bullets
  for(let i=0; i<preciseBullets.length; i++){
    obj = preciseBullets[i];
    for(let j=0; j<boss.arr.length; j++){
      let obj2 = boss.arr[j];
      hit = collideCircleCircle(obj.xPos, obj.yPos, obj.radius, obj2.xPos, obj2.yPos, obj2.radius);

      // Erases the bullets that have collided
      if(hit){
        eraseBullet(bullets, i, hit, "precisionBullet");
        eraseBullet(boss.arr, j, hit, "bossBullet");
      }
    }
  }
}

// Spawns in the user's health bar on screen.
function userHealthBar(){

  let padding = 10;
  let barWidth = 5;
  let barHeight = 20;
  let endPosOfHealthPoints = userHealth * barWidth + padding;
  let endPosOfRevivePoints = numOfRevives*2*barWidth + 1.1*padding;

  // When the user's health reaches 0, use up one revive if possible.
  if(userHealth <= 0 && numOfRevives >= 1){
    numOfRevives--;
    resetPhase();
    userHealth = PLYRHEALTH;
  }

  // When the user used up all their lives,
  // it results in the game over scenario.
  if(numOfRevives <= 0){
    resetPhase();
    numOfRevives = 0;
    phase = -1;
    makeThisRightSong.stop();
    titleTimer = millis();
    deathTimer = millis();
  }

  // Spawns in the user's current # of health points.
  for(let i=padding; i<endPosOfHealthPoints; i+=barWidth){
    stroke("black");
    fill("maroon");
    rect(i, padding, barWidth, barHeight);
    noStroke();
  }

  // Spawns in the total # of revives the user has.
  for(let i=1.1*padding; i<endPosOfRevivePoints; i+=2*barWidth){
    stroke("black");
    fill("DarkGoldenRod");
    rect(i, padding+barHeight, 2*barWidth, barHeight);
    noStroke();
  }
}

// Spawns in the boss' health bar on screen.
function bossHealthBar(){

  // This if is needed to make sure the boss' health bar doesn't 
  // bleed past the set boundaries set for it.
  if(bossHealth < 0){
    resetPhase();
    bossHealth = 0;
    phase = -2;
  }

  let endPosOfHealthBar = width - 10;
  let padding = 10;
  let barWidth = 200;
  let barHeight = 20;
  let startPosOfHealthBar = endPosOfHealthBar - barWidth;
  let healthBarFillPercent = ((100-bossHealth) * 0.01) * barWidth;

  // Spawns in the current status of the boss' health.
  stroke("purple");
  fill("crimson");
  rect(startPosOfHealthBar, padding, barWidth, barHeight);
  fill("FireBrick");
  rect(startPosOfHealthBar, padding, healthBarFillPercent, barHeight);
  noFill();
  noStroke();
}

// Returns a empty grid of window width and height.
function createEmptyGrid(cols, rows){
  let emptyGrid = [];

  for(let i=0; i<rows; i++){
    emptyGrid.push([]);
    for(let v=0; v<cols; v++){
      emptyGrid[i].push(0);
    }
  }
  return emptyGrid;
}

// Spawns in the map for the current phase.
function spawnMap(){

  let obj;
  let numOfTilesWidth = 15;
  let numOfTilesHeight = 8;
  let startHeight, endHeight, startWidth, endWidth, arrPosHeight;

  // There is no map for non-battle phases.
  if(phase <= 0){
    return 0;
  }

  // Generates the maps for the current phase.
  if(phase === 1 && phaseBool[phase-1] === 0){
    phaseBool[phase-1] = 1;
    map = new Maps("circ");
    map.arr.push(width/2, height/2, 400);
    storeMaps.push(map);
  }
  if(phase === 2 && phaseBool[phase-1] === 0){
    phaseBool[phase-1] = 1;
    map = new Maps("grid");
    tileSize = 40;
    map.arr.push(numOfTilesWidth, numOfTilesHeight, tileSize);
    storeMaps.push(map);

    for(let i=0; i < 2*numOfTilesHeight; i++){
      grid.push([]);
      for(let v=0; v < 2*numOfTilesWidth; v++){
        grid[i].push(1);
      }
    }
  }

  // Iterates through all the map objects and spawns them in.
  for(let i=0; i<storeMaps.length; i++){
    obj = storeMaps[i];

    if(obj.shape === "circ"){
      fill("red");
      circle(obj.arr[0], obj.arr[1], obj.arr[2]);
    }
    if(obj.shape === "grid"){
      updateGrid(obj.arr[0], obj.arr[1], obj.arr[2]);
      startHeight = height/2 - obj.arr[1]*obj.arr[2];
      endHeight = height/2 + obj.arr[1]*obj.arr[2];
      startWidth = width/2 - obj.arr[0]*obj.arr[2];
      endWidth = width/2 + obj.arr[0]*obj.arr[2];
      arrPosHeight = 0, arrPosWidth = 0;
      
      for(let i = startHeight; i < endHeight; i += obj.arr[2]){
        for(let v = startWidth; v < endWidth; v += obj.arr[2]){
          if(grid[arrPosHeight][arrPosWidth] === 1){
            fill("brown");
            rect(v, i, obj.arr[2], obj.arr[2]);
          }
          arrPosWidth++;
        }
        arrPosWidth = 0;
        arrPosHeight++;
      }
    }
  }

}

// This function removes and re-adds tiles to the grid.
function updateGrid(tileWidth, tileHeight, tileSize){
  let tileClone;
  let x2 = Math.floor(x);
  let y2 = Math.floor(y);

  // Determines which tile the user is in.
  x2 -= Math.floor(width/2 - tileWidth*tileSize);
  y2 -= Math.floor(height/2 - tileHeight*tileSize);
  x2 = Math.floor(x2/tileSize);
  y2 = Math.floor(y2/tileSize);

  // Determines if the user is on a live tile, else reset phase.
  if(y2 >= 0 && x2 >= 0 && y2 < 2*tileHeight && x2 < 2*tileWidth){
    if(grid[y2][x2] === 1){
      tile.indexX = x2;
      tile.indexY = y2;
      tile.time = millis();
      tileClone = JSON.parse(JSON.stringify(tile));
      removedTiles.push(tileClone);
    }else{
      resetPhase();
    }
  }

  // Removes the tile the user has stepped on.
  for(let i=0; i<removedTiles.length; i++){
    if(removedTiles[i].time+removeTileTimer <= millis()){
      x2 = removedTiles[i].indexX;
      y2 = removedTiles[i].indexY;
      grid[y2][x2] = 0;
    }else{
      break;
    }
  }

  // Re-adds the tiles that were removed.
  if(removedTiles.length > 0 && removedTiles[0].time+tilesTimer <= millis()){
    x2 = removedTiles[0].indexX;
    y2 = removedTiles[0].indexY;
    grid[y2][x2] = 1;
    removedTiles.splice(0, 1);
  }
}

// Resets all functionality of the current phase.
function resetPhase(){
  
  // Resets the grid layout
  for(let i=0; i < grid.length; i++){
    for(let v=0; v < grid[i].length; v++){
      grid[i][v] = 1;
    }
  }

  if(bossHealth > 0 && userHealth > 0){
    numOfRevives--;
  }
  userHealth = PLYRHEALTH;
  bossHealth = BOSHEALTH;
  boss.xPos = width / 2;
  boss.yPos = height / 2;
  boss.invincibilityMode = true;
  lastWave = millis();
  waveTimer = 5000;
  boss.circWaveArr.splice(0, boss.circWaveArr.length);
  boss.arr.splice(0, boss.arr.length);
  boss.arcZoneArr.splice(0, boss.arcZoneArr.length);
  x = width/2;
  y = boss.yPos + 100;
  removedTiles.splice(0, removedTiles.length);
  textBool = true;
  textTimer = millis();
  tileSound.stop();
  hitSound.stop();
  dashSound.stop();
  waveSound.stop();
  bulletSound.stop();
  preciseBulletSound.stop();
  preciseBulletTimer = 0;
  lineColour = "white";
  invincibilityTimer = 0;
}