type IconProps = {
  className?: string;
};

export function ShieldCheckIcon({ className = 'h-6 w-6' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3.25 5.75 5.7v5.65c0 4.15 2.58 7.88 6.25 9.4 3.67-1.52 6.25-5.25 6.25-9.4V5.7L12 3.25Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="m8.8 12.1 2.05 2.05 4.35-4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function LockIcon({ className = 'h-6 w-6' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 10.5V8.2a5 5 0 0 1 10 0v2.3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M6.5 10.5h11A1.5 1.5 0 0 1 19 12v6a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 18v-6a1.5 1.5 0 0 1 1.5-1.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M12 14v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function HeadsetIcon({ className = 'h-6 w-6' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4.75 13.2a7.25 7.25 0 0 1 14.5 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M6.75 13h-1.1a1.4 1.4 0 0 0-1.4 1.4v2.2A1.4 1.4 0 0 0 5.65 18h1.1v-5Zm10.5 0h1.1a1.4 1.4 0 0 1 1.4 1.4v2.2a1.4 1.4 0 0 1-1.4 1.4h-1.1v-5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M17.25 18c0 1.4-1.7 2.25-3.15 2.25H12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function ClipboardIcon({ className = 'h-6 w-6' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 5.75h6M9.5 4h5A1.5 1.5 0 0 1 16 5.5v.25A1.25 1.25 0 0 1 14.75 7h-4.5A1.25 1.25 0 0 1 9 5.75V5.5A1.5 1.5 0 0 1 10.5 4Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M8.25 5.75H7A2 2 0 0 0 5 7.75V18a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7.75a2 2 0 0 0-2-2h-1.25"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M8.75 11.5h6.5m-6.5 4h4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function UserIcon({ className = 'h-6 w-6' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8.25" r="3.25" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M5.75 19.25c.65-3.1 3-5 6.25-5s5.6 1.9 6.25 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CheckCircleIcon({ className = 'h-6 w-6' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.8" />
      <path d="m8.2 12.2 2.35 2.35 5.25-5.45" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function ArrowRightIcon({ className = 'h-6 w-6' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h13m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SparkleIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M10 1.75c.58 3.15 1.88 5.47 5.25 6.1-3.37.63-4.67 2.95-5.25 6.1-.58-3.15-1.88-5.47-5.25-6.1 3.37-.63 4.67-2.95 5.25-6.1Z" />
      <path d="M16.4 11.7c.3 1.6.95 2.78 2.65 3.1-1.7.32-2.35 1.5-2.65 3.1-.3-1.6-.95-2.78-2.65-3.1 1.7-.32 2.35-1.5 2.65-3.1Z" />
    </svg>
  );
}

export function PhoneIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M6.25 3.5 8 7.15 6.7 8.5c.85 1.65 2.1 2.9 3.8 3.8L11.85 11l3.65 1.75-.5 2.8c-.08.45-.45.78-.9.78C8.3 16.33 3.67 11.7 3.67 5.9c0-.45.33-.82.78-.9l1.8-.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MailIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M3.5 5.25h13v9.5h-13v-9.5Zm.75 1.25L10 10.8l5.75-4.3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PinIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 17s5-4.15 5-8.25a5 5 0 0 0-10 0C5 12.85 10 17 10 17Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="8.75" r="1.6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
