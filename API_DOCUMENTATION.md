# 오디오 워터마킹 API 문서

## 개요
이 API는 오디오 파일에 워터마킹을 삽입(embed)하거나 기존 오디오에서 워터마킹을 검증(verify)하는 기능을 제공합니다.  
파일 업로드 기반 비동기 처리, 실시간 스트리밍, 검증 가능한 증명서 다운로드까지 지원합니다.

---

## 인증
현재 버전은 API 키 인증 방식을 사용합니다.  
모든 요청 헤더에 다음을 포함해야 합니다.

```http
Authorization: Bearer YOUR_API_KEY
```

---

## 엔드포인트

### 1. 파일 업로드 및 워터마킹 생성
**POST /v1/jobs**  
오디오 파일 업로드 후 워터마킹 삽입 또는 검증 작업을 생성합니다.

**요청**  
- Content-Type: multipart/form-data  
- 필드:
  - `file`: 오디오 파일 (필수)
  - `mode`: `embed` 또는 `verify` (필수)
  - `strength`: 워터마킹 강도 (기본값: 6)
  - `robust`: 견고 모드 여부 (true/false)
  - `algo`: 알고리즘 버전 (예: v1)

**응답 예시**  
```json
{
  "job_id": "abc123"
}
```

---

### 2. 작업 상태/결과 조회
**GET /v1/jobs/{id}**  
특정 작업의 진행 상태와 결과를 반환합니다.

**응답 예시**  
```json
{
  "status": "done",
  "result": {
    "confidence": 0.93,
    "quality_score": 0.88,
    "manifest": {
      "algorithm": "v1",
      "robust": true
    }
  }
}
```

---

### 3. 웹훅 등록
**POST /v1/webhooks**  
작업 완료 시 알림을 받을 콜백 URL을 등록합니다.

**요청**  
```json
{
  "url": "https://example.com/callback",
  "events": ["job.completed"]
}
```

**응답**  
```json
{
  "webhook_id": "whk_12345"
}
```

---

### 4. 검증 가능한 증명서 다운로드
**GET /v1/proof/{result_id}**  
검증 가능한 증명서(JSON + JWS)를 반환합니다.

**응답 예시**  
```json
{
  "proof": { "type": "jws", "payload": { ... }, "signature": "..." }
}
```

---

### 5. 공개 키 확인
**GET /v1/keys/jwks.json**  
JWS 서명 검증용 공개 키 세트를 반환합니다.

---

## 오류 모델
모든 오류 응답은 다음과 같은 형식을 따릅니다.

```json
{
  "error": {
    "code": "invalid_request",
    "message": "업로드된 파일 형식이 잘못되었습니다."
  }
}
```

---

## 보안
- 모든 엔드포인트는 HTTPS에서만 동작합니다.
- 서명 검증은 `/v1/keys/jwks.json`에서 제공하는 키로 가능합니다.

---

## 클라이언트 예시

### cURL
```bash
curl -X POST "https://api.example.com/v1/jobs"   -H "Authorization: Bearer $API_KEY"   -F "file=@sample.wav"   -F "mode=embed"   -F "strength=6"
```

### JavaScript (fetch)
```javascript
const fd = new FormData();
fd.append('file', myFile);
fd.append('mode', 'embed');

fetch("https://api.example.com/v1/jobs", {
  method: "POST",
  headers: { "Authorization": "Bearer " + API_KEY },
  body: fd
}).then(r => r.json()).then(console.log);
```
