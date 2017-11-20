import { BSON } from "bson";

class ControlSocket {

    private readonly bson = new BSON();
    private socket: WebSocket;

    constructor(private readonly url: string) {

    }

    public connect() {
        this.socket = new WebSocket(this.url);
        this.socket.onmessage = (e: MessageEvent) => this.handleMessage(e);
        this.socket.onclose = (e: CloseEvent) => this.onClose(e);
        this.socket.onopen = () => this.onOpen();
    }

    public send(data: any) {
        this.socket.send(this.bson.serialize(data));
    }

    private onOpen() {
        console.log("control socket opened");
    }

    private handleMessage(e: MessageEvent) {
        const bson = this.bson.deserialize(e.data);
        console.log("handleMessage", bson);
    }

    private onClose(e: CloseEvent) {
        setTimeout(() => this.connect(), 1000);
    }
}

export default new ControlSocket("ws://localhost:3000");
