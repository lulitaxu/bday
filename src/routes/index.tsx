import { createFileRoute } from "@tanstack/react-router";
import { PartyExperience } from "@/components/party/experience";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <PartyExperience />;
}
