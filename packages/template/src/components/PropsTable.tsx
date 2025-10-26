/**
 * PropsTable component for displaying component props
 */

export interface PropTableRow {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
  description?: string;
}

export interface PropsTableProps {
  data: PropTableRow[];
  className?: string;
  styles?: {
    table?: string;
    header?: string;
    row?: string;
    cell?: string;
  };
}

export function PropsTable({ data, className, styles }: PropsTableProps) {
  if (!data || data.length === 0) {
    return null;
  }

  return (
    <table className={className || styles?.table}>
      <thead>
        <tr className={styles?.header}>
          <th className={styles?.cell}>Prop</th>
          <th className={styles?.cell}>Type</th>
          <th className={styles?.cell}>Required</th>
          <th className={styles?.cell}>Default</th>
          <th className={styles?.cell}>Description</th>
        </tr>
      </thead>
      <tbody>
        {data.map((prop) => (
          <tr key={prop.name} className={styles?.row}>
            <td className={styles?.cell}>
              <code>{prop.name}</code>
            </td>
            <td className={styles?.cell}>
              <code>{prop.type}</code>
            </td>
            <td className={styles?.cell}>{prop.required ? 'Yes' : 'No'}</td>
            <td className={styles?.cell}>
              {prop.defaultValue ? <code>{prop.defaultValue}</code> : '—'}
            </td>
            <td className={styles?.cell}>{prop.description || '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
