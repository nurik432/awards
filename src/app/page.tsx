import { prisma } from '@/lib/prisma';
import Hero from '@/components/Hero';
import InfoPanel from '@/components/InfoPanel';
import Nominations from '@/components/Nominations';
import Gallery from '@/components/Gallery';
import WinnersArchive from '@/components/WinnersArchive';
import Footer from '@/components/Footer';

export const dynamic = 'force-dynamic';

export default async function Home() {
  // Load all data from Prisma
  const [nominations, winners, galleryItems, heroSlides, siteContent] = await Promise.all([
    prisma.nomination.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.winner.findMany({
      include: { nomination: true },
      orderBy: [{ year: 'desc' }, { name: 'asc' }],
    }),
    prisma.gallery.findMany({
      where: { isVisible: true },
      orderBy: { orderIndex: 'asc' },
    }),
    prisma.heroSlide.findMany({
      where: { isActive: true },
      orderBy: { orderIndex: 'asc' },
    }),
    prisma.siteContent.findMany(),
  ]);

  // Build info cards from SiteContent
  const sc = Object.fromEntries(siteContent.map((s) => [s.key, s.value]));
  const infoCards = [
    { title: sc['info_1_title'] || 'Кто участвует', text: sc['info_1_text'] || '' },
    { title: sc['info_2_title'] || 'Кто определяет победителей', text: sc['info_2_text'] || '' },
    { title: sc['info_3_title'] || 'Главный принцип', text: sc['info_3_text'] || '' },
  ].filter((c) => c.text);

  // Transform nominations for the component
  const nomProps = nominations.map((n) => ({
    id: n.id,
    icon: n.icon || '🏆',
    title: n.title,
    description: n.description,
    eligibility: safeJsonParse(n.tags),
    criteria: safeJsonParse(n.criteria),
    steps: safeJsonParse(n.steps),
    googleFormUrl: n.googleFormUrl,
    formType: n.formType,
  }));

  // Group winners by nomination for the archive component
  const winnerGroups = groupWinnersByNomination(winners);

  // Transform gallery for component
  const galleryProps = galleryItems.map((g) => ({
    src: g.url,
    label: g.alt || '',
  }));

  // Transform slides
  const slideUrls = heroSlides.map((s) => s.imageUrl);

  return (
    <>
      <Hero slides={slideUrls} />
      <main>
        <InfoPanel cards={infoCards} />
        <Nominations nominations={nomProps} />
        <Gallery items={galleryProps} />
        <WinnersArchive groups={winnerGroups} />
      </main>
      <Footer />
    </>
  );
}

function safeJsonParse(str: string): string[] {
  try {
    const parsed = JSON.parse(str);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function groupWinnersByNomination(
  winners: Array<{
    id: string;
    name: string;
    position: string;
    department: string;
    year: number;
    nomination: { title: string; slug: string };
  }>
) {
  const groups: Record<
    string,
    { title: string; slug: string; winners: Array<{ name: string; position: string }> }
  > = {};

  for (const w of winners) {
    const key = w.nomination.slug;
    if (!groups[key]) {
      groups[key] = {
        title: w.nomination.title,
        slug: w.nomination.slug,
        winners: [],
      };
    }
    groups[key].winners.push({ name: w.name, position: w.position });
  }

  return Object.values(groups);
}
