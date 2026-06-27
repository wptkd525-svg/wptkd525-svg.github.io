# WorkOut — 맞춤 운동 계획 AI Agent

헬스장 기구 설문 → 부위별 운동 루틴 → AI 코치 채팅으로 루틴 수정까지 지원하는 웹 앱입니다.

## 채점 / 데모 (배포 URL)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fwptkd525-svg%2Fwptkd525-svg.github.io&env=TURSO_DATABASE_URL,TURSO_AUTH_TOKEN,OPENAI_API_KEY&envDescription=Turso%20DB%20%2B%20OpenAI%20(%EC%83%81%EC%84%B8%EB%8A%94%20DEPLOY.md)&project-name=workout-app)

별도 설치 없이 배포 URL에서 확인할 수 있습니다.

1. 기구 설문 완료
2. 운동 부위 선택 → **운동 루틴 생성**
3. **운동 코치** 채팅에서 루틴 수정 요청

- **저장소:** https://github.com/wptkd525-svg/wptkd525-svg.github.io
- **배포 URL:** _(Vercel 연결 후 `https://xxxx.vercel.app` — [Vercel 대시보드](https://vercel.com)에서 Import)_

> 이 앱은 API·DB·AI가 필요해 **GitHub Pages만으로는 동작하지 않습니다.**  
> GitHub에 코드를 올린 뒤 **Vercel**에서 이 저장소를 Import하고 환경 변수를 설정하세요.

---

## 로컬 실행

```bash
npm install
cp .env.example .env   # Windows: copy .env.example .env
```

`.env` 파일 설정:

```env
DATABASE_URL="file:./dev.db"
OPENAI_API_KEY="your-openai-api-key"
```

DB 마이그레이션 및 실행:

```bash
npm run db:migrate:dev
npm run dev
```

브라우저: http://localhost:3000

---

## Vercel + Turso 배포 (과제 제출용)

### 1. Turso DB 생성

[Turso](https://turso.tech) 가입 후 CLI 설치:

```bash
# Windows (scoop) 또는 https://docs.turso.tech/cli 참고
turso auth login
turso db create workout-app
turso db tokens create workout-app
turso db show workout-app --url
```

### 2. Turso에 마이그레이션 적용

`.env`에 Turso 정보를 임시로 넣고:

```env
TURSO_DATABASE_URL="libsql://....turso.io"
TURSO_AUTH_TOKEN="...."
```

```bash
npm run db:migrate
```

### 3. GitHub → Vercel 연결

1. GitHub에 코드 push
2. [Vercel](https://vercel.com)에서 Import Project
3. **Environment Variables** 추가:

| 변수 | 값 |
|------|-----|
| `TURSO_DATABASE_URL` | Turso DB URL (`libsql://...`) |
| `TURSO_AUTH_TOKEN` | Turso auth token |
| `OPENAI_API_KEY` | OpenAI API 키 |

4. Deploy

> `TURSO_*` 변수가 있으면 자동으로 Turso를 사용합니다.  
> 로컬에서는 `TURSO_*` 없이 `DATABASE_URL=file:./dev.db`만으로 SQLite 파일 DB를 씁니다.

---

## 기술 스택

- Next.js 16, TypeScript, Tailwind, shadcn/ui
- Prisma + SQLite (로컬) / Turso (배포)
- OpenAI tool-calling agent

## 주요 경로

| 경로 | 설명 |
|------|------|
| `/survey` | 헬스장 기구 설문 |
| `/workout` | 운동 부위 선택 + AI 코치 |
