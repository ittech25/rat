/// <reference path="view.ts" />

class IndexView extends MainView {

	private interval: number;

	constructor() {
		super("clients", "Clients");
	}

	onEnter() {
		this.interval = update("#clients", "/clients #clients", 1000, this.onUpdate);
	}

	onLeave() {
		clearInterval(this.interval);
	}

	private onUpdate() {
		Icons.updatePing();
		Icons.updateOSIcons();
	}
}

function setProcessesView(id: number) {
	sub.setView(new ProcessView(id));
}

function setDirectoryView(id: number, separator: string) {
	sub.setView(new DirectoryView(id, separator));
}

function setScreenView(id: number) {
	sub.setView(new ScreenView(id));
}