import { AUTH_HINT_ATTRIBUTE, AUTH_HINT_COOKIE } from "@/features/auth/core/definitions/authHint";

// Runs synchronously while the HTML is parsed, before the header paints. No cookie, or any error, means signed out.
const SCRIPT = `try{var s=document.cookie.split("; ").indexOf("${AUTH_HINT_COOKIE}=1")>-1;document.documentElement.setAttribute("${AUTH_HINT_ATTRIBUTE}",s?"in":"out")}catch(e){document.documentElement.setAttribute("${AUTH_HINT_ATTRIBUTE}","out")}`;

export default function AuthHintScript() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
