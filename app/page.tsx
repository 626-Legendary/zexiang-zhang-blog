import { DeployButton } from "@/components/deploy-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { Hero } from "@/components/hero";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { ConnectSupabaseSteps } from "@/components/tutorial/connect-supabase-steps";
import { SignUpUserSteps } from "@/components/tutorial/sign-up-user-steps";

import Link from "next/link";
import { Suspense } from "react";

import { WeatherWidget } from "@/components/widgets/weather-widget"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      123
      <div className="w-1/5">
        <WeatherWidget />
      </div>

    </main>
  );
}
