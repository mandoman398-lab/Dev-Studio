import { createFileRoute, useSearch } from "@tanstack/react-router";
import { SoftSkillView } from "@/components/soft-skills/soft-skill-view";
import { PageHeader, PageContainer, PageSection } from "@/components/layout";
import { z } from "zod";

const searchSchema = z.object({
  tab: z
    .enum([
      "communication",
      "speaking",
      "negotiation",
      "leadership",
      "problem-solving",
      "teamwork",
      "time",
      "growth",
      "mental-models",
    ])
    .optional()
    .default("communication"),
});

export const Route = createFileRoute("/soft-skills")({
  validateSearch: (search) => searchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Soft Skills Hub — Dev Studio" },
      {
        name: "description",
        content: "Master communication, leadership, and human engineering with our unified hub.",
      },
    ],
  }),
  component: SoftSkillsPage,
});

function SoftSkillsPage() {
  const { tab } = useSearch({ from: "/soft-skills" });

  return (
    <PageContainer>
      <PageSection>
        <PageHeader
          title="Communication & Soft Skills"
          description="Master the art of collaboration, leadership, and emotional intelligence."
          className="mb-0 sm:mb-2"
        />
      </PageSection>

      <div className="flex-1 overflow-hidden pt-1">
        <SoftSkillView activeTab={tab} />
      </div>
    </PageContainer>
  );
}
