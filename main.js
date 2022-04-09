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

