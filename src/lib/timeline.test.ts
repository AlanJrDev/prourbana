import { describe, expect, it } from 'vitest'
import { clamp, pingPongTime, progressToTime } from './timeline'

describe('clamp', () => {
  it('mantém valores dentro da faixa', () => {
    expect(clamp(5, 0, 10)).toBe(5)
  })
  it('corrige valores abaixo do mínimo', () => {
    expect(clamp(-1, 0, 10)).toBe(0)
  })
  it('corrige valores acima do máximo', () => {
    expect(clamp(11, 0, 10)).toBe(10)
  })
})

describe('progressToTime', () => {
  it('0 no scroll vira o início do trecho', () => {
    expect(progressToTime(0, 1.8, 8)).toBeCloseTo(1.8, 10)
  })
  it('1 no scroll vira exatamente o fim do trecho', () => {
    expect(progressToTime(1, 1.8, 8)).toBeCloseTo(8, 10)
  })
  it('interpola no meio do caminho', () => {
    expect(progressToTime(0.5, 0, 8)).toBeCloseTo(4, 10)
  })
  it('aceita trecho invertido (de > para)', () => {
    expect(progressToTime(0, 8, 1.8)).toBeCloseTo(1.8, 10)
    expect(progressToTime(1, 8, 1.8)).toBeCloseTo(8, 10)
  })
  it('progresso fora da faixa é aparado', () => {
    expect(progressToTime(-0.4, 0, 8)).toBeCloseTo(0, 10)
    expect(progressToTime(1.7, 0, 8)).toBeCloseTo(8, 10)
  })
  it('NaN vira 0 (início)', () => {
    expect(progressToTime(Number.NaN, 2, 6)).toBeCloseTo(2, 10)
  })
})

describe('pingPongTime', () => {
  it('sobe até a duração e desce sem corte', () => {
    expect(pingPongTime(0, 8)).toBeCloseTo(0, 10)
    expect(pingPongTime(4, 8)).toBeCloseTo(4, 10)
    expect(pingPongTime(8, 8)).toBeCloseTo(8, 10)
    expect(pingPongTime(12, 8)).toBeCloseTo(4, 10)
    expect(pingPongTime(16, 8)).toBeCloseTo(0, 10)
  })
  it('é contínuo na virada (sem pulo)', () => {
    expect(pingPongTime(8 - 0.001, 8)).toBeCloseTo(7.999, 6)
    expect(pingPongTime(8 + 0.001, 8)).toBeCloseTo(7.999, 6)
    expect(pingPongTime(16 - 0.001, 8)).toBeCloseTo(0.001, 6)
    expect(pingPongTime(16 + 0.001, 8)).toBeCloseTo(0.001, 6)
  })
  it('duração inválida devolve 0', () => {
    expect(pingPongTime(3, 0)).toBe(0)
    expect(pingPongTime(3, Number.NaN)).toBe(0)
  })
})
