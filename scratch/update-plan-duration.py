import os

def update_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    old_snippet = """                {/* Duration */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Duration (Days):</label>
                  <div className="flex items-center gap-1">
                    {[3, 5, 7, 10].map((d) => (
                      <button
                        key={d}
                        onClick={() => setDurationDays(d)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                          durationDays === d
                            ? 'bg-amber-400 text-slate-950 shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {d}D
                      </button>
                    ))}
                  </div>
                </div>"""

    new_snippet = """                {/* Duration */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">Trip Duration:</label>
                    <span className="text-[10px] font-extrabold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                      ✨ AI Recommended
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDurationDays(Math.max(1, durationDays - 1))}
                      className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm flex items-center justify-center transition"
                      aria-label="Decrease duration"
                    >
                      -
                    </button>
                    <div className="flex-1 text-center bg-slate-50 border border-slate-300 py-1.5 rounded-xl font-extrabold text-xs text-slate-900">
                      {durationDays} {durationDays === 1 ? 'Day' : 'Days'}
                    </div>
                    <button
                      type="button"
                      onClick={() => setDurationDays(Math.min(30, durationDays + 1))}
                      className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm flex items-center justify-center transition"
                      aria-label="Increase duration"
                    >
                      +
                    </button>
                  </div>
                </div>"""

    # Handle CRLF vs LF
    norm_content = content.replace('\r\n', '\n')
    norm_old = old_snippet.replace('\r\n', '\n')
    norm_new = new_snippet.replace('\r\n', '\n')

    if norm_old in norm_content:
        norm_content = norm_content.replace(norm_old, norm_new, 1)
        if '\r\n' in content:
            norm_content = norm_content.replace('\n', '\r\n')
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(norm_content)
        print(f"Successfully updated {filepath}")
    else:
        print(f"Snippet not found in {filepath}")

update_file('app/(customer)/plan/page.tsx')
if os.path.exists('18_DEVELOPMENT/Frontend/app/(customer)/plan/page.tsx'):
    update_file('18_DEVELOPMENT/Frontend/app/(customer)/plan/page.tsx')

