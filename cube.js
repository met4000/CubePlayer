let cubeSize, maxCubeOffset, cubeRings, basicNotation, _indexHelper;

// * cube logic *

let faceArr = [
  { name: "front",  normal: new AxisVector(Z_AXIS,  1) },
  { name: "back",   normal: new AxisVector(Z_AXIS, -1) },
  { name: "right",  normal: new AxisVector(X_AXIS,  1) },
  { name: "left",   normal: new AxisVector(X_AXIS, -1) },
  { name: "top",    normal: new AxisVector(Y_AXIS,  1) },
  { name: "down",   normal: new AxisVector(Y_AXIS, -1) },
];

function _checkPosBounds(p) { return Math.min(...p) >= 0 && Math.max(...p) < cubeSize; }
function generateRings() {
  let rings = [], grid = {};
  
  // traverse the grid, assigning indices
  for (let ringNumber = 0, pos = [0, 0], delta = [1, 0]; grid[pos] === undefined; pos = addPair(pos, delta)) {
    if (rings[ringNumber] === undefined) rings[ringNumber] = [];
    
    let i = pos[0] + pos[1] * cubeSize; // convert pos to grid index
    rings[ringNumber].push(i); // add to ring
    grid[pos] = ringNumber; // mark as visited

    // update direction if "crashing"
    let newPos = addPair(pos, delta);
    if (!_checkPosBounds(newPos) || grid[newPos] !== undefined) {
      delta = [-delta[1], delta[0]]; // right rotation by 90 deg
      if (grid[newPos] === ringNumber) ringNumber++; // move onto the next ring
    }
  }

  return rings;
}

function _getFaceElements(name) { return [...document.querySelectorAll(`#${name} > .cellContainer > *`)]; }
// todo: exchange elements instead of exchanging classes (allows for e.g. pictures/text)
function enact(move) {
  let newCellElements = {}; // e.g. { front: [blue, red] }
  let newCellIndexes = {}; // e.g. { front: [0, 2] }

  for (let face of faceArr) {
    if (face.normal.axis === move.normal.axis) { // parallel plane
      // continue if planes are not equal
      if (move.normal.magnitude * face.normal.magnitude != maxCubeOffset) continue;

      // perform a walk of each "ring" on the face, exchanging elements
      // todo generalise for multiple rings (2x2 has only one ring)

      let faceElements = _getFaceElements(face.name);

      for (let [...ring] of cubeRings) {
        if (face.normal.magnitude * Math.sign(move.normal.magnitude) * move.rotation < 0) ring.reverse();

        for (let r = 0, r_max = ring.length / 4; r < r_max; r++) {
          let temp = faceElements[ring[0]].className;
          for (let i = 1; i < ring.length; i++)
            faceElements[ring[i - 1]].className = faceElements[ring[i]].className;
          faceElements[ring[ring.length - 1]].className = temp;
        }
      }
    } else { // intersecting plane
      let faceElements = _getFaceElements(face.name);

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

      // ! todo: maths, rather than hard-code
      let n = undefined, nCalc = m => Math.round((cubeSize - 1) / 2 + m - (cubeSize % 2 == 0 ? Math.sign(m) * 0.5 : 0));
      if (move.normal.axis === Y_AXIS) {
        n = nCalc(-move.normal.magnitude);
      } else if (face.normal.axis === Y_AXIS) {
        if (move.normal.axis === X_AXIS) {
          n = nCalc(-fmProduct.magnitude);
        } else {
          n = nCalc(move.normal.magnitude);
        }
      } else {
        n = nCalc(fmProduct.magnitude);
      }
      
      // guaranteed to be in order, but may need to be reversed
      let check = i => op(i) === n;
      let movingElementPairs = faceElements.map((v, i) => ({ v, i })).filter(({ v, i }) => check(i));
      
      // ! todo: maths, rather than hard-code
      let reversed = undefined;
      if (move.normal.axis === Y_AXIS) {
        reversed = move.normal.magnitude > 0;
      } else if (face.normal.axis === Y_AXIS) {
        if (move.normal.axis === X_AXIS) {
          reversed = fmProduct.magnitude < 0;
        } else {
          reversed = move.normal.magnitude < 0;
        }
      } else {
        reversed = fmProduct.magnitude > 0;
      }
      if (reversed) movingElementPairs.reverse();
      
      let nextFace = fmProduct.mapMag(m => Math.sign(m * -move.rotation));
      
      newCellElements[faceArr.find(face => face.normal.equals(nextFace)).name] = movingElementPairs.map(({ v, _ }) => v.className);
      newCellIndexes[face.name] = movingElementPairs.map(({ _, i }) => i);
    }
  }

  // * debug
  // console.log(newCellElements);
  // console.log(newCellIndexes);

  for (let faceName of Object.keys(newCellElements)) {
    let faceElements = _getFaceElements(faceName);

    newCellIndexes[faceName].forEach((v, i) => faceElements[v].className = newCellElements[faceName][i]);
  }
}

let basicNotationAxis = {
  R: new AxisVector(X_AXIS,  1),
  L: new AxisVector(X_AXIS, -1),
  U: new AxisVector(Y_AXIS,  1),
  D: new AxisVector(Y_AXIS, -1),
  F: new AxisVector(Z_AXIS,  1),
  B: new AxisVector(Z_AXIS, -1),
};

// assumes all moves in one long string
function perform(str, options = undefined) {
  let notationSet = (options?.notationSet ?? basicNotation);
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
}

/**
 * @param {*} _isInverted SHOULD NOT BE USED PUBLICLY
 */
function performSubs(str, subsGroup, options = undefined, _isInverted = false) {
  // todo split into functions
  if (!_isInverted) {
    for (let i = 0; i < str.length; i++) {
      let moveName = str[i];
      let sub = subsGroup[moveName];

      let inverted = false;
      if (str[i + 1] === "'") { // i.e. inverted
        inverted = true;
        i++;
      }
      
      // ! only catches single digits; todo: increase
      let occurrences = 1;
      if (/\d/.test(str[i + 1])) { // i.e. repeated
        occurrences = str[i + 1];
        i++;
      }

      if (sub === undefined) {
        perform(`${moveName}${inverted?"'":""}${occurrences}`, options);
        continue;
      }

      for (let i = 0; i < occurrences; i++) performSubs(sub, subsGroup, options, inverted);
    }
  } else {
    for (let i = str.length - 1; i >= 0; i--) {
      // ! only catches single digits; todo: increase
      let occurrences = 1;
      if (/\d/.test(str[i])) { // i.e. repeated
        occurrences = str[i];
        i--;
      }

      let inverted = true;
      if (str[i] === "'") { // i.e. inverted
        inverted = false;
        i--;
      }

      let moveName = str[i];
      let sub = subsGroup[moveName];

      if (sub === undefined) {
        perform(`${moveName}${inverted ? "'" : ""}${occurrences}`, options);
        continue;
      }

      for (let i = 0; i < occurrences; i++) performSubs(sub, subsGroup, options, inverted);
    }
  }
}

// assumes moves in space separated string
// todo: advanced (3x3/4x4 etc.) notation
function performAdvanced(str, options = undefined) {
  for (let move of str.split(" ")) {
    // standard properties
    let moveName = /^(?:\d+)?([A-Z])[w']{0,2}(?:\d+)?$/.exec(move)[1]; // ! todo: improve stability
    let inverted = /'/.test(move);
    let occurrences = parseInt((/(\d+)$/.exec(move) ?? [])[1] ?? 1);

    // advanced properties
    let deep = /w/.test(move);
    let slice = parseInt((/^(\d+)/.exec(move) ?? [])[1] ?? 1);

    let moves = [];
    for (let i = deep ? 0 : slice - 1; i < slice; i++) moves.push(
      basicNotationAxis[moveName].mapMag(m => Math.sign(m) * (maxCubeOffset - i)).toMove(inverted ? 1 : -1)
    );

    for (let i = 0; i < occurrences; i++) moves.forEach(move => enact(move));
  }
}

// * setup/spawn cube *

const faceMap = {
  front:  `<div class="blue"></div>`,
  back:   `<div class="green"></div>`,
  right:  `<div class="red"></div>`,
  left:   `<div class="orange"></div>`,
  top:    `<div class="yellow"></div>`,
  down:   `<div class="white"></div>`,
};
function respawn(size = 3) {
  cubeSize = size;
  maxCubeOffset = Math.floor(cubeSize / 2);
  document.getElementById("cube").style.setProperty("--size", cubeSize);

  // make the cube cells
  [...document.getElementsByClassName("face")].forEach(face => {
    let cellContainer = face.getElementsByClassName("cellContainer")[0];
    cellContainer.innerHTML = Array(cubeSize * cubeSize).fill(faceMap[face.id]).join("");
  });

  // calculate rings (for rotating faces)
  cubeRings = generateRings();

  // calculate index helper list
  _indexHelper = [];
  for (let i = 0, p = -maxCubeOffset; i < cubeSize; i++, p++) {
    if (i == maxCubeOffset) p++;
    _indexHelper.push(p);
  }

  // setup basic notation
  basicNotation = {};
  // standard moves
  Object.entries(basicNotationAxis).forEach(
    ([k, v]) => basicNotation[k] = [v.mapMag(m => m * maxCubeOffset).toMove(-1)]
  );
  // rotations
  Object.entries({ x: X_AXIS, y: Y_AXIS, z: Z_AXIS }).forEach(
    ([k, axis]) => basicNotation[k] = [..._indexHelper].map(v => new Move(axis, v, -1))
  );
}
respawn();
