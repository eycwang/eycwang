// Builds the README "Tech stack" table: one shields.io badge per skill, each with a logo.
// Logos come from Simple Icons (slug), or from Devicon (MIT) / Lucide (ISC) where Simple Icons has none.
// Badge SVGs are saved to assets/stack/ and the table is written between the stack markers in README.md.
// Usage: node scripts/build-stack.mjs   (edit `rows` below to add or remove a skill)
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const DEVICON = "https://cdn.jsdelivr.net/npm/devicon@2.16.0/icons/";
const LUCIDE = "https://cdn.jsdelivr.net/npm/lucide-static@0.460.0/icons/";
const cache = new Map();
// Fetches an SVG, retrying from scratch until the body is one complete <svg> document.
const isComplete = (s) => s.trim().endsWith("</svg>") && s.split("<svg").length === 2;
const get = (url) => {
  for (let attempt = 1; !cache.has(url); attempt++) {
    try {
      const body = execFileSync("curl", ["-sfL", "-m", "45", url], { encoding: "utf8" });
      if (isComplete(body)) cache.set(url, body);
    } catch (e) {
      if (attempt >= 5) throw e;
    }
    if (!cache.has(url) && attempt >= 5) throw new Error(`Incomplete SVG from ${url.slice(0, 80)}`);
  }
  return cache.get(url);
};
const minify = (svg) => svg.replace(/<!--[\s\S]*?-->/g, "").replace(/\s+/g, " ").replace(/>\s+</g, "><").trim();
const dataUri = (svg) => "data:image/svg%2bxml;base64," + Buffer.from(minify(svg)).toString("base64");

// Recolor a single-color Devicon "plain" icon.
const devPlain = (path, color) => {
  let svg = get(DEVICON + path).replace(/fill="[^"]*"/g, "");
  return dataUri(svg.replace("<svg", `<svg fill="${color}"`));
};
const devOriginal = (path) => dataUri(get(DEVICON + path));
// Lucide stroke icons, drawn in white.
const lucide = (name) => dataUri(get(LUCIDE + name + ".svg").replace(/currentColor/g, "#ffffff"));

const AWS = () => devPlain("amazonwebservices/amazonwebservices-plain-wordmark.svg", "#FF9900");
const AI = "5B21B6";

const enc = (s) => encodeURIComponent(s.replace(/-/g, "--").replace(/_/g, "__"));
const fileName = (label) =>
  label.toLowerCase().replace(/\+\+/g, "pp").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + ".svg";

// Downloads the badge once into assets/stack/ and returns the <img> tag that points at it.
const badge = ({ label, color, slug, logo, logoColor = "white" }) => {
  const l = slug ? `&logo=${slug}&logoColor=${logoColor}` : `&logo=${logo}`;
  const svg = get(`https://img.shields.io/badge/${enc(label)}-${color}?style=for-the-badge${l}`);
  if (!svg.includes("<image")) throw new Error(`No logo rendered for "${label}"`);
  const path = `assets/stack/${fileName(label)}`;
  writeFileSync(path, svg);
  return `<img src="${path}" alt="${label}" />`;
};

const rows = [
  ["💻 Languages", [
    { label: "Java", color: "ED8B00", slug: "openjdk" },
    { label: "Python", color: "3776AB", slug: "python" },
    { label: "TypeScript", color: "3178C6", slug: "typescript" },
    { label: "JavaScript", color: "F7DF1E", slug: "javascript", logoColor: "black" },
    { label: "SQL", color: "336791", logo: lucide("database") },
    { label: "C++", color: "00599C", slug: "cplusplus" },
    { label: "Bash", color: "4EAA25", slug: "gnubash" },
  ]],
  ["🎨 Frontend", [
    { label: "React", color: "20232A", slug: "react", logoColor: "61DAFB" },
    { label: "Next.js", color: "000000", slug: "nextdotjs" },
    { label: "HTML5", color: "E34F26", slug: "html5" },
    { label: "CSS3", color: "1572B6", slug: "css" },
  ]],
  ["⚙️ Backend & APIs", [
    { label: "Spring Boot", color: "6DB33F", slug: "springboot" },
    { label: "FastAPI", color: "009688", slug: "fastapi" },
    { label: "Node.js", color: "339933", slug: "nodedotjs" },
    { label: "GraphQL", color: "E10098", slug: "graphql" },
    { label: "gRPC + Protobuf", color: "244C5A", logo: devPlain("grpc/grpc-plain.svg", "#ffffff") },
    { label: "REST · OpenAPI", color: "6BA539", slug: "openapiinitiative" },
  ]],
  ["🤖 AI Engineering", [
    { label: "LangChain", color: "1C3C3C", slug: "langchain" },
    { label: "LangGraph", color: "1C3C3C", slug: "langgraph" },
    { label: "MCP", color: "000000", slug: "modelcontextprotocol" },
    { label: "LLM APIs", color: AI, logo: lucide("brain-circuit") },
    { label: "RAG", color: AI, logo: lucide("library-big") },
    { label: "AI Agents", color: AI, logo: lucide("bot") },
    { label: "Tool Calling", color: AI, logo: lucide("wrench") },
    { label: "Vector Search", color: AI, logo: lucide("scan-search") },
    { label: "Multimodal AI", color: AI, logo: lucide("images") },
    { label: "Prompt Engineering", color: AI, logo: lucide("sparkles") },
    { label: "Model Evaluation", color: AI, logo: lucide("gauge") },
  ]],
  ["🌊 Data & Streaming", [
    { label: "Apache Kafka", color: "231F20", slug: "apachekafka" },
    { label: "Spark · PySpark", color: "E25A1C", slug: "apachespark" },
    { label: "AWS Glue", color: "232F3E", logo: AWS() },
    { label: "Amazon Redshift", color: "232F3E", logo: AWS() },
  ]],
  ["🗄️ Databases", [
    { label: "PostgreSQL", color: "4169E1", slug: "postgresql" },
    { label: "MySQL", color: "4479A1", slug: "mysql" },
    { label: "Redis", color: "DC382D", slug: "redis" },
    { label: "DynamoDB", color: "232F3E", logo: AWS() },
  ]],
  ["☁️ Cloud & DevOps", [
    { label: "AWS", color: "232F3E", logo: AWS() },
    { label: "Amazon EKS", color: "232F3E", logo: AWS() },
    { label: "AWS Lambda", color: "232F3E", logo: AWS() },
    { label: "Amazon S3", color: "232F3E", logo: AWS() },
    { label: "Amazon EC2", color: "232F3E", logo: AWS() },
    { label: "CloudWatch", color: "232F3E", logo: AWS() },
    { label: "Docker", color: "2496ED", slug: "docker" },
    { label: "Kubernetes", color: "326CE5", slug: "kubernetes" },
    { label: "Terraform", color: "7B42BC", slug: "terraform" },
    { label: "GitHub Actions", color: "2088FF", slug: "githubactions" },
  ]],
  ["🧪 Testing & Observability", [
    { label: "PyTest", color: "0A9EDC", slug: "pytest" },
    { label: "JUnit 5", color: "25A162", slug: "junit5" },
    { label: "Jest", color: "C21325", slug: "jest" },
    { label: "Playwright", color: "1E293B", logo: devOriginal("playwright/playwright-original.svg") },
    { label: "OpenTelemetry", color: "425CC7", slug: "opentelemetry" },
    { label: "Prometheus", color: "E6522C", slug: "prometheus" },
    { label: "Grafana", color: "F46800", slug: "grafana" },
  ]],
];

mkdirSync("assets/stack", { recursive: true });
const table = [
  "| Area | Stack |",
  "|:--|:--|",
  ...rows.map(([area, items]) => `| **${area}** | ${items.map(badge).join(" ")} |`),
].join("\n");

const START = "<!-- stack:start -->", END = "<!-- stack:end -->";
const readme = readFileSync("README.md", "utf8");
const [before, rest] = readme.split(START);
if (rest === undefined || !rest.includes(END)) throw new Error("README.md is missing the stack markers");
writeFileSync("README.md", `${before}${START}\n${table}\n${END}${rest.split(END)[1]}`);
console.log(`Wrote ${rows.reduce((n, [, i]) => n + i.length, 0)} badges in ${rows.length} rows.`);
