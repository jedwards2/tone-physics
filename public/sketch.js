let tones = [];
let poleValues = [55, 110, 220, 440, 880, 1760];
let poles = [];
let massSlider;
let socket;
//set gravity
const G = 1;

function setup() {
  createCanvas(400, 1600);
  let x = 1;
  for (let q = poleValues.length - 1; q >= 0; q--) {
    let pole = new Pole(poleValues[q], x * x);
    poles.push(pole);
    x += 1;
  }
  socket = io.connect("http://localhost:3000");

  massSlider = createSlider(11, 255, 10);
  massSlider.position(450, 10);
  massSlider.style("width", "80px");
}

function draw() {
  background(0);
  let allPos = {};
  for (let q = poles.length - 1; q >= 0; q--) {
    poles[q].display();
  }
  for (let i = tones.length - 1; i >= 0; i--) {
    tones[i].recordHistory();
    tones[i].updateHistory();
    tones[i].updatePosition();
    tones[i].drag();
    for (let q = poles.length - 1; q >= 0; q--) {
      poles[q].attract(tones[i]);
    }

    tones[i].display();
    tones[i].loseMass();
    if (tones[i].checkMass()) {
      tones[i].mass = 0;
      for (let i = tones.length - 1; i >= 0; i--) {
        allPos[i] = tones[i].pos.y;
        allPos[`${i}Mass`] = tones[i].mass;
      }
      console.log(allPos);
      socket.emit("talkback", allPos);
      tones[i].removeTone();
      return;
    }
  }
  for (let i = tones.length - 1; i >= 0; i--) {
    allPos[i] = tones[i].pos.y;
    allPos[`${i}Mass`] = tones[i].mass;
  }
  console.log(allPos);
  socket.emit("talkback", allPos);
}

function mousePressed() {
  if (mouseX > width || mouseY > height) {
    return;
  }
  let tone = new Tone(mouseY, massSlider.value());

  for (let i = tones.length - 1; i >= 0; i--) {
    let dist = tones[i].pos.y - mouseY;
    let force = createVector(0, dist);
    let distanceSq = constrain(force.mag(), 1, 10000);

    let strength = (G * (tone.mass * tones[i].mass)) / distanceSq;

    force.setMag(strength);
    tones[i].applyForce(force);
  }

  tones.push(tone);
}

function resetAllIndices() {
  for (let i = tones.length - 1; i >= 0; i--) {
    tones[i].index = i;
  }
}

// function windowResized() {
//   resizeCanvas(windowWidth, windowHeight);
// }

class Tone {
  constructor(y, m) {
    this.pos = createVector(width, y);
    this.velocity = createVector(0, 0);

    this.acc = createVector(0, 0);
    this.mass = m;
    this.r = sqrt(this.mass) * 2;
    this.positionHistory = [];
    this.c = 255;
  }

  drag() {
    let drag = this.velocity.copy();
    drag.normalize();
    drag.mult(-1);

    //set drag
    let c = 0.5;
    let speedSq = this.velocity.magSq();
    drag.setMag(c * speedSq);

    this.applyForce(drag);
  }

  applyForce(force) {
    let f = p5.Vector.div(force, this.mass);
    this.acc.add(f);
  }

  updatePosition() {
    this.velocity.add(this.acc);
    this.pos.add(this.velocity);
    if (this.pos.y < 0 || this.pos.y > height) {
      this.pos.y = 1;
      this.acc.y *= -1;
      this.velocity.y *= -1;
    }
    this.acc.set(0, 0);
  }

  display() {
    push();
    noStroke();
    fill(this.c);
    let radius = this.mass / 2;
    circle(this.pos.x, this.pos.y, radius);
    pop();
  }

  recordHistory() {
    this.positionHistory.push([this.pos.x, this.pos.y]);
  }

  updateHistory() {
    for (let i = this.positionHistory.length - 1; i >= 0; i--) {
      //remove [x, y] position if x is less than 0
      if (this.positionHistory[i][0] < 0) {
        this.positionHistory.splice(i, 1);
      }

      //lower x by 1 and display onscreen
      this.positionHistory[i][0] -= 1;

      push();
      noStroke();
      let alpha = map(i, width, 0, 255, 0);
      fill(this.c, this.c, this.c, alpha);
      let radius = this.mass / 2;

      circle(this.positionHistory[i][0], this.positionHistory[i][1], radius);
      pop();
    }
  }
  loseMass() {
    // controls the decay of the tones
    this.mass -= 0.025;
  }
  checkMass() {
    if (this.mass <= 1) {
      return true;
    } else return false;
  }
  removeTone() {
    tones.splice(this.index, 1);
    resetAllIndices();
  }
}

class Pole {
  constructor(y, m) {
    this.pos = createVector(width, y);
    this.mass = m;
    this.width = sqrt(this.mass) * 10;
  }

  attract(tone) {
    let force = p5.Vector.sub(this.pos, tone.pos);
    let distanceSq = constrain(force.magSq(), 100, 10000);

    let strength = (G * (this.mass * tone.mass)) / distanceSq;
    force.setMag(strength);
    tone.applyForce(force);
  }

  display() {
    noFill();
    stroke(255, 255, 255, 100);
    line(0, this.pos.y, width, this.pos.y);
  }
}
