// Size of canvas. These get updated to fill the whole browser.
let width = 150;
let height = 150;
var count = 0;

const numBoids = 100;
const visualRange = 75;


var boids = [];

var terrain = [];

var active = false;
var currentX;
var currentY;
var initialX;
var initialY;
var xOffset = 0;
var yOffset = 0;
var killed = 0;

var headerOffset = 100;



function dragStart(e) {
  if (e.type === "touchstart") {
    initialX = e.touches[0].clientX;
    initialY = e.touches[0].clientY;
    addBoid('blue');
  } else {
    //addBoid('green');
    initialX = e.clientX;
    initialY = e.clientY;
    addBoid('white');
  }
  //document.getElementById('output').innerHTML = initialX;
  //document.getElementById('output2').innerHTML = initialY;
  for(let rect of terrain){
    if(initialX < rect.x + rect.width && initialX  > rect.x && initialY < rect.y + rect.height && initialY  > rect.y){
      addBoid('orange');
    }
  }

  active = true;
}

function dragEnd(e) {
  initialX = currentX;
  initialY = currentY;
  addBoid('black');
  active = false;
}

function drag(e){
  // if(e.clientX < rect.x + rect.width && e.clientX  > rect.x && e.clientY < rect.y + rect.height && e.clientY  > rect.y){
  //   addBoid('white');
  //   }
  // //addBoid('green');
  if (active){
    e.preventDefault();

    //addBoid('green');
    if(e.type === "touchmove"){
      // something soon
      deltaX = e.clientX[0] - initialX;
      deltaY = e.clientY[0] - initialY;
      hldX = e.clientX[0];
      hldY = e.clientY[0];
      addBoid('grey');
    } else {
      deltaX = e.clientX - initialX;
      deltaY = e.clientY - initialY;
      hldX = e.clientX;
      hldY = e.clientY;
    }
      //something
    for(let rect of terrain){
      addBoid('green');
      //addBoid('green');
      if(hldX < rect.x + rect.width && hldX  > rect.x && hldY - headerOffset < rect.y + rect.height && hldY - headerOffset  > rect.y){
        //addBoid('green');
        rect.x += deltaX;
        rect.y += deltaY;
        //document.getElementById('output').innerHTML = e.clientX;
        addBoid("purple");

    }
   }

    initialX = hldX;
    initialY = hldY;
    yOffset = currentX;
    yOffset = currentY;
  }
}



function addRectangle(xPos,yPos,wid,heig,col){
  terrain.push({
    x : xPos,
    y : yPos,
    width : wid,
    height : heig,
    color : col,
    });
  
}

function addBoid(col){
  boids.push({
    x: Math.random() * 10 + 500,
    y: Math.random() * 10 + 700,
    dx: Math.random() * 10 - 5,
    dy: Math.random() * 10 - 5,
    history: [],
    color: col,
  });

}

function addBoid2(e){
  addBoid('red');

}

function boidTeam(num,col){
  for(var i = 0; i < num; i +=1){
    addBoid(col);
  }
}

function initBoids(color) {
  for (var i = 0; i < numBoids; i += 1) {
    boids[boids.length] = {
      x: Math.random() * width,
      y: Math.random() * height,
      dx: Math.random() * 10 - 5,
      dy: Math.random() * 10 - 5,
      history: [],
      color: color,
    };
  }
}



function distance(boid1, boid2) {
  return Math.sqrt(
    (boid1.x - boid2.x) * (boid1.x - boid2.x) +
      (boid1.y - boid2.y) * (boid1.y - boid2.y),
  );
}

// TODO: This is naive and inefficient.
function nClosestBoids(boid, n) {
  // Make a copy
  const sorted = boids.slice();
  // Sort the copy by distance from `boid`
  sorted.sort((a, b) => distance(boid, a) - distance(boid, b));
  // Return the `n` closest
  return sorted.slice(1, n + 1);
}

// Called initially and whenever the window resizes to update the canvas
// size and width/height variables.
function sizeCanvas() {
  const canvas = document.getElementById("boids");
  //document.write(canvas)
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
}

function collisionDect(boid){
  for(let rect of terrain){
    if(boid.x < rect.x + rect.width &&
   boid.x  > rect.x &&
   boid.y < rect.y + rect.height &&
   boid.y  > rect.y){
      boid.color = 'green';
      //addBoid('orange');
      //rect.x += 100;
      const index = boids.indexOf(boid);
      if(index > -1){
        killed += 1;
        document.getElementById('output2').innerHTML = killed;
        boids.splice(index,1);
      }

    }
  }
}

// Constrain a boid to within the window. If it gets too close to an edge,
// nudge it back in and reverse its direction.
function keepWithinBounds(boid) {
  const margin = 200;
  const turnFactor = 1;

  if (boid.x < margin) {
    boid.dx += turnFactor;
  }
  if (boid.x > width - margin) {
    boid.dx -= turnFactor;
  }
  if (boid.y < margin) {
    boid.dy += turnFactor;
  }
  if (boid.y > height - margin) {
    boid.dy -= turnFactor;
  }
}

// Find the center of mass of the other boids and adjust velocity slightly to
// point towards the center of mass.
function flyTowardsCenter(boid) {
  const centeringFactor = 0.005; // adjust velocity by this %

  let centerX = 0;
  let centerY = 0;
  let numNeighbors = 0;

  for (let otherBoid of boids) {
    if(otherBoid.color == boid.color){
      if (distance(boid, otherBoid) < visualRange) {
        centerX += otherBoid.x;
        centerY += otherBoid.y;
        numNeighbors += 1;
      }
    }
  }

  if (numNeighbors) {
    centerX = centerX / numNeighbors;
    centerY = centerY / numNeighbors;

    boid.dx += (centerX - boid.x) * centeringFactor;
    boid.dy += (centerY - boid.y) * centeringFactor;
  }
}

// Move away from other boids that are too close to avoid colliding
function avoidOthers(boid) {
  const minDistance = 20; // The distance to stay away from other boids
  const avoidFactor = 0.05; // Adjust velocity by this %
  let moveX = 0;
  let moveY = 0;
  for (let otherBoid of boids) {
    if(otherBoid.color == boid.color){
      if (otherBoid !== boid) {
        if (distance(boid, otherBoid) < minDistance) {
          moveX += boid.x - otherBoid.x;
          moveY += boid.y - otherBoid.y;
        }
      }
    }
  }

  boid.dx += moveX * avoidFactor;
  boid.dy += moveY * avoidFactor;
}

// Find the average velocity (speed and direction) of the other boids and
// adjust velocity slightly to match.
function matchVelocity(boid) {
  const matchingFactor = 0.05; // Adjust by this % of average velocity

  let avgDX = 0;
  let avgDY = 0;
  let numNeighbors = 0;

  for (let otherBoid of boids) {
    if(otherBoid.color == boid.color){
      if (distance(boid, otherBoid) < visualRange) {
        avgDX += otherBoid.dx;
        avgDY += otherBoid.dy;
        numNeighbors += 1;
      }
    }
  }

  if (numNeighbors) {
    avgDX = avgDX / numNeighbors;
    avgDY = avgDY / numNeighbors;

    boid.dx += (avgDX - boid.dx) * matchingFactor;
    boid.dy += (avgDY - boid.dy) * matchingFactor;
  }
}

// Speed will naturally vary in flocking behavior, but real animals can't go
// arbitrarily fast.
function limitSpeed(boid) {
  const speedLimit = 15;

  const speed = Math.sqrt(boid.dx * boid.dx + boid.dy * boid.dy);
  if (speed > speedLimit) {
    boid.dx = (boid.dx / speed) * speedLimit;
    boid.dy = (boid.dy / speed) * speedLimit;
  }
}

const DRAW_TRAIL = false;

function drawBoid(ctx, boid) {
  const angle = Math.atan2(boid.dy, boid.dx);
  ctx.translate(boid.x, boid.y);
  ctx.rotate(angle);
  ctx.translate(-boid.x, -boid.y);
  //ctx.fillStyle = "#558cf4";
  ctx.fillStyle = boid.color;
  ctx.beginPath();
  ctx.moveTo(boid.x, boid.y);
  ctx.lineTo(boid.x - 15, boid.y + 5);
  ctx.lineTo(boid.x - 15, boid.y - 5);
  ctx.lineTo(boid.x, boid.y);
  ctx.fill();
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  if (DRAW_TRAIL) {
    ctx.strokeStyle = "#558cf466";
    ctx.beginPath();
    ctx.moveTo(boid.history[0][0], boid.history[0][1]);
    for (const point of boid.history) {
      ctx.lineTo(point[0], point[1]);
    }
    ctx.stroke();
  }
}

function drawRectangle(ctx,rect){
  ctx.beginPath();
  //ctx.fillStyle('green');
  //ctx.rect(rect.x, rect.y, rect.width, rect.height);
  ctx.fillStyle = rect.color;
  ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
  //ctx.fillRect(20, 20, 150, 100);
  //ctx.fill(rect.color)
  ctx.stroke();

}

// Main animation loop
function animationLoop() {
  //document.getElementById("clicker").innerHTML = width.toString();
  //count += 1;

  // Update each boid
  for (let boid of boids) {
    // Update the velocities according to each rule
    flyTowardsCenter(boid);
    avoidOthers(boid);
    matchVelocity(boid);
    limitSpeed(boid);
    keepWithinBounds(boid);
    collisionDect(boid);

    // Update the position based on the current velocity
    boid.x += boid.dx;
    boid.y += boid.dy;
    boid.history.push([boid.x, boid.y])
    boid.history = boid.history.slice(-50);
  }

  // Clear the canvas and redraw all the boids in their current positions
  const ctx = document.getElementById("boids").getContext("2d");
  ctx.clearRect(0, 0, width, height);
  for (let boid of boids) {
    drawBoid(ctx, boid);
  }
  for (let rect of terrain){
    drawRectangle(ctx,rect);
  }


  // Schedule the next frame
  window.requestAnimationFrame(animationLoop);
}
//New stuffs


function myFunction() {
  //document.getElementById("demo").innerHTML = "YOU CLICKED ME!";
}

function clickerAdd(){
  count += 1;
  //document.getElementById("clicker").innerHTML = count.toString();
}
//End


window.onload = () => {

  //document.getElementById("demo").onclick = function() {addBoid('green')};
  document.getElementById("dump").onclick = function() {boidTeam(20,'blue')};
  //document.getElementById("clicker").onclick = function() {clickerAdd()};
  //document.getElementById("clicker").innerHTML = 'test';
  document.getElementById('output').innerHTML = 'Boids killed:';

  //document.addEventListener("mousedown",addBoid2, false);


  document.addEventListener("touchstart", dragStart, false);
  document.addEventListener("touchend", dragEnd, false);
  document.addEventListener("touchmove", drag, false);

  document.addEventListener("mousedown", dragStart, false);
  document.addEventListener("mouseup", dragEnd, false);
  document.addEventListener("mousemove", drag, false);

  //count += 1;
  // Make sure the canvas always fills the whole window
  window.addEventListener("resize", sizeCanvas, false);
  sizeCanvas();

  // Randomly distribute the boids to start
  initBoids("red");
  addRectangle(700,50,150,300,"blue")
  addRectangle(100,0,150,300,"blue")

  // Schedule the main animation loop
  window.requestAnimationFrame(animationLoop);

};
