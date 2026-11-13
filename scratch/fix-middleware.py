with open('middleware.ts', 'r', encoding='utf-8') as f:
    c = f.read()

old = """export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || request.nextUrl.hostname;

  const host = (request.headers.get('host') || request.nextUrl.hostname || '').replace(/:\d+$/, '').toLowerCase();"""

new = """export function middleware(request: NextRequest) {
  const host = (request.headers.get('host') || request.nextUrl.hostname || '').replace(/:\d+$/, '').toLowerCase();"""

assert old in c, "old block not found in middleware.ts"
c = c.replace(old, new)
with open('middleware.ts', 'w', encoding='utf-8') as f:
    f.write(c)

print("Cleaned up middleware.ts duplicate host declaration.")

