function pad2(n) {
  return String(n).padStart(2, '0');
}

export function formatDateTime(isoString) {
  const d = isoString ? new Date(isoString) : new Date();
  const day = d.getDate();
  const month = d.toLocaleString('en-US', { month: 'short' });
  const year = d.getFullYear();

  let hours = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours === 0 ? 12 : hours;

  return {
    date: `${day} ${month} ${year}`,
    time: `${hours}:${pad2(minutes)} ${ampm}`,
  };
}

