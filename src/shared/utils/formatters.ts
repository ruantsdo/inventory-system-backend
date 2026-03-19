export function formatDate(date: string) {
  const [day, month, year] = date.split("/");
  const parsedBirthDate = new Date(`${year}-${month}-${day}T00:00:00.000Z`);

  return parsedBirthDate as Date;
}
