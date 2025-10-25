/**
 * CodeBlock component for displaying code
 */

export interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  className?: string;
  styles?: {
    container?: string;
    pre?: string;
    code?: string;
  };
}

export function CodeBlock({
  code,
  language,
  showLineNumbers = false,
  className,
  styles,
}: CodeBlockProps) {
  const lines = code.split('\n');

  return (
    <div className={className || styles?.container}>
      <pre className={styles?.pre}>
        <code className={styles?.code} data-language={language}>
          {showLineNumbers
            ? lines.map((line, i) => (
                <div key={i}>
                  <span>{i + 1}</span>
                  {line}
                </div>
              ))
            : code}
        </code>
      </pre>
    </div>
  );
}
