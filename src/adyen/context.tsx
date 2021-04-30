import React, { createContext, createRef, useContext, useRef } from 'react';
import { CoreOptions } from '@adyen/adyen-web/dist/types/core/types';
import { assign } from 'xstate';
import { useMachine, useService } from '@xstate/react';
import { checkoutMachine, CheckoutMachineService } from './machine';
import { sortPaymentCards, getCardType } from './utils';
import { NEW_CARD_ID } from './constants';

const useCheckoutRefs = () => {
  // NOTE: does it need to be here or can we createRef on card creation?
  const adyenNewCardContainer = useRef<string | HTMLElement>('');

  return {
    adyenNewCardContainer,
  };
};

type AdyenCheckoutContextProps = {
  service: CheckoutMachineService;
};
const AdyenCheckoutContext = createContext<AdyenCheckoutContextProps>({
  service: {} as any,
});

type AdyenCheckoutProviderProps = {
  getAdyenNewCardConfig: () => Promise<CoreOptions>;
  getAdyenStoredCardConfig: () => Promise<CoreOptions>;
  getPaymentSources: () => Promise<CoreOptions>;
};
export const AdyenCheckoutProvider: React.FC<AdyenCheckoutProviderProps> = ({
  children,
  getAdyenNewCardConfig,
  getAdyenStoredCardConfig,
  getPaymentSources,
}) => {
  const refs = useCheckoutRefs();
  const [, send, service] = useMachine(checkoutMachine, {
    devTools: true,
    guards: {
      isAuthenticated: () => {
        return true;
      },
    },
    services: {
      getAllAsyncConfigs: async () => {
        const [newCardConfig, storedCardConfig, paymentSources] = await Promise.all([
          getAdyenNewCardConfig(),
          getAdyenStoredCardConfig(),
          getPaymentSources(),
        ]);
        return { newCardConfig, storedCardConfig, paymentSources };
      },
    },
    actions: {
      createNewCard: assign((context) => ({
        selectedCardId: NEW_CARD_ID,
        storedCards: [
          {
            id: NEW_CARD_ID,
            name: 'Add New Card',
            cardRef: refs.adyenNewCardContainer,
          } as any,
        ],
      })),
      extractStoredCards: assign(({ storedCards, storedCardInstance, paymentSources }) => {
        const extractedCards = storedCardInstance.options.paymentMethodsResponse?.storedPaymentMethods ?? [];

        const modifiedCards = extractedCards
          .filter((card) => Object.keys(card).length > 0)
          .map((card: any) => ({
            ...card,
            cardRef: createRef(),
            cardType: getCardType(paymentSources, card.id),
          }));

        return { storedCards: [...modifiedCards, storedCards[0]] };
      }),
      sortStoredCards: assign(({ storedCards, paymentSources }) => {
        return sortPaymentCards(storedCards, paymentSources);
      }),
      mountNewCardForm: assign(({ storedCards, newCardInstance }) => {
        // NOTE: payment-container dom has to be ready to mount
        const controller = newCardInstance
          .create('card', {
            onLoad: () => {
              send({ type: 'MOUNTING_COMPLETE' });
            },
          })
          .mount(refs.adyenNewCardContainer.current);
        // NOTE: newCardInstance.create('card') returns submit and other fns to be user later...
        const updatedStoredCards = storedCards.map((card) => {
          if (card.id !== NEW_CARD_ID) return card;
          return { ...card, controller };
        });

        return {
          storedCards: updatedStoredCards,
        };
      }),
      mountStoredCards: assign(({ storedCards, storedCardInstance }) => {
        // NOTE: saved cards dom has to be ready to mount
        const updatedStoredCards = storedCards.map((card) => {
          if (card.id === NEW_CARD_ID) return card;
          // NOTE: newCardInstance.create('card') returns submit and other fns to be user later...
          const controller = storedCardInstance.create('card').mount(card.cardRef.current);
          // attach card controller with submit and other fns
          return { ...card, controller };
        });

        return { storedCards: updatedStoredCards };
      }),
      submitPayment: ({ storedCards, selectedCardId }) => {
        const card = storedCards.find((card) => card.id === selectedCardId);
        if (!card) {
          throw new Error(`There has been a problem selecting your card ${selectedCardId}`);
        }
        console.log({ card });
        card.controller.submit();
      },
    },
  });

  return <AdyenCheckoutContext.Provider value={{ service }}>{children}</AdyenCheckoutContext.Provider>;
};

export const useAdyenCheckout = () => {
  const utils = useContext(AdyenCheckoutContext);
  return utils;
};

export const useAdyenService = () => {
  const { service } = useAdyenCheckout();
  return useService(service);
};
