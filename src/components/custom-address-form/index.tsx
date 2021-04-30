import React from 'react';
import { useForm } from 'react-hook-form';
import './styles.css';

const Input: React.FC<{ label: string }> = ({ label, children }) => {
  return (
    <label className="input-component">
      {label}
      {children}
    </label>
  );
};

type FormValues = {
  line_1: string;
  line_2: string;
  city: string;
  postcode: string;
  country: string;
};

export const CustomAddressForm = () => {
  const { register } = useForm<FormValues>();

  return (
    <div className="checkout_card-body-address_form">
      <Input label="Address line 1">
        <input {...register('line_1')} />
      </Input>
      <Input label="Address line 2">
        <input {...register('line_2')} />
      </Input>
      <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
        <Input label="City or town">
          <input {...register('city')} />
        </Input>
        &nbsp; &nbsp; &nbsp; &nbsp;
        <Input label="Postcode">
          <input {...register('postcode')} />
        </Input>
      </div>
      <Input label="Country">
        <input {...register('country')} />
      </Input>
    </div>
  );
};
