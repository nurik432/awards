'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
<<<<<<< HEAD
import bcryptjs from 'bcryptjs';
import { auth } from '@/auth';
import { getStorageClient, UPLOADS_BUCKET } from '@/lib/storage';
import { noteDeleted } from '@/lib/upload-guard';

const VALID_ROLES = ['ADMIN', 'JUDGE', 'EMPLOYEE'];

async function requireAdmin(): Promise<void> {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session || role !== 'ADMIN') throw new Error('Unauthorized');
}

/** Removes an uploaded file from Storage, refusing anything outside /uploads/. */
async function removeUpload(url: string | null | undefined): Promise<void> {
  if (!url || !url.startsWith('/uploads/') || url.includes('..') || url.includes('\\')) return;
  const key = url.slice('/uploads/'.length);
  try {
    const client = getStorageClient();
    const dir = key.includes('/') ? key.slice(0, key.lastIndexOf('/')) : '';
    const name = key.includes('/') ? key.slice(key.lastIndexOf('/') + 1) : key;
    const { data } = await client.storage.from(UPLOADS_BUCKET).list(dir, { search: name });
    const size = data?.find((f) => f.name === name)?.metadata?.size as number | undefined;
    await client.storage.from(UPLOADS_BUCKET).remove([key]);
    if (size) noteDeleted(size);
  } catch {
    /* already gone */
  }
}

// ── Applications ──────────────────────────────────────────
export async function updateApplicationStatus(id: string, status: string, reviewNote: string = ''): Promise<void> {
  await requireAdmin();
=======

// ── Applications ──────────────────────────────────────────
export async function updateApplicationStatus(id: string, status: string, reviewNote: string = ''): Promise<void> {
>>>>>>> ea0ea528935b3fb349231e765b4381c98866c16c
  await prisma.application.update({
    where: { id },
    data: { status, reviewNote },
  });
  revalidatePath('/admin');
}

export async function deleteApplication(id: string): Promise<void> {
<<<<<<< HEAD
  await requireAdmin();
  // Read the attachments first so deleting the row also frees the disk.
  const app = await prisma.application.findUnique({
    where: { id },
    select: { photoUrl: true, presentationUrl: true },
  });
  await prisma.application.delete({ where: { id } });
  await removeUpload(app?.photoUrl);
  await removeUpload(app?.presentationUrl);
=======
  await prisma.application.delete({ where: { id } });
>>>>>>> ea0ea528935b3fb349231e765b4381c98866c16c
  revalidatePath('/admin');
}

// ── Nominations ───────────────────────────────────────────
export async function toggleNomination(id: string, isActive: boolean): Promise<void> {
<<<<<<< HEAD
  await requireAdmin();
=======
>>>>>>> ea0ea528935b3fb349231e765b4381c98866c16c
  await prisma.nomination.update({
    where: { id },
    data: { isActive },
  });
  revalidatePath('/admin/nominations');
  revalidatePath('/');
}

export async function createNomination(formData: FormData): Promise<void> {
<<<<<<< HEAD
  await requireAdmin();
=======
>>>>>>> ea0ea528935b3fb349231e765b4381c98866c16c
  const title = formData.get('title') as string;
  const slug = (formData.get('slug') as string) || title.toLowerCase().replace(/\s+/g, '-');
  const icon = (formData.get('icon') as string) || '🏆';
  const description = formData.get('description') as string;
  const criteriaRaw = formData.get('criteria') as string;
  const stepsRaw = formData.get('steps') as string;
  const tagsRaw = formData.get('tags') as string;
  const googleFormUrl = (formData.get('googleFormUrl') as string) || null;
  const formType = (formData.get('formType') as string) || 'basic';
<<<<<<< HEAD
  const acceptsApplications = formData.get('acceptsApplications') === 'on';

  const toJsonArray = (text: string) =>
    JSON.stringify(text.split('\n').map((s) => s.trim()).filter(Boolean));
=======

  // Parse newline-separated text into JSON arrays
  const toJsonArray = (text: string) =>
    JSON.stringify(
      text
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
    );
>>>>>>> ea0ea528935b3fb349231e765b4381c98866c16c

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
<<<<<<< HEAD
      acceptsApplications,
    },
  });
  revalidatePath('/admin/nominations');
  revalidatePath('/');
}

export async function updateNomination(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = formData.get('id') as string;
  const title = formData.get('title') as string;
  const slug = formData.get('slug') as string;
  const icon = (formData.get('icon') as string) || '🏆';
  const description = formData.get('description') as string;
  const criteriaRaw = formData.get('criteria') as string;
  const stepsRaw = formData.get('steps') as string;
  const tagsRaw = formData.get('tags') as string;
  const googleFormUrl = (formData.get('googleFormUrl') as string) || null;
  const formType = (formData.get('formType') as string) || 'basic';
  const acceptsApplications = formData.get('acceptsApplications') === 'on';

  const toJsonArray = (text: string) =>
    JSON.stringify(text.split('\n').map((s) => s.trim()).filter(Boolean));

  await prisma.nomination.update({
    where: { id },
    data: {
      title,
      slug,
      icon,
      description,
      criteria: toJsonArray(criteriaRaw || ''),
      steps: toJsonArray(stepsRaw || ''),
      tags: toJsonArray(tagsRaw || ''),
      googleFormUrl: googleFormUrl || null,
      formType,
      acceptsApplications,
=======
>>>>>>> ea0ea528935b3fb349231e765b4381c98866c16c
    },
  });
  revalidatePath('/admin/nominations');
  revalidatePath('/');
}

export async function deleteNomination(id: string): Promise<void> {
<<<<<<< HEAD
  await requireAdmin();
=======
>>>>>>> ea0ea528935b3fb349231e765b4381c98866c16c
  await prisma.nomination.delete({ where: { id } });
  revalidatePath('/admin/nominations');
  revalidatePath('/');
}

// ── Winners ───────────────────────────────────────────────
export async function createWinner(formData: FormData): Promise<void> {
<<<<<<< HEAD
  await requireAdmin();
=======
>>>>>>> ea0ea528935b3fb349231e765b4381c98866c16c
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
<<<<<<< HEAD
  await requireAdmin();
=======
>>>>>>> ea0ea528935b3fb349231e765b4381c98866c16c
  await prisma.winner.delete({ where: { id } });
  revalidatePath('/admin/winners');
  revalidatePath('/');
}

// ── Gallery ───────────────────────────────────────────────
export async function createGalleryItem(formData: FormData): Promise<void> {
<<<<<<< HEAD
  await requireAdmin();
=======
>>>>>>> ea0ea528935b3fb349231e765b4381c98866c16c
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
<<<<<<< HEAD
  await requireAdmin();
=======
>>>>>>> ea0ea528935b3fb349231e765b4381c98866c16c
  await prisma.gallery.delete({ where: { id } });
  revalidatePath('/admin/gallery');
  revalidatePath('/');
}

export async function toggleGalleryVisibility(id: string, isVisible: boolean): Promise<void> {
<<<<<<< HEAD
  await requireAdmin();
=======
>>>>>>> ea0ea528935b3fb349231e765b4381c98866c16c
  await prisma.gallery.update({
    where: { id },
    data: { isVisible },
  });
  revalidatePath('/admin/gallery');
  revalidatePath('/');
}

<<<<<<< HEAD
// ── Users ─────────────────────────────────────────────────
export async function createUser(formData: FormData): Promise<void> {
  await requireAdmin();
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as string;
  const department = formData.get('department') as string;

  if (!password || password.length < 8) throw new Error('Пароль должен быть не менее 8 символов');
  if (!VALID_ROLES.includes(role)) throw new Error('Недопустимая роль');

  const hashed = await bcryptjs.hash(password, 10);
  await prisma.user.create({ data: { name, email, password: hashed, role, department } });
  revalidatePath('/admin/users');
}

export async function toggleUserActive(id: string, isActive: boolean): Promise<void> {
  await requireAdmin();
  await prisma.user.update({ where: { id }, data: { isActive } });
  revalidatePath('/admin/users');
}

export async function deleteUser(id: string): Promise<void> {
  await requireAdmin();
  await prisma.user.delete({ where: { id } });
  revalidatePath('/admin/users');
}

// ── Site Content ──────────────────────────────────────────
export async function updateSiteContent(formData: FormData): Promise<void> {
  await requireAdmin();
=======
// ── Site Content ──────────────────────────────────────────
export async function updateSiteContent(formData: FormData): Promise<void> {
>>>>>>> ea0ea528935b3fb349231e765b4381c98866c16c
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
