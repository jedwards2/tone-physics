let tones = [];
let poleValues = [55, 110, 220, 440, 880, 1760];
let poles = [];
let massSlider;

function setup() {
  createCanvas(400, 2000);
  let x = 1;
  for (let q = poleValues.length - 1; q >= 0; q--) {
    let pole = new Pole(poleValues[q], x * x);
    poles.push(pole);
    x += 1;
  }
  console.log(poles);

  massSlider = createSlider(11, 255, 10);
  massSlider.position(450, 10);
  massSlider.style("width", "80px");
}

function draw() {
  background(100);
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
  }
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
    let G = 5;

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

class Tone {
  constructor(y, m) {
    this.pos = createVector(width, y);
    this.velocity = createVector(0, 0);

    this.acc = createVector(0, 0);
    this.mass = m;
    this.r = sqrt(this.mass) * 2;
    this.positionHistory = [];
    this.c = [random(155) + 100, 60, random(155) + 100];
  }

  drag() {
    let drag = this.velocity.copy();
    drag.normalize();
    drag.mult(-1);

    let c = 0.1;
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
      fill(this.c);
      circle(this.positionHistory[i][0], this.positionHistory[i][1], 2);
      pop();
    }
  }
  loseMass() {
    // controls the decay of the tones
    this.mass -= 0.025;
    if (this.mass <= 1) {
      this.removeTone();
    }
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
    let G = 10;

    let strength = (G * (this.mass * tone.mass)) / distanceSq;
    force.setMag(strength);
    tone.applyForce(force);
  }

  display() {
    noFill();
    line(0, this.pos.y, width, this.pos.y);
  }
}
