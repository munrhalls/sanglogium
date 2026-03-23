import { SignInButton } from "@clerk/nextjs";
import { User } from "@phosphor-icons/react";
export default function SignInBtn() {
  return (
    <SignInButton mode="modal">
      <div className="flex flex-col items-center">
        <div className="grid place-content-center">
          <User size={24} />
        </div>
        <span className="hidden sm:inline-block">Sign In</span>
      </div>
    </SignInButton>
  );
}
