export function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value
}

/**
 * Progresso 0..1 do scroll -> instante em segundos dentro do trecho [from, to].
 * O 1 devolve exatamente o fim do trecho; NaN vira 0.
 */
export function progressToTime(progress: number, from: number, to: number): number {
  const start = Math.min(from, to)
  const end = Math.max(from, to)
  const p = clamp(Number.isFinite(progress) ? progress : 0, 0, 1)
  return start + p * (end - start)
}

/**
 * Posição "vai e volta" (ping-pong) para um tempo decorrido infinito.
 * 0..duration sobe, depois desce, e assim por diante — sem corte no fim.
 */
export function pingPongTime(elapsed: number, duration: number): number {
  if (!(duration > 0) || !Number.isFinite(elapsed)) return 0
  const cycle = duration * 2
  const t = ((elapsed % cycle) + cycle) % cycle
  return t <= duration ? t : cycle - t
}
