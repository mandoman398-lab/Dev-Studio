import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, PageContainer, PageSection, TabNav } from "@/components/layout";
import { QuestionList } from "@/components/interview/question-list";
import { MessageSquare, ListChecks } from "lucide-react";
import { useState } from "react";

type InterviewTab = "questions" | "chat";

export const Route = createFileRoute("/interview")({
  head: () => ({
    meta: [
      { title: "Interview — Dev Studio" },
      {
        name: "description",
        content: "Top interview Q&A for frontend, backend, DevOps and testing.",
      },
    ],
  }),
  component: InterviewPage,
});

function InterviewPage() {
  const [tab, setTab] = useState<InterviewTab>("questions");

  const tabs = [
    { id: "questions", label: "Questions", icon: ListChecks },
    { id: "chat", label: "AI Mock Chat", icon: MessageSquare },
  ] as const;

  return (
    <PageContainer>
      <PageSection>
        <PageHeader
          title="Interview Preparation"
          description="Master common and advanced interview questions across all engineering domains."
          className="mb-6"
        />
        <TabNav
          tabs={tabs.map((t) => ({
            ...t,
            onClick: () => setTab(t.id as InterviewTab),
          }))}
          activeTab={tab}
        />
      </PageSection>
      <div className="flex-1 overflow-hidden pt-1">
        {tab === "questions" ? (
          <QuestionList />
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-12 text-center min-h-[400px]">
            <div className="size-16 rounded-full bg-primary/10 grid place-items-center mx-auto mb-6">
              <MessageSquare className="size-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">AI Mock Interview</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Our mock interview chat is currently being calibrated for 3.5 Sonnet. Stay tuned for
              real-time technical assessments!
            </p>
            <button
              onClick={() => setTab("questions")}
              className="mt-6 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
            >
              Back to Questions
            </button>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
