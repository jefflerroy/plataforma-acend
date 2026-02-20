import './input.css';

export function Input({ label, icon, ...props }) {
  return (
    <div className="input">
      <label>{label}:</label>
      <input
        {...props}
      />
      {icon}
    </div>
  );
}
