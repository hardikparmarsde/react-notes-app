function getWords(name) {
  return name
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .filter(Boolean);
}

export function getGroupInitials(name) {
  const cleaned = (name ?? '').trim();
  if (!cleaned) return 'NN';

  const words = getWords(cleaned);
  if (words.length >= 2) {
    return `${words[0][0] ?? ''}${words[1][0] ?? ''}`.toUpperCase();
  }

  const first = cleaned[0] ?? 'N';
  return `${first}`.toUpperCase();
}

