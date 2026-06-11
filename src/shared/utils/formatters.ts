export function formatDate(date: string): Date {
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
    const [day, month, year] = date.split("/");
    return new Date(`${year}-${month}-${day}T00:00:00.000Z`);
  }

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Data inválida: ${date}`);
  }

  return new Date(Date.UTC(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()));
}

export function isValidDate(date: string): boolean {
  try {
    formatDate(date);
    return true;
  } catch {
    return false;
  }
}
