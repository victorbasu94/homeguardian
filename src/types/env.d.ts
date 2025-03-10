/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_OPENAI_API_KEY: string
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string
  readonly VITE_STRIPE_PRICE_ID: string
  readonly VITE_STRIPE_TRIAL_PRICE_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module "@/components/ui/use-toast" {
  const useToast: any;
  export { useToast };
}

declare module "@/components/ui/button" {
  const Button: any;
  export { Button };
}

declare module "@/components/ui/skeleton" {
  const Skeleton: any;
  export { Skeleton };
}

declare module "@/lib/maintenanceApi" {
  const getMaintenancePlan: any;
  export { getMaintenancePlan };
} 