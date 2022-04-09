let cube = document.getElementById("cube");
const cubeSize = 2; // todo
const maxCubeOffset = Math.floor(cubeSize / 2);


// slider setup

let sliders = Object.fromEntries(Object.entries({
  x: "slider_x",
  y: "slider_y",
  z: "slider_z"
}).map(([k, v]) => [k, document.getElementById(v)]));

Object.values(sliders).forEach(v => v.addEventListener("input", () => {
  cube.style.transform = `rotateX(${sliders.x.value}deg) `
                       + `rotateY(${sliders.y.value}deg) `
                       + `rotateZ(${sliders.z.value}deg)`;
}));


// cube manipulation

const X_AXIS = "x", Y_AXIS = "y", Z_AXIS = "z";
class AxisVector {
  constructor(axis, magnitude) {
    this.axis = axis;
    this.magnitude = magnitude;
  }

  mapAxis(f = (a, m) => a) { return new AxisVector(f(this.axis, this.magnitude), this.magnitude); }
  mapMag(f = (m, a) => m) { return new AxisVector(this.axis, f(this.magnitude, this.axis)); }

  equals(v) { return this.axis === v.axis && this.magnitude === v.magnitude; }
}
let crossProduct = (v1, v2) => { // ! for AxisVectors only
  const ring = [X_AXIS, Y_AXIS, Z_AXIS];
  let axis = ring.find(v => ![v1.axis, v2.axis].includes(v));
  let magnitudeModifier = ring[(ring.indexOf(v1.axis) + 1) % ring.length] == v2.axis ? 1 : -1;
  return new AxisVector(axis, v1.magnitude * v2.magnitude * magnitudeModifier);
};

class Move {
  constructor(normalAxis, offset, rotation) {
    this.normal = new AxisVector(normalAxis, offset);
    this.rotation = rotation; // must be 1 or -1
  }

  reversed() {
    return new Move(this.normal.axis, this.normal.magnitude, -this.rotation);
  }
}

let faceArr = [
  { name: "front",  normal: new AxisVector(Z_AXIS,  1) },
  { name: "back",   normal: new AxisVector(Z_AXIS, -1) },
  { name: "right",  normal: new AxisVector(X_AXIS,  1) },
  { name: "left",   normal: new AxisVector(X_AXIS, -1) },
  { name: "top",    normal: new AxisVector(Y_AXIS,  1) },
  { name: "down",   normal: new AxisVector(Y_AXIS, -1) },
];

const defaultRing = [0, 1, 3, 2];
// todo: exchange elements instead of exchanging classes (allows for e.g. pictures/text)
let enact = move => {
  let newCells = {}; // e.g. { front: [blue, red] }

  for (let face of faceArr) {
    if (face.normal.axis === move.normal.axis) { // parallel plane
      // continue if planes are not equal
      if (move.normal.magnitude * face.normal.magnitude != maxCubeOffset) continue;

      // perform a walk of each "ring" on the face, exchanging elements
      // todo generalise for multiple rings (2x2 has only one ring)

      let faceElements = document.getElementById(face.name).children;

      let ring = [...defaultRing];
      if (face.normal.magnitude * move.rotation < 0) ring.reverse();

      let temp = faceElements[ring[0]].className;
      for (let i = 1; i < ring.length; i++)
        faceElements[ring[i - 1]].className = faceElements[ring[i]].className;
      faceElements[ring[ring.length - 1]].className = temp;
    } else { // intersecting plane
      let faceElements = document.getElementById(face.name).children;

      let op = (a, b) => undefined;
      if (crossProduct(face.normal, move.normal.mapMag(m => Math.abs(m))).magnitude < 0) {
        op = (a, b) => a % b;
      } else {
        op = (a, b) => Math.floor(a / b);
      }

      let fmProduct = crossProduct(face.normal, move.normal);

      // "invert" around size (e.g. size = 4 => 3 becomes 0, 2 becomes 1) if fmProduct > 0
      let appliedOp = (i, c) => op(i, cubeSize) == c(maxCubeOffset - move.normal.magnitude);
      let check = i => false;
      if (fmProduct.magnitude > 0) {
        check = i => appliedOp(i, n => cubeSize - 1 - n);
      } else {
        check = i => appliedOp(i, n => n);
      }

      let nextFace = fmProduct.mapMag(m => m * -move.rotation);

      // guaranteed to be in order, but may need to be reversed
      let movingElements = [...faceElements].filter((_, i) => check(i));
      if (nextFace.magnitude > 0) movingElements.reverse(); // ... reverse if needed

      newCells[faceArr.find(v => v.normal.equals(nextFace)).name] = movingElements;
    }
  }

  for (let [name, elements] of Object.entries(newCells)) {
    // todo
  }
};

let defaultNotation = { // ! only for a 2x2 (or 3x3)
  R: [new Move(X_AXIS,  1, -1)],
  L: [new Move(X_AXIS, -1,  1)],
  U: [new Move(Y_AXIS,  1, -1)],
  D: [new Move(Y_AXIS, -1,  1)],
  F: [new Move(Z_AXIS,  1, -1)],
  B: [new Move(Z_AXIS, -1,  1)],
};

let perform = (str, options = undefined) => {
  let notationSet = (options?.notationSet ?? defaultNotation);
  let delay = (options?.delay ?? 0);

  for (let i = 0; i < str.length; i++) {
    let moves = notationSet[str[i]];
    if (moves === undefined) throw new Error(`invalid move "${str[i]}"`);

    if (str[i+1] === "'") { // i.e. reversed
      moves = moves.map(move => move.reversed());
      i++;
    }
    
    if (/\d/.test(str[i+1])) { // i.e. repeated
      moves = Array.from({length: str[i+1]}, () => moves).reduce((r, v) => r.concat(v));
      i++;
    }

    moves.forEach(move => enact(move));

    if (delay > 0) {
      // todo: do delay
    }
  }
};
