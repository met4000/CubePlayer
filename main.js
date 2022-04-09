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
  let newCellElements = {}; // e.g. { front: [blue, red] }
  let newCellIndexes = {}; // e.g. { front: [0, 2] }

  for (let face of faceArr) {
    if (face.normal.axis === move.normal.axis) { // parallel plane
      // continue if planes are not equal
      if (move.normal.magnitude * face.normal.magnitude != maxCubeOffset) continue;

      // perform a walk of each "ring" on the face, exchanging elements
      // todo generalise for multiple rings (2x2 has only one ring)

      let faceElements = document.getElementById(face.name).children;

      let ring = [...defaultRing];
      if (face.normal.magnitude * Math.sign(move.normal.magnitude) * move.rotation < 0) ring.reverse();

      let temp = faceElements[ring[0]].className;
      for (let i = 1; i < ring.length; i++)
        faceElements[ring[i - 1]].className = faceElements[ring[i]].className;
      faceElements[ring[ring.length - 1]].className = temp;
    } else { // intersecting plane
      let faceElements = [...document.getElementById(face.name).children];

      let fmProduct = crossProduct(face.normal, move.normal);

      // ! todo: maths, rather than hard-code
      let op = n => undefined;
      if ({
        [X_AXIS]: { [Y_AXIS]: false, [Z_AXIS]: true  },
        [Y_AXIS]: { [X_AXIS]: true,  [Z_AXIS]: false },
        [Z_AXIS]: { [Y_AXIS]: false, [X_AXIS]: true  },
      }[face.normal.axis][move.normal.axis]) {
        op = n => n % cubeSize; // vertical (wrt 0 top-left)
      } else {
        op = n => Math.floor(n / cubeSize); // horizontal (wrt 0 top-left)
      }

      // ! todo: generalise to > 2x2 (i.e. n in {0..size-1})
      let n = undefined;
      if (move.normal.axis === Y_AXIS) {
        n = move.normal.magnitude === -1 ? 1 : 0;
      } else if (face.normal.axis === Y_AXIS) {
        if (move.normal.axis === X_AXIS) {
          n = fmProduct.magnitude === -1 ? 1 : 0;
        } else {
          n = move.normal.magnitude === -1 ? 0 : 1;
        }
      } else {
        n = fmProduct.magnitude === -1 ? 0 : 1;
      }

      let check = i => op(i) === n;

      let nextFace = fmProduct.mapMag(m => m * -move.rotation);

      // guaranteed to be in order, but may need to be reversed
      let movingElementPairs = faceElements.map((v, i) => ({ v, i })).filter(({ v, i }) => check(i));
      
      // ! todo: maths, rather than hard-code
      let reversed = undefined;
      if (move.normal.axis === Y_AXIS) {
        reversed = move.normal.magnitude === 1;
      } else if (face.normal.axis === Y_AXIS) {
        if (move.normal.axis === X_AXIS) {
          reversed = fmProduct.magnitude === 1;
        } else {
          reversed = move.normal.magnitude === -1;
        }
      } else {
        reversed = fmProduct.magnitude === 1;
      }
      if (reversed) movingElementPairs.reverse();

      newCellElements[faceArr.find(v => v.normal.equals(nextFace)).name] = movingElementPairs.map(({ v, _ }) => v.className);
      newCellIndexes[face.name] = movingElementPairs.map(({ _, i }) => i);
    }
  }

  console.log(newCellElements);
  console.log(newCellIndexes);

  for (let faceName of Object.keys(newCellElements)) {
    let faceElements = [...document.getElementById(faceName).children];

    newCellIndexes[faceName].forEach((v, i) => faceElements[v].className = newCellElements[faceName][i]);
  }
};

let defaultNotation = { // ! only for a 2x2 (or 3x3)
  R: [new Move(X_AXIS,  1, -1)],
  L: [new Move(X_AXIS, -1, -1)],
  U: [new Move(Y_AXIS,  1, -1)],
  D: [new Move(Y_AXIS, -1, -1)],
  F: [new Move(Z_AXIS,  1, -1)],
  B: [new Move(Z_AXIS, -1, -1)],
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
