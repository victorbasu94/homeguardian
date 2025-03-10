/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_OPENAI_API_KEY: string;
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string;
  readonly VITE_STRIPE_PRICE_ID: string;
  readonly VITE_STRIPE_TRIAL_PRICE_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module 'react-router-dom' {
  export function useNavigate(): (path: string) => void;
  export function useLocation(): any;
}

declare module '@/components/ui/*';
declare module '@/contexts/*';
declare module '@/lib/*';
declare module '@/components/dashboard/*'; 