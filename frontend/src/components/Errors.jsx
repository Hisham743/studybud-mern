import { useSelector } from 'react-redux';

export default function Errors() {
  const errors = useSelector((state) => state.errors.value);

  return (
    <ul className="messages">
      {errors && errors.map((error, index) => <li key={index}>{error}</li>)}
    </ul>
  );
}
