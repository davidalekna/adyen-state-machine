import { AdyenCheckoutContext } from './machine';
import { NEW_CARD_ID, SUBSCRIPTION, CLICK_AND_COLLECT, CARD_TYPES } from './constants';

export const findPrimaryPaymentSource = (paymentSources: any[]) => {
  const sources = Array.isArray(paymentSources) ? paymentSources : [];
  const card = sources.find(({ isPrimaryPaymentSource }) => isPrimaryPaymentSource);
  if (!card) return;
  const [, cardId] = card.referenceId.split('/');
  return cardId;
};

export const sortPaymentCards = (
  cards: any[] = [],
  paymentSources: any[] = [],
): Partial<AdyenCheckoutContext> => {
  const currentlyUsedCardId = findPrimaryPaymentSource(paymentSources);

  if (cards.length < 2) return { storedCards: cards, selectedCardId: NEW_CARD_ID };
  if (!currentlyUsedCardId) return { storedCards: cards, selectedCardId: NEW_CARD_ID };

  const allOtherCards = cards.filter((card) => card.id !== currentlyUsedCardId);
  const currentSubscriptionCard = cards.find((card) => card.id === currentlyUsedCardId);

  return {
    selectedCardId: currentlyUsedCardId ?? NEW_CARD_ID,
    storedCards: currentSubscriptionCard ? [currentSubscriptionCard, ...allOtherCards] : cards,
  };
};

export const getCardType = (paymentSources: any[], cardId: string): CARD_TYPES => {
  return paymentSources.find((ps) => ps.referenceId.includes(cardId)) ? SUBSCRIPTION : CLICK_AND_COLLECT;
};
