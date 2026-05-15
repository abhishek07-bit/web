"""
PrepMate AI — Multi-Provider AI Service with Fallback Stack

Provider Priority (high performance → low):
  1. Gemini 2.5 Flash     (Google — best quality/speed ratio)
  2. Groq Llama-3.3-70B   (Groq — fast inference, strong model)
  3. OpenRouter Gemini     (OpenRouter — reliable fallback)
  4. Cerebras Llama-3.1    (Cerebras — ultra-fast, smaller model)

Each provider implements the same interface. On failure (rate limit, timeout, error),
the system automatically falls through to the next provider.
"""

import json
import time
import logging
import httpx
from typing import Optional
from dataclasses import dataclass
from app.core.config import settings

logger = logging.getLogger("prepmate.ai")


@dataclass
class AIResponse:
    text: str
    provider: str
    model: str
    latency_ms: float
    fallback_count: int = 0


class AIProviderError(Exception):
    def __init__(self, provider: str, message: str):
        self.provider = provider
        super().__init__(f"[{provider}] {message}")


# ─────────────────────────────────────────────
# Provider Implementations
# ─────────────────────────────────────────────

async def _call_gemini(prompt: str, system_prompt: str = "", temperature: float = 0.7) -> AIResponse:
    """Google Gemini API (native REST — not OpenAI-compatible)."""
    start = time.monotonic()
    model = "gemini-2.0-flash"
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={settings.GEMINI_API_KEY}"

    contents = []
    if system_prompt:
        contents.append({"role": "user", "parts": [{"text": system_prompt}]})
        contents.append({"role": "model", "parts": [{"text": "Understood. I will follow these instructions precisely."}]})
    contents.append({"role": "user", "parts": [{"text": prompt}]})

    payload = {
        "contents": contents,
        "generationConfig": {
            "temperature": temperature,
            "maxOutputTokens": 4096,
        },
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        resp = await client.post(url, json=payload)
        if resp.status_code == 429:
            raise AIProviderError("gemini", "Rate limited (429)")
        if resp.status_code != 200:
            raise AIProviderError("gemini", f"HTTP {resp.status_code}: {resp.text[:200]}")

        data = resp.json()
        try:
            text = data["candidates"][0]["content"]["parts"][0]["text"]
        except (KeyError, IndexError):
            raise AIProviderError("gemini", f"Unexpected response shape: {json.dumps(data)[:200]}")

    latency = (time.monotonic() - start) * 1000
    return AIResponse(text=text, provider="gemini", model=model, latency_ms=latency)


async def _call_groq(prompt: str, system_prompt: str = "", temperature: float = 0.7) -> AIResponse:
    """Groq API (OpenAI-compatible)."""
    start = time.monotonic()
    model = "llama-3.3-70b-versatile"
    url = "https://api.groq.com/openai/v1/chat/completions"

    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})

    payload = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": 4096,
    }
    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        resp = await client.post(url, json=payload, headers=headers)
        if resp.status_code == 429:
            raise AIProviderError("groq", "Rate limited (429)")
        if resp.status_code != 200:
            raise AIProviderError("groq", f"HTTP {resp.status_code}: {resp.text[:200]}")

        data = resp.json()
        text = data["choices"][0]["message"]["content"]

    latency = (time.monotonic() - start) * 1000
    return AIResponse(text=text, provider="groq", model=model, latency_ms=latency)


async def _call_openrouter(prompt: str, system_prompt: str = "", temperature: float = 0.7) -> AIResponse:
    """OpenRouter API (OpenAI-compatible, routes to many models)."""
    start = time.monotonic()
    model = "google/gemini-2.0-flash-001"
    url = "https://openrouter.ai/api/v1/chat/completions"

    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})

    payload = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": 4096,
    }
    headers = {
        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://prepmate.ai",
        "X-Title": "PrepMate AI",
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        resp = await client.post(url, json=payload, headers=headers)
        if resp.status_code == 429:
            raise AIProviderError("openrouter", "Rate limited (429)")
        if resp.status_code != 200:
            raise AIProviderError("openrouter", f"HTTP {resp.status_code}: {resp.text[:200]}")

        data = resp.json()
        text = data["choices"][0]["message"]["content"]

    latency = (time.monotonic() - start) * 1000
    return AIResponse(text=text, provider="openrouter", model=model, latency_ms=latency)


async def _call_cerebras(prompt: str, system_prompt: str = "", temperature: float = 0.7) -> AIResponse:
    """Cerebras API (OpenAI-compatible, ultra-fast inference)."""
    start = time.monotonic()
    model = "llama3.1-8b"
    url = "https://api.cerebras.ai/v1/chat/completions"

    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})

    payload = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": 4096,
    }
    headers = {
        "Authorization": f"Bearer {settings.CEREBRAS_API_KEY}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        resp = await client.post(url, json=payload, headers=headers)
        if resp.status_code == 429:
            raise AIProviderError("cerebras", "Rate limited (429)")
        if resp.status_code != 200:
            raise AIProviderError("cerebras", f"HTTP {resp.status_code}: {resp.text[:200]}")

        data = resp.json()
        text = data["choices"][0]["message"]["content"]

    latency = (time.monotonic() - start) * 1000
    return AIResponse(text=text, provider="cerebras", model=model, latency_ms=latency)


# ─────────────────────────────────────────────
# Fallback Stack Orchestrator
# ─────────────────────────────────────────────

# Ordered from highest performance to lowest
PROVIDER_STACK = [
    ("gemini",      _call_gemini),
    ("groq",        _call_groq),
    ("openrouter",  _call_openrouter),
    ("cerebras",    _call_cerebras),
]


async def generate(
    prompt: str,
    system_prompt: str = "",
    temperature: float = 0.7,
    preferred_provider: Optional[str] = None,
) -> AIResponse:
    """
    Generate text using the AI fallback stack.
    Tries each provider in priority order until one succeeds.
    """
    stack = list(PROVIDER_STACK)

    # If a preferred provider is specified, move it to the front
    if preferred_provider:
        stack = sorted(stack, key=lambda x: 0 if x[0] == preferred_provider else 1)

    errors = []
    for i, (name, call_fn) in enumerate(stack):
        # Skip providers with no API key configured
        key_map = {
            "gemini": settings.GEMINI_API_KEY,
            "groq": settings.GROQ_API_KEY,
            "openrouter": settings.OPENROUTER_API_KEY,
            "cerebras": settings.CEREBRAS_API_KEY,
        }
        if not key_map.get(name):
            continue

        try:
            logger.info(f"Trying provider: {name} (attempt {i + 1}/{len(stack)})")
            result = await call_fn(prompt, system_prompt, temperature)
            result.fallback_count = i
            if i > 0:
                logger.warning(f"Used fallback provider '{name}' after {i} failures: {[e.provider for e in errors]}")
            return result
        except (AIProviderError, httpx.TimeoutException, Exception) as e:
            logger.error(f"Provider '{name}' failed: {e}")
            errors.append(AIProviderError(name, str(e)))
            continue

    # All providers failed
    error_details = "; ".join([f"{e.provider}: {e}" for e in errors])
    raise AIProviderError("all", f"All AI providers failed: {error_details}")


async def check_providers() -> dict:
    """Health check all providers. Returns status dict."""
    results = {}
    for name, call_fn in PROVIDER_STACK:
        key_map = {
            "gemini": settings.GEMINI_API_KEY,
            "groq": settings.GROQ_API_KEY,
            "openrouter": settings.OPENROUTER_API_KEY,
            "cerebras": settings.CEREBRAS_API_KEY,
        }
        if not key_map.get(name):
            results[name] = {"status": "skipped", "reason": "no API key"}
            continue

        try:
            resp = await call_fn("Say OK", "", 0.1)
            results[name] = {
                "status": "ok",
                "model": resp.model,
                "latency_ms": round(resp.latency_ms, 1),
            }
        except Exception as e:
            results[name] = {"status": "error", "error": str(e)}

    return results


# ─────────────────────────────────────────────
# Domain-Specific Prompt Generators
# ─────────────────────────────────────────────

SYSTEM_PROMPT_INTERVIEWER = """You are an expert technical interviewer for top tech companies.
You generate interview questions that are challenging, specific, and tailored to the candidate's
experience and target role. Your questions should test both technical depth and communication ability.
Always respond with valid JSON when asked for structured output."""

SYSTEM_PROMPT_EVALUATOR = """You are an expert interview performance evaluator.
You analyze candidate responses with precision, identifying strengths and weaknesses.
You provide specific, actionable feedback. Be honest but constructive.
Always respond with valid JSON when asked for structured output."""


async def generate_interview_questions(
    role: str,
    company: str,
    persona: str,
    rigor_level: int,
    skills: list[str],
    num_questions: int = 5,
) -> list[dict]:
    """Generate tailored interview questions using AI."""
    prompt = f"""Generate exactly {num_questions} interview questions for a {role} position at {company}.

Interviewer persona: {persona}
Rigor level: {rigor_level}/5
Candidate skills: {', '.join(skills) if skills else 'General software engineering'}

Return a JSON array where each item has:
- "category": one of "Behavioral", "Technical", "System Design", "Algorithms"
- "text": the main question text
- "sub_prompt": a follow-up guidance hint (1-2 sentences)
- "time_limit": suggested time in seconds (120-600)

Return ONLY the JSON array, no other text."""

    result = await generate(prompt, SYSTEM_PROMPT_INTERVIEWER, temperature=0.8)
    try:
        # Strip markdown code fences if present
        text = result.text.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1] if "\n" in text else text[3:]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()
        questions = json.loads(text)
        return questions if isinstance(questions, list) else []
    except json.JSONDecodeError:
        logger.error(f"Failed to parse AI response as JSON: {result.text[:200]}")
        return _fallback_questions(role, company, num_questions)


async def evaluate_answer(
    question: str,
    answer: str,
    role: str,
    company: str,
) -> dict:
    """Evaluate a candidate's answer using AI."""
    prompt = f"""Evaluate this interview answer for a {role} position at {company}.

Question: {question}
Candidate's Answer: {answer}

Return a JSON object with:
- "score": integer 0-100
- "feedback": a 2-3 sentence evaluation
- "strengths": array of 1-3 strength points
- "improvements": array of 1-3 improvement suggestions

Return ONLY the JSON object."""

    result = await generate(prompt, SYSTEM_PROMPT_EVALUATOR, temperature=0.4)
    try:
        text = result.text.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1] if "\n" in text else text[3:]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()
        return json.loads(text)
    except json.JSONDecodeError:
        return {"score": 70, "feedback": "Response recorded.", "strengths": [], "improvements": []}


async def generate_session_feedback(
    questions_and_answers: list[dict],
    role: str,
    company: str,
) -> dict:
    """Generate comprehensive session feedback."""
    qa_text = "\n\n".join([
        f"Q{i+1} [{qa['category']}]: {qa['question']}\nA: {qa['answer']}"
        for i, qa in enumerate(questions_and_answers)
    ])

    prompt = f"""Analyze this complete mock interview session for a {role} position at {company}.

{qa_text}

Return a JSON object with:
- "overallScore": integer 0-100
- "overallAssessment": 2-3 sentence overall evaluation
- "strengths": array of objects with "title" and "description" (3 items)
- "improvements": array of objects with "title" and "description" (3 items)
- "recommendedActions": array of objects with "title" and "link" (2 items, link can be "#")
- "vocalConfidenceData": array of objects with "label" and "value" (5 data points, values 0-100)

Return ONLY the JSON object."""

    result = await generate(prompt, SYSTEM_PROMPT_EVALUATOR, temperature=0.5)
    try:
        text = result.text.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1] if "\n" in text else text[3:]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()
        return json.loads(text)
    except json.JSONDecodeError:
        return _fallback_feedback()

async def analyze_resume(resume_text: str) -> dict:
    """Analyze a resume and provide ruthless, hyper-comprehensive feedback including LaTeX checks."""
    prompt = f"""Act as a Ruthless, World-Class FAANG Recruiter and ATS Optimization Expert. 
    Your goal is to tear this resume apart and find EVERY single flaw. 
    
    SPECIAL INSTRUCTION: Analyze the document's structure. If it appears to be a LaTeX-generated resume, evaluate if the LaTeX-to-PDF conversion has preserved text-searchable layers or if it has created non-standard character encoding that breaks ATS.
    
    Resume Text:
    {resume_text[:5000]}
    
    Return a JSON object STRICTLY matching this format:
    {{
        "atsScore": integer (0-100),
        "impactScore": integer (0-100),
        "brevityScore": integer (0-100),
        "latexStructureScore": integer (0-100),
        "overallSummary": string,
        "voiceSummary": string,
        "strengths": [array of string],
        "weaknesses": [array of string],
        "metricsDetected": [array of string],
        "allLinksFound": [array of strings (all URLs, social links, portfolio links found anywhere in the text)],
        "projects": [
            {{
                "name": string,
                "github": string (URL or "Not Found"),
                "live": string (URL or "Not Found"),
                "stack": string,
                "impact": string (1-sentence quantified achievement)
            }}
        ],
        "recommendedRoles": [array of string],
        "criticalFixes": [array of string]
    }}
    
    Return ONLY the raw JSON string."""

    result = await generate(prompt, SYSTEM_PROMPT_INTERVIEWER, temperature=0.2)
    try:
        text = result.text.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1] if "\n" in text else text[3:]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()
            if text.startswith("json"):
                text = text[4:].strip()
        return json.loads(text)
    except json.JSONDecodeError:
        return {"error": "Failed to parse resume analysis"}

async def analyze_job_match(resume_text: str, job_description: str) -> dict:
    """Perform 'Kill-Ratio' analysis between a resume and a specific job description."""
    prompt = f"""Act as a Ruthless FAANG Hiring Manager. Compare this RESUME against the JOB DESCRIPTION.
    Calculate the 'Kill-Ratio' (Probability of immediate rejection).
    
    JOB DESCRIPTION:
    {job_description[:3000]}
    
    RESUME TEXT:
    {resume_text[:4000]}
    
    Return a JSON object:
    {{
        "rejectionProbability": integer (0-100, higher means more likely to be rejected),
        "matchScore": integer (0-100),
        "topRejectionReasons": [array of 3 brutally honest reasons why this resume would be rejected for THIS specific job],
        "gapReport": [array of objects with "missingSkill", "importance" (High/Medium), "fixAction"],
        "killRatioVerdict": string (A ruthless, 1-sentence verdict on the candidate's chances)
    }}
    
    Return ONLY the raw JSON string."""

    result = await generate(prompt, SYSTEM_PROMPT_INTERVIEWER, temperature=0.2)
    try:
        text = result.text.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1] if "\n" in text else text[3:]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()
            if text.startswith("json"):
                text = text[4:].strip()
        return json.loads(text)
    except json.JSONDecodeError:
        return {"error": "Failed to perform job match analysis"}


async def generate_company_prep(company_name: str) -> dict:
    """Generate targeted company interview prep guide."""
    prompt = f"""Create a targeted interview preparation guide for {company_name}.
    
Return a JSON object with:
- "company": string (the company name)
- "description": string (1-2 sentences summarizing the interview style)
- "corePhilosophy": array of 3 objects, each with "title", "desc" (description), and "icon" (string name of a Lucide icon like 'Brain', 'Code', 'Globe', 'Target', 'Zap')
- "targetedScenarios": array of 3-4 objects, each with "title", "category" (e.g. 'System Design', 'Behavioral'), "time" (e.g. '45 mins'), and "desc" (brief description of what it assesses)

Return ONLY the JSON object."""

    result = await generate(prompt, SYSTEM_PROMPT_INTERVIEWER, temperature=0.7)
    try:
        text = result.text.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1] if "\n" in text else text[3:]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()
        return json.loads(text)
    except json.JSONDecodeError:
        raise AIProviderError("all", "Failed to parse company prep JSON")


def _fallback_questions(role: str, company: str, num: int) -> list[dict]:
    """Hardcoded fallback when AI completely fails."""
    templates = [
        {"category": "Behavioral", "text": f"Tell me about a time you demonstrated leadership in a {role} context.", "sub_prompt": "Use the STAR method.", "time_limit": 300},
        {"category": "Technical", "text": f"Design a scalable system relevant to {company}'s core product.", "sub_prompt": "Focus on trade-offs and scalability.", "time_limit": 600},
        {"category": "System Design", "text": "How would you design a real-time notification system?", "sub_prompt": "Consider push vs pull models.", "time_limit": 600},
        {"category": "Algorithms", "text": "Describe an efficient algorithm for finding the k-th largest element.", "sub_prompt": "Discuss time complexity.", "time_limit": 300},
        {"category": "Behavioral", "text": "Describe a situation where you had to make a decision with incomplete information.", "sub_prompt": "Focus on your decision framework.", "time_limit": 300},
    ]
    return templates[:num]


def _fallback_feedback() -> dict:
    return {
        "overallScore": 75,
        "overallAssessment": "Your responses demonstrated solid technical understanding with room for improvement in communication clarity.",
        "strengths": [
            {"title": "Technical Knowledge", "description": "Showed strong understanding of core concepts."},
            {"title": "Problem Approach", "description": "Systematic approach to problem decomposition."},
            {"title": "Communication", "description": "Clear and concise verbal delivery."},
        ],
        "improvements": [
            {"title": "Depth of Analysis", "description": "Could explore edge cases more thoroughly."},
            {"title": "Time Management", "description": "Some answers exceeded the suggested time limit."},
            {"title": "Specificity", "description": "Use more concrete examples from past experience."},
        ],
        "recommendedActions": [
            {"title": "System Design Fundamentals", "link": "#"},
            {"title": "Behavioral Interview Practice", "link": "#"},
        ],
        "vocalConfidenceData": [
            {"label": "Intro", "value": 70},
            {"label": "Technical Q1", "value": 60},
            {"label": "Behavioral", "value": 80},
            {"label": "System Design", "value": 55},
            {"label": "Closing", "value": 75},
        ],
    }
