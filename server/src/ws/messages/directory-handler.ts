import Client from '~/client/client';
import { BrowsePacket } from '~/client/packets';

import { BrowseTemplate } from '../../../../shared/src/templates';

export default (data: BrowseTemplate, _, client: Client) =>
  client.send(new BrowsePacket(data));
