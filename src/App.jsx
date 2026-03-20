import { useState, useEffect, useRef, useCallback } from "react";

const C = {
  bg: "#0F172A", bgMid: "#1E293B", card: "#334155", dark: "#0d1117",
  primary: "#D97706", accent: "#F59E0B", teal: "#0891B2", success: "#10B981",
  danger: "#EF4444", purple: "#7C3AED", text: "#F1F5F9", muted: "#94A3B8",
  white: "#FFFFFF", highlight: "#1a2744"
};

// Placeholder text for preview - replace with real commands before deploying
const CMDS = {
  scaffold: `cd frontend && npm create [build-tool]@6 . -- --template react-ts && npm install && cd ..`,
  twInstall: `npm install -D tailwindcss [tailwind-plugin]`,
  viteConfig: `# Configurar build tool config (ver guía descargable para comandos exactos)`,
  cssImport: `echo '@import "tailwindcss";' > src/index.css`,
};

const useInView = (threshold = 0.15) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.unobserve(el); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
};

const FadeIn = ({ children, delay = 0, direction = "up", className = "" }) => {
  const [ref, inView] = useInView();
  const dirs = { up: "translateY(40px)", down: "translateY(-40px)", left: "translateX(40px)", right: "translateX(-40px)", none: "none" };
  return (
    <div ref={ref} className={className} style={{
      opacity: inView ? 1 : 0, transform: inView ? "none" : dirs[direction],
      transition: `all 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`
    }}>{children}</div>
  );
};

const Counter = ({ end, suffix = "", duration = 2000 }) => {
  const [ref, inView] = useInView();
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0; const step = end / (duration / 16);
    const timer = setInterval(() => { start += step; if (start >= end) { setCount(end); clearInterval(timer); } else setCount(Math.round(start * 10) / 10); }, 16);
    return () => clearInterval(timer);
  }, [inView, end, duration]);
  return <span ref={ref}>{count}{suffix}</span>;
};

const CodeBlock = ({ children, delay = 0 }) => (
  <FadeIn delay={delay}>
    <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid #2a2a3e", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
      <div style={{ background: "#1a1a2e", padding: "10px 16px", display: "flex", gap: 8, borderBottom: "1px solid #2a2a3e" }}>
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57" }} />
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#febc2e" }} />
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840" }} />
      </div>
      <pre style={{ background: "#12121e", padding: "16px 20px", fontSize: 13, lineHeight: 1.8, overflowX: "auto", fontFamily: "'JetBrains Mono', 'Fira Code', monospace", margin: 0, color: "#e2e8f0" }}>
        <code>{children}</code>
      </pre>
    </div>
  </FadeIn>
);

const CopyBlock = ({ children, label }) => {
  const [copied, setCopied] = useState(false);
  const textRef = useRef(null);
  const copy = () => {
    const text = typeof children === 'string' ? children : textRef.current?.innerText || '';
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }).catch(() => fallbackCopy(text));
    } else { fallbackCopy(text); }
  };
  const fallbackCopy = (text) => {
    const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch(e) {}
    document.body.removeChild(ta);
  };
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <div style={{ fontSize: 11, color: C.muted, marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>}
      <div style={{ borderRadius: 10, overflow: "hidden", border: `1px solid #2a2a3e`, boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
        {/* macOS title bar */}
        <div style={{ background: "#1a1a2e", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #2a2a3e" }}>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#febc2e" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840" }} />
          </div>
          <button onClick={copy} style={{ background: copied ? "#28c84033" : "#ffffff11", border: `1px solid ${copied ? "#28c840" : "#ffffff22"}`, borderRadius: 6, padding: "4px 14px", cursor: "pointer", fontSize: 11, color: copied ? "#28c840" : "#888", fontWeight: 600, transition: "all 0.2s", fontFamily: "'DM Sans', sans-serif" }}>
            {copied ? "✓ Copiado" : "Copiar"}
          </button>
        </div>
        {/* Code content */}
        <pre ref={textRef} style={{ background: "#12121e", padding: "16px 20px", fontSize: 13, lineHeight: 1.8, overflowX: "auto", fontFamily: "'JetBrains Mono', 'Fira Code', monospace", whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0, color: "#e2e8f0" }}>
          <code>{children}</code>
        </pre>
      </div>
    </div>
  );
};

const StepBadge = ({ icon, label, color = C.primary }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${color}18`, color, padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, border: `1px solid ${color}33` }}>
    {icon} {label}
  </span>
);

const GuideStep = ({ number, title, badge, badgeColor, children }) => (
  <FadeIn>
    <div style={{ marginBottom: 40, paddingLeft: 24, borderLeft: `3px solid ${badgeColor || C.primary}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
        <span style={{ background: C.primary, color: C.bg, width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800 }}>{number}</span>
        <h3 style={{ color: C.white, fontSize: 18, fontWeight: 700, margin: 0 }}>{title}</h3>
        {badge && <StepBadge icon={badge.icon} label={badge.label} color={badgeColor} />}
      </div>
      {children}
    </div>
  </FadeIn>
);

const Badge = ({ children, color = C.primary }) => (
  <span style={{ background: `${color}22`, color, padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{children}</span>
);

const SectionTitle = ({ icon, children, sub }) => (
  <div style={{ marginBottom: 48 }}>
    <FadeIn>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
        {icon && <span style={{ fontSize: 32 }}>{icon}</span>}
        <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, color: C.white, margin: 0, letterSpacing: "-0.02em" }}>{children}</h2>
      </div>
    </FadeIn>
    {sub && <FadeIn delay={0.15}><p style={{ fontSize: 16, color: C.muted, maxWidth: 720, lineHeight: 1.7, margin: 0 }}>{sub}</p></FadeIn>}
  </div>
);

const Card = ({ children, accent, delay = 0, style = {} }) => (
  <FadeIn delay={delay}>
    <div style={{ background: C.card, borderRadius: 12, padding: 24, borderLeft: accent ? `4px solid ${accent}` : "none", position: "relative", overflow: "hidden", ...style }}>
      {children}
    </div>
  </FadeIn>
);

const nav = [
  { id: "hero", label: "Inicio" }, { id: "what", label: "¿Qué es?" }, { id: "arch", label: "Arquitectura" },
  { id: "context", label: "Contexto" }, { id: "claude-md", label: "CLAUDE.md" }, { id: "skills", label: "Skills" },
  { id: "mcp", label: "MCP" }, { id: "hooks", label: "Hooks" }, { id: "features", label: "Features" },
  { id: "plugins", label: "Plugins" }, { id: "costs", label: "Costos" }, { id: "patterns", label: "Patrones" },
  { id: "bench", label: "Benchmarks" }, { id: "privacy", label: "Privacidad" }, { id: "best", label: "Prácticas" },
  { id: "close", label: "Cierre" }, { id: "demo", label: "Live Demo" }, { id: "guide", label: "Guía" }
];

const Section = ({ id, children, style = {}, hero = false }) => (
  <section id={id} style={{ minHeight: hero ? "100vh" : "auto", padding: hero ? "100px max(24px, 5vw)" : "80px max(24px, 5vw)", display: "flex", flexDirection: "column", justifyContent: hero ? "center" : "flex-start", position: "relative", ...style }}>
    <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%" }}>{children}</div>
  </section>
);

const Divider = ({ accent = C.primary }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0 max(24px, 5vw)" }}>
    <div style={{ maxWidth: 1200, width: "100%", height: 1, background: `linear-gradient(90deg, transparent, ${accent}33, transparent)` }} />
  </div>
);

export default function App() {
  const [active, setActive] = useState("hero");
  const [showGuide, setShowGuide] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const targetRef = useRef("hero");
  const isScrolling = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      if (isScrolling.current) return;
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible.length > 0) {
        const id = visible[0].target.id;
        setActive(id);
        targetRef.current = id;
      }
    }, { threshold: [0.3, 0.5, 0.7] });
    nav.forEach(n => { const el = document.getElementById(n.id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  const scrollTo = useCallback((id) => {
    isScrolling.current = true;
    targetRef.current = id;
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
    setTimeout(() => { isScrolling.current = false; }, 800);
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key !== "ArrowDown" && e.key !== "ArrowRight" && e.key !== "ArrowUp" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      if (isScrolling.current) return;
      const ids = nav.map(n => n.id);
      const idx = ids.indexOf(targetRef.current);
      if ((e.key === "ArrowDown" || e.key === "ArrowRight") && idx < ids.length - 1) scrollTo(ids[idx + 1]);
      if ((e.key === "ArrowUp" || e.key === "ArrowLeft") && idx > 0) scrollTo(ids[idx - 1]);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [scrollTo]);

  return (
    <div style={{ background: C.bg, color: C.text, fontFamily: "'DM Sans', 'Segoe UI', sans-serif", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { overflow-x: hidden; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: ${C.primary}44; border-radius: 3px; }
        ::selection { background: ${C.primary}44; }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes pulse { 0%,100% { opacity: 0.4; } 50% { opacity: 0.8; } }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes gradientMove { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .glow { box-shadow: 0 0 40px ${C.primary}22; }
        .bar-animate { transition: width 1.5s cubic-bezier(0.16, 1, 0.3, 1); }
        .nav-dot { transition: all 0.3s ease; }
        .nav-dot:hover { transform: scale(1.5); }
        .card-hover { transition: all 0.3s ease; }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.3); }
        .grid-stretch > * { height: 100%; }
        .grid-stretch > * > * { height: 100%; }
      `}</style>

      {/* Navigation dots */}
      <nav style={{ position: "fixed", right: 20, top: "50%", transform: "translateY(-50%)", zIndex: 100, display: "flex", flexDirection: "column", gap: 8 }}>
        {nav.map(n => (
          <button key={n.id} onClick={() => scrollTo(n.id)} className="nav-dot" title={n.label}
            style={{ width: active === n.id ? 12 : 8, height: active === n.id ? 12 : 8, borderRadius: "50%", border: "none", cursor: "pointer",
              background: active === n.id ? C.primary : `${C.muted}44`, transition: "all 0.3s" }} />
        ))}
      </nav>

      {/* Top bar */}
      <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 90, padding: "12px 32px", display: "flex", justifyContent: "space-between", alignItems: "center",
        background: `${C.bg}dd`, backdropFilter: "blur(12px)", borderBottom: `1px solid ${C.card}22` }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: C.primary, fontWeight: 600 }}>{">"}_claude_code_101</span>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <button onClick={() => scrollTo("demo")} style={{ background: `${C.primary}22`, color: C.primary, border: `1px solid ${C.primary}44`, padding: "6px 16px", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            Live Demo →
          </button>
          <button onClick={() => scrollTo("guide")} style={{ background: `${C.success}22`, color: C.success, border: `1px solid ${C.success}44`, padding: "6px 16px", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            Guía Paso a Paso
          </button>
        </div>
      </header>

      {/* ═══ HERO ═══ */}
      <Section id="hero" hero={true} style={{ display: "flex", alignItems: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 30% 40%, ${C.primary}11 0%, transparent 60%), radial-gradient(circle at 80% 70%, ${C.teal}08 0%, transparent 50%)` }} />
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: `linear-gradient(to bottom, ${C.primary}, ${C.teal})` }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <FadeIn><Badge>Workshop · JavaScript Chapter · Accenture Chile</Badge></FadeIn>
          <FadeIn delay={0.2}>
            <h1 style={{ fontSize: "clamp(48px, 8vw, 96px)", fontWeight: 800, lineHeight: 1.05, margin: "24px 0 16px", letterSpacing: "-0.03em" }}>
              Claude Code
            </h1>
          </FadeIn>
          <FadeIn delay={0.35}>
            <p style={{ fontSize: "clamp(20px, 3vw, 32px)", color: C.accent, fontWeight: 500, marginBottom: 32 }}>
              Herramientas y Extensiones para Empezar
            </p>
          </FadeIn>
          <FadeIn delay={0.5}>
            <p style={{ fontSize: 16, color: C.muted, maxWidth: 560, lineHeight: 1.7 }}>
              Descubre cómo las extensiones de Claude Code transforman tu flujo de desarrollo.
              De Skills a Hooks, de MCP a Subagents — todo lo que necesitas para empezar.
            </p>
          </FadeIn>
          <FadeIn delay={0.65}>
            <div style={{ display: "flex", gap: 16, marginTop: 40, flexWrap: "wrap" }}>
              <button onClick={() => scrollTo("what")} style={{ background: C.primary, color: C.bg, border: "none", padding: "14px 32px", borderRadius: 8, fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
                Comenzar ↓
              </button>
              <button onClick={() => scrollTo("demo")} style={{ background: "transparent", color: C.primary, border: `2px solid ${C.primary}`, padding: "14px 32px", borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: "pointer" }}>
                Ir al Live Demo
              </button>
            </div>
          </FadeIn>
        </div>
      </Section>
      <Divider />

      {/* ═══ WHAT IS CLAUDE CODE ═══ */}
      <Section id="what">
        <SectionTitle icon="⌨️" sub="Una herramienta de desarrollo agéntico. Lee tu codebase completo, edita archivos, ejecuta comandos e integra con tus herramientas de desarrollo. Disponible en terminal, IDE, desktop app y browser.">
          ¿Qué es Claude Code?
        </SectionTitle>
        <div className="grid-stretch" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, marginBottom: 48 }}>
          {[{ icon: "🔍", title: "Recopilar Contexto", desc: "Lee archivos, busca en el repo, analiza dependencias", color: C.teal },
            { icon: "⚡", title: "Ejecutar Acción", desc: "Edita código, ejecuta comandos, crea archivos", color: C.accent },
            { icon: "✓", title: "Verificar Resultados", desc: "Corre tests, valida builds, verifica el output", color: C.success }
          ].map((p, i) => (
            <Card key={i} delay={i * 0.15} style={{ borderTop: `3px solid ${p.color}`, textAlign: "center", padding: 32 }}>
              <div style={{ fontSize: 40, marginBottom: 16, animation: "float 3s ease-in-out infinite", animationDelay: `${i * 0.3}s` }}>{p.icon}</div>
              <h3 style={{ color: C.white, fontSize: 18, marginBottom: 8, fontWeight: 700 }}>{p.title}</h3>
              <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.6 }}>{p.desc}</p>
            </Card>
          ))}
        </div>
        <FadeIn delay={0.5}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            {["Terminal", "Desktop App", "VS Code / JetBrains", "claude.ai/code", "Slack", "CI/CD"].map((iface, i) => (
              <span key={i} style={{ background: C.dark, padding: "8px 16px", borderRadius: 6, fontSize: 13, color: C.accent, fontFamily: "'JetBrains Mono', monospace", border: `1px solid ${C.card}` }}>
                {iface}
              </span>
            ))}
          </div>
        </FadeIn>
      </Section>
      <Divider />

      {/* ═══ ARCHITECTURE ═══ */}
      <Section id="arch">
        <SectionTitle icon="🚀" sub="Las herramientas integradas son la base. Las extensiones forman capas encima del bucle agéntico principal.">
          Arquitectura: Bucle Agéntico + Extensiones
        </SectionTitle>
        <FadeIn>
          <div style={{ background: C.dark, borderRadius: 12, padding: 32, border: `1px solid ${C.card}`, marginBottom: 40 }}>
            <div style={{ textAlign: "center", marginBottom: 16, color: C.primary, fontWeight: 700, fontSize: 14, letterSpacing: 2 }}>BUCLE AGÉNTICO PRINCIPAL</div>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              {[{ label: "Recopilar", color: C.teal }, { label: "Ejecutar", color: C.accent }, { label: "Verificar", color: C.success }].map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ background: C.card, borderTop: `3px solid ${s.color}`, borderRadius: 8, padding: "12px 24px", textAlign: "center" }}>
                    <span style={{ color: s.color, fontWeight: 600, fontSize: 14 }}>{s.label}</span>
                  </div>
                  {i < 2 && <span style={{ color: C.primary, fontSize: 20 }}>→</span>}
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
          {[{ name: "Skills", color: C.purple, what: "Extiende conocimiento", ex: "/fix-issue" },
            { name: "MCP", color: C.teal, what: "Conecta servicios", ex: "GitHub, Jira" },
            { name: "Hooks", color: C.accent, what: "Automatiza flujos", ex: "Auto-lint" },
            { name: "Subagents", color: C.success, what: "Delega tareas", ex: "Ctx aislado" },
            { name: "Plugins", color: C.primary, what: "Empaqueta todo", ex: "Instala + dist." }
          ].map((ext, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className="card-hover" style={{ background: C.card, borderRadius: 10, padding: 20, borderTop: `3px solid ${ext.color}`, cursor: "default" }}>
                <div style={{ color: ext.color, fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{ext.name}</div>
                <div style={{ color: C.text, fontSize: 13, marginBottom: 8 }}>{ext.what}</div>
                <code style={{ fontSize: 11, color: ext.color, background: C.dark, padding: "4px 8px", borderRadius: 4 }}>{ext.ex}</code>
              </div>
            </FadeIn>
          ))}
        </div>
      </Section>
      <Divider />

      {/* ═══ CONTEXT LOADING ═══ */}
      <Section id="context">
        <SectionTitle icon="📊" sub="Cada feature se carga en un momento diferente de tu sesión. Entender esto es clave para optimizar el uso.">
          Cómo se Cargan las Features en Contexto
        </SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {[{ title: "Session Start", color: C.primary, items: [
              { name: "CLAUDE.md", desc: "Contenido completo, cada solicitud", style: "solid" },
              { name: "MCP Servers", desc: "Tool definitions, cada solicitud", style: "solid" },
              { name: "Skills*", desc: "Descripciones (por defecto)", style: "solid" }
            ]},
            { title: "On Use", color: C.accent, items: [
              { name: "Skills", desc: "Contenido completo al invocar", style: "dashed" }
            ]},
            { title: "Isolated", color: C.success, items: [
              { name: "Subagents", desc: "Contexto fresco, aislado", style: "solid" },
              { name: "Hooks", desc: "Ejecutan externamente, costo cero", style: "solid" }
            ]}
          ].map((col, ci) => (
            <FadeIn key={ci} delay={ci * 0.2}>
              <div>
                <div style={{ color: col.color, fontWeight: 700, fontSize: 16, marginBottom: 8, textAlign: "center", borderBottom: `3px solid ${col.color}`, paddingBottom: 8 }}>{col.title}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
                  {col.items.map((item, ii) => (
                    <div key={ii} style={{ background: C.card, borderRadius: 8, padding: 16, borderLeft: `3px ${item.style} ${col.color}` }}>
                      <div style={{ color: C.white, fontWeight: 600, fontSize: 14 }}>{item.name}</div>
                      <div style={{ color: C.muted, fontSize: 12, marginTop: 4 }}>{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
        <FadeIn delay={0.6}>
          <p style={{ fontSize: 12, color: C.muted, marginTop: 24, fontStyle: "italic" }}>
            *Skills con disable-model-invocation: true no cargan nada hasta que las invoques.
          </p>
        </FadeIn>
      </Section>
      <Divider />

      {/* ═══ CLAUDE.md ═══ */}
      <Section id="claude-md">
        <SectionTitle icon="📄" sub="Archivo markdown inyectado en el system prompt de cada sesión. Define convenciones, comandos y reglas. Se genera con /init.">
          CLAUDE.md — El Cerebro del Proyecto
        </SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
          <CodeBlock>{`# Mi Proyecto Angular

## Tech Stack
- Frontend: Angular 20, Signals
- Backend: NestJS 10, TypeORM
- Testing: Jest, Cypress

## Comandos
- npm start  → Dev server
- npm test   → Unit tests

## Reglas
- NO usar any en TypeScript
- OnPush change detection
- Conventional Commits`}</CodeBlock>
          <div>
            <FadeIn delay={0.2}><h3 style={{ color: C.accent, fontSize: 18, marginBottom: 20, fontWeight: 700 }}>Jerarquía + Rules</h3></FadeIn>
            {[{ path: "~/.claude/CLAUDE.md", desc: "Preferencias globales (estilo, idioma)" },
              { path: "proyecto/CLAUDE.md", desc: "Reglas del proyecto (compartido via git)" },
              { path: ".claude/rules/*.md", desc: "Reglas por path de archivo" }
            ].map((h, i) => (
              <FadeIn key={i} delay={0.3 + i * 0.15}>
                <div style={{ background: C.card, borderRadius: 8, padding: 16, marginBottom: 12 }}>
                  <code style={{ color: C.accent, fontSize: 13 }}>{h.path}</code>
                  <p style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>{h.desc}</p>
                </div>
                {i < 2 && <div style={{ textAlign: "center", color: C.muted, fontSize: 16, margin: "4px 0" }}>▼</div>}
              </FadeIn>
            ))}
            <FadeIn delay={0.8}>
              <div style={{ background: C.highlight, borderRadius: 8, padding: 16, marginTop: 20 }}>
                <p style={{ color: C.accent, fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Pro tip: Claude Code te enseña a usarlo.</p>
                <p style={{ color: C.muted, fontSize: 12 }}>
                  <code style={{ color: C.success }}>/init</code> crea CLAUDE.md · <code style={{ color: C.teal }}>/agents</code> configura subagents · <code style={{ color: C.primary }}>/doctor</code> diagnostica
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </Section>
      <Divider />

      {/* ═══ SKILLS ═══ */}
      <Section id="skills">
        <SectionTitle icon="🧠" sub="Guías en markdown que enseñan a Claude cómo manejar tareas específicas. Invocadas por el usuario o automáticamente.">
          Skills — Comportamientos Enseñables
        </SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
          <CodeBlock>{`---
name: fix-issue
description: Fix a GitHub issue
argument-hint: [issue-number]
allowed-tools: Bash(gh:*)
---

Fix GitHub issue: $ARGUMENTS

1. gh issue view → ver detalles
2. Buscar archivos relevantes
3. Implementar el fix
4. Escribir tests
5. Commit con mensaje conventional`}</CodeBlock>
          <div>
            <FadeIn delay={0.2}><h3 style={{ color: C.accent, fontSize: 18, marginBottom: 20, fontWeight: 700 }}>Características</h3></FadeIn>
            {[{ title: "Model-Invoked", desc: "Claude las usa automáticamente según el contexto de la tarea" },
              { title: "Compartibles via Git", desc: ".claude/skills/ en el repo para todo el equipo" },
              { title: "Frontmatter Configurable", desc: "model, context: fork, allowed-tools, etc." },
              { title: "Custom Commands", desc: "/fix-issue, /test-bdd, /refactor-service" }
            ].map((f, i) => (
              <FadeIn key={i} delay={0.3 + i * 0.12}>
                <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "flex-start" }}>
                  <span style={{ color: C.success, fontSize: 18, marginTop: 2 }}>✓</span>
                  <div>
                    <div style={{ color: C.white, fontWeight: 600, fontSize: 14 }}>{f.title}</div>
                    <div style={{ color: C.muted, fontSize: 13, marginTop: 2 }}>{f.desc}</div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </Section>
      <Divider />

      {/* ═══ MCP ═══ */}
      <Section id="mcp">
        <SectionTitle icon="🔌" sub="Estándar abierto (Linux Foundation) que conecta Claude con servicios externos. 300+ integraciones.">
          MCP — Model Context Protocol
        </SectionTitle>
        <div className="grid-stretch" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
          {[{ cat: "Version Control", items: "GitHub, GitLab, Git", color: C.primary },
            { cat: "Bases de Datos", items: "PostgreSQL, MongoDB, Redis", color: C.teal },
            { cat: "Project Mgmt", items: "Jira, Linear, Sentry", color: C.accent },
            { cat: "Browser", items: "Playwright, Puppeteer", color: C.success },
            { cat: "Cloud / DevOps", items: "AWS, Azure, Docker, K8s", color: C.purple },
            { cat: "Comunicación", items: "Slack, MS Teams", color: C.primary }
          ].map((c, i) => (
            <Card key={i} delay={i * 0.1} accent={c.color}>
              <div style={{ color: c.color, fontWeight: 700, fontSize: 14, marginBottom: 8 }}>{c.cat}</div>
              <div style={{ color: C.muted, fontSize: 13 }}>{c.items}</div>
            </Card>
          ))}
        </div>
        <CodeBlock delay={0.5}>{`$ claude mcp add github npx @modelcontextprotocol/server-github`}</CodeBlock>
      </Section>
      <Divider />

      {/* ═══ HOOKS ═══ */}
      <Section id="hooks">
        <SectionTitle icon="🔧" sub="Comandos shell en puntos del ciclo de vida. Garantías que el LLM solo no puede dar. Se ejecutan FUERA del contexto.">
          Hooks — Control Determinístico
        </SectionTitle>
        <FadeIn>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 32, justifyContent: "center" }}>
            {[{ name: "SessionStart", c: C.teal }, { name: "UserPromptSubmit", c: C.primary }, { name: "PreToolUse", c: C.accent },
              { name: "PostToolUse", c: C.success }, { name: "Stop", c: C.purple }, { name: "SubagentStop", c: C.muted }
            ].map((h, i) => (
              <div key={i} style={{ background: C.card, borderTop: `3px solid ${h.c}`, borderRadius: 8, padding: "10px 16px", textAlign: "center" }}>
                <code style={{ color: h.c, fontSize: 12 }}>{h.name}</code>
              </div>
            ))}
          </div>
        </FadeIn>
        <FadeIn delay={0.2}><h3 style={{ color: C.accent, fontSize: 16, marginBottom: 12, fontWeight: 600 }}>Ejemplo: Auto-format + bloquear DROP TABLE</h3></FadeIn>
        <CodeBlock delay={0.3}>{`{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Edit|Write",
      "hooks": [{
        "type": "command",
        "command": "npx prettier --write $FILE_PATH"
      }]
    }],
    "PreToolUse": [{
      "matcher": "Bash",
      "hooks": [{ "command": "check-no-drop.sh" }]
    }]  // exit code 2 = BLOCK action
  }
}`}</CodeBlock>
      </Section>
      <Divider />

      {/* ═══ ADVANCED FEATURES ═══ */}
      <Section id="features">
        <SectionTitle icon="🚀" sub="">Features Avanzados</SectionTitle>
        <div className="grid-stretch" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
          {[{ title: "Plan Mode", desc: "Claude crea un plan detallado que puedes revisar antes de codificar.", color: C.primary },
            { title: "Background Agents", desc: "Envía tareas al background con Ctrl+B y sigue trabajando.", color: C.teal },
            { title: "Agent Teams", desc: "Múltiples instancias en paralelo en diferentes partes del proyecto.", color: C.accent },
            { title: "IDE Integration", desc: "VS Code, JetBrains, Desktop App. Diffs inline, checkpoints.", color: C.success },
            { title: "Git Operations", desc: "Commits, branches, PRs via gh CLI. Conventional commits automáticos.", color: C.purple },
            { title: "One-Shot Mode", desc: 'claude -p "query" para scripts y CI/CD. Output JSON.', color: C.primary }
          ].map((f, i) => (
            <Card key={i} delay={i * 0.1} accent={f.color}>
              <div style={{ color: f.color, fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{f.title}</div>
              <div style={{ color: C.muted, fontSize: 13, lineHeight: 1.6 }}>{f.desc}</div>
            </Card>
          ))}
        </div>
      </Section>
      <Divider />

      {/* ═══ PLUGINS ═══ */}
      <Section id="plugins">
        <SectionTitle icon="⚙️" sub="Un plugin agrupa Skills, Hooks, Subagents y servidores MCP en una única unidad instalable y distribuible.">
          Plugins & Marketplaces
        </SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
          <div>
            <FadeIn><h3 style={{ color: C.accent, fontSize: 16, marginBottom: 16, fontWeight: 700 }}>¿Qué Contiene un Plugin?</h3></FadeIn>
            {[{ name: "Skills", desc: "Conocimiento y flujos", color: C.purple },
              { name: "Hooks", desc: "Automatización determinística", color: C.accent },
              { name: "Subagents", desc: "Trabajadores aislados", color: C.success },
              { name: "MCP Servers", desc: "Conexiones externas", color: C.teal }
            ].map((p, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div style={{ background: C.card, borderLeft: `3px solid ${p.color}`, borderRadius: 8, padding: "12px 16px", marginBottom: 10, display: "flex", alignItems: "center", gap: 12 }}>
                  <div><div style={{ color: p.color, fontWeight: 600, fontSize: 14 }}>{p.name}</div><div style={{ color: C.muted, fontSize: 12 }}>{p.desc}</div></div>
                </div>
              </FadeIn>
            ))}
          </div>
          <div>
            <FadeIn delay={0.2}><h3 style={{ color: C.accent, fontSize: 16, marginBottom: 16, fontWeight: 700 }}>Distribución</h3></FadeIn>
            <Card delay={0.3}>
              <div style={{ color: C.white, fontWeight: 600, marginBottom: 8 }}>Marketplaces</div>
              <p style={{ color: C.muted, fontSize: 13 }}>Instala plugins de la comunidad o crea tu propio marketplace interno.</p>
            </Card>
            <div style={{ height: 12 }} />
            <Card delay={0.4}>
              <div style={{ color: C.white, fontWeight: 600, marginBottom: 8 }}>Namespacing</div>
              <p style={{ color: C.muted, fontSize: 13, marginBottom: 8 }}>Skills de plugin usan namespaces para coexistir:</p>
              <code style={{ color: C.accent, fontSize: 12, background: C.dark, padding: "6px 12px", borderRadius: 4, display: "inline-block" }}>
                /my-plugin:review  /other-plugin:deploy
              </code>
            </Card>
          </div>
        </div>
      </Section>
      <Divider />

      {/* ═══ COSTS ═══ */}
      <Section id="costs">
        <SectionTitle icon="📈" sub="Cada extensión consume contexto de forma diferente. Entender estos costos te ayuda a construir una configuración efectiva.">
          Costos de Contexto por Feature
        </SectionTitle>
        <FadeIn>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 4px", fontSize: 14 }}>
              <thead>
                <tr>{["Feature", "Cuándo se carga", "Qué se carga", "Costo de contexto", "Nivel"].map((h, i) => (
                  <th key={i} style={{ padding: "12px 16px", textAlign: "left", color: C.accent, fontWeight: 600, fontSize: 13, borderBottom: `2px solid ${C.card}` }}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {[{ feat: "CLAUDE.md", when: "Inicio de sesión", what: "Contenido completo", cost: "Cada solicitud", level: "Alto", color: C.primary, lc: C.primary },
                  { feat: "Skills", when: "Inicio + al usar", what: "Descripciones → contenido", cost: "Bajo (descripciones)", level: "Bajo → Alto", color: C.purple, lc: C.accent },
                  { feat: "MCP Servers", when: "Inicio de sesión", what: "Tool definitions + schemas", cost: "Cada solicitud", level: "Medio", color: C.teal, lc: C.teal },
                  { feat: "Subagents", when: "Al generarse", what: "Contexto fresco", cost: "Aislado del principal", level: "Cero", color: C.success, lc: C.success },
                  { feat: "Hooks", when: "Al dispararse", what: "Nada (externo)", cost: "Cero", level: "Cero", color: C.accent, lc: C.success }
                ].map((r, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? C.dark : C.card }}>
                    <td style={{ padding: "12px 16px", borderLeft: `3px solid ${r.color}`, fontWeight: 600, color: r.color }}>{r.feat}</td>
                    <td style={{ padding: "12px 16px", color: C.text }}>{r.when}</td>
                    <td style={{ padding: "12px 16px", color: C.muted }}>{r.what}</td>
                    <td style={{ padding: "12px 16px", color: C.text }}>{r.cost}</td>
                    <td style={{ padding: "12px 16px", color: r.lc, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{r.level}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FadeIn>
      </Section>
      <Divider />

      {/* ═══ PATTERNS ═══ */}
      <Section id="patterns">
        <SectionTitle icon="🔗" sub="Cada extensión resuelve un problema diferente. Las configuraciones reales las combinan.">
          Patrones de Combinación
        </SectionTitle>
        {[{ pattern: "Skill + MCP", color: C.purple, how: "MCP provee la conexión; la Skill enseña cómo usarla bien", ex: "MCP conecta tu DB. La Skill documenta el esquema y patrones de query." },
          { pattern: "Skill + Subagent", color: C.success, how: "La Skill genera subagents para trabajo paralelo aislado", ex: "/audit lanza subagents de seguridad, rendimiento y estilo." },
          { pattern: "CLAUDE.md + Skills", color: C.primary, how: "CLAUDE.md = reglas siempre activas. Skills = referencia bajo demanda", ex: 'CLAUDE.md dice "sigue convenciones de API". La Skill contiene la guía completa.' },
          { pattern: "Hook + MCP", color: C.teal, how: "El Hook dispara acciones externas vía MCP automáticamente", ex: "Hook post-edición envía notificación a Slack al modificar archivos críticos." }
        ].map((c, i) => (
          <FadeIn key={i} delay={i * 0.12}>
            <div style={{ background: C.card, borderLeft: `4px solid ${c.color}`, borderRadius: 10, padding: "20px 24px", marginBottom: 16, display: "grid", gridTemplateColumns: "160px 1fr", gap: 20, alignItems: "center" }}>
              <code style={{ background: C.dark, color: c.color, padding: "8px 16px", borderRadius: 6, textAlign: "center", fontWeight: 600, fontSize: 13 }}>{c.pattern}</code>
              <div>
                <div style={{ color: C.white, fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{c.how}</div>
                <div style={{ color: C.muted, fontSize: 13 }}>{c.ex}</div>
              </div>
            </div>
          </FadeIn>
        ))}
      </Section>
      <Divider />

      {/* ═══ BENCHMARKS ═══ */}
      <Section id="bench">
        <SectionTitle icon="📊" sub="SWE-bench Verified toma issues reales de repos open source en GitHub y mide qué % un modelo resuelve solo. Datos: Marzo 2026.">
          ¿Qué tan bien programa Claude?
        </SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 32 }}>
          <FadeIn>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[{ name: "Claude Opus 4.5", val: 80.9 }, { name: "Claude Opus 4.6", val: 80.8 }, { name: "Gemini 3.1 Pro", val: 80.6 },
                { name: "MiniMax M2.5", val: 80.2 }, { name: "GPT-5.2", val: 80.0 }, { name: "Claude Sonnet 4.6", val: 79.6 }
              ].map((m, i) => {
                const pct = ((m.val - 78) / 4) * 100;
                return (
                  <BarRow key={i} name={m.name} val={m.val} pct={pct} delay={i * 0.1} />
                );
              })}
            </div>
          </FadeIn>
          <div>
            <Card delay={0.3} accent={C.accent}>
              <h4 style={{ color: C.accent, marginBottom: 12, fontWeight: 700 }}>¿Por qué importa?</h4>
              <p style={{ color: C.text, fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>
                Los 6 mejores modelos están a menos de 1.3 puntos entre sí. La diferencia real ya no es el modelo — es cómo lo configuras y usas.
              </p>
              <p style={{ color: C.accent, fontSize: 13, fontStyle: "italic" }}>
                Por eso este workshop se enfoca en las extensiones de Claude Code, no en el modelo.
              </p>
            </Card>
            <div style={{ height: 16 }} />
            <Card delay={0.5} accent={C.success}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: C.success, fontSize: 18 }}>✓</span>
                <span style={{ color: C.success, fontWeight: 700 }}>Accenture & Anthropic</span>
              </div>
              <p style={{ color: C.text, fontSize: 13, marginTop: 8 }}>Partner estratégico desde Diciembre 2025.</p>
            </Card>
          </div>
        </div>
      </Section>
      <Divider />

      {/* ═══ PRIVACY ═══ */}
      <Section id="privacy">
        <SectionTitle icon="🛡️" sub="">Privacidad y Propiedad del Código</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
          <div>
            <FadeIn><h3 style={{ color: C.accent, fontSize: 18, marginBottom: 20, fontWeight: 700 }}>¿Qué Pasa con Tu Código?</h3></FadeIn>
            {["Solo archivos que Claude lee se envían", "Transporte encriptado TLS", "Ejecución de código es LOCAL", "Sandboxing aísla filesystem + red"].map((t, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div style={{ display: "flex", gap: 12, marginBottom: 14, alignItems: "center" }}>
                  <span style={{ color: C.success, fontSize: 16 }}>✓</span>
                  <span style={{ fontSize: 14 }}>{t}</span>
                </div>
              </FadeIn>
            ))}
            <FadeIn delay={0.5}>
              <h4 style={{ color: C.accent, fontSize: 14, marginTop: 24, marginBottom: 12, fontWeight: 700 }}>¿Se usa tu código para entrenar modelos?</h4>
              <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 4px", fontSize: 13 }}>
                <thead><tr>
                  {["Plan", "Retención", "¿Entrena?"].map((h, i) => <th key={i} style={{ padding: "8px 12px", textAlign: "left", color: C.accent, fontSize: 11, fontWeight: 600 }}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {[{ plan: "API / Enterprise / Team", ret: "7-30 días", train: "NUNCA", c: C.success },
                    { plan: "Pro / Max / Free", ret: "30 días", train: "NO por defecto. Tú decides.", c: C.teal },
                    { plan: 'Si activas "Mejorar Claude"', ret: "5 años", train: "SÍ, tu elección.", c: C.danger },
                    { plan: "Conversación eliminada", ret: "Se borra", train: "NUNCA", c: C.success }
                  ].map((r, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? C.dark : C.card }}>
                      <td style={{ padding: "8px 12px", color: C.text }}>{r.plan}</td>
                      <td style={{ padding: "8px 12px", color: r.c, fontFamily: "'JetBrains Mono', monospace" }}>{r.ret}</td>
                      <td style={{ padding: "8px 12px", color: r.c, fontWeight: 600 }}>{r.train}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </FadeIn>
          </div>
          <div>
            <FadeIn><h3 style={{ color: C.accent, fontSize: 18, marginBottom: 16, fontWeight: 700 }}>¿Quién es Dueño del Código?</h3></FadeIn>
            <FadeIn delay={0.15}>
              <div style={{ background: C.dark, borderRadius: 8, padding: 16, marginBottom: 20, border: `1px solid ${C.card}` }}>
                <code style={{ color: C.accent, fontSize: 13 }}>Términos de Servicio de Anthropic, Sección 4(a):{"\n"}"you own all Outputs"</code>
              </div>
            </FadeIn>
            <FadeIn delay={0.25}><h4 style={{ color: C.success, fontSize: 14, marginBottom: 12, fontWeight: 700 }}>Lo que dicen los Términos de Servicio:</h4></FadeIn>
            {["Anthropic asigna todos los derechos al usuario", "Planes comerciales incluyen indemnización", "Tu código NO se incorpora al modelo (tú decides)"].map((t, i) => (
              <FadeIn key={i} delay={0.3 + i * 0.1}><div style={{ display: "flex", gap: 10, marginBottom: 12 }}><span style={{ color: C.success }}>✓</span><span style={{ fontSize: 13 }}>{t}</span></div></FadeIn>
            ))}
            <FadeIn delay={0.6}><h4 style={{ color: C.accent, fontSize: 14, marginTop: 20, marginBottom: 12, fontWeight: 700 }}>Zona gris legal:</h4></FadeIn>
            {["Copyright requiere autoría humana (US Copyright Office)", "Código 100% IA sin input humano puede no ser protegible", "Usa Claude como asistente, documenta tu proceso creativo"].map((t, i) => (
              <FadeIn key={i} delay={0.7 + i * 0.1}><div style={{ display: "flex", gap: 10, marginBottom: 12 }}><span style={{ color: C.accent }}>⚠</span><span style={{ fontSize: 13 }}>{t}</span></div></FadeIn>
            ))}
          </div>
        </div>
        <FadeIn delay={0.9}>
          <div style={{ background: C.highlight, borderRadius: 8, padding: 16, marginTop: 24, textAlign: "center" }}>
            <p style={{ color: C.accent, fontWeight: 700, fontSize: 14 }}>
              Anthropic NO usa tus datos arbitrariamente. Siempre es decisión del usuario. Settings {">"} Privacy para configurar.
            </p>
          </div>
        </FadeIn>
      </Section>
      <Divider />

      {/* ═══ BEST PRACTICES ═══ */}
      <Section id="best">
        <SectionTitle icon="💡" sub="">Best Practices Profesionales</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
          <div>
            <FadeIn><h3 style={{ color: C.success, fontSize: 20, marginBottom: 20, fontWeight: 800 }}>HACER</h3></FadeIn>
            {["Usar CLAUDE.md con convenciones del equipo", "Activar Plan Mode para tareas complejas", "Revisar cada output — no aceptar ciegamente",
              "Escribir prompts específicos con contexto", "Mantener tests como red de seguridad", "Usar Skills compartidas via git", "Hooks para formateo y validación automática"
            ].map((t, i) => (
              <FadeIn key={i} delay={i * 0.08}><div style={{ display: "flex", gap: 12, marginBottom: 14 }}><span style={{ color: "#34D399" }}>✓</span><span style={{ fontSize: 14 }}>{t}</span></div></FadeIn>
            ))}
          </div>
          <div>
            <FadeIn><h3 style={{ color: C.danger, fontSize: 20, marginBottom: 20, fontWeight: 800 }}>EVITAR</h3></FadeIn>
            {["Refactorizar legacy masivo sin tests", 'Prompts vagos: "arregla esto"', "Ignorar el Plan Mode en features grandes",
              "Dejar que Claude haga commits sin revisar", "Usar --dangerously-skip en producción", "Confiar en IA para lógica de negocio crítica", "Olvidar documentar en CLAUDE.md"
            ].map((t, i) => (
              <FadeIn key={i} delay={i * 0.08}><div style={{ display: "flex", gap: 12, marginBottom: 14 }}><span style={{ color: "#FBBF24" }}>⚠</span><span style={{ fontSize: 14 }}>{t}</span></div></FadeIn>
            ))}
          </div>
        </div>
        <FadeIn delay={0.7}>
          <div style={{ textAlign: "center", marginTop: 40, padding: "20px 0", borderTop: `2px solid ${C.primary}33` }}>
            <p style={{ color: C.accent, fontStyle: "italic", fontSize: 16 }}>"La IA no reemplaza al desarrollador. Potencia al que sabe usarla con criterio técnico."</p>
          </div>
        </FadeIn>
      </Section>
      <Divider />

      {/* ═══ CLOSING ═══ */}
      <Section id="close" hero={true} style={{ textAlign: "center" }}>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 50%, ${C.primary}11 0%, transparent 60%)` }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <FadeIn>
            <p style={{ fontSize: 48, marginBottom: 24 }}>🚀</p>
            <h2 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 800, marginBottom: 16 }}>Ahora veámoslo en acción.</h2>
          </FadeIn>
          <FadeIn delay={0.2}><p style={{ fontSize: 22, color: C.accent, marginBottom: 48 }}>Live Demo</p></FadeIn>
          <FadeIn delay={0.4}>
            <button onClick={() => scrollTo("demo")} style={{ background: C.primary, color: C.bg, border: "none", padding: "16px 48px", borderRadius: 10, fontSize: 18, fontWeight: 700, cursor: "pointer" }}>
              Ver Guía del Live Demo ↓
            </button>
          </FadeIn>
          <FadeIn delay={0.6}>
            <div style={{ marginTop: 48, display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
              {[{ label: "Docs oficiales", url: "code.claude.com/docs/es/overview" },
                { label: "Skills", url: "code.claude.com/docs/es/skills" },
                { label: "MCP", url: "code.claude.com/docs/es/mcp" },
                { label: "Hooks", url: "code.claude.com/docs/es/hooks-guide" },
                { label: "Plugins", url: "code.claude.com/docs/es/plugins" },
                { label: "Tutoriales", url: "claude.com/resources/tutorials" }
              ].map((r, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ color: C.accent, fontSize: 12, fontWeight: 600, minWidth: 80, textAlign: "right" }}>{r.label}</span>
                  <code style={{ fontSize: 13, color: C.muted }}>{r.url}</code>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </Section>
      <Divider />

      {/* ═══ LIVE DEMO GUIDE ═══ */}
      <Section id="demo">
        <SectionTitle icon="🎯" sub="ContactBook App — Gestión de contactos con React + NestJS. El foco es cómo Claude Code con sus extensiones potencia el desarrollo.">
          Live Demo: ContactBook App
        </SectionTitle>
        <div className="grid-stretch" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 32 }}>
          {[{ phase: "Fase 1", title: "Proyecto + CLAUDE.md", time: "3 min", desc: "Mostrar extensiones configuradas", color: C.primary },
            { phase: "Fase 2", title: "Backend Hexagonal", time: "10 min", desc: "NestJS + Plan Mode + Hook Prettier", color: C.teal },
            { phase: "Fase 3", title: "Tests BDD con Skill", time: "5 min", desc: "/test-bdd ContactsService", color: C.purple },
            { phase: "Fase 4", title: "Frontend con Subagent", time: "7 min", desc: "React + Tailwind en contexto aislado", color: C.success },
            { phase: "Fase 5", title: "MCP GitHub → PR", time: "5 min", desc: "Issue #1 → implementar → PR automático", color: C.accent }
          ].map((p, i) => (
            <Card key={i} delay={i * 0.1} accent={p.color}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <Badge color={p.color}>{p.phase}</Badge>
                <span style={{ color: C.muted, fontSize: 12 }}>{p.time}</span>
              </div>
              <div style={{ color: C.white, fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{p.title}</div>
              <div style={{ color: C.muted, fontSize: 13 }}>{p.desc}</div>
            </Card>
          ))}
        </div>
        <FadeIn delay={0.5}>
          <div style={{ background: C.dark, borderRadius: 12, padding: 24, border: `1px solid ${C.card}` }}>
            <h4 style={{ color: C.accent, marginBottom: 16, fontWeight: 700 }}>Mapa de Extensiones en el Demo</h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
              {[{ ext: "CLAUDE.md", use: "Convenciones, stack, arquitectura", color: C.primary },
                { ext: "Hook", use: "Auto-format Prettier en cada edición", color: C.accent },
                { ext: "Skill", use: "/test-bdd genera tests BDD del equipo", color: C.purple },
                { ext: "Subagent", use: "Frontend en contexto aislado", color: C.success },
                { ext: "MCP", use: "GitHub: lee issues, crea PRs", color: C.teal }
              ].map((e, i) => (
                <div key={i} style={{ borderLeft: `3px solid ${e.color}`, paddingLeft: 12 }}>
                  <div style={{ color: e.color, fontWeight: 600, fontSize: 13 }}>{e.ext}</div>
                  <div style={{ color: C.muted, fontSize: 12 }}>{e.use}</div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
        <FadeIn delay={0.7}>
          <div style={{ textAlign: "center", marginTop: 40, padding: 24, background: C.highlight, borderRadius: 12 }}>
            <p style={{ color: C.accent, fontWeight: 700, fontSize: 14, marginBottom: 8 }}>
              💡 Todo lo que configuramos se podría empaquetar en un Plugin e instalarlo en todos los repos del Chapter con un solo comando.
            </p>
            <p style={{ color: C.muted, fontSize: 13 }}>Stack: React 19 + Build Tool 7 + TailwindCSS (frontend) | NestJS 11 + Hexagonal Architecture (backend)</p>
          </div>
        </FadeIn>
      </Section>

      <Divider accent={C.success} />

      {/* ═══ AUDIENCE GUIDE ═══ */}
      <Section id="guide">
        <SectionTitle icon="📋" sub="Sigue esta guía paso a paso para replicar el Live Demo en tu máquina. Cada paso indica qué herramienta usar.">
          Guía Paso a Paso
        </SectionTitle>

        {/* Legend */}
        <FadeIn>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 40 }}>
            <StepBadge icon="🖥️" label="Manual" color={C.muted} />
            <StepBadge icon="⌨️" label="Claude Code" color={C.primary} />
            <StepBadge icon="🧠" label="CLAUDE.md" color={C.accent} />
            <StepBadge icon="📝" label="Skill" color={C.purple} />
            <StepBadge icon="🔧" label="Hook" color={C.accent} />
            <StepBadge icon="🔌" label="MCP" color={C.teal} />
            <StepBadge icon="🤖" label="Subagent" color={C.success} />
          </div>
        </FadeIn>

        {/* Prerequisites */}
        <FadeIn><h2 style={{ color: C.accent, fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Requisitos Previos</h2></FadeIn>
        <CopyBlock label="Verificar instalación">{`node --version    # >= 18
npm --version     # >= 9
git --version
gh --version      # GitHub CLI
claude --version  # Claude Code CLI`}</CopyBlock>

        {/* Step 1 */}
        <GuideStep number="1" title="Crear el Repositorio" badge={{ icon: "🖥️", label: "Manual" }} badgeColor={C.muted}>
          <CopyBlock label="Terminal">{`gh repo create contactbook-demo-v2 --public --clone
cd contactbook-demo-v2`}</CopyBlock>
        </GuideStep>

        {/* Step 2 */}
        <GuideStep number="2" title="Scaffold del Proyecto" badge={{ icon: "🖥️", label: "Manual" }} badgeColor={C.muted}>
          <p style={{ color: C.muted, fontSize: 14, marginBottom: 16 }}>Backend (NestJS):</p>
          <CopyBlock>{`mkdir -p backend frontend
cd backend && npx @nestjs/cli new . --package-manager npm --skip-git && cd ..`}</CopyBlock>
          <p style={{ color: C.muted, fontSize: 14, marginBottom: 16 }}>Frontend (React + Build Tool + Tailwind):</p>
          <CopyBlock>{[CMDS.scaffold,"",`cd frontend`,CMDS.twInstall,"",CMDS.viteConfig,"",CMDS.cssImport,`cd ..`].join("\n")}</CopyBlock>
          <p style={{ color: C.muted, fontSize: 14, marginBottom: 16 }}>Dependencias y config:</p>
          <CopyBlock>{`cd backend
npm install class-validator class-transformer @nestjs/mapped-types uuid
cd ..

npm init -y
npm install -D prettier

echo 'node_modules/
dist/
.env
*.log' > .gitignore

echo '{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2
}' > .prettierrc

git add -A
git commit -m "chore: initial project setup"
git push origin main`}</CopyBlock>
        </GuideStep>

        {/* Step 3 */}
        <GuideStep number="3" title="Configurar con Claude Code" badge={{ icon: "⌨️", label: "Claude Code" }} badgeColor={C.primary}>
          <CopyBlock label="Abrir Claude Code">{`cd contactbook-demo-v2
claude`}</CopyBlock>

          <div style={{ marginTop: 24, marginBottom: 8 }}><StepBadge icon="🧠" label="CLAUDE.md" color={C.accent} /></div>
          <CopyBlock label="Crear CLAUDE.md">{`/init`}</CopyBlock>
          <p style={{ color: C.muted, fontSize: 13, marginBottom: 12 }}>Si necesitas ajustar el CLAUDE.md generado:</p>
          <CopyBlock>{`Ajusta el CLAUDE.md para que incluya:
1. La estructura de carpetas hexagonal: domain/ (entities + ports), application/ (services), infrastructure/ (adapters + controllers)
2. Comandos: cd backend && npm run start:dev, cd frontend && npm run dev, npm test
3. Reglas: NO any, max 30 líneas por función, un export por archivo
4. Base de datos: in-memory array (dummy DB)
5. Principios: SOLID, KISS, DRY, Hexagonal (domain no conoce infrastructure)`}</CopyBlock>

          <div style={{ marginTop: 24, marginBottom: 8 }}><StepBadge icon="📝" label="Skill" color={C.purple} /></div>
          <CopyBlock label="Crear Skill test-bdd">{`Crea una skill del proyecto en .claude/skills/test-bdd/SKILL.md con las siguientes características:
- name: test-bdd
- description: Generate BDD-style unit tests following team conventions
- argument-hint: <service-or-component-name>
- allowed-tools: Bash(npm:*), Bash(npx:*), Read, Grep, Glob, Write

Las reglas de la skill:
- Naming: should_[expected_result]_when_[condition]
- Max 10 tests por archivo
- Usar fakes in-memory, NUNCA jest.mock() o spyOn
- Patrón AAA: Arrange → Act → Assert
- Tests independientes, sin estado compartido
- Incluir edge cases: null, empty, not found, duplicates
- Correr tests al final para verificar
- Para backend: crear fakes que implementen las interfaces de los ports
- Para frontend: usar React Testing Library, testear interacciones de usuario`}</CopyBlock>

          <div style={{ marginTop: 24, marginBottom: 8 }}><StepBadge icon="🔧" label="Hook" color={C.accent} /></div>
          <CopyBlock label="Crear Hook de Prettier">{`Configura un hook en .claude/settings.json que ejecute Prettier automáticamente después de cada edición de archivo (PostToolUse con matcher Edit|Write|MultiEdit).
El comando debe ser: npx prettier --write "$CLAUDE_FILE_PATHS" 2>/dev/null || true`}</CopyBlock>

          <div style={{ marginTop: 24, marginBottom: 8 }}><StepBadge icon="🔌" label="MCP" color={C.teal} /></div>
          <p style={{ color: C.muted, fontSize: 13, marginBottom: 8 }}>Sal de Claude Code primero con <code style={{ color: C.accent }}>/exit</code>, luego:</p>
          <CopyBlock label="Configurar MCP de GitHub">{`claude mcp add github -s project -- npx @modelcontextprotocol/server-github`}</CopyBlock>
        </GuideStep>

        {/* Step 4 */}
        <GuideStep number="4" title="Crear Issue en GitHub" badge={{ icon: "🖥️", label: "Manual" }} badgeColor={C.muted}>
          <CopyBlock>{`gh issue create \\
  --title "Feature: Agregar campo 'favorito' a los contactos" \\
  --body "## Descripción
Los usuarios necesitan marcar contactos como favoritos para acceso rápido.

## Requisitos
- Agregar campo isFavorite: boolean al modelo de Contact
- Endpoint PATCH /contacts/:id/favorite para toggle
- Botón de estrella en el frontend
- Los favoritos deben aparecer primero en la lista

## Criterios de aceptación
- [ ] Campo isFavorite en el modelo
- [ ] Endpoint PATCH funcionando
- [ ] Test unitario para el caso de toggle
- [ ] UI con estrella clickeable
- [ ] Favoritos ordenados primero"`}</CopyBlock>
        </GuideStep>

        {/* Step 5 */}
        <GuideStep number="5" title="Commit y Preparar Demo" badge={{ icon: "🖥️", label: "Manual" }} badgeColor={C.muted}>
          <CopyBlock>{`git add -A
git commit -m "chore: add Claude Code config (CLAUDE.md, skills, hooks, MCP)"
git push origin main`}</CopyBlock>
        </GuideStep>

        {/* Live Demo Phases */}
        <FadeIn><h2 style={{ color: C.accent, fontSize: 20, fontWeight: 700, margin: "48px 0 24px", borderTop: `2px solid ${C.card}`, paddingTop: 32 }}>🎬 Ejecutar el Live Demo</h2></FadeIn>

        <CopyBlock label="Abrir Claude Code para el demo">{`cd contactbook-demo-v2
claude --dangerously-skip-permissions`}</CopyBlock>
        <p style={{ color: C.danger, fontSize: 12, marginBottom: 32, marginTop: -8 }}>⚠️ --dangerously-skip-permissions es solo para demos. Nunca usarlo en producción.</p>

        {/* Phase 1 */}
        <GuideStep number="F1" title="Verificar Extensiones" badge={{ icon: "⌨️", label: "Claude Code" }} badgeColor={C.primary}>
          <CopyBlock>{`Muéstrame qué extensiones tenemos configuradas en este proyecto: CLAUDE.md, skills, hooks y MCP servers.`}</CopyBlock>
        </GuideStep>

        {/* Phase 2 */}
        <GuideStep number="F2" title="Backend Hexagonal" badge={{ icon: "🧠", label: "CLAUDE.md + Hook" }} badgeColor={C.accent}>
          <p style={{ color: C.muted, fontSize: 13, marginBottom: 12 }}>Presiona <code style={{ color: C.accent }}>Shift+Tab</code> para activar Plan Mode, luego:</p>
          <CopyBlock>{`Crea el módulo de contactos en el backend siguiendo la arquitectura hexagonal definida en CLAUDE.md.

Un Contact tiene: id (UUID), name, email, phone y createdAt.

Necesito:
1. Domain: entity + repository port interface + service port interface
2. Application: service que implementa el service port
3. Infrastructure: in-memory repository adapter + controller REST con CRUD completo
4. DTOs con class-validator
5. Module que conecte todo con dependency injection

Sigue los principios SOLID y la estructura de carpetas del CLAUDE.md.`}</CopyBlock>
          <CopyBlock label="Verificar">{`Corre los tests existentes del backend y levanta el server para verificar que compila correctamente.`}</CopyBlock>
        </GuideStep>

        {/* Phase 3 */}
        <GuideStep number="F3" title="Tests BDD con Skill" badge={{ icon: "📝", label: "Skill" }} badgeColor={C.purple}>
          <p style={{ color: C.muted, fontSize: 13, marginBottom: 12 }}>Desactiva Plan Mode (<code style={{ color: C.accent }}>Shift+Tab</code>), luego:</p>
          <CopyBlock>{`/test-bdd ContactsService`}</CopyBlock>
        </GuideStep>

        {/* Phase 4 */}
        <GuideStep number="F4" title="Frontend con Subagent" badge={{ icon: "🤖", label: "Subagent" }} badgeColor={C.success}>
          <CopyBlock>{`Usa un subagent para construir el frontend React del ContactBook.

El subagent debe:
1. Crear un componente ContactList que muestre los contactos del backend
2. Crear un componente ContactForm para agregar contactos (name, email, phone)
3. Usar TailwindCSS para el styling con un diseño limpio y moderno
4. Conectar al backend en http://localhost:3000/contacts
5. Manejar estados de loading y error

Stack: React + TypeScript + TailwindCSS.
El frontend ya está scaffoldeado en /frontend.`}</CopyBlock>
        </GuideStep>

        {/* Phase 5 */}
        <GuideStep number="F5" title="MCP GitHub → PR" badge={{ icon: "🔌", label: "MCP + Skill" }} badgeColor={C.teal}>
          <CopyBlock>{`Usa el MCP de GitHub para:

1. Lee el issue #1 de este repositorio
2. Analiza los requisitos y criterios de aceptación
3. Implementa TODOS los cambios necesarios (backend + frontend):
   - Campo isFavorite en la entity
   - Endpoint PATCH /contacts/:id/favorite
   - Botón de estrella en el frontend
   - Ordenar favoritos primero
4. Genera un test usando la skill /test-bdd para el toggle de favoritos
5. Corre todos los tests para verificar
6. Crea un branch feat/favorite-contacts
7. Haz commit con conventional commit
8. Abre un PR que referencie el issue #1`}</CopyBlock>
        </GuideStep>

        {/* Resources */}
        <FadeIn>
          <div style={{ background: C.dark, borderRadius: 12, padding: 32, border: `1px solid ${C.card}`, marginTop: 48 }}>
            <h3 style={{ color: C.accent, fontSize: 18, fontWeight: 700, marginBottom: 20 }}>📚 Recursos Oficiales</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
              {[{ label: "Información general", url: "https://code.claude.com/docs/es/overview" },
                { label: "Documentación de Skills", url: "https://code.claude.com/docs/es/skills" },
                { label: "Skills de Anthropic", url: "https://github.com/anthropics/skills/tree/main" },
                { label: "Documentación MCP", url: "https://code.claude.com/docs/es/mcp" },
                { label: "Documentación de Hooks", url: "https://code.claude.com/docs/es/hooks-guide" },
                { label: "Documentación de Plugins", url: "https://code.claude.com/docs/es/plugins" },
                { label: "Tutoriales de Claude", url: "https://claude.com/resources/tutorials?open_in_browser=1" }
              ].map((r, i) => (
                <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: C.card, borderRadius: 8, textDecoration: "none", transition: "all 0.2s", borderLeft: `3px solid ${C.primary}` }}>
                  <span style={{ color: C.text, fontSize: 13, fontWeight: 500 }}>{r.label}</span>
                  <span style={{ color: C.muted, fontSize: 11, marginLeft: "auto" }}>↗</span>
                </a>
              ))}
            </div>
          </div>
        </FadeIn>
      </Section>

      {/* Footer */}
      <footer style={{ padding: "40px 32px", borderTop: `1px solid ${C.card}`, textAlign: "center" }}>
        <p style={{ color: C.muted, fontSize: 13 }}>Claude Code 101 · JavaScript Chapter · Accenture Chile</p>
        <p style={{ color: `${C.muted}88`, fontSize: 11, marginTop: 8 }}>Navega con ↑↓ o los puntos laterales</p>
      </footer>
    </div>
  );
}

function BarRow({ name, val, pct, delay }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} style={{ display: "grid", gridTemplateColumns: "160px 1fr 60px", gap: 12, alignItems: "center" }}>
      <span style={{ fontSize: 13, color: C.text, textAlign: "right" }}>{name}</span>
      <div style={{ background: C.dark, borderRadius: 6, height: 28, overflow: "hidden" }}>
        <div className="bar-animate" style={{ height: "100%", width: inView ? `${pct}%` : "0%", background: `linear-gradient(90deg, ${C.primary}, ${C.accent})`, borderRadius: 6, transitionDelay: `${delay}s` }} />
      </div>
      <span style={{ color: C.accent, fontWeight: 700, fontSize: 14, fontFamily: "'JetBrains Mono', monospace" }}>
        {inView ? val : "0.0"}
      </span>
    </div>
  );
}
