let helpObj = {
  help: "help(command: string = undefined) // " +
        "Displays this help message. If `command` is specified, only " +
        "displays the help message for the specified command, or an error message if it does not exist.",
  perform: "perform(str: string, options: Object = undefined) // " +
           "Performs the sequence `str` on the cube. `options` is an object containing " +
           "`\"notationSet\"` (defaults to Singmaster notation) and/or `\"delay\"` (defaults to 0).",
  rotate: "rotate(str: string, options: Object = undefined) // " +
          "Performs the rotation sequence `str` on the cube. `rotate(...)` is an alias for `perform(...)` " +
          "under the hood, with the default `\"notationSet\"` changed to one that rotates the cube " +
          "towards the face specified. `\"F\"` and `\"B\"` rotate the cube clockwise, " +
          "respective to the face specified.",
  performSubs: "performSubs(str: string, subsGroup: Object, options: Object = undefined) // " +
               "Wrapper for perform, that does (recursive) string substitution on `str` based on `subsGroup`",
};
let help = command => {
  if (command !== undefined) { // display specific command help
    if (helpObj[command] === undefined) {
      console.log("Command does not exist. Run `help()` for a list of all commands.");
      return false;
    }

    console.log(helpObj[command]);
  } else { // display all command help
    Object.values(helpObj).forEach(v => console.log(v));
  }

  return true;
};
