class WebCli{
    constructor(){
        var self = this;

        self.history = [];
        self.commandOffset = 0;

        self.createElements();
        self.wireEvents();
        self.showGreeting();
        self.busy(false);
    }

    wireEvents(){
        var self = this;
        document.addEventListener('keydown', self.onKeyDown.bind(self));
        self.controlElement.addEventListener('click', self.focus.bind(this));    
    }

    onKeyDown(e){
        var self = this, controlStyle = self.controlElement.style;
        
        if(e.ctrlKey && e.keyCode === 192){
            if(controlStyle.display == 'none'){
                controlStyle.display='';
                self.focus();
            }else{
                controlStyle.display='none';
            }
        }

        if(self.inputElement === document.activeElement && !self.isBusy){
            self.handleKeyEvents(e);
        }
        
    }

    handleKeyEvents(e){
        var self = this;
        switch(e.keyCode){
            case 13:
                self.runCommand();
                break;
            case 38:
                if((self.history.length + self.commandOffset) > 0){
                    self.commandOffset--;
                    self.inputElement.value = self.history[self.history.length + self.commandOffset];
                    e.preventDefault();
                }
                break;
            case 40:
                if(self.commandOffset < -1){
                    self.commandOffset++;
                    self.inputElement.value = self.history[self.history.length + self.commandOffset];
                    e.preventDefault();
                }
            break;

        }
    }

    runCommand(){
        var self = this, text = self.inputElement.value.trim();

        self.commandOffset = 0;
        self.inputElement.value="";
        if(text !== ''){
            self.writeLine(text,"cmd");
            self.history.push(text);
            var tokens = text.toLowerCase().split(' '), command = tokens[0];

            if(command === 'cls') { self.clear();return}
            self.runServerCommand(text);

           
        }
    }

    runServerCommand(text){
        var self = this;

        var body = JSON.stringify({command:text});
        self.busy(true);
        fetch('/api/webcli',{
            method:"post",
            headers: new Headers({'Content-Type': 'application/json'}),
            body: body
        })
        .then(function(response){
            return response.json();
        })
        .then(function(result){
            var output = result.output;
            var style = result.isError ? "error" :  "ok";

            if(result.isHTML){
                self.writeHTML(output);
            }else{
                self.writeLine(output,style)
            }
        })
        .catch(function(){
            self.writeLine("Error sending request to server", "error");
        })
        .then(function(){
            self.busy(false);
            self.focus();
        })
    }

    clear(){
        this.outputElement.innerHTML = "";
        this.showGreeting();
    }

    focus(){
        this.inputElement.focus();
    }

    scrollToBottom(){
        this.controlElement.scrollTop = this.controlElement.scrollHeight;
    }
    
    newLine(){
        this.outputElement.appendChild(document.createElement('br'));
        this.scrollToBottom();
    }

    writeLine(text, cssSuffix){
        cssSuffix = cssSuffix || 'ok';
        var span = document.createElement('span');
        span.className = 'webcli-' + cssSuffix;
        span.innerText = text;
        this.outputElement.appendChild(span);
        this.newLine();
    }

    writeHTML(markup){
        var div = document.createElement('div');
        div.innerHTML = markup;
        this.outputElement.appendChild(div);
        this.newLine();
    }

    showGreeting(){
        this.writeLine("Web CLI [Version 0.0.1]", 'cmd');

    }

    createElements(){
        var self = this, doc = document;

        self.controlElement = doc.createElement("div");
        self.outputElement = doc.createElement("div");
        self.inputElement = doc.createElement("input");
        self.busyElement = doc.createElement("div");

        self.controlElement.className = "webcli";
        self.outputElement.className = "webcli-output";
        self.inputElement.className = "webcli-input";
        self.busyElement.className = "webcli-busy";

        self.inputElement.setAttribute("spellcheck", false);

        self.controlElement.appendChild(self.outputElement);
        self.controlElement.appendChild(self.inputElement);
        self.controlElement.appendChild(self.busyElement);

        self.controlElement.style.display = "none";
        doc.body.appendChild(self.controlElement);
    }

    busy(busy){
        this.isBusy = busy;
        this.busyElement.style.display = busy ? "block" : "none"
        this.inputElement.style.display = busy ? "none" : "block"
    }

}