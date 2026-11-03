import Link from 'next/link';
import Icon from './Icon';
import styles from './Button.module.css';

type Variant = 'dark' | 'light' | 'outline' | 'danger';

export interface ButtonBaseProps {
  variant?: Variant;
  trial?: boolean;
  small?: boolean;
  block?: boolean;
  className?: string;
  children: React.ReactNode;
}

type ButtonProps = ButtonBaseProps & React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type LinkProps = ButtonBaseProps & { href: string; onClick?: () => void };

function classes({ variant = 'dark', trial, small, block, className }: ButtonBaseProps) {
  return [
    styles.button,
    styles[variant],
    trial && styles.trial,
    small && styles.small,
    block && styles.block,
    className,
  ]
    .filter(Boolean)
    .join(' ');
}

export default function Button(props: ButtonProps | LinkProps) {
  const { variant, trial, small, block, className, children, ...rest } = props;
  const cls = classes({ variant, trial, small, block, className, children });
  const content = (
    <>
      {trial && <Icon name="chevron-circle" size={28} className={styles.chevron} />}
      {children}
    </>
  );

  if (typeof props.href === 'string') {
    const { href, onClick } = rest as LinkProps;
    return (
      <Link href={href} className={cls} onClick={onClick}>
        {content}
      </Link>
    );
  }

  const { type = 'button', ...buttonRest } = rest as React.ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button type={type} className={cls} {...buttonRest}>
      {content}
    </button>
  );
}
