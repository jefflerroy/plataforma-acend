import './textarea.css';

export function TextArea({ label, icon, ...props }) {
  return (
    <div className="textarea">
      <label>{label}:</label>
      <textarea
        {...props}
      />
      {icon}
    </div>
  );
}
