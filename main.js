let sliders = Object.fromEntries(Object.entries({
  x: "slider_x",
  y: "slider_y",
  z: "slider_z"
}).map(([k, v]) => [k, document.getElementById(v)]));

let updateCubeTransform = () => {
  document.getElementById("cube").style.transform = ["x", "y", "z"].map(
    axisName => `rotate${axisName.toUpperCase()}(${sliders[axisName].value}deg)`
  ).join(" ");
};
Object.values(sliders).forEach(v => v.addEventListener("input", updateCubeTransform));
updateCubeTransform();

// perform() defined in cube.js
[...document.getElementsByClassName("ib")].forEach(
  button => button.addEventListener("click", () => perform(button.value))
);

let toggleButtons = () => [...document.getElementsByClassName("ib")].forEach(
  button => button.style.display = button.style.display == "none" ? "inline" : "none"
);
