import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import VotingClient from "./VotingClient";
import Breadcrumb from "@/components/Breadcrumb";
import { safeParseObject } from "@/lib/safe-json";

export default async function JuryVotePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();
  const judgeId = (session?.user as any)?.id as string;
  const judgeName = session?.user?.name ?? "Жюри";

  const nomination = await prisma.nomination.findUnique({ where: { slug } });
  if (!nomination) notFound();

  const applications = await prisma.application.findMany({
    where: { nominationId: nomination.id },
    include: {
      juryScores: {
        include: { judge: { select: { id: true, name: true } } },
      },
    },
    orderBy: { submittedAt: "asc" },
  });

  const judges = await prisma.user.findMany({
    where: { role: "JUDGE", isActive: true },
    select: { id: true, name: true },
  });

  const appsData = applications.map(app => {
    const emp = safeParseObject(app.employeeData) as Record<string, string>;
    const fd = safeParseObject(app.formData) as Record<string, string>;
    const myScore = app.juryScores.find((s: { judgeId: string }) => s.judgeId === judgeId);
    const avgScore = app.juryScores.length > 0
      ? app.juryScores.reduce((s: number, j: { score: number }) => s + j.score, 0) / app.juryScores.length
      : null;
    return {
      id: app.id,
      photoUrl: app.photoUrl ?? null,
      presentationUrl: app.presentationUrl ?? null,
      presentationName: app.presentationName ?? null,
      emp,
      fd,
      juryScores: app.juryScores.map((s: { judgeId: string; judge: { name: string }; score: number; comment: string | null }) => ({
        judgeId: s.judgeId,
        judgeName: s.judge.name,
        score: s.score,
        comment: s.comment ?? "",
      })),
      myScore: myScore ? { score: myScore.score, comment: (myScore as any).comment ?? "" } : null,
      avgScore,
      scoredCount: app.juryScores.length,
    };
  });

  const scoredCount = appsData.filter(a => a.myScore !== null).length;

  return (
    <>
      <Breadcrumb items={[
        { label: 'Жюри', href: '/jury' },
        { label: nomination.title },
      ]} />

      {/* Page header */}
      <div className="section-title" style={{ marginTop: 0 }}>
        <p className="kicker">Голосование</p>
        <h2 style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span>{nomination.icon}</span>
          <span>{nomination.title}</span>
        </h2>
      </div>

      {/* Judge info bar */}
      <div className="stat" style={{ marginBottom: 28, padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 20 }}>👤</span>
          <div>
            <div style={{ color: "#fecaca", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>Голосует</div>
            <div style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>{judgeName}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 28 }}>
          <div style={{ textAlign: "center" as const }}>
            <div style={{ color: "#fff", fontSize: 22, fontWeight: 800 }}>{appsData.length}</div>
            <div style={{ color: "#ffe4e4", fontSize: 12 }}>участников</div>
          </div>
          <div style={{ textAlign: "center" as const }}>
            <div style={{ color: scoredCount === appsData.length && appsData.length > 0 ? "#86efac" : "#fde68a", fontSize: 22, fontWeight: 800 }}>
              {scoredCount}
            </div>
            <div style={{ color: "#ffe4e4", fontSize: 12 }}>оценено</div>
          </div>
          <div style={{ textAlign: "center" as const }}>
            <div style={{ color: "#fff", fontSize: 22, fontWeight: 800 }}>{judges.length}</div>
            <div style={{ color: "#ffe4e4", fontSize: 12 }}>членов жюри</div>
          </div>
        </div>
      </div>

      <VotingClient applications={appsData} judgeId={judgeId} totalJudges={judges.length} />
    </>
  );
}
