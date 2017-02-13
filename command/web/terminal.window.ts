enum Shell {
	START = 0,
	STOP = 1,
	WRITE = 2
}

function openTerminal(id: number) {
	window.open("terminal?id=" + id, "_blank", "width=600,height=400");
}

function initTerminalView(id: number) {
	let view = new TerminalView(id);
	window.onbeforeunload = () => view.onLeave();

	Control.instance.onOpen(() => view.onEnter());
}

class TerminalView {

	constructor(private id: number) {

	}

	onEnter() {
		let commandElement = <HTMLInputElement>document.getElementById("command");
		commandElement.onkeypress = (event) => {
			if (event.keyCode === 13) { // enter
				this.write(Shell.WRITE, commandElement.value);
				commandElement.value = "";
			}
		};

		Control.addEvent(Control.EventType.TERMINAL, new TerminalEvent(this));

		this.write(Shell.START);
	}

	onLeave() {
		Control.removeEvent(Control.EventType.TERMINAL);

		this.write(Shell.STOP);
	}

	private get terminal() {
		return <HTMLTextAreaElement>document.getElementById("terminal");
	}

	// Append a raw line to the terminal element
	public append(line: string) {
		this.terminal.innerHTML += ansi_up.ansi_to_html(line) + "<br>";
	}

	private write(action: number, line: string = "") {
		let data = JSON.stringify({
			"action": action,
			"command": line
		});

		Control.instance.write(Control.EventType.TERMINAL, data, this.id);
	}
}