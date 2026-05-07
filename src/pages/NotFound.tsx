import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-page">
      <div className="not-found-emoji">🍽️</div>
      <h1 className="not-found-title">Page Not Found</h1>
      <p className="not-found-text">
        Looks like this page went missing — just like the last piece of jollof rice.
        Let's get you back to something delicious.
      </p>
      <button className="not-found-btn" onClick={() => navigate('/')}>
        Back to Home
      </button>
    </div>
  );
};

export default NotFound;
