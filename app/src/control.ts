import { BSON } from "bson";
import Message from "shared/message";
import { MessageType } from "../../shared/src/types";

import * as EventHandler from "./events";

import { setInterval } from "timers";

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

    public send(data: Message) {
        this.socket.send(this.bson.serialize(data));
    }

    private onOpen() {
        console.log("[ws] connected");
        EventHandler.subscribe(MessageType.Bounce, this.onBounce);

        setInterval(() => {
            this.send({
                _type: MessageType.Bounce,
                data: "ping"
            });
        }, 1000);

        setTimeout(() => {
            EventHandler.unsubscribe(MessageType.Bounce, this.onBounce);
        }, 3000);
    }

    private onBounce(data: any) {
        console.log("bounce", data);
    }

    private handleMessage(e: MessageEvent) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const bson = this.bson.deserialize(Buffer.from(reader.result));
            EventHandler.emit(bson);
        };

        reader.readAsArrayBuffer(e.data);
    }

    private onClose(e: CloseEvent) {
        setTimeout(() => this.connect(), 1000);
    }
}

export default new ControlSocket("ws://localhost:3000");
