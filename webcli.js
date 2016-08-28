"use strict";

var escape = require("escape-html");
var os = require("os");

module.exports = function(app){
    app.post("/api/webcli", function(req,res){
        var command = req.body.command;
        var result = new CommandResult("Command not found for: " + command, false, true);

        try{
            var args = getArgs(req.body.command);
            var cmd = args[0].toLowerCase();
            var command = _commands[cmd];
            if(command){
                result = command.func(args);
            }
        }finally{
            res.send(result);
        }
    });
}

function getArgs(command){
    var tokenEx = /[^\s"]+|"[^"]*"/g;
    var quoteEx = /"/g;

    var args = command.match(tokenEx);

    args.forEach(function(c,i){
        args[i] = c.replace(quoteEx, '');
    });

    return args;
}

class CommandResult{
    constructor(output, isHTML, isError){
        this.output = output || "";
        this.isHTML = isHTML || false;
        this.isError = isError || false;
    }
}

var _commands = {};
class Command{
    constructor(help,func){
        this.help = help;
        this.func = func;
    }
}

_commands.echo = new Command("Echos back the command recieved", function(args){
    if(args.length >= 2){
        return new CommandResult(args[1]);
    }
    return new CommandResult("There must be at least one argument");
})

_commands.add = new Command("Adds arguments", function(args){
    if(args.length >= 3){
        var sum = 0;
        args.forEach(function(num, i){
            if(i > 0){
                sum += parseFloat(num);
            }
        });

        return new CommandResult("Result is : " + sum);
    }

    return new CommandResult("Error there must be at least two variables to add!",false,true);
});

_commands.help = new Command("Lists available commands", function(args){
    var s = "<table class='webcli-table'>";
    Object.keys(_commands).forEach(function(key){
        var command = _commands[key];

        s+= "<tr><td class='webcli-label'>" + key + "</td> <td>:</td> <td class='webcli-value'>"
        + escape(command.help) + "</td></tr>"
    })
    s+= "</table>";
    return new CommandResult(s, true);
});

_commands.status = new Command("Displays server status info", function(args){
    var freeMem = Math.floor(os.freemem() /1024 /1024);
    var totalMem = Math.floor(os.totalmem()/1024/1024);
    var memoryStatus = freeMem + "/" + totalMem + " MB Free";


    var uptime = os.uptime();
    var days = Math.floor(uptime / 86400);
    var hours = Math.floor(uptime % 86400 / 3600);
    var minutes = Math.floor(uptime % 86400 % 3600 / 60);

    var uptimeStatus = days + "d " + hours + "h " + minutes + "m";

    var status = memoryStatus + " :: " + uptimeStatus + " up time.";

    return new CommandResult(status);
});