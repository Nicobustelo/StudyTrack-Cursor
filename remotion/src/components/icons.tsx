import React from "react";

type IconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
};

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none" as const,
});

export const CheckIcon: React.FC<IconProps> = ({
  size = 24,
  color = "#fff",
  strokeWidth = 3.2,
}) => (
  <svg {...base(size)}>
    <path
      d="M4.5 12.5L9.8 17.8L19.5 6.8"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const LockIcon: React.FC<IconProps> = ({
  size = 24,
  color = "#fff",
  strokeWidth = 2.4,
}) => (
  <svg {...base(size)}>
    <rect
      x="5"
      y="10.5"
      width="14"
      height="10"
      rx="3"
      stroke={color}
      strokeWidth={strokeWidth}
    />
    <path
      d="M8 10.5V7.5C8 5.29 9.79 3.5 12 3.5C14.21 3.5 16 5.29 16 7.5V10.5"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <circle cx="12" cy="15.5" r="1.6" fill={color} />
  </svg>
);

export const StarIcon: React.FC<IconProps> = ({ size = 24, color = "#fff" }) => (
  <svg {...base(size)}>
    <path
      d="M12 2.8L14.7 8.6L21 9.4L16.4 13.8L17.6 20.1L12 17L6.4 20.1L7.6 13.8L3 9.4L9.3 8.6L12 2.8Z"
      fill={color}
    />
  </svg>
);

export const ZapIcon: React.FC<IconProps> = ({ size = 24, color = "#fff" }) => (
  <svg {...base(size)}>
    <path d="M13 2L4.5 13.5H11L10 22L19.5 10H13L13 2Z" fill={color} />
  </svg>
);

export const DocIcon: React.FC<IconProps> = ({
  size = 24,
  color = "#fff",
  strokeWidth = 2.2,
}) => (
  <svg {...base(size)}>
    <path
      d="M6 3.5H14L19 8.5V20.5H6V3.5Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
    <path
      d="M9 12H16M9 15.5H16M9 8.5H11.5"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </svg>
);

export const RefreshIcon: React.FC<IconProps> = ({
  size = 24,
  color = "#fff",
  strokeWidth = 2.6,
}) => (
  <svg {...base(size)}>
    <path
      d="M19.5 12C19.5 16.14 16.14 19.5 12 19.5C7.86 19.5 4.5 16.14 4.5 12C4.5 7.86 7.86 4.5 12 4.5C14.65 4.5 16.98 5.87 18.32 7.95"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <path d="M18.8 3.4V8.2H14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const FireIcon: React.FC<IconProps> = ({ size = 24, color = "#FF8A3D" }) => (
  <svg {...base(size)}>
    <path
      d="M12 22C7.9 22 5 19.2 5 15.4C5 12.6 6.7 10.5 8.1 8.9C9.3 7.5 10.3 6.3 10.3 4.6C10.3 3.7 10.1 2.9 9.8 2.2C13.4 3.3 15.4 6.1 15.6 9.3C16.3 8.7 16.8 7.8 17 6.8C18.3 8.4 19 10.6 19 13C19 18.2 16.1 22 12 22Z"
      fill={color}
    />
    <path
      d="M12 22C9.9 22 8.4 20.4 8.4 18.3C8.4 16.6 9.5 15.5 10.4 14.5C11 13.8 11.6 13.2 11.8 12.4C13.4 13.4 15.6 15.4 15.6 18.3C15.6 20.4 14.1 22 12 22Z"
      fill="#FFD166"
    />
  </svg>
);

export const TargetIcon: React.FC<IconProps> = ({
  size = 24,
  color = "#2F80ED",
  strokeWidth = 2.2,
}) => (
  <svg {...base(size)}>
    <circle cx="12" cy="12" r="8.5" stroke={color} strokeWidth={strokeWidth} />
    <circle cx="12" cy="12" r="4.8" stroke={color} strokeWidth={strokeWidth} />
    <circle cx="12" cy="12" r="1.7" fill={color} />
  </svg>
);

export const UploadIcon: React.FC<IconProps> = ({
  size = 24,
  color = "#37C871",
  strokeWidth = 2.6,
}) => (
  <svg {...base(size)}>
    <path
      d="M12 15.5V4.5M12 4.5L7.5 9M12 4.5L16.5 9"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4.5 15.5V18.5C4.5 19.6 5.4 20.5 6.5 20.5H17.5C18.6 20.5 19.5 19.6 19.5 18.5V15.5"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </svg>
);

export const BookIcon: React.FC<IconProps> = ({
  size = 24,
  color = "#fff",
  strokeWidth = 2.2,
}) => (
  <svg {...base(size)}>
    <path
      d="M4 5.5C4 4.4 4.9 3.5 6 3.5H20V18.5H6C4.9 18.5 4 19.4 4 20.5V5.5Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
    <path
      d="M4 20.5C4 19.4 4.9 18.5 6 18.5H20V20.5"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <path d="M9 8.5H15" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

export const CalendarIcon: React.FC<IconProps> = ({
  size = 24,
  color = "#2F80ED",
  strokeWidth = 2.2,
}) => (
  <svg {...base(size)}>
    <rect x="4" y="5.5" width="16" height="15" rx="3" stroke={color} strokeWidth={strokeWidth} />
    <path d="M4 10H20" stroke={color} strokeWidth={strokeWidth} />
    <path d="M8.5 3.5V7M15.5 3.5V7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <circle cx="12" cy="15" r="1.8" fill={color} />
  </svg>
);

export const CameraIcon: React.FC<IconProps> = ({
  size = 24,
  color = "#8B5CF6",
  strokeWidth = 2.2,
}) => (
  <svg {...base(size)}>
    <path
      d="M3.5 8.5C3.5 7.4 4.4 6.5 5.5 6.5H8L9.5 4.5H14.5L16 6.5H18.5C19.6 6.5 20.5 7.4 20.5 8.5V17.5C20.5 18.6 19.6 19.5 18.5 19.5H5.5C4.4 19.5 3.5 18.6 3.5 17.5V8.5Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12.7" r="3.4" stroke={color} strokeWidth={strokeWidth} />
  </svg>
);

export const PencilIcon: React.FC<IconProps> = ({
  size = 24,
  color = "#FF8A3D",
  strokeWidth = 2.2,
}) => (
  <svg {...base(size)}>
    <path
      d="M14.5 5.5L18.5 9.5L8.5 19.5H4.5V15.5L14.5 5.5Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
    <path d="M12.5 7.5L16.5 11.5" stroke={color} strokeWidth={strokeWidth} />
  </svg>
);

export const TrophyIcon: React.FC<IconProps> = ({ size = 24, color = "#FFD166" }) => (
  <svg {...base(size)}>
    <path
      d="M7 4H17V10C17 12.76 14.76 15 12 15C9.24 15 7 12.76 7 10V4Z"
      fill={color}
    />
    <path
      d="M7 5.5H4.5V7.5C4.5 9.16 5.84 10.5 7.5 10.5M17 5.5H19.5V7.5C19.5 9.16 18.16 10.5 16.5 10.5"
      stroke={color}
      strokeWidth="2"
    />
    <path d="M12 15V17.5" stroke={color} strokeWidth="2.4" />
    <path d="M8.5 20.5C8.5 18.84 10.06 17.5 12 17.5C13.94 17.5 15.5 18.84 15.5 20.5H8.5Z" fill={color} />
  </svg>
);

export const XIcon: React.FC<IconProps> = ({
  size = 24,
  color = "#EF4444",
  strokeWidth = 3,
}) => (
  <svg {...base(size)}>
    <path
      d="M6 6L18 18M18 6L6 18"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </svg>
);
