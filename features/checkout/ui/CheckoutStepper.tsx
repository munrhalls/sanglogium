"use client";

import { ShoppingCart, MapPin, Truck, CreditCard } from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils/tailwind";

interface StepDef {
  label: string;
  icon: Icon;
}

const STEPS: StepDef[] = [
  { label: "Basket", icon: ShoppingCart },
  { label: "Address", icon: MapPin },
  { label: "Shipping", icon: Truck },
  { label: "Payment", icon: CreditCard },
];

interface CheckoutStepperProps {
  currentStep: number;
}

export default function CheckoutStepper({ currentStep }: CheckoutStepperProps) {
  return (
    <nav aria-label="Checkout progress" className="mb-6">
      <ol className="flex items-center justify-center">
        {STEPS.map((step, i) => {
          const isActive = i === currentStep;
          const isPassed = i < currentStep;
          const isPending = i > currentStep;
          const IconComponent = step.icon;

          return (
            <li key={step.label} className="flex items-center">
              <span className="flex flex-col items-center gap-1">
                <IconComponent
                  className={cn(
                    "w-6 h-6 lg:w-8 lg:h-8",
                    isActive && "text-brand-400",
                    isPassed && "text-brand-600",
                    isPending && "text-secondary-600"
                  )}
                  weight={isActive ? "fill" : isPassed ? "regular" : "light"}
                  aria-hidden="true"
                />
                <span
                  className={cn(
                    "hidden lg:block type-overline",
                    isActive && "!text-brand-400",
                    isPassed && "!text-brand-600",
                    isPending && "!text-secondary-600"
                  )}
                  aria-current={isActive ? "step" : undefined}
                >
                  {step.label}
                </span>
              </span>
              {i < STEPS.length - 1 && (
                <span
                  className={cn(
                    "w-8 lg:w-16 h-px mx-1",
                    isPassed ? "bg-brand-600" : "bg-secondary-700"
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
