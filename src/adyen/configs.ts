import { CoreOptions } from '@adyen/adyen-web/dist/types/core/types';
import { getPaymentMethods, getClientConfig } from './rest-api';

const generateAdyenCheckoutConfig = async ({
  paymentMethodsConfiguration = {},
  ...rest
}: Partial<CoreOptions>): Promise<CoreOptions> => {
  const [config, paymentMethodsResponse] = await Promise.all([getClientConfig(), getPaymentMethods()]);

  return {
    removePaymentMethods: [
      'paysafecard',
      'c_cash',
      'ideal',
      'klarna',
      'swish',
      'multibanco',
      'giropay',
      'eps',
      'entercash',
      'directEbanking',
      'bcmc',
    ],
    paymentMethodsResponse, // The `/paymentMethods` response from the server.
    clientKey: config.clientKey, // Web Drop-in versions before 3.10.1 use originKey instead of clientKey.
    locale: 'en-GB',
    environment: 'test',
    showPayButton: false,
    paymentMethodsConfiguration,
    amount: {
      currency: 'GBP',
      value: 2000,
    },
    ...rest,
  };
};

export const getAdyenNewCardConfig = async () => {
  return await generateAdyenCheckoutConfig({
    onSubmit: (state: any, dropin: any) => {
      console.log('submit from new card');
    },
    onError: (error: any) => {
      console.log(error);
    },
    onAdditionalDetails: (state: any, dropin: any) => {},
    paymentMethodsConfiguration: {
      card: {
        hasHolderName: true,
        holderNameRequired: true,
        name: 'Card',
        enableStoreDetails: false,
        billingAddressRequired: false,
        hideCVC: false,
        brands: ['visa', 'mc', 'amex'],
        showBrandIcon: true,
        data: {
          billingAddress: {
            country: 'UK',
            houseNumberOrName: '',
            street: '',
            postalCode: '',
            city: '',
          },
        },
      },
    },
  });
};

export const getAdyenStoredCardConfig = async () => {
  return await generateAdyenCheckoutConfig({
    onSubmit: (state: any, dropin: any) => {
      console.log('submit from stored card');
    },
    onError: (error: any) => {
      console.log(error);
    },
    onAdditionalDetails: (state: any, dropin: any) => {},
    paymentMethodsConfiguration: {
      card: {
        hasHolderName: true,
        holderNameRequired: true,
        name: 'Card',
        enableStoreDetails: false,
        billingAddressRequired: false,
        hideCVC: true,
        brands: ['visa', 'mc', 'amex'],
        showBrandIcon: true,
        data: {
          billingAddress: {
            country: 'UK',
            houseNumberOrName: '',
            street: '',
            postalCode: '',
            city: '',
          },
        },
      },
    },
  });
};
