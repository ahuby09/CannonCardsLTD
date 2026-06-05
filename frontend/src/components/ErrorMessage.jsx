export default function ErrorMessage({ error }) {
  if (!error) return null;

  const details = Array.isArray(error.details)
    ? error.details
        .slice(0, 3)
        .map((detail) => detail.text || detail.message || detail.code)
        .filter(Boolean)
    : [];

  return (
    <div className="alert error">
      {error.message || String(error)}
      {details.length > 0 && (
        <ul>
          {details.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
