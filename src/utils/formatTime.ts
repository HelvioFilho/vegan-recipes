function formatTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  const hoursLabel = hours === 1 ? 'hora' : 'horas';
  const minutesLabel = remainingMinutes === 1 ? 'minuto' : 'minutos';

  return remainingMinutes === 0
    ? `${hours} ${hoursLabel}`
    : `${hours} ${hoursLabel} e ${remainingMinutes} ${minutesLabel}`;
}

export default formatTime;
