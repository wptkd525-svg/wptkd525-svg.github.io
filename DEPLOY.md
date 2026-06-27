# Vercel 배포 (5분)

이 프로젝트는 Next.js API + Turso DB + OpenAI를 사용합니다. **GitHub Pages 정적 호스팅으로는 실행할 수 없습니다.**

## 1. GitHub

코드는 다음 저장소에 있습니다:

https://github.com/wptkd525-svg/wptkd525-svg.github.io

## 2. Turso DB (무료)

1. https://turso.tech 가입
2. 대시보드에서 DB 생성 (이름 예: `workout-app`)
3. **Database URL** (`libsql://...`) 과 **Auth Token** 복사

로컬에서 한 번만 마이그레이션:

```bash
# .env에 추가
TURSO_DATABASE_URL="libsql://...."
TURSO_AUTH_TOKEN="...."

npm run db:migrate
```

## 3. Vercel

1. https://vercel.com 로그인 (GitHub 연동)
2. **Add New Project** → `wptkd525-svg.github.io` 저장소 Import
3. **Environment Variables** 추가:

| Name | Value |
|------|--------|
| `TURSO_DATABASE_URL` | Turso libsql URL (`libsql://...`) |
| `TURSO_AUTH_TOKEN` | Turso token |
| `OPENAI_API_KEY` | OpenAI API 키 |

> **`DATABASE_URL`은 Vercel에 넣지 마세요.** `libsql://`를 넣으면 빌드가 실패합니다(P1013).

4. **Deploy** 클릭
5. 완료 후 `https://프로젝트명.vercel.app` 이 채점용 URL

### Vercel 빌드 설정 확인 (P1013 / 예전 빌드 스크립트)

빌드 로그에 `prisma migrate deploy`가 보이면 **예전 코드**로 빌드 중입니다.  
최신 빌드는 `node scripts/turso-migrate.mjs`를 사용해야 합니다.

1. Vercel → **Settings** → **General** → **Build & Development Settings**
2. **Build Command** → **Override 끄기** (또는 비우고 Default 사용)
3. **Production Branch** = `main`
4. **Git Repository** = `wptkd525-svg/wptkd525-svg.github.io`
5. **Deployments** → 최신 커밋 `Harden Vercel deploy...` 로 **Redeploy**

환경 변수: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `OPENAI_API_KEY`만 설정. **`DATABASE_URL`은 넣지 마세요.**

## 4. 과제 제출

- GitHub 링크 + Vercel 배포 URL 함께 제출
