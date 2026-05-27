import { User } from "@phosphor-icons/react";
export default function SignInBtn() {
  return (
    <div className="flex flex-col items-center cursor-not-allowed opacity-50">
      <div className="grid place-content-center">
        <User size={24} />
      </div>
      <span className="hidden sm:inline-block">Sign In (Disabled)</span>
    </div>
  );
}
