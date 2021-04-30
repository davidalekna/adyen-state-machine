import './styles.css';

export const Spinner = () => {
  return (
    <div className="spinner">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
};

export const WindowSpinner = () => {
  return (
    <div className="spinner-wrapper">
      <Spinner />
    </div>
  );
};
