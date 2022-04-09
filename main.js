let cube = document.getElementById("cube");


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

let enact = move => {
  // ! TODO
};

let defaultNotation = {
  R: [new Move("x", 1, -1)],
  L: [new Move("x", -1, 1)],
  U: [new Move("y", 1, -1)],
  D: [new Move("y", -1, 1)],
  F: [new Move("z", 1, -1)],
  B: [new Move("z", -1, 1)],
};

let perform = (str, notation = defaultNotation) => {
  for (let i = 0; i < str.length; i++) {
    let moves = notation[str[i]];
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
  }
};
