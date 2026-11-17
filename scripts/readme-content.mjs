// Everything the README says lives here.
// After editing, rebuild the cards and README.md with:  node scripts/build-readme.mjs

export const profile = {
  repo: "eycwang/eycwang",
  name: "Ethan Wang",
  role: "Senior Software Engineer",
  focus: ["AI Platforms", "Distributed Systems", "Full-Stack Engineering"],
  statement:
    "I design and ship production systems end to end, from event-driven services and data platforms to the AI tooling and interfaces people rely on every day.",
  meta: [
    { icon: "pin", text: "Bellevue, WA" },
    { icon: "clock", text: "7+ years in production engineering" },
    { icon: "trend", text: "Growing into engineering leadership" },
  ],
  links: [
    { label: "LinkedIn", text: "Connect", color: "0A66C2", logo: "linkedin", href: "https://linkedin.com/in/eycwang" },
    { label: "Email", text: "Get in touch", color: "0F172A", logo: "maildotru", href: "mailto:ethan.W9611@outlook.com" },
  ],
};

export const about = {
  label: "About",
  title: "Engineering with ownership",
  paragraphs: [
    "I'm a senior software engineer with 7+ years of experience building full-stack products, distributed backend services, and AI systems. My center of gravity is the platform layer: event-driven services, data pipelines, and the retrieval and evaluation infrastructure that makes LLM-powered products dependable.",
    "I own work from design review through production: shaping the architecture, instrumenting it, and staying accountable for how it behaves under real traffic. Today I focus on AI governance tooling, systems that help teams decide whether content is original, fair, and safe.",
  ],
};

export const focus = {
  label: "Focus areas",
  title: "Where I create the most leverage",
  items: [
    {
      icon: "cpu",
      title: "AI Platforms & Evaluation",
      text: "RAG pipelines, structured tool calling, and multimodal evaluation with versioned datasets and regression gates, so model changes ship with evidence.",
    },
    {
      icon: "network",
      title: "Distributed Systems",
      text: "Event-driven microservices on Kafka, gRPC, and PostgreSQL, built with idempotent consumers, safe retries, and end-to-end observability.",
    },
    {
      icon: "layout",
      title: "Full-Stack Product Engineering",
      text: "React and Next.js applications backed by Spring Boot and FastAPI services, designed around the real workflows of the people who use them.",
    },
    {
      icon: "database",
      title: "Data Platforms",
      text: "Incremental Spark and Glue pipelines, dimensional models in Redshift, and automated data-quality checks that catch issues before stakeholders do.",
    },
  ],
};

export const leadership = {
  label: "Leadership",
  title: "From owning systems to growing engineers",
  intro:
    "The next stage of my growth is multiplying impact through others. I'm deliberately building the skills of an engineering leader while staying close to the code.",
  columns: [
    {
      heading: "What I do today",
      icon: "check",
      items: [
        "Mentor engineers through pairing, design feedback, and code reviews that teach",
        "Lead system design reviews and drive alignment on technical tradeoffs",
        "Own operational readiness and incident response for the services I build",
        "Partner with ML engineers on performance, quality, and release confidence",
      ],
    },
    {
      heading: "What I'm building toward",
      icon: "arrow",
      items: [
        "Setting technical direction and a roadmap a team can rally behind",
        "Growing engineers into owners through coaching and candid feedback",
        "Building a culture of clarity, focus, and shared credit",
      ],
    },
  ],
};

export const principles = {
  label: "Principles",
  title: "How I build",
  items: [
    { title: "Own the outcome", text: "Accountability continues past the merge: rollout, monitoring, and on-call." },
    { title: "Design for failure", text: "Expect duplicate messages, slow dependencies, and partial outages, then make them uneventful." },
    { title: "Measure first", text: "Traces, p95 latency, and error budgets guide decisions, not intuition." },
    { title: "Ground AI in evidence", text: "Retrieval with sources, versioned datasets, and regression evals before anything ships." },
    { title: "Earn complexity", text: "Start with the simplest design that works. Add complexity only when the data demands it." },
    { title: "Multiply the team", text: "Clear docs, thoughtful reviews, and mentoring are part of the deliverable." },
  ],
};

export const beyond = {
  label: "Beyond work",
  title: "Recharging in the Cascades",
  text: "Most weekends I'm on a trail somewhere in the Cascades. Hiking is how I reset, and it reinforces the same lessons as running production systems: prepare for conditions you don't expect, pace yourself for the long climb, and know when to turn back.",
};

// Badge logos: `slug` is a Simple Icons name; `devicon` / `lucide` embed an icon from those open-source sets
// (use `tint` to recolor a one-color Devicon icon). Badge images are cached in assets/stack/.
const AWS = { devicon: "amazonwebservices/amazonwebservices-plain-wordmark.svg", tint: "#FF9900" };
const AI = "5B21B6";
const AWS_INK = "232F3E";

export const stack = {
  label: "Tech stack",
  title: "Tools I use to ship",
  groups: [
    {
      name: "Languages",
      badges: [
        { label: "Java", color: "ED8B00", slug: "openjdk" },
        { label: "Python", color: "3776AB", slug: "python" },
        { label: "TypeScript", color: "3178C6", slug: "typescript" },
        { label: "JavaScript", color: "F7DF1E", slug: "javascript", logoColor: "black" },
        { label: "SQL", color: "336791", lucide: "database" },
        { label: "C++", color: "00599C", slug: "cplusplus" },
        { label: "Bash", color: "4EAA25", slug: "gnubash" },
      ],
    },
    {
      name: "Frontend",
      badges: [
        { label: "React", color: "20232A", slug: "react", logoColor: "61DAFB" },
        { label: "Next.js", color: "000000", slug: "nextdotjs" },
        { label: "HTML5", color: "E34F26", slug: "html5" },
        { label: "CSS3", color: "1572B6", slug: "css" },
      ],
    },
    {
      name: "Backend & APIs",
      badges: [
        { label: "Spring Boot", color: "6DB33F", slug: "springboot" },
        { label: "FastAPI", color: "009688", slug: "fastapi" },
        { label: "Node.js", color: "339933", slug: "nodedotjs" },
        { label: "GraphQL", color: "E10098", slug: "graphql" },
        { label: "gRPC + Protobuf", color: "244C5A", devicon: "grpc/grpc-plain.svg", tint: "#FFFFFF" },
        { label: "REST · OpenAPI", color: "6BA539", slug: "openapiinitiative" },
      ],
    },
    {
      name: "AI Engineering",
      badges: [
        { label: "LangChain", color: "1C3C3C", slug: "langchain" },
        { label: "LangGraph", color: "1C3C3C", slug: "langgraph" },
        { label: "MCP", color: "000000", slug: "modelcontextprotocol" },
        { label: "LLM APIs", color: AI, lucide: "brain-circuit" },
        { label: "RAG", color: AI, lucide: "library-big" },
        { label: "AI Agents", color: AI, lucide: "bot" },
        { label: "Tool Calling", color: AI, lucide: "wrench" },
        { label: "Vector Search", color: AI, lucide: "scan-search" },
        { label: "Multimodal AI", color: AI, lucide: "images" },
        { label: "Prompt Engineering", color: AI, lucide: "sparkles" },
        { label: "Model Evaluation", color: AI, lucide: "gauge" },
      ],
    },
    {
      name: "Data & Streaming",
      badges: [
        { label: "Apache Kafka", color: "231F20", slug: "apachekafka" },
        { label: "Spark · PySpark", color: "E25A1C", slug: "apachespark" },
        { label: "AWS Glue", color: AWS_INK, ...AWS },
        { label: "Amazon Redshift", color: AWS_INK, ...AWS },
      ],
    },
    {
      name: "Databases",
      badges: [
        { label: "PostgreSQL", color: "4169E1", slug: "postgresql" },
        { label: "MySQL", color: "4479A1", slug: "mysql" },
        { label: "Redis", color: "DC382D", slug: "redis" },
        { label: "DynamoDB", color: AWS_INK, ...AWS },
      ],
    },
    {
      name: "Cloud & DevOps",
      badges: [
        { label: "AWS", color: AWS_INK, ...AWS },
        { label: "Amazon EKS", color: AWS_INK, ...AWS },
        { label: "AWS Lambda", color: AWS_INK, ...AWS },
        { label: "Amazon S3", color: AWS_INK, ...AWS },
        { label: "Amazon EC2", color: AWS_INK, ...AWS },
        { label: "CloudWatch", color: AWS_INK, ...AWS },
        { label: "Docker", color: "2496ED", slug: "docker" },
        { label: "Kubernetes", color: "326CE5", slug: "kubernetes" },
        { label: "Terraform", color: "7B42BC", slug: "terraform" },
        { label: "GitHub Actions", color: "2088FF", slug: "githubactions" },
      ],
    },
    {
      name: "Testing & Observability",
      badges: [
        { label: "PyTest", color: "0A9EDC", slug: "pytest" },
        { label: "JUnit 5", color: "25A162", slug: "junit5" },
        { label: "Jest", color: "C21325", slug: "jest" },
        { label: "Playwright", color: "1E293B", devicon: "playwright/playwright-original.svg" },
        { label: "OpenTelemetry", color: "425CC7", slug: "opentelemetry" },
        { label: "Prometheus", color: "E6522C", slug: "prometheus" },
        { label: "Grafana", color: "F46800", slug: "grafana" },
      ],
    },
  ],
};
