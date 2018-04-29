import { setActiveClient } from '@app/actions';
import Client from '@app/client';
import { selectClient } from '@app/reducers';
import ClientUpdate from '@components/ClientUpdate';
import * as React from 'react';
import { ContextMenu, ContextMenuTrigger, MenuItem } from 'react-contextmenu';
import { connect } from 'react-redux';
import { History, RouteComponentProps, withRouter } from 'react-router-dom';
import store from '../../';
import FlagIcon from './Flag';

interface Props extends RouteComponentProps<any> {
  client: Client;
  history: History;
  currentClient: Client;
  setActiveClient: typeof setActiveClient;
}

interface State {
  unsubscribe: () => void;
}

class ClientRow extends React.Component<Props, State> {
  public render() {
    const { client } = this.props;

    const osIcon = require('@assets/os/' +
      (this.getOperatingSystemIcon() || 'os_linux') +
      '.png');
    const pingIcon = require('@assets/ping/' +
      (this.getPingIcon() || 'ping5') +
      '.png');

    return (
      <ClientUpdate client={client} onUpdate={() => this.forceUpdate()}>
        <ContextMenuTrigger id={client.id} renderTag="tr">
          <td>
            <FlagIcon client={client} />
            {client.country || 'Unknown'}
          </td>
          <td>{client.host}</td>
          <td>{client.identifier}</td>
          <td>
            <img src={osIcon} />
            {client.os.display}
          </td>
          <td>
            <img src={pingIcon} />
            {client.ping + ' ms'}
          </td>

          <ContextMenu id={client.id}>
            <MenuItem onClick={() => this.redirect('/view/screen', client)}>
              View Screen
            </MenuItem>
            <MenuItem onClick={() => this.redirect('/view/fs', client)}>
              File System
            </MenuItem>
            <MenuItem onClick={() => this.redirect('/view/process', client)}>
              Processes
            </MenuItem>
          </ContextMenu>
        </ContextMenuTrigger>
      </ClientUpdate>
    );
  }

  redirect(path: string, user: Client) {
    this.props.setActiveClient(user);
    this.props.history.push(path);
  }

  private getOperatingSystemIcon(): string {
    const { client } = this.props;
    const os = client.os ? client.os.display : null;

    if (os === null) {
      return;
    }

    const args = os.split(' ');

    // windows, macos, linux...
    const type = args[0].toLowerCase();

    // (Windows) 10, (macOS) 10.12
    const version = args.length >= 2 ? args[args.length - 1] : null;

    let icon: string;

    switch (type) {
      case 'windows':
      case 'linux':
        icon = 'os_' + type;
        break;
      case 'mac': // Mac OS X
      case 'macos':
        icon = 'os_mac';
        break;
      case 'debian':
      case 'ubuntu':
      case 'opensuse':
      case 'mint':
      case 'gentoo':
      case 'fedora':
      case 'centos':
      case 'arch':
      case 'kali':
        icon = 'dist_' + type;
        break;
      default:
        icon = 'unknown';
        break;
    }

    return icon;
  }

  private getPingIcon() {
    const { client } = this.props;
    const ms = client.ping;
    let n;

    if (ms < 100) {
      n = 0;
    } else if (ms < 150) {
      n = 1;
    } else if (ms < 250) {
      n = 2;
    } else if (ms < 350) {
      n = 3;
    } else if (ms < 500) {
      n = 4;
    } else {
      n = 5;
    }

    return 'ping' + n;
  }
}

export default withRouter(
  connect(
    state => ({
      currentClient: selectClient(state),
    }),
    {
      setActiveClient,
    }
  )(ClientRow)
);
