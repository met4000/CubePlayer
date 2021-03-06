let helpObj = {
  help: "help(command: string = undefined) // " +
        "Displays this help message. If `command` is specified, only " +
        "displays the help message for the specified command, or an error message if it does not exist.",
  respawn: "respawn(size: number = 3) // " +
           "Removes the current cube, and spawns a new one with the given size (in a solved state).",
  perform: "perform(str: string, options: Object = undefined) // " +
           "Performs the sequence `str` on the cube. Assumes the sequence is a list of basic moves " +
           "and/or rotations, with no spaces. `options` is an object containing `\"notationSet\"` " +
           "(defaults to Singmaster notation) and/or `\"delay\"` (defaults to 0).",
  performSubs: "performSubs(str: string, subsGroup: Object, options: Object = undefined) // " +
               "Wrapper for perform(...), does (recursive) string substitution on `str` based on `subsGroup`",
  performAdvanced: "performAdvanced(str: string, options: Object = undefined) // " +
                   "Performs the space-separated sequence of moves in `str`. Recognises big cube " +
                   "notation such as `\"3Fw2\"` (advanced notation such as `\"f\"` is still TODO). " +
                   "`options` is the same as perform(...).",
  startCounter: "startCounter(id: any = 1) // " +
                "Starts (or restarts) counting the number of moves made. Use different `id`s to " +
                "make multiple simultaneous counters. See getCounter(...).",
  getCounter: "getCounter(id: any = 1) // " +
              "Gets the number of moves made since the respective startCounter(...) call to " +
              "the counter with the same `id`, or undefined if the counter has not been started.",
};

function help(command = undefined) {
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
}
