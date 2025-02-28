import formatTime from '@/utils/formatTime';

describe('formatTime utility', () => {
  it.each([
    [0, '0 minutos'],
    [1, '1 minuto'],
    [59, '59 minutos'],
    [60, '1 hora'],
    [61, '1 hora e 1 minuto'],
    [62, '1 hora e 2 minutos'],
    [75, '1 hora e 15 minutos'],
    [120, '2 horas'],
    [121, '2 horas e 1 minuto'],
    [180, '3 horas'],
    [185, '3 horas e 5 minutos'],
  ])('should format %i minutes as "%s"', (input, expected) => {
    expect(formatTime(input)).toBe(expected);
  });
});
