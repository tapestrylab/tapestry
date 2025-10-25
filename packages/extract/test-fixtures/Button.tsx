import { ButtonHTMLAttributes } from "react";

/**
 * A beautiful button component
 *
 * @param {string} title - The label that goes inside the button
 * @param {Function} onClick - Handler function called when button is clicked
 * @param {boolean} disabled - Whether the button is disabled
 * @returns {JSX.Element} The rendered button element
 * @example
 * <Button title="Submit" onClick={handleSubmit} />
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button}
 * @since 1.0.0
 */
export const Button = ({
  title = "Click me",
  onClick,
  disabled = false,
}: {
  title?: string;
  onClick: () => void;
  disabled?: boolean;
}) => {
  return (
    <button type="button" onClick={onClick} disabled={disabled}>
      {title}
    </button>
  );
};

type ButtonProps = {
  title?: string;
  onClick: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
} & ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * Legacy button component
 *
 * @deprecated Use Button instead for better type safety
 */
export const Button2 = ({
  title = "Click me",
  onClick,
  disabled = false,
}: ButtonProps) => {
  return (
    <button type="button" onClick={onClick} disabled={disabled}>
      {title}
    </button>
  );
};

/**
 * A beautiful button3 component
 *
 * @param {string} title - The label that goes inside the button
 */
export function Button3({ title, onClick, disabled }: ButtonProps) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}>
      {title}
    </button>
  );
}

export function Button4({
  title,
  onClick,
  disabled,
}: {
  title?: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}>
      {title}
    </button>
  );
}
