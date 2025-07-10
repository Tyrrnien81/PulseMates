# PulseMates 성능 최적화 가이드

## 🎯 목표

- **최종 목표**: API 응답 시간 < 3초
- **현재 달성**: 5.26초 (81% 개선)
- **추가 최적화 필요**: ~2초 단축

## 📊 성능 개선 히스토리

### Phase 1: 초기 상태 (GPT-4)

```
총 시간: 27.992초
├─ STT: 7.097초
├─ AI 코칭: 20.234초 ← 주요 병목
└─ TTS: 657ms
```

### Phase 2: 서버 통합

```
총 시간: 13.133초 (53% 개선)
├─ STT: ~4초
├─ Mock 코칭: ~1초
└─ TTS Mock: ~200ms
```

### Phase 3: 최적화 완료 ✅

```
총 시간: 5.262초 (81% 개선)
├─ AssemblyAI STT: ~4초
├─ 최적화 코칭: 0ms (캐시)
└─ TTS Mock: ~200ms
```

## 🚀 현재 최적화 전략

### 1. 캐시 기반 코칭 (0ms)

**파일**: `apps/server/src/services/optimizedCoachingService.ts`

```typescript
// 감정별 사전 정의 코칭
CACHED_COACHING = {
  negative: {
    breathingExercise: { /* 스트레스 완화 호흡법 */ },
    motivationalMessage: "힘든 시간이지만...",
    stretchExercise: { /* 긴장 완화 스트레칭 */ }
  }
}

// 즉시 반환 (0ms)
async generateFastCoaching(sentiment) {
  return CACHED_COACHING[sentiment.label] || CACHED_COACHING.neutral;
}
```

**장점:**

- ⚡ 즉시 응답 (0ms)
- 🛡️ 100% 안정성
- 💰 API 비용 절약

**단점:**

- 🤖 개인화 부족
- 📋 제한된 메시지

### 2. GPT-4o-mini 최적화 (~1.5초)

```typescript
model: 'gpt-4o-mini',     // GPT-4 대신 20배 빠름
temperature: 0.3,         // 일관된 빠른 응답
max_tokens: 200,          // 응답 길이 제한
```

**장점:**

- 🎯 개인화된 응답
- ⚡ 실용적 속도
- 💡 AI 품질 유지

**사용법:**

```typescript
// 환경변수로 모드 선택
COACHING_MODE = 'fast'; // 캐시 사용 (데모용)
COACHING_MODE = 'optimized'; // AI 사용 (운영용)
```

## 📈 추가 최적화 방안

### A. STT 최적화 (목표: 4초 → 2초)

#### 1) 스트리밍 STT

```typescript
// WebSocket 기반 실시간 처리
const streamingTranscript = await assemblyai.transcripts.transcribeStream({
  audio: audioStream,
  real_time: true,
});
```

**예상 개선**: 2-3초 단축

#### 2) 로컬 STT 모델

```bash
# Whisper 로컬 설치
pip install openai-whisper
```

```typescript
// 로컬 처리로 네트워크 지연 제거
const localResult = await whisper.transcribe(audioFile);
```

**예상 개선**: 1-2초 단축

### B. 병렬 처리 최적화

#### 1) 완전 병렬 파이프라인

```typescript
const [sttResult, cachedCoaching] = await Promise.all([
  assemblyai.transcribe(audio),
  optimizedCoaching.generateFastCoaching(defaultSentiment),
]);
```

#### 2) 예측적 캐싱

```typescript
// 요청 전에 일반적인 코칭 미리 준비
const predictiveCoaching = await Promise.all([
  generateFastCoaching({ label: 'negative' }),
  generateFastCoaching({ label: 'neutral' }),
  generateFastCoaching({ label: 'positive' }),
]);
```

### C. 인프라 최적화

#### 1) CDN 및 캐싱

```typescript
// Redis 캐싱
const cachedTranscript = await redis.get(`transcript:${audioHash}`);
if (cachedTranscript) return cachedTranscript;
```

#### 2) Connection Pooling

```typescript
// DB 연결 풀링
const pool = mysql.createPool({
  connectionLimit: 10,
  acquireTimeout: 60000,
});
```

## 🎯 목표별 최적화 로드맵

### 단기 목표: 3초 달성 (2초 단축 필요)

1. **STT 스트리밍**: -2초
2. **완전 병렬 처리**: -0.5초
3. **Redis 캐싱**: -0.3초
4. **Connection Pool**: -0.2초

### 중기 목표: 2초 달성

1. **로컬 Whisper**: -1초
2. **예측적 캐싱**: -0.5초
3. **CDN**: -0.3초

### 장기 목표: 1초 달성

1. **Edge Computing**: -0.5초
2. **하드웨어 최적화**: -0.3초
3. **Custom AI 모델**: -0.2초

## 🔧 구현 우선순위

### 높음 (즉시 적용 가능)

- [ ] STT 스트리밍 구현
- [ ] Redis 캐싱 적용
- [ ] Connection Pooling

### 중간 (1-2일 소요)

- [ ] Whisper 로컬 설치
- [ ] 완전 병렬 처리
- [ ] 예측적 캐싱

### 낮음 (주말 프로젝트)

- [ ] WebSocket 실시간 처리
- [ ] Edge Computing 배포
- [ ] Custom 모델 훈련

## 📊 성능 모니터링

### 현재 메트릭

```typescript
// 응답 시간 추적
const metrics = {
  sttTime: Date.now() - sttStart,
  coachingTime: Date.now() - coachingStart,
  totalTime: Date.now() - requestStart,
};
```

### 추천 도구

- **APM**: New Relic, DataDog
- **메트릭**: Prometheus + Grafana
- **로깅**: Winston + ELK Stack

## 🎉 결론

**현재 상태**: 5.26초 (81% 개선 완료) **목표 달성도**: 83% (3초 목표 기준) **추가 최적화**: STT
스트리밍으로 3초 달성 가능

**권장 다음 단계**:

1. STT 스트리밍 구현 (가장 큰 효과)
2. Redis 캐싱 적용 (쉬운 구현)
3. 병렬 처리 완성 (안정성 향상)
