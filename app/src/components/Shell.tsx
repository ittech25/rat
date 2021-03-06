import { MessageType } from 'app/messages/types';
import * as React from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import Client from '../client';
import {
  ShellAction,
  ShellMessage,
  ShellMessageTemplate,
} from '../messages/shell';
import withClient from '../withClient';
import { Subscriber } from './Subscription';

interface Props {
  client: Client;
}

class Shell extends React.Component<Props, any> {
  t: Terminal;
  ref = React.createRef<HTMLDivElement>();

  componentDidMount() {
    const t = new Terminal();
    const fitAddon = new FitAddon();
    t.loadAddon(fitAddon);
    t.open(this.ref.current);
    fitAddon.fit();

    // @ts-ignore TODO
    t.on('data', this.onTerminalInput);

    this.t = t;

    this.props.client.send(
      new ShellMessage({
        action: ShellAction.Start,
      })
    );
  }

  componentWillUnmount() {
    this.props.client.send(
      new ShellMessage({
        action: ShellAction.Stop,
      })
    );
  }

  onTerminalInput = (data: string) => {
    this.props.client.send(
      new ShellMessage({
        action: ShellAction.Write,

        // seems like xterm gives us a carriage return instead of newline
        data: data.replace(/\r/g, '\n'),
      })
    );
  };

  onReceive = (message: ShellMessageTemplate) => {
    switch (message.action) {
      case ShellAction.Write:
        // xterm wants both cr and lf
        this.t.write(message.data.replace(/\n/g, '\n\r'));
        break;
      default:
        throw new Error(`Shell action ${message.action} not implemented`);
    }
  };

  render() {
    return (
      <Subscriber type={MessageType.Shell} handler={this.onReceive}>
        <div ref={this.ref as any} />
      </Subscriber>
    );
  }
}

export default withClient(Shell);
