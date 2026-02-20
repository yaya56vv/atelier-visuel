"""Service recherche documentaire externe — Tavily API.

Fournit une recherche web structurée pour l'IA de l'Atelier.
Les résultats sont nettoyés et prêts à être injectés comme contexte IA
ou transformés en blocs du graphe.

Configuration : TAVILY_API_KEY dans le fichier .env
"""

import os
import json
import httpx
import traceback

TAVILY_API_URL = "https://api.tavily.com/search"


def get_tavily_key() -> str | None:
    """Récupère la clé API Tavily depuis les variables d'environnement."""
    key = os.environ.get("TAVILY_API_KEY", "")
    if not key or key.startswith("tvly-COLLE"):
        return None
    return key


async def recherche_web(
    query: str,
    max_results: int = 5,
    search_depth: str = "advanced",
    include_answer: bool = True,
) -> dict:
    """Effectue une recherche web via Tavily.

    Args:
        query: La requête de recherche
        max_results: Nombre max de résultats (1-10)
        search_depth: "basic" (rapide) ou "advanced" (plus complet)
        include_answer: Si True, Tavily génère une réponse synthétique

    Returns:
        dict avec :
        - "answer": réponse synthétique (si include_answer)
        - "results": liste de {title, url, content, score}
        - "error": message d'erreur (ou None)
    """
    api_key = get_tavily_key()
    if not api_key:
        return {
            "answer": None,
            "results": [],
            "error": "Clé API Tavily non configurée. Ajoutez TAVILY_API_KEY dans le fichier .env",
        }

    payload = {
        "api_key": api_key,
        "query": query,
        "max_results": min(max_results, 10),
        "search_depth": search_depth,
        "include_answer": include_answer,
        "include_raw_content": False,
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(TAVILY_API_URL, json=payload)
            resp.raise_for_status()
            data = resp.json()

        results = []
        for r in data.get("results", []):
            results.append({
                "title": r.get("title", ""),
                "url": r.get("url", ""),
                "content": r.get("content", ""),
                "score": r.get("score", 0),
            })

        return {
            "answer": data.get("answer"),
            "results": results,
            "error": None,
        }

    except httpx.HTTPStatusError as e:
        msg = f"Erreur HTTP Tavily: {e.response.status_code}"
        print(f"[Recherche] {msg}")
        return {"answer": None, "results": [], "error": msg}
    except Exception as e:
        print(f"[Recherche] Erreur: {e}")
        traceback.print_exc()
        return {"answer": None, "results": [], "error": str(e)}


async def recherche_multi(queries: list[str], max_results_per_query: int = 3) -> list[dict]:
    """Effectue plusieurs recherches et agrège les résultats.

    Utile pour comparer plusieurs outils ou concepts.
    """
    all_results = []
    for q in queries:
        result = await recherche_web(q, max_results=max_results_per_query)
        all_results.append({
            "query": q,
            **result,
        })
    return all_results
