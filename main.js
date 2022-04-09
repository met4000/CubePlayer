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
class Move {
  constructor(normalAxis, offset, direction) {
    this.normal = normalAxis;
    this.offset = offset;
    this.direction = direction;
  }

  reversed() {
    return new Move(this.normal, this.offset, -this.direction);
  }
}

let faceInfoArr = [
  { face: "front",  normal: Z_AXIS,  direction:  1 },
  { face: "back",   normal: Z_AXIS,  direction: -1 },
  { face: "right",  normal: X_AXIS,  direction:  1 },
  { face: "left",   normal: X_AXIS,  direction: -1 },
  { face: "top",    normal: Y_AXIS,  direction:  1 },
  { face: "down",   normal: Y_AXIS,  direction: -1 },
];

const defaultRing = [0, 1, 3, 2];
// todo: exchange elements instead of exchanging classes (allows for e.g. pictures/text)
let enact = move => {
  for (let faceInfo of faceInfoArr) {
    if (faceInfo.normal === move.normal) { // parallel plane
      // continue if planes are not equal
      if (move.offset * faceInfo.direction != maxCubeOffset) continue;

      // perform a walk of each "ring" on the face, exchanging elements
      // todo generalise for multiple rings (2x2 has only one ring)

      let faceElements = document.getElementById(faceInfo.face).children;

      let ring = defaultRing;
      if (faceInfo.direction * move.direction < 0) ring.reverse();

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
