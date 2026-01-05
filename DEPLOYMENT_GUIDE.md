# 📱 EAS 빌드 및 배포 가이드

## 목차

1. [사전 준비](#사전-준비)
2. [EAS 설정](#eas-설정)
3. [개발 클라이언트 빌드](#개발-클라이언트-빌드)
4. [프리뷰 빌드](#프리뷰-빌드)
5. [릴리즈 빌드](#릴리즈-빌드)
6. [앱 스토어 배포](#앱-스토어-배포)
7. [릴리즈 체크리스트](#릴리즈-체크리스트)
8. [정책 문서 템플릿](#정책-문서-템플릿)

---

## 사전 준비

### 1. 필수 도구 설치

```bash
# Node.js 및 npm (이미 설치됨)
node --version  # v18 이상 권장
npm --version

# Expo CLI 설치
npm install -g expo-cli

# EAS CLI 설치
npm install -g eas-cli

# Android SDK (Android 빌드 필요)
# - Android Studio 설치
# - SDK Platform 33 이상 설치
```

### 2. 계정 설정

```bash
# Expo 계정 생성 (https://expo.dev)
# 또는 기존 계정으로 로그인

# EAS 로그인
eas login

# 계정 확인
eas whoami
```

### 3. 프로젝트 초기화

```bash
cd mythic-workshop

# EAS 프로젝트 초기화 (최초 1회)
eas build:configure

# 프롬프트에서 선택:
# - Platform: Android (또는 All)
# - Build type: Development, Preview, Production
```

---

## EAS 설정

### eas.json 구성

프로젝트 루트에 `eas.json` 파일이 생성됩니다. 다음과 같이 구성하세요:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "aab"
      }
    },
    "production": {
      "distribution": "store",
      "android": {
        "buildType": "aab"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./android-key.json",
        "track": "internal"
      }
    }
  }
}
```

### app.json 업데이트

```json
{
  "expo": {
    "name": "설화 정비소",
    "slug": "mythic-workshop",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "updates": {
      "fallbackToCacheTimeout": 0
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTabletMode": true,
      "bundleIdentifier": "com.mythic.workshop"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.mythic.workshop",
      "versionCode": 1
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}
```

---

## 개발 클라이언트 빌드

개발 중에 Expo Go 대신 Dev Client를 사용합니다 (react-native-skia 필요).

### 단계 1: 개발 클라이언트 빌드

```bash
# Android 개발 클라이언트 빌드
eas build --platform android --profile development

# 또는 iOS (옵션)
eas build --platform ios --profile development
```

### 단계 2: 빌드 모니터링

```bash
# 빌드 상태 확인
eas build:list

# 특정 빌드 상세 정보
eas build:view <build-id>
```

### 단계 3: 기기에 설치

```bash
# Android: APK 다운로드 후 기기에 설치
adb install path/to/build.apk

# 또는 Expo 앱에서 QR 코드 스캔
eas build:view <build-id>  # QR 코드 표시
```

### 단계 4: 개발 서버 시작

```bash
npm start

# 또는
expo start

# 기기에서 QR 코드 스캔하여 연결
```

---

## 프리뷰 빌드

테스트용 프리뷰 빌드를 생성합니다.

```bash
# Android 프리뷰 빌드 (AAB)
eas build --platform android --profile preview

# 빌드 완료 후 다운로드
eas build:view <build-id>
```

### 로컬 테스트

```bash
# AAB를 APK로 변환 (Android Studio 또는 bundletool 사용)
bundletool build-apks \
  --bundle=build.aab \
  --output=build.apks \
  --mode=universal

# 기기에 설치
adb install-multiple build.apks
```

---

## 릴리즈 빌드

프로덕션 배포용 릴리즈 빌드를 생성합니다.

### 단계 1: 버전 업데이트

```bash
# app.json에서 버전 업데이트
{
  "expo": {
    "version": "1.0.1",
    "android": {
      "versionCode": 2
    }
  }
}
```

### 단계 2: 릴리즈 빌드 생성

```bash
# Android 릴리즈 빌드
eas build --platform android --profile production

# 빌드 완료 대기 (5~15분)
eas build:view <build-id>
```

### 단계 3: 빌드 검증

```bash
# 빌드 다운로드 및 로컬 테스트
eas build:view <build-id>  # 다운로드 링크 확인

# 또는 자동 다운로드
eas build:download <build-id>
```

---

## 앱 스토어 배포

### Google Play Store 배포

#### 사전 준비

1. **Google Play Developer 계정 생성**
   - https://play.google.com/console
   - $25 등록비 필요

2. **키스토어 생성 (최초 1회)**

```bash
# 키스토어 생성
keytool -genkey -v -keystore mythic-workshop.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias mythic-workshop

# 프롬프트에서 정보 입력:
# - 비밀번호: [안전한 비밀번호 입력]
# - 이름: [개발자 이름]
# - 조직: [회사명]
# - 도시: [도시명]
# - 시/도: [시/도]
# - 국가: [국가 코드, 예: KR]
```

3. **키스토어 정보 저장**

```bash
# 키스토어 파일을 안전한 위치에 저장
# 비밀번호를 안전하게 보관
```

#### 배포 단계

1. **Google Play Console에서 앱 생성**
   - 앱 이름: "설화 정비소"
   - 패키지명: com.mythic.workshop
   - 앱 카테고리: 게임 > 캐주얼

2. **EAS 제출 설정**

```bash
# android-key.json 생성 (Google Play 서비스 계정)
# Google Play Console → 설정 → API 액세스 → 서비스 계정 생성

# eas.json에 경로 설정
{
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./android-key.json",
        "track": "internal"
      }
    }
  }
}
```

3. **앱 제출**

```bash
# 빌드 생성 및 자동 제출
eas build --platform android --profile production --auto-submit

# 또는 수동 제출
eas submit --platform android --latest
```

4. **Google Play Console에서 검토**
   - 앱 정보 작성
   - 스크린샷 업로드
   - 개인정보처리방침 링크 추가
   - 콘텐츠 등급 설정
   - 검토 제출

---

## 릴리즈 체크리스트

배포 전 다음 항목을 확인하세요:

### 기능 검증

- [ ] 모든 기능이 정상 작동하는가?
- [ ] 튜토리얼이 올바르게 진행되는가?
- [ ] 저장/로드가 정상 작동하는가?
- [ ] 오프라인 보상이 정상 계산되는가?
- [ ] 패스 시스템이 정상 작동하는가?
- [ ] 광고 보상이 Mock으로 정상 작동하는가?
- [ ] 코스튬 구매/장착이 정상 작동하는가?

### 성능 검증

- [ ] 앱 시작 시간이 5초 이내인가?
- [ ] 전투 화면에서 프레임 드롭이 없는가?
- [ ] 메모리 누수가 없는가?
- [ ] 배터리 소비가 정상 수준인가?

### 보안 검증

- [ ] 저장 데이터가 암호화되어 있는가?
- [ ] 치트 방지 로직이 작동하는가?
- [ ] 민감한 정보가 로그에 노출되지 않는가?

### 호환성 검증

- [ ] Android 8.0 이상에서 작동하는가?
- [ ] 다양한 화면 크기에서 정상 표시되는가?
- [ ] 다국어 지원이 필요한가?

### 메타데이터 검증

- [ ] 앱 아이콘이 올바른가?
- [ ] 스플래시 화면이 올바른가?
- [ ] 앱 이름/설명이 올바른가?
- [ ] 버전 번호가 올바른가?

### 문서 검증

- [ ] 개인정보처리방침이 작성되었는가?
- [ ] 광고 표기가 있는가?
- [ ] 이용약관이 작성되었는가?

---

## 정책 문서 템플릿

### 개인정보처리방침 (Privacy Policy)

```markdown
# 개인정보처리방침

**설화 정비소** (이하 "앱")는 사용자의 개인정보 보호를 중요하게 생각합니다.

## 수집하는 정보

1. **기기 정보**
   - 기기 모델, OS 버전, 고유 식별자

2. **게임 데이터**
   - 플레이 진행도, 스테이지, 보유 아이템
   - 이 정보는 로컬 기기에만 저장됩니다

3. **분석 정보** (선택 사항)
   - 앱 사용 통계, 오류 로그
   - Google Analytics 등을 통해 수집될 수 있습니다

## 정보 사용

- 게임 경험 개선
- 오류 진단 및 해결
- 게임 밸런스 조정

## 정보 공유

- 제3자와 개인정보를 공유하지 않습니다
- 법적 요청이 있을 경우 제공할 수 있습니다

## 데이터 삭제

- 앱 삭제 시 모든 로컬 데이터가 삭제됩니다
- 개인정보 삭제 요청: [이메일 주소]

## 문의

개인정보 관련 문의: [이메일 주소]

**마지막 업데이트: 2024년 1월**
```

### 광고 표기

```markdown
# 광고 표기

이 앱은 다음과 같은 광고를 포함할 수 있습니다:

- **리워드 광고**: 사용자가 선택적으로 시청하여 게임 내 보상을 받을 수 있습니다
- **배너 광고**: 게임 화면 하단에 표시될 수 있습니다 (향후)
- **인터스티셜 광고**: 게임 진행 중 표시될 수 있습니다 (향후)

광고는 사용자 경험을 해치지 않도록 최소화됩니다.

**광고 제공자**: Google Mobile Ads (향후 연동 예정)
```

### 이용약관 (Terms of Service)

```markdown
# 이용약관

## 1. 서비스 이용

이 앱은 "있는 그대로" 제공되며, 명시적 또는 묵시적 보증이 없습니다.

## 2. 사용자 책임

- 사용자는 게임 규칙을 준수해야 합니다
- 부정행위(치트, 해킹 등)는 금지됩니다
- 위반 시 계정 정지 또는 삭제될 수 있습니다

## 3. 지적재산권

- 게임의 모든 콘텐츠는 저작권으로 보호됩니다
- 사용자는 개인 용도로만 사용할 수 있습니다

## 4. 책임 제한

- 개발사는 게임 이용으로 인한 손해에 책임을 지지 않습니다
- 데이터 손실, 기기 손상 등에 대해 책임을 지지 않습니다

## 5. 약관 변경

- 개발사는 언제든 약관을 변경할 수 있습니다
- 변경 사항은 앱 내 공지됩니다

## 6. 문의

이용약관 관련 문의: [이메일 주소]

**마지막 업데이트: 2024년 1월**
```

---

## 배포 후 운영

### 버전 관리

```bash
# 새 버전 배포 시
# 1. app.json에서 버전 업데이트
# 2. 변경 사항 정리
# 3. 릴리즈 노트 작성
# 4. 빌드 및 배포
```

### 모니터링

- Google Play Console에서 크래시 로그 모니터링
- 사용자 리뷰 확인
- 성능 지표 확인

### 업데이트 전략

- 주요 기능 추가: 마이너 버전 증가 (1.0 → 1.1)
- 버그 수정: 패치 버전 증가 (1.0 → 1.0.1)
- 긴급 수정: 즉시 배포

---

## 문제 해결

### 빌드 실패

```bash
# 캐시 초기화
eas build:list  # 빌드 히스토리 확인
eas build --platform android --profile production --clear-cache

# 의존성 재설치
rm -rf node_modules
npm install
```

### 배포 거부

- Google Play Console에서 거부 사유 확인
- 개인정보처리방침 추가
- 광고 표기 추가
- 콘텐츠 등급 설정

### 성능 문제

- 번들 크기 확인: `eas build:view <build-id>`
- 불필요한 의존성 제거
- 코드 최적화

---

## 참고 자료

- [Expo EAS 공식 문서](https://docs.expo.dev/eas/)
- [Google Play Console 도움말](https://support.google.com/googleplay/android-developer)
- [React Native 배포 가이드](https://reactnative.dev/docs/signed-apk-android)

---

**마지막 업데이트: 2024년 1월**
