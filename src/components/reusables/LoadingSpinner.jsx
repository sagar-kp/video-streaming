const LoadingSpinner = () => {
  return (
    <div className="d-flex justify-content-center align-items-center loading-spinner">
      <div className="spinner-border text-primary">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
};

export default LoadingSpinner;
