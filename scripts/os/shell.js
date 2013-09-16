/* ------------
  Shell.js
  
  The OS Shell - The "command line interface" (CLI) for the console.
------------ */

// TODO: Write a base class / prototype for system services and let Shell inherit from it.

function Shell() {
  // Properties
  this.promptStr   = ">";
  this.commandList = [];
  this.curses      = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
  this.apologies   = "[sorry]";
  // Methods
  this.init        = shellInit;
  this.putPrompt   = shellPutPrompt;
  this.handleInput = shellHandleInput;
  this.parseInput  = shellParseInput;
  this.execute     = shellExecute;
}

function shellInit() {
  var sc = null;
  //
  // Load the command list.
  
  // ver
  sc = new ShellCommand();
  sc.command = "ver";
  sc.description = "- Displays the current version data.";
  sc.function = shellVer;
  this.commandList[this.commandList.length] = sc;
  
  // help
  sc = new ShellCommand();
  sc.command = "help";
  sc.description = "- This is the help command. Seek help.";
  sc.function = shellHelp;
  this.commandList[this.commandList.length] = sc;
  
  // shutdown
  sc = new ShellCommand();
  sc.command = "shutdown";
  sc.description = "- Shuts down the virtual OS but leaves the underlying hardware simulation running.";
  sc.function = shellShutdown;
  this.commandList[this.commandList.length] = sc;
  
  // cls
  sc = new ShellCommand();
  sc.command = "cls";
  sc.description = "- Clears the screen and resets the cursor position.";
  sc.function = shellCls;
  this.commandList[this.commandList.length] = sc;
  
  // man <topic>
  sc = new ShellCommand();
  sc.command = "man";
  sc.description = "<topic> - Displays the MANual page for <topic>.";
  sc.function = shellMan;
  this.commandList[this.commandList.length] = sc;
  
  // trace <on | off>
  sc = new ShellCommand();
  sc.command = "trace";
  sc.description = "<on | off> - Turns the OS trace on or off.";
  sc.function = shellTrace;
  this.commandList[this.commandList.length] = sc;
  
  // rot13 <string>
  sc = new ShellCommand();
  sc.command = "rot13";
  sc.description = "<string> - Does rot13 obfuscation on <string>.";
  sc.function = shellRot13;
  this.commandList[this.commandList.length] = sc;
  
  // prompt <string>
  sc = new ShellCommand();
  sc.command = "prompt";
  sc.description = "<string> - Sets the prompt.";
  sc.function = shellPrompt;
  this.commandList[this.commandList.length] = sc;
  
  // date
  sc = new ShellCommand();
  sc.command = "date";
  sc.description = "- Displays the current date and time.";
  sc.function = shellDate;
  this.commandList[this.commandList.length] = sc;
  
  // whereami
  sc = new ShellCommand();
  sc.command = "whereami";
  sc.description = "- Displays the user's current location.";
  sc.function = shellWhereAmI;
  this.commandList[this.commandList.length] = sc;
  
  // joke
  sc = new ShellCommand();
  sc.command = "joke";
  sc.description = "- Displays a joke.";
  sc.function = shellJoke;
  this.commandList[this.commandList.length] = sc;
  
  // status
  sc = new ShellCommand();
  sc.command = "status";
  sc.description = "- Changes the host's status.";
  sc.function = shellStatus;
  this.commandList[this.commandList.length] = sc;
  
  // bsod
  sc = new ShellCommand();
  sc.command = "bsod";
  sc.description = "- Causes a BSOD.";
  sc.function = shellBsod;
  this.commandList[this.commandList.length] = sc;
  
  // processes - list the running processes and their IDs
  // kill <id> - kills the specified process id.
  
  //
  // Display the initial prompt.
  this.putPrompt();
}

function shellPutPrompt()
{
  _StdIn.putText(this.promptStr);
}

function shellHandleInput(buffer)
{
  krnTrace("Shell Command~" + buffer);
  // 
  // Parse the input...
  //
  var userCommand = new UserCommand();
  userCommand = this.parseInput(buffer);
  // ... and assign the command and args to local variables.
  var cmd = userCommand.command;
  var args = userCommand.args;
  //
  // Determine the command and execute it.
  //
  // JavaScript may not support associative arrays in all browsers so we have to
  // iterate over the command list in attempt to find a match.  TODO: Is there a better way? Probably.
  var index = 0;
  var found = false;
  while (!found && index < this.commandList.length)
  {
    if (this.commandList[index].command === cmd)
    {
      found = true;
      var fn = this.commandList[index].function;
    }
    else
    {
      ++index;
    }
  }
  if (found)
  {
    this.execute(fn, args);
  }
  else
  {
    // It's not found, so check for curses and apologies before declaring the command invalid.
    if (this.curses.indexOf("[" + rot13(cmd) + "]") >= 0)      // Check for curses.
    {
      this.execute(shellCurse);
    }
    else if (this.apologies.indexOf("[" + cmd + "]") >= 0)      // Check for apologies.
    {
      this.execute(shellApology);
    }
    else    // It's just a bad command.
    {
      this.execute(shellInvalidCommand);
    }
  }
}

function shellParseInput(buffer)
{
  var retVal = new UserCommand();
  
  // 1. Remove leading and trailing spaces.
  buffer = trim(buffer);
  
  // 2. Lower-case it.
  buffer = buffer.toLowerCase();
  
  // 3. Separate on spaces so we can determine the command and command-line args, if any.
  var tempList = buffer.split(" ");
  
  // 4. Take the first (zeroth) element and use that as the command.
  var cmd = tempList.shift();  // Yes, you can do that to an array in JavaScript.  See the Queue class.
  // 4.1 Remove any left-over spaces.
  cmd = trim(cmd);
  // 4.2 Record it in the return value.
  retVal.command = cmd;
  
  // 5. Now create the args array from what's left.
  for (var i in tempList)
  {
    var arg = trim(tempList[i]);
    if (arg != "")
    {
      retVal.args[retVal.args.length] = tempList[i];
    }
  }
  return retVal;
}

function shellExecute(fn, args)
{
  // We just got a command, so advance the line...
  _StdIn.advanceLine();
  // ... call the command function passing in the args...
  fn(args);
  // Check to see if we need to advance the line again
  if (_StdIn.CurrentXPosition > 0)
  {
    _StdIn.advanceLine();
  }
  // ... and finally write the prompt again.
  this.putPrompt();
}

//
// The rest of these functions ARE NOT part of the Shell "class" (prototype, more accurately), 
// as they are not denoted in the constructor.  The idea is that you cannot execute them from
// elsewhere as shell.xxx .  In a better world, and a more perfect JavaScript, we'd be
// able to make then private.  (Actually, we can. have a look at Crockford's stuff and Resig's JavaScript Ninja cook.)
//

//
// An "interior" or "private" class (prototype) used only inside Shell() (we hope).
//
function ShellCommand()     
{
  // Properties
  this.command = "";
  this.description = "";
  this.function = "";
}

//
// Another "interior" or "private" class (prototype) used only inside Shell() (we hope).
//
function UserCommand()
{
  // Properties
  this.command = "";
  this.args = [];
}


//
// Shell Command Functions.  Again, not part of Shell() class per se', just called from there.
//
function shellInvalidCommand()
{
  _StdIn.putText("Invalid Command. ");
  if (_SarcasticMode)
  {
    _StdIn.putText("Duh. Go back to your Speak & Spell.");
  }
  else
  {
    _StdIn.putText("Type 'help' for, well... help.");
  }
}

function shellCurse()
{
  _StdIn.putText("Oh, so that's how it's going to be, eh? Fine.");
  _StdIn.advanceLine();
  _StdIn.putText("Bitch.");
  _SarcasticMode = true;
}

function shellApology()
{
  if (_SarcasticMode) {
    _StdIn.putText("Okay. I forgive you. This time.");
    _SarcasticMode = false;
    } else {
    _StdIn.putText("For what?");
  }
}

function shellVer(args)
{
  _StdIn.putText(APP_NAME + " version " + APP_VERSION);    
}

function shellHelp(args)
{
  _StdIn.putText("Commands:");
  for (var i in _OsShell.commandList)
  {
    _StdIn.advanceLine();
    _StdIn.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
  }    
}

function shellShutdown(args)
{
  _StdIn.putText("Shutting down...");
  // Call Kernel shutdown routine.
  krnShutdown();   
  // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
}

function shellCls(args)
{
  _StdIn.clearScreen();
  _StdIn.resetXY();
}

function shellMan(args)
{
  if (args.length > 0)
  {
    var topic = args[0];
    switch (topic)
    {
      case "help": 
      _StdIn.putText("Help displays a list of (hopefully) valid commands.");
      break;
      default:
      _StdIn.putText("No manual entry for " + args[0] + ".");
    }        
  }
  else
  {
    _StdIn.putText("Usage: man <topic>  Please supply a topic.");
  }
}

function shellTrace(args)
{
  if (args.length > 0)
  {
    var setting = args[0];
    switch (setting)
    {
      case "on": 
      if (_Trace && _SarcasticMode)
      {
        _StdIn.putText("Trace is already on, dumbass.");
      }
      else
      {
        _Trace = true;
        _StdIn.putText("Trace ON");
      }
      
      break;
      case "off": 
      _Trace = false;
      _StdIn.putText("Trace OFF");                
      break;                
      default:
      _StdIn.putText("Invalid arguement.  Usage: trace <on | off>.");
    }        
  }
  else
  {
    _StdIn.putText("Usage: trace <on | off>");
  }
}

function shellRot13(args)
{
  if (args.length > 0)
  {
    _StdIn.putText(args[0] + " = '" + rot13(args[0]) +"'");     // Requires Utils.js for rot13() function.
  }
  else
  {
    _StdIn.putText("Usage: rot13 <string>  Please supply a string.");
  }
}

function shellPrompt(args)
{
  if (args.length > 0)
  {
    _OsShell.promptStr = args[0];
  }
  else
  {
    _StdIn.putText("Usage: prompt <string>  Please supply a string.");
  }
}

function shellDate()
{
  var d = new Date();
  _StdIn.putText(d.toString());
}

function shellWhereAmI()
{
  _StdIn.putText("An utterly insignificant little blue-green planet far out in the uncharted backwaters of the unfashionable end of the western spiral arm of the galaxy.");
}

function shellJoke()
{
	var jokes = ["Some people, when confronted with a problem, think, 'I know, I'll use threads' - and then two they hav erpoblesms.", 'A programmer is told to "go to hell", he finds the worst part of that statement is the "go to"', "How many programmers does it take to screw in a light bulb? None. It's a hardware problem.", "A programmer puts two glasses on his bedside table before going to sleep. A full one, in case he gets thirsty, and an empty one, in case he doesn't.", "There are 10 kinds of people in this world: Those who understand binary, those who don't, and those who weren't expecting a base 3 joke.", 'A programmer is heading out to the grocery store, so his wife tells him "get a gallon of milk, and if they have eggs, get a dozen." He returns with 13 gallons of milk.', 'A SQL statement walks into a bar and sees two tables. It approaches, and asks "may I join you?"', "A web developer walks into a restaurant. He immediately leaves in disgust as the restaurant was laid out in tables.", "There are 2 hard problems in computer science: caching, naming, and off-by-1 errors.", "Why do programmers confuse halloween and christmas? Because Oct 31 = Dec 25."];
  _StdIn.putText(jokes[Math.floor(Math.random()*(jokes.length - 1))]);
}

function shellStatus(args)
{
  if (args.length > 0)
  {
    _Status = args[0];
    _StdIn.putText("Status set.");     
  }
  else
  {
    _StdIn.putText("Usage: status <string>");
  }
}

function shellBsod()
{
  _KernelInterruptQueue.enqueue( new Interrupt(-1, -1) );
}
