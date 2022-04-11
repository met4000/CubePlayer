const X_AXIS = "x", Y_AXIS = "y", Z_AXIS = "z";

class AxisVector {
  constructor(axis, magnitude) {
    this.axis = axis;
    this.magnitude = magnitude;
  }

  mapAxis(f = (a, m) => a) { return new AxisVector(f(this.axis, this.magnitude), this.magnitude); }
  mapMag(f = (m, a) => m) { return new AxisVector(this.axis, f(this.magnitude, this.axis)); }

  // * note: both magnitude === 0 =/=> equal
  equals(v) { return this.axis === v.axis && this.magnitude === v.magnitude; }

  toMove(rotation) { return new Move(this.axis, this.magnitude, rotation); }
}

function crossProduct(v1, v2) { // ! for AxisVectors only
  const ring = [X_AXIS, Y_AXIS, Z_AXIS];
  let axis = ring.find(v => ![v1.axis, v2.axis].includes(v));
  let magnitudeModifier = ring[(ring.indexOf(v1.axis) + 1) % ring.length] == v2.axis ? 1 : -1;
  return new AxisVector(axis, v1.magnitude * v2.magnitude * magnitudeModifier);
}

class Move {
  constructor(normalAxis, offset, rotation) {
    this.normal = new AxisVector(normalAxis, offset);
    this.rotation = rotation; // must be 1 or -1
  }

  reversed() {
    return new Move(this.normal.axis, this.normal.magnitude, -this.rotation);
  }
}

function addPair(p1, p2) { return [p1[0] + p2[0], p1[1] + p2[1]]; }

// returns exactly +/- 1, including for +/- 0
function sgn(n) { return Math.sign(1 / n); }

// maps true -> 1, false -> -1
function sgn_b(b) { return b ? 1 : -1; }
