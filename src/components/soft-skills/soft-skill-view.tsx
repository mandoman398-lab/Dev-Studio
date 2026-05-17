import { Mic, Handshake } from "lucide-react";
import { SkillArea } from "@/components/tech-skills/skill-area";
import { SOFT_SKILLS_DATA } from "@/data/skills";

const COMMUNICATION_EXTRA_TABS = [
  { id: "speaking",    label: "Public Speaking", icon: Mic },
  { id: "negotiation", label: "Negotiation",     icon: Handshake },
];

export function SoftSkillView({ activeTab }: { activeTab?: string }) {
  const subAreaTabs = activeTab === "communication" ? COMMUNICATION_EXTRA_TABS : [];
  return (
    <SkillArea
      data={SOFT_SKILLS_DATA}
      activeSubArea={activeTab}
      subAreaTabs={subAreaTabs}
    />
  );
}
