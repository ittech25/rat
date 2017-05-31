/// <reference path="view.ts" />

class BuildView extends SubView {

	private iconPreviewElement: HTMLImageElement;
	private iconElement: HTMLInputElement;
	private iconData: ArrayBuffer;

	constructor() {
		super("static/build.html", "Build");
	}

	onEnter() {
		let button = <HTMLButtonElement>document.getElementById("submit");
		button.onclick = () => this.build();

		let osElement = <HTMLSelectElement>document.getElementById("os");
		osElement.onchange = (event) => {
			let manifestDiv = <HTMLDivElement>document.getElementById("manifest");
			let os = (<HTMLOptionElement>osElement.options[osElement.selectedIndex]).value;

			manifestDiv.hidden = !(os === "all" || os === "windows");

			let x86 = <HTMLOptionElement>document.getElementById("386");
			x86.disabled = os === "macos";
		};

		this.iconPreviewElement = <HTMLImageElement>document.getElementById("icon_preview");

		this.iconElement = <HTMLInputElement>document.getElementById("icon");
		this.iconElement.onchange = () => this.updateIcon();

		Control.addEvent(Control.EventType.DOWNLOAD, new DownloadEvent());
	}

	onLeave() {
		Control.removeEvent(Control.EventType.DOWNLOAD);
	}

	private get name() {
		let element = <HTMLInputElement>document.getElementById("name");
		return element.value === "" ? element.placeholder : element.value;
	}

	private get host() {
		let element = <HTMLInputElement>document.getElementById("host");
		return element.value === "" ? element.placeholder : element.value;
	}

	private get os() {
		let element = <HTMLSelectElement>document.getElementById("os");
		let option = <HTMLOptionElement>element.options[element.selectedIndex];
		return option.value;
	}

	private get arch() {
		let element = <HTMLSelectElement>document.getElementById("arch");
		let option = <HTMLOptionElement>element.options[element.selectedIndex];
		return option.value;
	}

	private get delay(): number {
		let element = <HTMLInputElement>document.getElementById("delay");
		return Number(element.value);
	}

	private get invalidCerts(): boolean {
		let element = <HTMLInputElement>document.getElementById("invalidssl");
		return element.checked;
	}

	private get installPath(): number {
		let elements = document.getElementsByName("path");

		for (let i = 0; i < elements.length; i++) {
			let element = <HTMLInputElement>elements[i];

			if (element.checked) {
				return Number(element.value);
			}
		}

		return 0;
	}

	private updateIcon() {
		this.iconPreviewElement.src = URL.createObjectURL(this.iconElement.files[0]);

		let file = this.iconElement.files[0];
		let reader = new FileReader();

		reader.onload = (e: any) => {
			this.iconData = e.target.result;
		};

		reader.readAsArrayBuffer(file);
	}

	private get icon() {
		if (this.iconData) {
			return btoa(String.fromCharCode.apply(null, new Uint8Array(this.iconData)));
		}

		return null;
	}

	private get version(): string {
		let element = <HTMLInputElement>document.getElementById("version");
		return element.value === "" ? element.placeholder : element.value;
	}

	private build() {
		let os = this.os;

		let data = {
			"host": this.host,
			"os": os,
			"arch": this.arch,
			"delay": this.delay,
			"name": this.name,
			"install_path": this.installPath,
			"invalid_ssl": this.invalidCerts
		};

		if (os === "all" || os === "windows") {
			data["manifest"] = {
				"version": this.version,
				"icon": this.icon
			};
		}

		console.log(JSON.stringify(data));

		Control.instance.write(Control.EventType.BUILD, JSON.stringify(data));
	}
}