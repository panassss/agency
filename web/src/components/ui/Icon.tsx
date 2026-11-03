export type IconName =
  | 'svc-content'
  | 'svc-graphic'
  | 'svc-digital'
  | 'svc-web'
  | 'svc-it'
  | 'svc-brand'
  | 'contact-email'
  | 'contact-phone'
  | 'contact-pin'
  | 'social-facebook'
  | 'social-instagram'
  | 'social-linkedin'
  | 'proc-ideate'
  | 'proc-research'
  | 'proc-create'
  | 'proc-testing'
  | 'arrow-up-right'
  | 'chevron-circle'
  | 'chevron-left'
  | 'chevron-right'
  | 'arrow-up'
  | 'star'
  | 'check-circle'
  | 'close'
  | 'sun'
  | 'moon'
  | 'user'
  | 'search';

interface IconProps {
  name: IconName;
  size?: number;
  width?: number;
  height?: number;
  className?: string;
  title?: string;
}

/** Renders a symbol from the shared SVG sprite (public/img/sprite.svg). */
export default function Icon({ name, size = 24, width, height, className, title }: IconProps) {
  return (
    <svg
      className={className}
      width={width ?? size}
      height={height ?? size}
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      focusable="false"
    >
      {title && <title>{title}</title>}
      <use href={`/img/sprite.svg#${name}`} />
    </svg>
  );
}
