import { permanentRedirect } from "next/navigation";
import { DISCOVERY_SET_PATH } from "@/lib/discovery-set";

export default function DiscoverySetRedirectPage() {
  permanentRedirect(DISCOVERY_SET_PATH);
}
