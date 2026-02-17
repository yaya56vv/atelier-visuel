"""Service IA — Routeur : dispatch vers Ollama / LM Studio / API selon config utilisateur."""

import httpx

from db.database import get_db


async def get_ia_config(role: str) -> dict | None:
    """Lit la configuration IA pour un rôle donné (graphe ou assistant)."""
    db = await get_db()
    rows = await db.execute_fetchall("SELECT * FROM config_ia WHERE role = ?", (role,))
    if not rows:
        return None
    return dict(rows[0])


async def call_ia(role: str, prompt: str, system: str = "") -> str | None:
    """Appelle le modèle IA configuré pour le rôle donné.

    Retourne la réponse texte ou None si non configuré / erreur.
    """
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
            return await _call_api(url, modele, cle_api, prompt, system)
    except Exception:
        return None

    return None


async def _call_ollama(url: str | None, modele: str | None, prompt: str, system: str) -> str | None:
    """Appel vers Ollama / LM Studio (format OpenAI-compatible)."""
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


async def _call_api(url: str | None, modele: str | None, cle_api: str | None, prompt: str, system: str) -> str | None:
    """Appel vers une API externe (format OpenAI-compatible)."""
    if not url or not modele or not cle_api:
        return None

    endpoint = f"{url.rstrip('/')}/v1/chat/completions"
    headers = {"Authorization": f"Bearer {cle_api}", "Content-Type": "application/json"}
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})

    payload = {"model": modele, "messages": messages}

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(endpoint, json=payload, headers=headers)
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"]
