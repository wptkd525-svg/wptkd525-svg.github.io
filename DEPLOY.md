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

## 4. 과제 제출

- GitHub 링크 + Vercel 배포 URL 함께 제출
