"use client";

import { useState, useEffect } from "react";
import { Loader2, Wand2, Save, Eye, EyeOff, LogOut, Lock, List, Zap, CheckCircle, XCircle } from "lucide-react";

type ContentType = "product" | "comparison" | "guide" | "best" | "faq";

const TYPE_LABELS: Record<ContentType, string> = {
  product: "产品描述",
  comparison: "产品对比",
  guide: "行业指南",
  best: "推荐榜单",
  faq: "FAQ问答",
};

// ==================== 登录页 ====================
export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/auth").then(res => {
      setAuthenticated(res.ok);
    }).catch(() => setAuthenticated(false));
  }, []);

  const login = async () => {
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: loginPassword }),
      });
      setAuthenticated(res.ok);
      if (!res.ok) { const d = await res.json(); setLoginError(d.error || "密码错误"); }
    } catch { setLoginError("网络错误"); }
    finally { setLoginLoading(false); }
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthenticated(false);
  };

  if (authenticated === null) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }
  if (!authenticated) {
    return <LoginPage password={loginPassword} setPassword={setLoginPassword} error={loginError} loading={loginLoading} onSubmit={login} />;
  }
  return <AdminPanel onLogout={logout} />;
}

function LoginPage({ password, setPassword, error, loading, onSubmit }: any) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-xl border border-gray-200 p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">AooBee 管理后台</h1>
          <p className="text-sm text-gray-500 mt-1">请输入管理密码</p>
        </div>
        {error && <div className="mb-4 px-3 py-2 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">{error}</div>}
        <form onSubmit={e => { e.preventDefault(); onSubmit(); }}>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="输入管理密码"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent mb-4" autoFocus />
          <button type="submit" disabled={loading || !password}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50 transition-colors">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> 验证中...</> : <><Lock className="w-4 h-4" /> 登录</>}
          </button>
        </form>
        <p className="text-center text-xs text-gray-400 mt-6"><a href="/" className="hover:text-primary">← 返回前台</a></p>
      </div>
    </div>
  );
}

// ==================== 管理后台主界面 ====================
function AdminPanel({ onLogout }: { onLogout: () => void }) {
  const [mode, setMode] = useState<"single" | "batch">("single");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">AooBee 管理后台</h1>
            <p className="text-sm text-gray-500">使用 LLM 生成 GEO-SEO 优化内容</p>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" className="text-sm text-primary hover:underline">← 前台</a>
            <button onClick={onLogout} className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500">
              <LogOut className="w-3.5 h-3.5" /> 退出
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* 模式切换 */}
        <div className="flex gap-2 mb-8">
          <button onClick={() => setMode("single")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              mode === "single" ? "bg-primary text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-primary"
            }`}>
            <Wand2 className="w-4 h-4" /> 单条生成
          </button>
          <button onClick={() => setMode("batch")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              mode === "batch" ? "bg-primary text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-primary"
            }`}>
            <List className="w-4 h-4" /> 批量生成
          </button>
        </div>

        {mode === "single" ? <SingleGenerate /> : <BatchGenerate />}
      </main>
    </div>
  );
}

// ==================== 单条生成 ====================
function SingleGenerate() {
  const [type, setType] = useState<ContentType>("product");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ name: "", category: "", url: "", company: "", productA: "", productB: "", topic: "", keywords: "", keyword: "" });
  const update = (f: string, v: string) => setForm({ ...form, [f]: v });

  const generate = async () => {
    setLoading(true); setResult(null); setMessage("");
    try {
      const body: Record<string, any> = { type };
      if (type === "product") Object.assign(body, { name: form.name, category: form.category, url: form.url, company: form.company });
      else if (type === "comparison") Object.assign(body, { productA: form.productA, productB: form.productB, category: form.category });
      else if (type === "guide") Object.assign(body, { category: form.category, topic: form.topic, keywords: form.keywords.split(",").map(k => k.trim()).filter(Boolean) });
      else if (type === "best") Object.assign(body, { keyword: form.keyword, category: form.category });
      else if (type === "faq") Object.assign(body, { topic: form.topic });

      const res = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) setMessage("❌ 生成失败: " + (data.error || "未知错误"));
      else { setResult(data.result); setShowPreview(true); setMessage("✅ 内容生成成功！"); }
    } catch (e: any) { setMessage("❌ 请求失败: " + e.message); }
    finally { setLoading(false); }
  };

  const saveToDb = async () => {
    if (!result) return;
    setSaving(true); setMessage("");
    try {
      const body: Record<string, any> = { type, data: result };
      if (type === "product") body.categoryName = form.category;
      const res = await fetch("/api/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) setMessage("❌ 保存失败: " + (data.error || "未知错误"));
      else setMessage("✅ 已保存！" + (data.url ? ` 前台地址: ${data.url}` : ""));
    } catch (e: any) { setMessage("❌ 保存失败: " + e.message); }
    finally { setSaving(false); }
  };

  return (
    <>
      {message && <Message text={message} />}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">生成内容</h2>
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">内容类型</label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(TYPE_LABELS) as ContentType[]).map(t => (
                <button key={t} onClick={() => { setType(t); setResult(null); }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${type === t ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{TYPE_LABELS[t]}</button>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            {type === "product" && (<>
              <Field label="产品名称 *" value={form.name} onChange={v => update("name", v)} placeholder="如：ChatGPT" />
              <Field label="所属行业 *" value={form.category} onChange={v => update("category", v)} placeholder="如：人工智能" />
              <Field label="官网地址" value={form.url} onChange={v => update("url", v)} placeholder="如：https://chat.openai.com" />
              <Field label="公司名称" value={form.company} onChange={v => update("company", v)} placeholder="如：OpenAI" />
            </>)}
            {type === "comparison" && (<>
              <Field label="产品A *" value={form.productA} onChange={v => update("productA", v)} placeholder="如：ChatGPT" />
              <Field label="产品B *" value={form.productB} onChange={v => update("productB", v)} placeholder="如：Claude" />
              <Field label="所属行业" value={form.category} onChange={v => update("category", v)} placeholder="如：人工智能" />
            </>)}
            {type === "guide" && (<>
              <Field label="所属行业 *" value={form.category} onChange={v => update("category", v)} placeholder="如：人工智能" />
              <Field label="指南主题 *" value={form.topic} onChange={v => update("topic", v)} placeholder="如：如何选择AI写作工具" />
              <Field label="目标关键词" value={form.keywords} onChange={v => update("keywords", v)} placeholder="用逗号分隔" />
            </>)}
            {type === "best" && (<>
              <Field label="推荐关键词 *" value={form.keyword} onChange={v => update("keyword", v)} placeholder="如：AI写作工具" />
              <Field label="所属行业" value={form.category} onChange={v => update("category", v)} placeholder="如：人工智能" />
            </>)}
            {type === "faq" && <Field label="FAQ主题 *" value={form.topic} onChange={v => update("topic", v)} placeholder="如：人工智能" />}
          </div>
          <button onClick={generate} disabled={loading}
            className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50 transition-colors">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> 正在生成...</> : <><Wand2 className="w-4 h-4" /> 生成内容</>}
          </button>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">生成结果</h2>
            {result && (
              <div className="flex gap-2">
                <button onClick={() => setShowPreview(!showPreview)} className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-primary border border-gray-200 rounded-lg">
                  {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />} {showPreview ? "JSON" : "预览"}
                </button>
                <button onClick={saveToDb} disabled={saving} className="flex items-center gap-1 px-4 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} {saving ? "保存中..." : "保存入库"}
                </button>
              </div>
            )}
          </div>
          {!result ? (
            <div className="flex items-center justify-center h-64 text-gray-400"><p>生成内容后在此预览</p></div>
          ) : showPreview ? (
            <PreviewContent data={result} type={type} />
          ) : (
            <pre className="bg-gray-50 rounded-lg p-4 text-xs text-gray-700 overflow-auto max-h-[500px]">{JSON.stringify(result, null, 2)}</pre>
          )}
        </div>
      </div>
    </>
  );
}

// ==================== 批量生成 ====================
function BatchGenerate() {
  const [type, setType] = useState<ContentType>("best");
  const [category, setCategory] = useState("");
  const [keywordsText, setKeywordsText] = useState("");
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<Array<{ keyword: string; status: "pending" | "running" | "done" | "error"; message?: string }>>([]);
  const [message, setMessage] = useState("");

  const startBatch = async () => {
    const keywords = keywordsText.split("\n").map(k => k.trim()).filter(Boolean);
    if (keywords.length === 0) { setMessage("❌ 请输入至少一个关键词"); return; }
    if (!category.trim()) { setMessage("❌ 请输入行业分类"); return; }

    setRunning(true);
    setMessage("");
    setResults(keywords.map(kw => ({ keyword: kw, status: "pending" })));

    for (let i = 0; i < keywords.length; i++) {
      const keyword = keywords[i];
      setResults(prev => prev.map((r, idx) => idx === i ? { ...r, status: "running" } : r));

      try {
        // 第一步：生成内容
        const genBody: Record<string, any> = { type, category: category.trim() };
        if (type === "product") genBody.name = keyword;
        else if (type === "comparison") {
          const parts = keyword.includes(" vs ") ? keyword.split(" vs ") : keyword.includes("VS") ? keyword.split("VS") : [keyword, "竞品"];
          genBody.productA = parts[0].trim();
          genBody.productB = parts[1]?.trim() || "竞品";
        }
        else if (type === "guide") { genBody.topic = keyword; genBody.keywords = [keyword]; }
        else if (type === "best") genBody.keyword = keyword;
        else if (type === "faq") genBody.topic = keyword;

        const genRes = await fetch("/api/generate", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(genBody),
        });
        const genData = await genRes.json();
        if (!genRes.ok) throw new Error(genData.error || "生成失败");

        // 第二步：保存入库
        const saveBody: Record<string, any> = { type, data: genData.result, categoryName: category.trim() };
        const saveRes = await fetch("/api/save", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(saveBody),
        });
        const saveData = await saveRes.json();
        if (!saveRes.ok) throw new Error(saveData.error || "保存失败");

        setResults(prev => prev.map((r, idx) => idx === i ? { ...r, status: "done", message: saveData.url || "已保存" } : r));
      } catch (e: any) {
        setResults(prev => prev.map((r, idx) => idx === i ? { ...r, status: "error", message: e.message } : r));
      }

      // 间隔 2 秒避免限流
      if (i < keywords.length - 1) await new Promise(r => setTimeout(r, 2000));
    }

    setRunning(false);
    const done = results.filter(r => r.status === "done").length;
    setMessage(`✅ 批量生成完成！成功 ${done}/${keywords.length} 条`);
  };

  const doneCount = results.filter(r => r.status === "done").length;
  const errorCount = results.filter(r => r.status === "error").length;

  return (
    <>
      {message && <Message text={message} />}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 左侧：批量配置 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">批量生成</h2>
          <p className="text-sm text-gray-500 mb-6">输入关键词列表（一行一个），选择类型和行业，一键批量生成入库</p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">内容类型</label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(TYPE_LABELS) as ContentType[]).map(t => (
                <button key={t} onClick={() => !running && setType(t)} disabled={running}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${type === t ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{TYPE_LABELS[t]}</button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <Field label="所属行业 *" value={category} onChange={setCategory} placeholder="如：装修" />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">关键词列表（一行一个）*</label>
            <textarea value={keywordsText} onChange={e => setKeywordsText(e.target.value)} rows={10} disabled={running}
              placeholder={`全屋定制\n装修公司\n装修预算\n装修材料选购\n装修避坑指南`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 font-mono" />
            <p className="text-xs text-gray-400 mt-1">
              {type === "comparison" ? "对比类型：输入「产品A vs 产品B」格式" : "每行一个关键词/主题"}
            </p>
          </div>

          <button onClick={startBatch} disabled={running || !keywordsText.trim() || !category.trim()}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50 transition-colors">
            {running ? <><Loader2 className="w-4 h-4 animate-spin" /> 生成中 ({doneCount + errorCount}/{results.length})...</>
                      : <><Zap className="w-4 h-4" /> 开始批量生成</>}
          </button>
        </div>

        {/* 右侧：进度和结果 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">生成进度</h2>
            {results.length > 0 && (
              <div className="flex gap-3 text-sm">
                <span className="text-green-600">✅ {doneCount}</span>
                <span className="text-red-500">❌ {errorCount}</span>
                <span className="text-gray-400">⏳ {results.length - doneCount - errorCount}</span>
              </div>
            )}
          </div>

          {results.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-400">
              <div className="text-center">
                <List className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p>输入关键词后点击「开始批量生成」</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-auto">
              {results.map((r, i) => (
                <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm ${
                  r.status === "done" ? "bg-green-50 border border-green-200" :
                  r.status === "error" ? "bg-red-50 border border-red-200" :
                  r.status === "running" ? "bg-blue-50 border border-blue-200" :
                  "bg-gray-50 border border-gray-200"
                }`}>
                  <span className="shrink-0">
                    {r.status === "done" && <CheckCircle className="w-4 h-4 text-green-500" />}
                    {r.status === "error" && <XCircle className="w-4 h-4 text-red-500" />}
                    {r.status === "running" && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
                    {r.status === "pending" && <span className="w-4 h-4 block rounded-full border-2 border-gray-300" />}
                  </span>
                  <span className="font-medium text-gray-900 flex-1">{r.keyword}</span>
                  {r.message && <span className={`text-xs ${r.status === "error" ? "text-red-500" : "text-green-600"}`}>{r.message}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ==================== 通用组件 ====================
function Message({ text }: { text: string }) {
  return (
    <div className={`mb-6 px-4 py-3 rounded-lg text-sm ${
      text.startsWith("✅") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
    }`}>{text}</div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent" />
    </div>
  );
}

function PreviewContent({ data, type }: { data: any; type: ContentType }) {
  if (type === "product") {
    return (
      <div className="space-y-4 text-sm max-h-[500px] overflow-auto">
        <div><strong>简介：</strong><p className="text-gray-600 mt-1">{data.description}</p></div>
        {data.longDesc && <div><strong>详细介绍：</strong><p className="text-gray-600 mt-1 whitespace-pre-wrap">{data.longDesc}</p></div>}
        {data.features && <div><strong>功能特性：</strong><ul className="mt-1 space-y-1">{data.features.map((f: any, i: number) => <li key={i} className="text-gray-600">• {f.name}: {f.description}</li>)}</ul></div>}
        {data.pros && <div><strong>优点：</strong><ul className="mt-1">{data.pros.map((p: string, i: number) => <li key={i} className="text-green-600">✓ {p}</li>)}</ul></div>}
        {data.cons && <div><strong>缺点：</strong><ul className="mt-1">{data.cons.map((c: string, i: number) => <li key={i} className="text-red-500">✗ {c}</li>)}</ul></div>}
      </div>
    );
  }
  return (
    <div className="space-y-4 text-sm max-h-[500px] overflow-auto">
      <div><strong>标题：</strong><p className="text-gray-600 mt-1">{data.title}</p></div>
      {data.excerpt && <div><strong>摘要：</strong><p className="text-gray-600 mt-1">{data.excerpt}</p></div>}
      {data.content && <div><strong>正文：</strong><div className="mt-1 text-gray-600 whitespace-pre-wrap bg-gray-50 rounded p-3">{data.content}</div></div>}
    </div>
  );
}
