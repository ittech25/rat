import Client from '~/client/client';
import { ScreenPacket } from '~/client/packets';

import { ScreenTemplate } from '../../../../shared/src/templates';

export default (data: ScreenTemplate, _, client: Client) =>
  client.send(new ScreenPacket(data));
