type IconName =
  | "add"
  | "arrow_right_alt"
  | "bolt"
  | "check"
  | "check_circle"
  | "more_horiz"
  | "psychology"
  | "schedule"
  | "star"
  | "analytics"
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
    case "analytics":
      return (
        <svg aria-hidden="true" className={className} {...sharedProps}>
          <path d="M5 18V9" />
          <path d="M12 18V6" />
          <path d="M19 18v-4" />
          <path d="M4 18h16" />
        </svg>
      );
    case "bolt":
      return (
        <svg aria-hidden="true" className={className} {...sharedProps}>
          <path d="M13 2 6 13h5l-1 9 8-12h-5l0-8Z" />
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
    case "psychology":
      return (
        <svg aria-hidden="true" className={className} {...sharedProps}>
          <path d="M12 4.5a6.5 6.5 0 1 0 6.5 6.5c0-.8-.14-1.57-.4-2.3" />
          <path d="M12 8.3a2.2 2.2 0 1 1 0 4.4" />
          <path d="M12 12.7c-1.8 0-3.2 1.5-3.2 3.3" />
          <path d="M16.8 6.2 20 3" />
          <path d="m17.6 3 2.4 2.4" />
        </svg>
      );
    case "schedule":
      return (
        <svg aria-hidden="true" className={className} {...sharedProps}>
          <circle cx="12" cy="13" r="7" />
          <path d="M12 9v4.2l2.7 1.7" />
          <path d="M8 3h8" />
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
