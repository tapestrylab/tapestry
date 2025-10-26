/**
 * Button component for user interactions
 * @example
 * <Button variant="primary">Click me</Button>
 * @example
 * <Button variant="danger" disabled>Cannot click</Button>
 * @since 1.0.0
 * @see https://design.acme.com/button
 */
export function Button({
  /**
   * Button style variant
   */
  variant = 'primary' as 'primary' | 'secondary' | 'danger',
  /**
   * Whether the button is disabled
   */
  disabled = false,
  /**
   * Button click handler
   */
  onClick,
}: {
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      className={`btn btn-${variant}`}
      disabled={disabled}
      onClick={onClick}
    >
      Click me
    </button>
  );
}
