import LoginForm  from "@/features/auth/components/login-form";
import { LayersIcon as LogoIcon } from "@/components/layout/logo";


export default function SimpleMarqueeDemo() {

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
            <LogoIcon size={24} />
        </a>
        <LoginForm />
      </div>
    </div>
  );
}
