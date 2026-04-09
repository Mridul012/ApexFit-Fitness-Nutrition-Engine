import { create, findByUser, findByIdAndUser, deleteById } from '../repositories/progress.repository';

export async function trackProgress(
  userId: string,
  dto: { weightKg: number; bodyFatPercentage: number }
) {
  return create({ userId, ...dto });
}

function serializeEntry(entry: { id: string; userId: string; weightKg: { toNumber(): number }; bodyFatPercentage: { toNumber(): number }; recordedAt: Date }) {
  return {
    ...entry,
    weightKg: entry.weightKg.toNumber(),
    bodyFatPercentage: entry.bodyFatPercentage.toNumber(),
  };
}

export async function analyzeTrend(userId: string) {
  const entries = await findByUser(userId);
  const totalEntries = entries.length;

  const serializedEntries = entries.map(serializeEntry);

  if (totalEntries < 2) {
    return {
      entries: serializedEntries,
      totalEntries,
      firstEntry: serializedEntries[0] ?? null,
      latestEntry: serializedEntries[totalEntries - 1] ?? null,
      weightChange: null,
    };
  }

  const weightChange = entries[totalEntries - 1].weightKg.toNumber() - entries[0].weightKg.toNumber();

  return {
    entries: serializedEntries,
    totalEntries,
    firstEntry: serializedEntries[0],
    latestEntry: serializedEntries[totalEntries - 1],
    weightChange,
  };
}

export async function deleteEntry(id: string, userId: string) {
  const entry = await findByIdAndUser(id, userId);
  if (!entry) throw new Error('Entry not found');
  return deleteById(id);
}
