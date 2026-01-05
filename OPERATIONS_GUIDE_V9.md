## 🌟 운영 가이드 (v1.4 - Sprint 9)

### 1. 개인화 시스템 관리

- **정비소 꾸미기 아이템 추가**: `src/data/decor.json`에 새 아이템 추가. `unlockCondition`을 통해 해금 조건 설정.
- **칭호/뱃지 추가**: `src/data/titles.json`, `src/data/badges.json`에 새 아이템 추가. `unlockCondition`을 통해 해금 조건 설정.

### 2. 동료 시너지 관리

- **신규 시너지 추가**: `src/data/synergies.json`에 새 시너지 조합 추가. `requiredCompanionIds`와 `effects`를 정의.

### 3. 상점 및 오퍼 관리

- **신규 오퍼 추가**: `src/data/offers.json`에 새 오퍼 추가. `eligibility`를 통해 노출 조건 설정.
- **오퍼 A/B 테스트**: `src/data/experiments.json`에 오퍼 관련 실험 추가. `variants`에 다른 가격이나 구성의 오퍼 ID를 설정.

### 4. 콘텐츠 팩 시스템

- **콘텐츠 팩 배포**: 원격 서버(e.g., Firebase Remote Config)에 새로운 콘텐츠 팩 JSON을 업로드.
- **클라이언트 적용 확인**: `DebugPanel`에서 콘텐츠 팩 로드 상태 및 적용 여부 확인.

### 5. 데이터 기반 최적화

- **퍼널 분석**: `EventTracker`를 통해 기록된 주요 이벤트(튜토리얼, 상점 진입, 구매 등)를 분석하여 이탈 구간 확인.
- **A/B 실험 결과 분석**: `ExperimentService`를 통해 기록된 각 실험 그룹의 지표(리텐션, 구매율 등)를 비교 분석하여 최적의 안을 선택지 결정.
