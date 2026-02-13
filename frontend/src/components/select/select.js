import './select.css';

export function Select({ label, value, onChange, options = [] }) {
  return (
    <div className="select-container">
      {label && <label>{label}</label>}

      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((item, index) => (
          <option key={index} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  );
}
