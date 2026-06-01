type IconName =
  | "add"
  | "arrow_right_alt"
  | "check"
  | "check_circle"
  | "more_horiz"
  | "star"
  | "trending_up";

type IconProps = {
  className?: string;
  name: IconName;
};

const sharedProps = {
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  strokeWidth: 1.8,
  viewBox: "0 0 24 24",
} as const;

export function Icon({ className, name }: IconProps) {
  switch (name) {
    case "add":
      return (
        <svg aria-hidden="true" className={className} {...sharedProps}>
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      );
    case "arrow_right_alt":
      return (
        <svg aria-hidden="true" className={className} {...sharedProps}>
          <path d="M4 12h14" />
          <path d="m13 7 5 5-5 5" />
        </svg>
      );
    case "check":
      return (
        <svg aria-hidden="true" className={className} {...sharedProps}>
          <path d="m5 12 4.2 4.2L19 7.4" />
        </svg>
      );
    case "check_circle":
      return (
        <svg aria-hidden="true" className={className} {...sharedProps}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="m8.6 12 2.4 2.4 4.5-4.8" />
        </svg>
      );
    case "more_horiz":
      return (
        <svg aria-hidden="true" className={className} {...sharedProps}>
          <circle cx="6.5" cy="12" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="17.5" cy="12" r="1.2" fill="currentColor" stroke="none" />
        </svg>
      );
    case "star":
      return (
        <svg aria-hidden="true" className={className} {...sharedProps}>
          <path d="m12 4 2.2 4.6 5.1.7-3.7 3.6.9 5.1L12 15.5 7.5 18l.9-5.1-3.7-3.6 5.1-.7Z" />
        </svg>
      );
    case "trending_up":
      return (
        <svg aria-hidden="true" className={className} {...sharedProps}>
          <path d="M4 16.5 10 10.5l3.7 3.7 6.3-7.2" />
          <path d="M15 7h5v5" />
        </svg>
      );
    default:
      return null;
  }
}
