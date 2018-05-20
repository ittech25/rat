import { createAction } from 'redux-actions';
import { MessageType } from 'shared/types';
import { Action } from '../constants';
import { MessageHandler } from '../messages';

export const subscribe = createAction<any, MessageType, MessageHandler>(
  Action.SUBSCRIBE,
  (type, handler) => ({
    type,
    handler,
  })
);

export const unsubscribe = createAction<MessageType>(Action.UNSUBSCRIBE);
