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
    this.rotation = rotation;
  }

  reversed() {
    return new Move(this.normal.axis, this.normal.magnitude, -this.rotation);
  }
}

let faceInfoArr = [
  { face: "front",  normal: new AxisVector(Z_AXIS,  1) },
  { face: "back",   normal: new AxisVector(Z_AXIS, -1) },
  { face: "right",  normal: new AxisVector(X_AXIS,  1) },
  { face: "left",   normal: new AxisVector(X_AXIS, -1) },
  { face: "top",    normal: new AxisVector(Y_AXIS,  1) },
  { face: "down",   normal: new AxisVector(Y_AXIS, -1) },
];

const defaultRing = [0, 1, 3, 2];
// todo: exchange elements instead of exchanging classes (allows for e.g. pictures/text)
let enact = move => {
  for (let faceInfo of faceInfoArr) {
    if (faceInfo.normal.axis === move.normal.axis) { // parallel plane
      // continue if planes are not equal
      if (move.normal.magnitude * faceInfo.normal.magnitude != maxCubeOffset) continue;

      // perform a walk of each "ring" on the face, exchanging elements
      // todo generalise for multiple rings (2x2 has only one ring)

      let faceElements = document.getElementById(faceInfo.face).children;

      let ring = [...defaultRing];
      if (faceInfo.normal.magnitude * move.rotation < 0) ring.reverse();

      let temp = faceElements[ring[0]].className;
      for (let i = 1; i < ring.length; i++)
        faceElements[ring[i - 1]].className = faceElements[ring[i]].className;
      faceElements[ring[ring.length - 1]].className = temp;
    } else { // intersecting plane
      // TODO
    }
  }
};

let defaultNotation = {
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
