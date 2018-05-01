import { setCurrentDirectory } from '@app/actions';
import Client from '@app/client';
import {
  selectClient,
  selectCurrentDirectory,
  selectFilesList,
} from '@app/reducers';
import withClient from '@app/withClient';
import { FileEntry } from '@templates';
import * as path from 'path';
import * as React from 'react';
import { Breadcrumb, Nav, Navbar, NavItem, Table } from 'react-bootstrap';
import styled from 'react-emotion';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import BrowseMessage from 'shared/messages/browse';
import { OperatingSystem } from 'shared/system';
import { MessageType } from 'shared/types';
import { DirectorySubscription } from '../Subscription';
import Row from './Row';

interface Props {
  client: Client;
  filesList: FileEntry[];
  currentDirectory: string;
  setCurrentDirectory: typeof setCurrentDirectory;
}

interface State {
  utils: any;
}

const BreadcrumbItem = Breadcrumb.Item as any;

const BreadcrumbContainer = styled('div')`
  padding: 12px;
`;

class FileSystem extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      utils:
        props.client.os.type === OperatingSystem.WINDOWS
          ? path.win32
          : path.posix,
    };
  }

  componentDidMount() {
    this.browse();
  }

  splitPath = () => {
    const { client, currentDirectory } = this.props;

    return currentDirectory.split(client.separator).filter(x => x.length > 0);
  };

  render() {
    const { filesList, client } = this.props;

    const paths = this.splitPath();

    return (
      <DirectorySubscription>
        <BreadcrumbContainer>
          <Breadcrumb>
            {client.os.type !== OperatingSystem.WINDOWS && (
              <BreadcrumbItem active={false} onClick={() => this.browse()}>
                root
              </BreadcrumbItem>
            )}

            {paths.map((part, index) => {
              return (
                <BreadcrumbItem
                  key={part}
                  active={index === paths.length - 1}
                  onClick={() =>
                    this.browse(
                      paths.slice(0, index + 1).join(client.separator)
                    )
                  }
                >
                  {part}
                </BreadcrumbItem>
              );
            })}
          </Breadcrumb>
        </BreadcrumbContainer>

        <Table bordered>
          <thead>
            <tr>
              <th>Name</th>
              <th>Size</th>
              <th>Last modified</th>
            </tr>
          </thead>
          <tbody>
            {filesList.map(file => (
              <Row
                key={file.path + file.name}
                file={file}
                onClick={() => this.browse(file)}
              />
            ))}
          </tbody>
        </Table>
      </DirectorySubscription>
    );
  }

  browse = (file?: FileEntry | string) => {
    const { client, setCurrentDirectory } = this.props;
    const { utils } = this.state;

    let path = '';

    if (typeof file === 'string') {
      path = file;
    } else if (file && file.directory) {
      path = file ? file.path + client.separator + file.name : '';
    }

    if (client.os.type !== OperatingSystem.WINDOWS && path[0] !== '/') {
      path = '/' + path;
    }

    setCurrentDirectory(path);

    this.props.client.send(
      new BrowseMessage({
        id: this.props.client.id,
        path,
      })
    );
  };
}

export default compose(
  connect(
    state => ({
      filesList: selectFilesList(state),
      currentDirectory: selectCurrentDirectory(state),
    }),
    {
      setCurrentDirectory,
    }
  ),
  withClient
)(FileSystem);
