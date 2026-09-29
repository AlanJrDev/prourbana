declare global {
  interface Window {
    /** Diagnóstico de vídeo em campo: últimas linhas [vid] para copiar do console. */
    __vidDiag?: string[]
  }
}

/**
 * Log de diagnóstico de vídeo: `console.info('[vid] …')` + buffer em
 * window.__vidDiag (últimas 80 linhas) para quem testa em aparelho copiar a
 * saída inteira de uma vez. Sempre ativo — é o instrumento de campo.
 */
export function vlog(msg: string): void {
  const line = `[vid] ${msg}`
  try {
    console.info(line)
    const w = window
    if (!w.__vidDiag) w.__vidDiag = []
    w.__vidDiag.push(line)
    if (w.__vidDiag.length > 80) w.__vidDiag.shift()
  } catch {
    // diagnóstico nunca pode quebrar o player
  }
}
