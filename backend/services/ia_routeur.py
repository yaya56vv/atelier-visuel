"""Service IA — Routeur : dispatch vers Ollama / LM Studio / API selon config utilisateur.

Supporte deux modes :
1. call_ia() — appel simple (messages in, texte out) pour indexation, etc.
2. call_ia_with_tools() — appel avec tool calling pour l'assistant interactif
"""

import json
import httpx
import traceback

from db.database import get_db


async def get_ia_config(role: str) -> dict | None:
    """Lit la configuration IA pour un rôle donné (graphe ou assistant)."""
    db = await get_db()
    rows = await db.execute_fetchall("SELECT * FROM config_ia WHERE role = ?", (role,))
    if not rows:
        return None
    return dict(rows[0])


async def call_ia(role: str, prompt: str, system: str = "") -> str | None:
    """Appel simple : messages in, texte out. Pour indexation, etc."""
    config = await get_ia_config(role)
    if config is None or config.get("mode") is None:
        return None

    mode = config["mode"]
    url = config.get("url")
    modele = config.get("modele")
    cle_api = config.get("cle_api")

    try:
        if mode == "local":
            return await _call_ollama(url, modele, prompt, system)
        elif mode == "api":
            return await _call_api_simple(url, modele, cle_api, prompt, system)
    except Exception as e:
        print(f"[IA Routeur] Erreur appel {role} ({mode}): {e}")
        traceback.print_exc()
        return None

    return None


async def call_ia_with_tools(role: str, messages: list, tools: list) -> dict:
    """Appel avec tool calling : envoie messages + outils, retourne la réponse complète.
    
    Retourne un dict avec :
    - "content": le texte de réponse (ou None si tool call)
    - "tool_calls": liste d'appels d'outils [{name, arguments}] (ou None si texte)
    - "error": message d'erreur (ou None)
    """
    config = await get_ia_config(role)
    if config is None:
        return {"content": None, "tool_calls": None, "error": "IA non configurée"}

    mode = config["mode"]
    url = config.get("url")
    modele = config.get("modele")
    cle_api = config.get("cle_api")

    if mode == "api":
        return await _call_api_tools(url, modele, cle_api, messages, tools)
    elif mode == "local":
        # Ollama ne supporte pas toujours le tool calling
        # Fallback : on passe les outils en tant que description dans le system prompt
        return await _call_ollama_tools_fallback(url, modele, messages, tools)
    
    return {"content": None, "tool_calls": None, "error": f"Mode inconnu: {mode}"}


# ═══════════════════════════════════════════════════════════
#  APPELS BAS NIVEAU
# ═══════════════════════════════════════════════════════════

async def _call_ollama(url: str | None, modele: str | None, prompt: str, system: str) -> str | None:
    """Appel Ollama / LM Studio (format natif)."""
    if not url or not modele:
        return None

    endpoint = f"{url.rstrip('/')}/api/generate"
    payload = {"model": modele, "prompt": prompt, "stream": False}
    if system:
        payload["system"] = system

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(endpoint, json=payload)
        resp.raise_for_status()
        return resp.json().get("response", "")


async def _call_api_simple(url: str | None, modele: str | None, cle_api: str | None,
                           prompt: str, system: str) -> str | None:
    """Appel API OpenAI-compatible sans tools."""
    if not url or not modele or not cle_api:
        return None

    endpoint = f"{url.rstrip('/')}/chat/completions"
    headers = {
        "Authorization": f"Bearer {cle_api}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Atelier Visuel de Pensee",
    }
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})

    payload = {"model": modele, "messages": messages}

    async with httpx.AsyncClient(timeout=120.0) as client:
        resp = await client.post(endpoint, json=payload, headers=headers)
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"]


async def _call_api_tools(url: str | None, modele: str | None, cle_api: str | None,
                          messages: list, tools: list) -> dict:
    """Appel API OpenAI-compatible AVEC tool calling."""
    if not url or not modele or not cle_api:
        return {"content": None, "tool_calls": None, "error": "Configuration API incomplète"}

    endpoint = f"{url.rstrip('/')}/chat/completions"
    headers = {
        "Authorization": f"Bearer {cle_api}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Atelier Visuel de Pensee",
    }

    payload = {
        "model": modele,
        "messages": messages,
        "tools": tools,
        "tool_choice": "auto",
    }

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            resp = await client.post(endpoint, json=payload, headers=headers)
            resp.raise_for_status()
            data = resp.json()

        choice = data["choices"][0]
        message = choice["message"]

        # Vérifier si l'IA a fait un appel d'outil
        if message.get("tool_calls"):
            tool_calls = []
            for tc in message["tool_calls"]:
                func = tc.get("function", {})
                name = func.get("name", "")
                try:
                    arguments = json.loads(func.get("arguments", "{}"))
                except json.JSONDecodeError:
                    arguments = {}
                tool_calls.append({
                    "id": tc.get("id", ""),
                    "name": name,
                    "arguments": arguments,
                })
            return {
                "content": message.get("content"),
                "tool_calls": tool_calls,
                "error": None,
            }
        else:
            return {
                "content": message.get("content", ""),
                "tool_calls": None,
                "error": None,
            }

    except Exception as e:
        print(f"[IA Routeur] Erreur tool calling: {e}")
        traceback.print_exc()
        return {"content": None, "tool_calls": None, "error": str(e)}


async def _call_ollama_tools_fallback(url: str | None, modele: str | None,
                                       messages: list, tools: list) -> dict:
    """Fallback pour Ollama : passe les outils en texte dans le system prompt.
    
    L'IA doit répondre avec un JSON structuré si elle veut appeler un outil.
    """
    if not url or not modele:
        return {"content": None, "tool_calls": None, "error": "Ollama non configuré"}

    # Construire une description textuelle des outils
    tools_desc = "Tu as accès aux outils suivants. Pour en appeler un, réponds UNIQUEMENT avec un JSON :\n"
    tools_desc += '{"tool_call": {"name": "nom_outil", "arguments": {...}}}\n\n'
    tools_desc += "Outils disponibles :\n"
    for t in tools:
        func = t.get("function", {})
        tools_desc += f"- {func['name']}: {func['description']}\n"
        params = func.get("parameters", {}).get("properties", {})
        if params:
            tools_desc += f"  Paramètres: {json.dumps(params, ensure_ascii=False)}\n"
    tools_desc += "\nSi tu n'as pas besoin d'outil, réponds normalement en texte.\n"

    # Injecter dans le premier message système
    augmented_messages = list(messages)
    if augmented_messages and augmented_messages[0].get("role") == "system":
        augmented_messages[0] = {
            "role": "system",
            "content": augmented_messages[0]["content"] + "\n\n" + tools_desc,
        }
    else:
        augmented_messages.insert(0, {"role": "system", "content": tools_desc})

    # Convertir en format Ollama
    prompt_parts = []
    system_content = ""
    for msg in augmented_messages:
        if msg["role"] == "system":
            system_content += msg["content"] + "\n"
        else:
            prompt_parts.append(f"{msg['role']}: {msg['content']}")

    prompt = "\n".join(prompt_parts)

    try:
        endpoint = f"{url.rstrip('/')}/api/generate"
        payload = {"model": modele, "prompt": prompt, "stream": False}
        if system_content:
            payload["system"] = system_content

        async with httpx.AsyncClient(timeout=120.0) as client:
            resp = await client.post(endpoint, json=payload)
            resp.raise_for_status()
            response_text = resp.json().get("response", "")

        # Essayer de parser comme tool call
        try:
            parsed = json.loads(response_text.strip())
            if "tool_call" in parsed:
                tc = parsed["tool_call"]
                return {
                    "content": None,
                    "tool_calls": [{
                        "id": "local_0",
                        "name": tc.get("name", ""),
                        "arguments": tc.get("arguments", {}),
                    }],
                    "error": None,
                }
        except (json.JSONDecodeError, KeyError):
            pass

        return {"content": response_text, "tool_calls": None, "error": None}

    except Exception as e:
        print(f"[IA Routeur] Erreur Ollama fallback: {e}")
        traceback.print_exc()
        return {"content": None, "tool_calls": None, "error": str(e)}
