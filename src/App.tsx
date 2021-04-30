import { useEffect } from 'react';
import { AdyenCheckoutProvider, useAdyenService } from './adyen';
import { getAdyenNewCardConfig, getAdyenStoredCardConfig } from './adyen/configs';
import { getPaymentSources } from './adyen/rest-api';
import { CLICK_AND_COLLECT, SUBSCRIPTION } from './adyen/constants';
import { SavedCardWithForm, SavedCard, NewCard } from './components/saved-cards';
import { WindowSpinner } from './components/spinner';

const AdyenCheckoutComponent = () => {
  const [state, send] = useAdyenService();

  useEffect(() => {
    // mount cards after first render when the dom is ready
    send('MOUNT_STORED_CARDS');
    send('MOUNT_NEW_CARD_FORM');
  }, [send]);

  return (
    <div className="App">
      {state.matches('success.guest.prepare') && <WindowSpinner />}
      <div className="checkout" data-loading={state.matches('success.guest.prepare')}>
        <div className="checkout_cards">
          {state.context.storedCards.map((card) => {
            switch (card.cardType) {
              case CLICK_AND_COLLECT: {
                if (state.context.coffeeSubscription) {
                  // NOTE: if user with a coffee subscription and card was created on click and collect
                  return <SavedCardWithForm key={card.id} card={card} />;
                }
                return <SavedCard key={card.id} card={card} />;
              }
              case SUBSCRIPTION:
                return <SavedCard key={card.id} card={card} />;
              default:
                // NOTE: renders new card
                return <NewCard key={card.id} card={card} />;
            }
          })}
        </div>
        <div className="checkout_footer">
          <button onClick={() => send('SUBMIT_PAYMENT')}>Submit payment</button>
        </div>
      </div>
    </div>
  );
};

const TransitionComponent = () => {
  const [state] = useAdyenService();

  return (
    <>
      {state.matches('boot') && <div>Initializing Adyen Checkout...</div>}
      {state.matches('success') && <AdyenCheckoutComponent />}
      {state.matches('failure') && <div>Failed loading adyen config</div>}
    </>
  );
};

export default function App() {
  return (
    <AdyenCheckoutProvider
      getAdyenNewCardConfig={getAdyenNewCardConfig}
      getAdyenStoredCardConfig={getAdyenStoredCardConfig}
      getPaymentSources={getPaymentSources}
    >
      <TransitionComponent />
    </AdyenCheckoutProvider>
  );
}
