// In this file we will be writing the code for ninja's actions. 
// In our code (below) we will have created variables that represents 
// every part of the game (which is for hte position of the ninja, the 
// current phase, the coordinates of the platforms, etc.)

// First we will extend the base functionality of JS
Array.prototype.last = function () {
  return this[this.length - 1];
};

// A sinus function that acceps degrees instead of radians
Math.sinus = function (degree) {
  return Math.sin((degree / 180) * Math.PI);
};





//================================================================ GAME DATA =============================================================================================

// Now below will be all the data needed to begin creating the game:
let phase = "waiting"; // will tell if we ar waiting (for the user to click the mouse to stretch the stick) | stretching (once the user clicks the mouse) |
                       // turning | walking | transitioning (when the image moves to center the ninja and for the new pillar to pop up) | falling (when the 
                       // stick becomes too short or too long)

let lastTimestamp; /// will give the time stamp of the previous animation cycle

let ninjaX; // this will change when moving forward
let ninjaY; // this will only change when the ninja falls
let sceneOffset; // this will move the whole game screen Moves to help keep the ninja centered (if not, then the ninja will go off screen)

let platforms = [];
let sticks = [];
let trees = [];


// Next, we will have two main functions: 
// 1) this function will paint the scene on the screen based on this state (which we will call the "draw" function)
// 2) the second function will change the state gradually so that it looks like an animation (which will be the "animation" function)
// we will also include event handling to listen on the click from the user and begin created the stick....

let score = 0;

// Here are all the configurations we will need for this project:
const canvasWidth = 375;
const canvasHeight = 375;
const platformHeight = 100;
const ninjaDistanceFromEdge = 10; // the ninja will stand to close/far from the edge of the platform while waiting on user input
const paddingX = 100; // The waiting position of the ninja in the original canvas size
const perfectAreaSize = 10;

// next, we will make the background move slower than the ninja:
const backgroundSpeedMultiplier = 0.2;

// next is the variables needed for the background animation and the ninjas build and movement speed:
const hill1BaseHeight = 100;
const hill1Amplitude = 10;
const hill1Stretch = 1;
const hill2BaseHeight = 70;
const hill2Amplitude = 20;
const hill2Stretch = 0.5;

const stretchingSpeed = 4; // this is the milliseconds it takes to draw a pixel
const turningSpeed = 4; // this is the milliseconds it takes to turn a degree

// for the characters actions and built:
const walkingSpeed = 4;
const transitioningSpeed = 2;
const fallingSpeed = 2;
const ninjaWidth = 17; // 24
const ninjaHeight = 30; // 40

// next, we will get the canavs element:
const canvas = document.getElementById("game");
canvas.width = window.innerWidth; // Make the Canvas full screen
canvas.height = window.innerHeight;

// Now we will get the drawing context, allowing us to use js to draw on the canvas from the HTML file
const ctx = canvas.getContext("2d");

// Our other UI elements so we can restart the game (the restart button) and the score that will show in the right hand corner
const introductionElement = document.getElementById("introduction");
const perfectElement = document.getElementById("perfect");
//const endButton = document.getElementById("end")
const restartButton = document.getElementById("restart");
const scoreElement = document.getElementById("score");

// Initialize layout
resetGame();








//================================================================ THE RESET GAME FUNCTION =============================================================================================

//the function below will reset the game state and layout to the original state:
function resetGame() {
  // Resetting the game state
  phase = "waiting";
  lastTimestamp = undefined;
  sceneOffset = 0; // this will help us shift the screen
  score = 0; // intializing the score to zero

  introductionElement.style.opacity = 1;
  perfectElement.style.opacity = 0;
  restartButton.style.display = "none";
  scoreElement.innerText = score;

   // the first platform will always be the same, and the ninja will always start at the edge of the platform in the beginning:
  platforms = [{ x: 50, w: 50 }];
  generatePlatform();
  generatePlatform();
  generatePlatform();
  generatePlatform();

  // there will always be a stick, but it will not always be visible (by using length: 0):
  sticks = [{ x: platforms[0].x + platforms[0].w, length: 0, rotation: 0 }];

  // Here we will genereate the trees in the background for the animation:
  trees = [];
  generateTree();
  generateTree();
  generateTree();
  generateTree();
  generateTree();
  generateTree();
  generateTree();
  generateTree();
  generateTree();
  generateTree();

  // Here we will intialize the ninjas position
  ninjaX = platforms[0].x + platforms[0].w - ninjaDistanceFromEdge; // the ninja will stand somewhat at the edge of the pillar with this 
  ninjaY = 0; // the Y-coordinates will always stay the same until the ninja falls

  // want to create lives here:
  // lives = 3;
  draw();
}
// once we come to the end of the "resetGame()" function, we reset the user interface by making sure that
// we reset the "reset button" to hidden and the score reset back to 0






//================================================================ THE GENERATE TREE FUNCTION =============================================================================================

function generateTree() {
  const minimumGap = 30;
  const maximumGap = 150;

  // we will get the X-coordinate of the right edge of the furthest tree
  const lastTree = trees[trees.length - 1];
  let furthestX = lastTree ? lastTree.x : 0;

  const x = furthestX + minimumGap + Math.floor(Math.random() * (maximumGap - minimumGap));

  // creating the colors for the trees:
  const treeColors = ["#6D8821", "#8FAC34", "#98B333"];
  const color = treeColors[Math.floor(Math.random() * 3)];

  trees.push({ x, color });
}






//================================================================ Generate PLATFORM FUNCTION =============================================================================================
// this function (below) will be out utility function, where it will generate/define the maximum distance 
// between the two platforms (which we will name "minumumGap") and what is the maximum distance (which we will
// name "maximumGap") and course the maximumWidth and minimumWidth as well

function generatePlatform() {
  const minimumGap = 40;
  const maximumGap = 200;
  const minimumWidth = 20;
  const maximumWidth = 100;

  //code below will represent the X-coordinate of the right edge of the furthest platform
  const lastPlatform = platforms[platforms.length - 1];
  let furthestX = lastPlatform.x + lastPlatform.w;

  const x =
    furthestX + minimumGap + Math.floor(Math.random() * (maximumGap - minimumGap));

  const w =
    minimumWidth + Math.floor(Math.random() * (maximumWidth - minimumWidth));

  platforms.push({ x, w });
}

resetGame();

// the conditional below will check to see if the user will press space to re-start the game instead:
window.addEventListener("keydown", function (event) {
  if (event.key == " ") {
    event.preventDefault();
    resetGame();
    return;
  }
});

window.addEventListener("mousedown", function (event) {
  if (phase == "waiting") {
    lastTimestamp = undefined;
    introductionElement.style.opacity = 0;
    phase = "stretching";
    window.requestAnimationFrame(animate);
  }
});

window.addEventListener("mouseup", function (event) {
  if (phase == "stretching") {
    phase = "turning";
  }
});

window.addEventListener("resize", function (event) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  draw();
});

window.requestAnimationFrame(animate);






//================================================================ THE ANIMATE FUNCTION (MAIN FUNCTION) =============================================================================================
// the "animate" function below is the main game loop:

function animate(timestamp) {
  if (!lastTimestamp) {
    lastTimestamp = timestamp;
    window.requestAnimationFrame(animate);
    return;
  }

  // we want to check to see what pahse the game is currently in:
  switch (phase) {
    case "waiting":
      return; // Stop the loop
    case "stretching": {
      sticks.last().length += (timestamp - lastTimestamp) / stretchingSpeed;
      break;
    }
    case "turning": {
      sticks.last().rotation += (timestamp - lastTimestamp) / turningSpeed;

      if (sticks.last().rotation > 90) {
        sticks.last().rotation = 90;

        const [nextPlatform, perfectHit] = thePlatformTheStickHits();
        if (nextPlatform) {
          // Increase score
          score += perfectHit ? 2 : 1;
          scoreElement.innerText = score;

          if (perfectHit) {
            perfectElement.style.opacity = 1;
            setTimeout(() => (perfectElement.style.opacity = 0), 1000);
          }

          generatePlatform();
          generateTree();
          generateTree();
        }

        phase = "walking";
      }
      break;
    }
    case "walking": {
      ninjaX += (timestamp - lastTimestamp) / walkingSpeed;

      const [nextPlatform] = thePlatformTheStickHits();
      if (nextPlatform) {
        // if the ninja reach another platform then limit its position at its edge:
        const maxNinjaX = nextPlatform.x + nextPlatform.w - ninjaDistanceFromEdge;
        if (ninjaX > maxNinjaX) {
          ninjaX = maxNinjaX;
          phase = "transitioning";
        }
      } else {
        // if the ninja does not reach another platform then we will limit the ninjas position by the end of the pole
        const maxNinjaX = sticks.last().x + sticks.last().length + ninjaWidth;
        if (ninjaX > maxNinjaX) {
          ninjaX = maxNinjaX;
          phase = "falling";
        }
      }
      break;
    }
    case "transitioning": {
      sceneOffset += (timestamp - lastTimestamp) / transitioningSpeed;

      const [nextPlatform] = thePlatformTheStickHits();
      if (sceneOffset > nextPlatform.x + nextPlatform.w - paddingX) {

        sticks.push({
          x: nextPlatform.x + nextPlatform.w,
          length: 0,
          rotation: 0
        });
        phase = "waiting";
      }
      break;
    }
    case "falling": {
      if (sticks.last().rotation < 180)
        sticks.last().rotation += (timestamp - lastTimestamp) / turningSpeed;

      ninjaY += (timestamp - lastTimestamp) / fallingSpeed;
      const maxNinjaY =
        platformHeight + 100 + (window.innerHeight - canvasHeight) / 2;
      if (ninjaY > maxNinjaY) {
        restartButton.style.display = "block";
        return;
      }
      break;
    }
    default:
      throw Error("Wrong phase");
  }

  draw();
  window.requestAnimationFrame(animate);

  lastTimestamp = timestamp;
}






//================================================================ THE STICK HITS THE PLATFORM FUNCTION =============================================================================================

//next, we want to make the function that will return the platform that the stick hits (if it doens not hit any
// stick then it will return undefined)
function thePlatformTheStickHits() {
  if (sticks.last().rotation != 90)
    throw Error(`Stick is ${sticks.last().rotation}°`);
  const stickFarX = sticks.last().x + sticks.last().length;

  const platformTheStickHits = platforms.find(
    (platform) => platform.x < stickFarX && stickFarX < platform.x + platform.w
  );

  //if the stick hits the perfect area then below will activate
  if (
    platformTheStickHits &&
    platformTheStickHits.x + platformTheStickHits.w / 2 - perfectAreaSize / 2 <
      stickFarX &&
    stickFarX <
      platformTheStickHits.x + platformTheStickHits.w / 2 + perfectAreaSize / 2
  )
    return [platformTheStickHits, true];

  return [platformTheStickHits, false];
}






//================================================================ THE DRAW FUNCTION =============================================================================================
// Our draw function paints the whole cnavas based on the state. It shifts the whole UI by the offset, which
// puts the ninja in position, and paints the platforms  and hte sticks:
function draw() {//this will get the drawing context
  ctx.save(); // this will allow us to save the current transformation
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  // here we are going to draw the background for the game
  drawBackground();

  // Center main canvas area to the middle of the screen
  ctx.translate(
    (window.innerWidth - canvasWidth) / 2 - sceneOffset,
    (window.innerHeight - canvasHeight) / 2
  );

  // Now we will draw the scene:
  drawPlatforms();
  drawNinja();
  drawSticks();

  // Now we will restore the transformation to the last save
  ctx.restore();
}

restartButton.addEventListener("click", function (event) {
  event.preventDefault();
  resetGame();
  restartButton.style.display = "none";
});






//================================================================ DRAWING THE PLATFORM FUNCTION =============================================================================================
// the weird thing about paiting on the canvas is that once you paint on the cnavas, you CANNOT chnage the painting at all
// we can think about this in a real example with real canvases. Once artist start drawing/paiting on their canvas, the only 
// way to change things on it is they have to paint over it or try to clear it
function drawPlatforms() {
  platforms.forEach(({ x, w }) => {
    // Drawing the platform below:
    ctx.fillStyle = "black"; // this will make the whole character/ninja black
    ctx.fillRect(
      x,
      canvasHeight - platformHeight,
      w,
      platformHeight + (window.innerHeight - canvasHeight) / 2
    );

        // we will only draw this if the ninja did not reach the platform yet
    if (sticks.last().x < x) {
      ctx.fillStyle = "red";
      ctx.fillRect(
        x + w / 2 - perfectAreaSize / 2,
        canvasHeight - platformHeight,
        perfectAreaSize,
        perfectAreaSize
      );
    }
  });
}






//================================================================ DRAWING THE NINJA FUNCTION =============================================================================================

function drawNinja() {
  ctx.save();
  ctx.fillStyle = "black";
  ctx.translate(
    ninjaX - ninjaWidth / 2,
    ninjaY + canvasHeight - platformHeight - ninjaHeight / 2
  );

  // Drawing the ninjas body:
  drawRoundedRect(
    -ninjaWidth / 2,
    -ninjaHeight / 2,
    ninjaWidth,
    ninjaHeight - 4,
    5
  );

  // Drawing the legs for the ninja:
  const legDistance = 5;
  ctx.beginPath();
  ctx.arc(legDistance, 11.5, 3, 0, Math.PI * 2, false);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-legDistance, 11.5, 3, 0, Math.PI * 2, false);
  ctx.fill();

  // Eye:
  ctx.beginPath();
  ctx.fillStyle = "white";
  ctx.arc(5, -7, 3, 0, Math.PI * 2, false);
  ctx.fill();

  // drawing the ninjas scarf/headband:
  ctx.fillStyle = "red";
  ctx.fillRect(-ninjaWidth / 2 - 1, -12, ninjaWidth + 2, 4.5);
  ctx.beginPath();
  ctx.moveTo(-9, -14.5);
  ctx.lineTo(-17, -18.5);
  ctx.lineTo(-14, -8.5);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-10, -10.5);
  ctx.lineTo(-15, -3.5);
  ctx.lineTo(-5, -7);
  ctx.fill();

  ctx.restore();
}






//================================================================ DRAWING THE ROUNDED RECTANGLE FUNCTION =============================================================================================

function drawRoundedRect(x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x, y + radius);
  ctx.lineTo(x, y + height - radius);
  ctx.arcTo(x, y + height, x + radius, y + height, radius);
  ctx.lineTo(x + width - radius, y + height);
  ctx.arcTo(x + width, y + height, x + width, y + height - radius, radius);
  ctx.lineTo(x + width, y + radius);
  ctx.arcTo(x + width, y, x + width - radius, y, radius);
  ctx.lineTo(x + radius, y);
  ctx.arcTo(x, y, x, y + radius, radius);
  ctx.fill();
}







//================================================================ DRAWING THE STICK FUNCTION =============================================================================================

function drawSticks() {
  sticks.forEach((stick) => {
    ctx.save();

    // Move the anchor point to the start of the stick and rotate
    ctx.translate(stick.x, canvasHeight - platformHeight);
    ctx.rotate((Math.PI / 180) * stick.rotation);

    // Draw stick
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -stick.length);
    ctx.stroke();

    // Restore transformations
    ctx.restore();
  });
}







//================================================================ DRAWING THE BACKGROUND SCENE FUNCTION =============================================================================================

function drawBackground() {
  // Draw sky
  var gradient = ctx.createLinearGradient(0, 0, 0, window.innerHeight);
  gradient.addColorStop(0, "#BBD691");
  gradient.addColorStop(1, "#FEF1E1");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

  // Draw hills
  drawHill(hill1BaseHeight, hill1Amplitude, hill1Stretch, "#95C629");
  drawHill(hill2BaseHeight, hill2Amplitude, hill2Stretch, "#659F1C");

  // Draw trees
  trees.forEach((tree) => drawTree(tree.x, tree.color));
}








//================================================================ DRAWING THE HILLS FUNCTION =============================================================================================

// A hill is a shape under a stretched out sinus wave
function drawHill(baseHeight, amplitude, stretch, color) {
  ctx.beginPath();
  ctx.moveTo(0, window.innerHeight);
  ctx.lineTo(0, getHillY(0, baseHeight, amplitude, stretch));
  for (let i = 0; i < window.innerWidth; i++) {
    ctx.lineTo(i, getHillY(i, baseHeight, amplitude, stretch));
  }
  ctx.lineTo(window.innerWidth, window.innerHeight);
  ctx.fillStyle = color;
  ctx.fill();
}








//================================================================ DRAWING THE TREES FUNCTION =============================================================================================

function drawTree(x, color) {
  ctx.save();
  ctx.translate(
    (-sceneOffset * backgroundSpeedMultiplier + x) * hill1Stretch,
    getTreeY(x, hill1BaseHeight, hill1Amplitude)
  );

  const treeTrunkHeight = 5;
  const treeTrunkWidth = 2;
  const treeCrownHeight = 25;
  const treeCrownWidth = 10;

  // Draw trunk
  ctx.fillStyle = "#7D833C";
  ctx.fillRect(
    -treeTrunkWidth / 2,
    -treeTrunkHeight,
    treeTrunkWidth,
    treeTrunkHeight
  );

  // Drawing the top part for the tree (the leaves/cone shape for the top of the tree)
  ctx.beginPath();
  ctx.moveTo(-treeCrownWidth / 2, -treeTrunkHeight);
  ctx.lineTo(0, -(treeTrunkHeight + treeCrownHeight));
  ctx.lineTo(treeCrownWidth / 2, -treeTrunkHeight);
  ctx.fillStyle = color;
  ctx.fill();

  ctx.restore();
}







//================================================================ DRAWING THE TREES AND HILLS Y POSITION FUNCTION =============================================================================================

function getHillY(windowX, baseHeight, amplitude, stretch) {
  const sineBaseY = window.innerHeight - baseHeight;
  return (
    Math.sinus((sceneOffset * backgroundSpeedMultiplier + windowX) * stretch) *
      amplitude +
    sineBaseY
  );
}

function getTreeY(x, baseHeight, amplitude) {
  const sineBaseY = window.innerHeight - baseHeight;
  return Math.sinus(x) * amplitude + sineBaseY;
}


// later, I need to update the code so whenever the ninja is moving, so does the screen...... (this is just in case some one holds the mouse for too long and has the stick overgrow)