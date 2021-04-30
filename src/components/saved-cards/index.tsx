import { useAdyenService } from '../../adyen';
import { StoredPaymentMethodModified } from '../../adyen/machine';
import { CustomAddressForm } from '../custom-address-form';

type CardToolbarProps = {
  isSelected: boolean;
  onClick: () => void;
  lastFour?: string;
  expiry: string;
};
const CardToolbar: React.FC<CardToolbarProps> = ({ isSelected, onClick, lastFour, expiry }) => {
  return (
    <div className="checkout_card-toolbar">
      <button data-active={isSelected} onClick={onClick}></button>
      <div className="checkout_card-icon"></div>
      <div className="checkout_card-title">{`Ending in ${lastFour}`}</div>
      <div className="checkout_card-expiry">Expiry {expiry}</div>
    </div>
  );
};

export const SavedCardWithForm: React.FC<{ card: StoredPaymentMethodModified }> = ({ card }) => {
  const [state, send] = useAdyenService();
  const isSelected = card.id === state.context.selectedCardId;

  return (
    <div className="checkout_card">
      <CardToolbar
        isSelected={isSelected}
        onClick={() => send({ type: 'SELECT_CARD', id: card.id })}
        lastFour={card.lastFour}
        expiry={`${card.expiryMonth}/${card.expiryYear?.slice(2)}`}
      />
      {/* NOTE: dom has to be mounted for the refs to be able to apply */}
      {isSelected && (
        <div className="checkout_card-body">
          <div className="checkout_card-body-title">Cardholder: {card.holderName}</div>
          <CustomAddressForm />
          <div>
            <button onClick={() => alert(`delete card ${card.id}`)} className="checkout_card-body-button">
              Delete card
            </button>
          </div>
        </div>
      )}
      <div className="checkout_card-component">
        <div className="checkout_card-stored" ref={card.cardRef} />
      </div>
    </div>
  );
};
export const SavedCard: React.FC<{ card: StoredPaymentMethodModified }> = ({ card }) => {
  const [state, send] = useAdyenService();
  const isSelected = card.id === state.context.selectedCardId;

  return (
    <div className="checkout_card">
      <CardToolbar
        isSelected={isSelected}
        onClick={() => send({ type: 'SELECT_CARD', id: card.id })}
        lastFour={card.lastFour}
        expiry={`${card.expiryMonth}/${card.expiryYear?.slice(2)}`}
      />
      {/* NOTE: dom has to be mounted for the refs to be able to apply */}
      {isSelected && (
        <div className="checkout_card-body">
          <div className="checkout_card-body-title">Cardholder: {card.holderName}</div>
          <div>
            <button onClick={() => alert(`delete card ${card.id}`)} className="checkout_card-body-button">
              Delete card
            </button>
          </div>
        </div>
      )}
      <div className="checkout_card-component">
        <div className="checkout_card-stored" ref={card.cardRef} />
      </div>
    </div>
  );
};

export const NewCard: React.FC<{ card: StoredPaymentMethodModified }> = ({ card }) => {
  const [state, send] = useAdyenService();
  const isSelected = card.id === state.context.selectedCardId;

  return (
    <div className="checkout_card">
      <div className="checkout_card-toolbar">
        <button
          data-active={card.id === state.context.selectedCardId}
          onClick={() => send({ type: 'SELECT_CARD', id: card.id })}
        ></button>
        <div>{card.name}</div>
      </div>
      <div className={isSelected ? '' : 'checkout_card-component'}>
        <div className="checkout_card-stored" ref={card.cardRef} />
      </div>
      {isSelected && (
        <div className="checkout_card-body">
          <CustomAddressForm />
        </div>
      )}
    </div>
  );
};
