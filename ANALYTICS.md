# Trace Landing Analytics

이 문서는 `myroutinelanding`의 GA4 설정 방식과 현재 코드에 붙어 있는 이벤트 스키마를 정리합니다.

## 1. GA4에서 먼저 해야 할 설정

1. GA4 속성과 Web Data Stream을 생성합니다.
   `Admin > Property > Data streams > Add stream > Web`
2. 측정 ID를 `.env.local`에 넣습니다.

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

3. `Admin > Data display > Reporting identity`에서 리포팅 아이덴티티를 정합니다.
   로그인 기반 식별이 아직 없다면 기본 device ID 중심으로 수집됩니다.
   나중에 로그인 사용자가 생기면 `user_id`를 붙여 cross-device 분석이 가능해집니다.
4. `Admin > Data collection and modification > Custom definitions`에서 아래 커스텀 정의를 만듭니다.
5. `Admin > Key events`에서 아래 이벤트를 Key event로 표시합니다.
   `goal_submitted`
   `beta_application_submitted`
6. 원본 이벤트 단위로 사용자/세션 분석을 하려면 BigQuery Export를 연결합니다.
   `Admin > Product links > BigQuery links`

## 2. User-level 추적 원칙

- 로그인 사용자가 없으면 GA4 `user_id`는 보내지 않습니다.
- 로그인 사용자가 생기면 내부 비식별 ID만 `user_id`로 보냅니다.
- 이메일, 목표 원문, 이름 같은 PII는 GA로 보내지 않습니다.
- `visitor_id`, `session_id`는 코드에서 이벤트 파라미터로 보내지만, 리포트용 커스텀 디멘션으로 등록하지 않는 것을 권장합니다.
  이런 고유값은 BigQuery 원본 분석이나 DebugView 용도로만 쓰는 편이 안전합니다.

## 3. 현재 코드에서 자동으로 붙는 공통 파라미터

모든 `trackEvent(...)` 호출에는 아래 값이 함께 붙습니다.

| Parameter | Scope | 설명 |
| --- | --- | --- |
| `page_path` | event | 현재 경로 |
| `page_title` | event | 현재 문서 제목 |
| `page_type` | event | 현재 페이지 유형. 지금은 `landing_page` |
| `experience_name` | event | 경험/실험 이름. 지금은 `trace_landing` |
| `analytics_version` | event | 계측 스키마 버전. 지금은 `landing_v2` |
| `device_type` | event + user property | `mobile`, `tablet`, `desktop` |
| `viewport_bucket` | event + user property | `xs`, `sm`, `md`, `lg`, `xl` |
| `locale` | event + user property | `ko` 등 브라우저/문서 언어 |
| `user_state` | event + user property | `anonymous`, `authenticated` |
| `visitor_id` | event only | 로컬 스토리지 기반 비로그인 방문자 ID |
| `session_id` | event only | 세션 스토리지 기반 세션 ID |

## 4. 등록 권장 커스텀 정의

### Event-scoped custom dimensions

아래는 GA4 UI에서 만들어두면 리포트/탐색에서 바로 쓰기 좋습니다.

- `page_type`
- `experience_name`
- `analytics_version`
- `section`
- `origin`
- `target`
- `navigation_area`
- `cta_label`
- `scroll_depth_percent`
- `location`
- `length_bucket`
- `goal_length_bucket`
- `goal_topic`
- `entry_point`
- `reason`
- `source`
- `status_code`
- `beta_submitted`
- `has_goal`

### User-scoped custom dimensions

- `user_state`
- `device_type`
- `viewport_bucket`
- `locale`

### 등록 비권장 항목

아래는 고유값/민감값이라 커스텀 디멘션 등록을 권장하지 않습니다.

- `visitor_id`
- `session_id`
- `user_id`
- 이메일 전체값
- 사용자가 적은 목표 원문

## 5. 현재 이벤트 목록

### 페이지/탐색

| Event name | 언제 발생하는가 | 주요 파라미터 |
| --- | --- | --- |
| `landing_page_viewed` | 랜딩 첫 진입 시 | `path` |
| `section_view` | 각 섹션이 처음 뷰포트에 들어왔을 때 | `section` |
| `scroll_depth_reached` | 25/50/75/90% 지점 최초 도달 시 | `scroll_depth_percent` |
| `nav_clicked` | 헤더/푸터 링크 클릭 시 | `navigation_area`, `target` |
| `cta_clicked` | 메인 CTA 클릭 시 | `origin`, `target`, `cta_label` |

### 목표 입력

| Event name | 언제 발생하는가 | 주요 파라미터 |
| --- | --- | --- |
| `goal_input_focused` | 목표 입력창 첫 포커스 | `location` |
| `goal_input_started` | 목표 입력이 처음 시작될 때 | `location`, `length_bucket` |
| `goal_submit_validation_failed` | 빈 값 제출 시 | `reason` |
| `goal_submitted` | 목표 제출 성공 시 | `goal_length_bucket`, `goal_length`, `goal_topic` |

### 베타 모달/리드 수집

| Event name | 언제 발생하는가 | 주요 파라미터 |
| --- | --- | --- |
| `beta_modal_opened` | 목표 제출 후 모달 오픈 | `source`, `goal_length_bucket`, `goal_length`, `goal_topic` |
| `beta_form_started` | 이메일 입력창 첫 포커스 | `entry_point`, `has_goal` |
| `beta_email_started` | 이메일 입력 시작 | `entry_point` |
| `beta_application_validation_failed` | 이메일 형식 오류 | `reason` |
| `beta_application_save_failed` | API 저장 실패 | `status_code` |
| `beta_application_submitted` | 베타 신청 성공 | `email_domain`, `goal_length_bucket`, `goal_topic`, `entry_point` |
| `beta_modal_closed` | 닫기 버튼/배경/Escape/성공으로 닫힘 | `reason`, `beta_submitted`, `has_goal` |

## 6. 로그인 사용자가 생겼을 때

현재 코드에는 `setAnalyticsUser(userId)` 헬퍼가 준비돼 있습니다.

- 로그인 직후: `setAnalyticsUser("internal_user_123")`
- 로그아웃 직후: `setAnalyticsUser(null)`

주의:

- `user_id`는 사내/서비스 내부의 안정적인 비식별 ID여야 합니다.
- 이메일 주소를 그대로 `user_id`로 넣으면 안 됩니다.
- Google 문서 기준으로 `user_id`는 이벤트 파라미터나 커스텀 디멘션으로 별도 등록하지 않습니다.

## 7. 확인 방법

1. 로컬에서 앱 실행
2. GA4 `Admin > DebugView` 또는 `Reports > Realtime` 열기
3. 랜딩 진입, 스크롤, CTA 클릭, 목표 입력, 베타 제출 흐름 테스트
4. 이벤트 파라미터가 기대대로 들어오는지 확인

## 8. 참고 문서

- [Send user IDs](https://developers.google.com/analytics/devguides/collection/ga4/user-id)
- [Collect data about your users](https://support.google.com/analytics/answer/12370404?hl=en)
- [Reporting identity](https://support.google.com/analytics/answer/10976610?hl=en)
- [BigQuery Export](https://support.google.com/analytics/answer/9358801?hl=en)
