import AdyenCheckout from '@adyen/adyen-web';
import { StoredPaymentMethod } from '@adyen/adyen-web/dist/types/types';
import { RefObject } from 'react';
import { Machine, assign, Interpreter } from 'xstate';
import { CARD_TYPES } from './constants';

const noop = () => {};

export type CheckoutMachineService = Interpreter<
  AdyenCheckoutContext,
  AdyenCheckoutSchema,
  AdyenCheckoutEvents,
  {
    value: any;
    context: AdyenCheckoutContext;
  }
>;

interface AdyenCheckoutSchema {
  states: {
    boot: {};
    failure: {};
    success: {
      states: {
        verifyUserType: {};
        user: {
          states: {
            prepare: {};
            adyenReady: {};
          };
        };
        guest: {
          states: {
            prepare: {};
            adyenReady: {};
          };
        };
      };
    };
  };
}

type AdyenCheckoutEvents =
  | { type: 'MOUNT_NEW_CARD_FORM' }
  | { type: 'MOUNT_STORED_CARDS' }
  | { type: 'SUBMIT_PAYMENT' }
  | { type: 'SELECT_CARD'; id?: string }
  | { type: 'MOUNTING_COMPLETE' };

export interface StoredPaymentMethodModified extends StoredPaymentMethod {
  id?: string;
  lastFour?: string;
  expiryMonth?: string;
  expiryYear?: string;
  holderName?: string;
  cardRef: RefObject<any>;
  controller?: any;
  cardType?: CARD_TYPES;
}

export interface AdyenCheckoutContext {
  newCardInstance: AdyenCheckout;
  storedCardInstance: AdyenCheckout;
  paymentSources: any;
  //
  selectedCardId?: string;
  coffeeSubscription: boolean;
  storedCards: StoredPaymentMethodModified[];
}

export const checkoutMachine = Machine<AdyenCheckoutContext, AdyenCheckoutSchema, AdyenCheckoutEvents>(
  {
    id: 'adyenCheckout',
    context: {
      newCardInstance: null as any,
      storedCardInstance: null as any,
      paymentSources: [],
      //
      selectedCardId: undefined,
      coffeeSubscription: true,
      storedCards: [],
    },
    initial: 'boot',
    states: {
      boot: {
        invoke: {
          src: 'getAllAsyncConfigs',
          onDone: {
            target: 'success',
            actions: assign({
              newCardInstance: (ctx, event) => new AdyenCheckout(event.data.newCardConfig),
              storedCardInstance: (ctx, event) => new AdyenCheckout(event.data.storedCardConfig),
              paymentSources: (ctx, event) => event.data.paymentSources,
            }),
          },
          onError: 'failure',
        },
      },
      failure: {
        type: 'final',
      },
      success: {
        entry: ['createNewCard'],
        initial: 'verifyUserType',
        states: {
          verifyUserType: {
            always: [{ target: 'user', cond: 'isAuthenticated' }, { target: 'guest' }],
          },
          user: {
            entry: ['extractStoredCards', 'sortStoredCards'],
            initial: 'prepare',
            states: {
              prepare: {
                on: {
                  MOUNT_NEW_CARD_FORM: {
                    actions: 'mountNewCardForm',
                  },
                  MOUNT_STORED_CARDS: {
                    actions: 'mountStoredCards',
                  },
                  MOUNTING_COMPLETE: {
                    target: 'adyenReady',
                  },
                  SELECT_CARD: {
                    actions: 'selectCardById',
                  },
                },
              },
              adyenReady: {
                on: {
                  SUBMIT_PAYMENT: {
                    actions: 'submitPayment',
                  },
                  SELECT_CARD: {
                    actions: 'selectCardById',
                  },
                },
              },
            },
          },
          guest: {
            initial: 'prepare',
            states: {
              prepare: {
                on: {
                  MOUNT_NEW_CARD_FORM: {
                    actions: 'mountNewCardForm',
                  },
                  MOUNTING_COMPLETE: {
                    target: 'adyenReady',
                  },
                },
              },
              adyenReady: {
                on: {
                  SUBMIT_PAYMENT: {
                    actions: 'submitPayment',
                  },
                  SELECT_CARD: {
                    actions: 'selectCardById',
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  {
    actions: {
      createNewCard: noop,
      extractStoredCards: noop,
      sortStoredCards: noop,
      mountNewCardForm: noop,
      mountStoredCards: noop,
      submitPayment: noop,
      selectCardById: assign({ selectedCardId: (ctx, event: any) => event.id }),
    },
    services: {
      getAllAsyncConfigs: Promise.resolve,
    },
    guards: {
      isAuthenticated: () => false,
    },
  },
);
