'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// ── Applications ──────────────────────────────────────────
export async function updateApplicationStatus(id: string, status: string, reviewNote: string = ''): Promise<void> {
  await prisma.application.update({
    where: { id },
    data: { status, reviewNote },
  });
  revalidatePath('/admin');
}

export async function deleteApplication(id: string): Promise<void> {
  await prisma.application.delete({ where: { id } });
  revalidatePath('/admin');
}

// ── Nominations ───────────────────────────────────────────
export async function toggleNomination(id: string, isActive: boolean): Promise<void> {
  await prisma.nomination.update({
    where: { id },
    data: { isActive },
  });
  revalidatePath('/admin/nominations');
  revalidatePath('/');
}

export async function createNomination(formData: FormData): Promise<void> {
  const title = formData.get('title') as string;
  const slug = (formData.get('slug') as string) || title.toLowerCase().replace(/\s+/g, '-');
  const icon = (formData.get('icon') as string) || '🏆';
  const description = formData.get('description') as string;
  const criteriaRaw = formData.get('criteria') as string;
  const stepsRaw = formData.get('steps') as string;
  const tagsRaw = formData.get('tags') as string;
  const googleFormUrl = (formData.get('googleFormUrl') as string) || null;
  const formType = (formData.get('formType') as string) || 'basic';

  // Parse newline-separated text into JSON arrays
  const toJsonArray = (text: string) =>
    JSON.stringify(
      text
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
    );

  await prisma.nomination.create({
    data: {
      slug,
      title,
      icon,
      description,
      criteria: toJsonArray(criteriaRaw || ''),
      steps: toJsonArray(stepsRaw || ''),
      tags: toJsonArray(tagsRaw || ''),
      googleFormUrl,
      formType,
    },
  });
  revalidatePath('/admin/nominations');
  revalidatePath('/');
}

export async function deleteNomination(id: string): Promise<void> {
  await prisma.nomination.delete({ where: { id } });
  revalidatePath('/admin/nominations');
  revalidatePath('/');
}

// ── Winners ───────────────────────────────────────────────
export async function createWinner(formData: FormData): Promise<void> {
  const name = formData.get('name') as string;
  const department = formData.get('department') as string;
  const position = formData.get('position') as string;
  const nominationId = formData.get('nominationId') as string;
  const year = parseInt(formData.get('year') as string);
  const photo = (formData.get('photo') as string) || '';

  await prisma.winner.create({
    data: { name, department, position, nominationId, year, photo },
  });
  revalidatePath('/admin/winners');
  revalidatePath('/');
}

export async function deleteWinner(id: string): Promise<void> {
  await prisma.winner.delete({ where: { id } });
  revalidatePath('/admin/winners');
  revalidatePath('/');
}

// ── Gallery ───────────────────────────────────────────────
export async function createGalleryItem(formData: FormData): Promise<void> {
  const url = formData.get('url') as string;
  const alt = (formData.get('alt') as string) || '';
  const album = (formData.get('album') as string) || '';

  const maxOrder = await prisma.gallery.aggregate({ _max: { orderIndex: true } });
  const nextOrder = (maxOrder._max.orderIndex ?? -1) + 1;

  await prisma.gallery.create({
    data: { url, alt, album, orderIndex: nextOrder, isVisible: true },
  });
  revalidatePath('/admin/gallery');
  revalidatePath('/');
}

export async function deleteGalleryItem(id: string): Promise<void> {
  await prisma.gallery.delete({ where: { id } });
  revalidatePath('/admin/gallery');
  revalidatePath('/');
}

export async function toggleGalleryVisibility(id: string, isVisible: boolean): Promise<void> {
  await prisma.gallery.update({
    where: { id },
    data: { isVisible },
  });
  revalidatePath('/admin/gallery');
  revalidatePath('/');
}

// ── Site Content ──────────────────────────────────────────
export async function updateSiteContent(formData: FormData): Promise<void> {
  const keys = formData.getAll('key') as string[];
  const values = formData.getAll('value') as string[];

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = values[i] || '';
    await prisma.siteContent.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
  revalidatePath('/admin/content');
  revalidatePath('/');
}
