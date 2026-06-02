export const toApiDateTime = (date: string, time: string): string => `${date}T${time}:00`;

export const toHumanDateTime = (iso?: string): string => {
  if (!iso) {
    return '-';
  }

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};
