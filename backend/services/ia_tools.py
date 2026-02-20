"""Service IA Tools — Définition et exécution des outils que l'IA peut appeler.

Architecture tool calling :
1. L'IA reçoit la liste des outils disponibles avec le prompt
2. L'IA peut répondre avec un appel d'outil (function call)
3. Le backend exécute l'outil et renvoie le résultat
4. L'IA formule sa réponse finale avec le résultat

Principe de souveraineté : les outils s'exécutent UNIQUEMENT après validation utilisateur.
En V1, on exécute directement (l'utilisateur a déjà validé en posant la question).
En V2, on ajoutera un mode "proposition" avec validation explicite.
"""

import uuid
import json
import os
from datetime import datetime, timezone

from db.database import get_db


# ═══════════════════════════════════════════════════════════
#  DÉFINITIONS DES OUTILS (format OpenAI function calling)
# ═══════════════════════════════════════════════════════════

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "creer_bloc",
            "description": "Crée un nouveau bloc dans l'espace actif. Utilise les couleurs sémantiques (green=fait, orange=problème, yellow=solution, blue=logique, violet=sens profond, mauve=concept) et les formes épistémiques (cloud=intuition, rounded-rect=idée structurée, square=texte fondateur, oval=processus, circle=cœur/centre).",
            "parameters": {
                "type": "object",
                "properties": {
                    "titre": {
                        "type": "string",
                        "description": "Titre du bloc (max 60 caractères)"
                    },
                    "couleur": {
                        "type": "string",
                        "enum": ["green", "orange", "yellow", "blue", "violet", "mauve"],
                        "description": "Couleur sémantique du bloc"
                    },
                    "forme": {
                        "type": "string",
                        "enum": ["cloud", "rounded-rect", "square", "oval", "circle"],
                        "description": "Forme épistémique du bloc"
                    },
                    "contenu": {
                        "type": "string",
                        "description": "Contenu textuel détaillé du bloc (optionnel)"
                    },
                    "x": {
                        "type": "number",
                        "description": "Position X (optionnel, auto-positionné si omis)"
                    },
                    "y": {
                        "type": "number",
                        "description": "Position Y (optionnel, auto-positionné si omis)"
                    }
                },
                "required": ["titre", "couleur", "forme"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "creer_liaison",
            "description": "Crée une liaison entre deux blocs existants. Utilise les titres des blocs pour les identifier.",
            "parameters": {
                "type": "object",
                "properties": {
                    "bloc_source_titre": {
                        "type": "string",
                        "description": "Titre (ou début du titre) du bloc source"
                    },
                    "bloc_cible_titre": {
                        "type": "string",
                        "description": "Titre (ou début du titre) du bloc cible"
                    },
                    "type_liaison": {
                        "type": "string",
                        "enum": ["simple", "logique", "tension", "ancree"],
                        "description": "Type de la liaison"
                    }
                },
                "required": ["bloc_source_titre", "bloc_cible_titre", "type_liaison"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "modifier_bloc",
            "description": "Modifie les propriétés d'un bloc existant (couleur, forme, titre).",
            "parameters": {
                "type": "object",
                "properties": {
                    "bloc_titre": {
                        "type": "string",
                        "description": "Titre actuel (ou début) du bloc à modifier"
                    },
                    "nouveau_titre": {
                        "type": "string",
                        "description": "Nouveau titre (optionnel)"
                    },
                    "nouvelle_couleur": {
                        "type": "string",
                        "enum": ["green", "orange", "yellow", "blue", "violet", "mauve"],
                        "description": "Nouvelle couleur (optionnel)"
                    },
                    "nouvelle_forme": {
                        "type": "string",
                        "enum": ["cloud", "rounded-rect", "square", "oval", "circle"],
                        "description": "Nouvelle forme (optionnel)"
                    }
                },
                "required": ["bloc_titre"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "supprimer_bloc",
            "description": "Supprime un bloc et toutes ses liaisons. Action irréversible.",
            "parameters": {
                "type": "object",
                "properties": {
                    "bloc_titre": {
                        "type": "string",
                        "description": "Titre (ou début) du bloc à supprimer"
                    }
                },
                "required": ["bloc_titre"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "lire_document",
            "description": "Lit le contenu d'un fichier local (texte, markdown, PDF texte). Permet à l'IA de consulter un document pour en extraire des informations à structurer en graphe.",
            "parameters": {
                "type": "object",
                "properties": {
                    "chemin": {
                        "type": "string",
                        "description": "Chemin absolu du fichier sur le PC (ex: C:\\Users\\...\\document.md)"
                    }
                },
                "required": ["chemin"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "lister_blocs",
            "description": "Liste tous les blocs de l'espace actif avec leurs propriétés.",
            "parameters": {
                "type": "object",
                "properties": {}
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "reorganiser_graphe",
            "description": "Réorganise visuellement tous les blocs de l'espace avec un algorithme force-directed. Les nœuds très connectés se retrouvent au centre, les clusters émergent par affinité, les nœuds isolés flottent en périphérie. APPELER SYSTÉMATIQUEMENT après avoir créé plusieurs blocs et liaisons pour obtenir une disposition organique vivante.",
            "parameters": {
                "type": "object",
                "properties": {}
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "importer_youtube",
            "description": "Importe une vidéo YouTube dans le graphe : stocke l'URL, la miniature, et extrait la transcription (sous-titres) pour l'indexation. Crée un bloc mauve (concept en création). Utilise cet outil quand l'utilisateur partage un lien YouTube ou demande d'importer une vidéo.",
            "parameters": {
                "type": "object",
                "properties": {
                    "url": {
                        "type": "string",
                        "description": "URL de la vidéo YouTube"
                    },
                    "bloc_id": {
                        "type": "string",
                        "description": "ID du bloc existant où ajouter (optionnel, crée un nouveau bloc si omis)"
                    }
                },
                "required": ["url"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "stocker_document_web",
            "description": "Télécharge une page web et stocke son contenu dans un bloc. Modes : 'brut' (stocke le texte complet dans un seul bloc), 'analyse' (crée plusieurs blocs thématiques reliés au bloc source), 'les_deux' (stocke brut + crée des blocs d'analyse). Utilise cet outil quand l'utilisateur veut capturer et conserver le contenu d'un site web dans le graphe.",
            "parameters": {
                "type": "object",
                "properties": {
                    "url": {
                        "type": "string",
                        "description": "URL de la page web à télécharger"
                    },
                    "mode": {
                        "type": "string",
                        "enum": ["brut", "analyse", "les_deux"],
                        "description": "Mode de stockage : brut (texte complet), analyse (blocs thématiques), les_deux"
                    },
                    "bloc_id": {
                        "type": "string",
                        "description": "ID du bloc existant où stocker (optionnel, crée un nouveau bloc si omis)"
                    },
                    "titre": {
                        "type": "string",
                        "description": "Titre pour le bloc créé (optionnel, extrait de la page si omis)"
                    }
                },
                "required": ["url", "mode"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "recherche_web",
            "description": "Effectue une recherche sur le web pour trouver des informations actuelles. Retourne des résultats structurés (titre, URL, contenu, score de pertinence) et une réponse synthétique. Utile pour rechercher des logiciels, des principes architecturaux, des tendances, des comparaisons techniques, etc.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "La requête de recherche (en français ou anglais)"
                    },
                    "max_results": {
                        "type": "integer",
                        "description": "Nombre max de résultats (1-10, défaut 5)"
                    }
                },
                "required": ["query"]
            }
        }
    },
]


# ═══════════════════════════════════════════════════════════
#  EXÉCUTION DES OUTILS
# ═══════════════════════════════════════════════════════════

async def _find_bloc_by_titre(espace_id: str, titre_partiel: str) -> dict | None:
    """Trouve un bloc par correspondance partielle du titre."""
    db = await get_db()
    blocs = await db.execute_fetchall(
        "SELECT * FROM blocs WHERE espace_id = ?", (espace_id,)
    )
    titre_lower = titre_partiel.lower().strip()
    for b in blocs:
        b = dict(b)
        titre_ia = (b.get("titre_ia") or "").lower()
        if titre_lower in titre_ia or titre_ia in titre_lower:
            return b
    # Deuxième passe : recherche plus souple
    for b in blocs:
        b = dict(b)
        titre_ia = (b.get("titre_ia") or "").lower()
        # Correspondance par mots-clés
        mots = titre_lower.split()
        if mots and all(m in titre_ia for m in mots):
            return b
    return None


async def _auto_position(espace_id: str) -> tuple[float, float]:
    """Calcule une position automatique pour un nouveau bloc (grille en spirale)."""
    db = await get_db()
    blocs = await db.execute_fetchall(
        "SELECT x, y FROM blocs WHERE espace_id = ?", (espace_id,)
    )
    n = len(blocs)
    # Disposition en grille avec espacement
    cols = 4
    col = n % cols
    row = n // cols
    x = 100 + col * 280
    y = 100 + row * 200
    return (x, y)


async def execute_tool(espace_id: str, tool_name: str, arguments: dict) -> str:
    """Exécute un outil et retourne le résultat sous forme de texte."""
    db = await get_db()
    now = datetime.now(timezone.utc).isoformat()

    try:
        if tool_name == "creer_bloc":
            titre = arguments.get("titre", "Sans titre")
            couleur = arguments.get("couleur", "green")
            forme = arguments.get("forme", "rounded-rect")
            contenu = arguments.get("contenu")
            x = arguments.get("x")
            y = arguments.get("y")

            if x is None or y is None:
                x, y = await _auto_position(espace_id)

            bloc_id = str(uuid.uuid4())
            await db.execute(
                """INSERT INTO blocs (id, espace_id, x, y, forme, couleur, largeur, hauteur, titre_ia, created_at, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?, 200, 120, ?, ?, ?)""",
                (bloc_id, espace_id, x, y, forme, couleur, titre, now, now),
            )

            if contenu:
                contenu_id = str(uuid.uuid4())
                await db.execute(
                    """INSERT INTO contenus_bloc (id, bloc_id, type, contenu, ordre, created_at)
                       VALUES (?, ?, 'texte', ?, 0, ?)""",
                    (contenu_id, bloc_id, contenu, now),
                )
                # Générer resume_ia à partir du contenu
                resume = contenu[:150] + "..." if len(contenu) > 150 else contenu
                await db.execute(
                    "UPDATE blocs SET resume_ia = ? WHERE id = ?",
                    (resume, bloc_id),
                )

            await db.commit()
            return f"✓ Bloc créé : \"{titre}\" [{couleur}/{forme}] à position ({x:.0f}, {y:.0f})"

        elif tool_name == "creer_liaison":
            src_titre = arguments.get("bloc_source_titre", "")
            dst_titre = arguments.get("bloc_cible_titre", "")
            type_l = arguments.get("type_liaison", "simple")

            src = await _find_bloc_by_titre(espace_id, src_titre)
            dst = await _find_bloc_by_titre(espace_id, dst_titre)

            if not src:
                return f"✗ Bloc source introuvable : \"{src_titre}\""
            if not dst:
                return f"✗ Bloc cible introuvable : \"{dst_titre}\""
            if src["id"] == dst["id"]:
                return "✗ Impossible de lier un bloc à lui-même"

            liaison_id = str(uuid.uuid4())
            await db.execute(
                """INSERT INTO liaisons (id, espace_id, bloc_source_id, bloc_cible_id, type, created_at)
                   VALUES (?, ?, ?, ?, ?, ?)""",
                (liaison_id, espace_id, src["id"], dst["id"], type_l, now),
            )
            await db.commit()
            return f"✓ Liaison créée : \"{src.get('titre_ia', '?')}\" --[{type_l}]--> \"{dst.get('titre_ia', '?')}\""

        elif tool_name == "modifier_bloc":
            bloc_titre = arguments.get("bloc_titre", "")
            bloc = await _find_bloc_by_titre(espace_id, bloc_titre)
            if not bloc:
                return f"✗ Bloc introuvable : \"{bloc_titre}\""

            updates = []
            params = []
            if "nouveau_titre" in arguments and arguments["nouveau_titre"]:
                updates.append("titre_ia = ?")
                params.append(arguments["nouveau_titre"])
            if "nouvelle_couleur" in arguments and arguments["nouvelle_couleur"]:
                updates.append("couleur = ?")
                params.append(arguments["nouvelle_couleur"])
            if "nouvelle_forme" in arguments and arguments["nouvelle_forme"]:
                updates.append("forme = ?")
                params.append(arguments["nouvelle_forme"])

            if not updates:
                return "✗ Aucune modification spécifiée"

            updates.append("updated_at = ?")
            params.append(now)
            params.append(bloc["id"])

            await db.execute(
                f"UPDATE blocs SET {', '.join(updates)} WHERE id = ?",
                params,
            )
            await db.commit()
            return f"✓ Bloc \"{bloc.get('titre_ia', '?')}\" modifié"

        elif tool_name == "supprimer_bloc":
            bloc_titre = arguments.get("bloc_titre", "")
            bloc = await _find_bloc_by_titre(espace_id, bloc_titre)
            if not bloc:
                return f"✗ Bloc introuvable : \"{bloc_titre}\""

            await db.execute("DELETE FROM contenus_bloc WHERE bloc_id = ?", (bloc["id"],))
            await db.execute("DELETE FROM liaisons WHERE bloc_source_id = ? OR bloc_cible_id = ?", (bloc["id"], bloc["id"]))
            await db.execute("DELETE FROM blocs WHERE id = ?", (bloc["id"],))
            await db.commit()
            return f"✓ Bloc \"{bloc.get('titre_ia', '?')}\" supprimé avec ses liaisons"

        elif tool_name == "lire_document":
            chemin = arguments.get("chemin", "")
            if not chemin or not os.path.exists(chemin):
                return f"✗ Fichier introuvable : \"{chemin}\""

            # Sécurité : limiter aux extensions textuelles
            ext = os.path.splitext(chemin)[1].lower()
            if ext not in ('.txt', '.md', '.markdown', '.json', '.csv', '.py', '.js', '.ts',
                           '.html', '.css', '.xml', '.yaml', '.yml', '.toml', '.docx', '.log'):
                return f"✗ Type de fichier non supporté : {ext}. Formats acceptés : texte, markdown, code, JSON, CSV."

            try:
                # Tenter lecture UTF-8 puis Latin-1
                try:
                    with open(chemin, 'r', encoding='utf-8') as f:
                        contenu = f.read()
                except UnicodeDecodeError:
                    with open(chemin, 'r', encoding='latin-1') as f:
                        contenu = f.read()

                # Limiter la taille pour le contexte IA
                max_chars = 15000
                if len(contenu) > max_chars:
                    contenu = contenu[:max_chars] + f"\n\n[... tronqué à {max_chars} caractères sur {len(contenu)} total]"

                nom_fichier = os.path.basename(chemin)
                return f"✓ Document lu : \"{nom_fichier}\" ({len(contenu)} caractères)\n\n---\n{contenu}"
            except Exception as e:
                return f"✗ Erreur de lecture : {e}"

        elif tool_name == "lister_blocs":
            blocs = await db.execute_fetchall(
                "SELECT * FROM blocs WHERE espace_id = ? ORDER BY created_at", (espace_id,)
            )
            if not blocs:
                return "L'espace est vide — aucun bloc."

            lines = [f"{len(blocs)} blocs dans l'espace :"]
            for b in blocs:
                b = dict(b)
                titre = b.get("titre_ia") or "(sans titre)"
                lines.append(f"  • [{b['couleur']}/{b['forme']}] \"{titre}\"")
            return "\n".join(lines)

        elif tool_name == "reorganiser_graphe":
            from services.force_layout import reorganiser_espace
            result = await reorganiser_espace(espace_id)
            return result

        elif tool_name == "importer_youtube":
            from services.import_parser import parse_youtube_url

            url = arguments.get("url", "")
            bloc_id = arguments.get("bloc_id")

            if not url:
                return "✗ URL YouTube manquante"

            yt = await parse_youtube_url(url)
            if not yt.get("video_id"):
                return f"✗ {yt.get('error', 'URL YouTube invalide')}"

            titre = yt.get("title") or f"YouTube: {yt['video_id']}"
            actions = []

            if not bloc_id:
                bloc_id = str(uuid.uuid4())
                x, y = await _auto_position(espace_id)
                await db.execute(
                    """INSERT INTO blocs (id, espace_id, x, y, forme, couleur, largeur, hauteur, titre_ia, created_at, updated_at)
                       VALUES (?, ?, ?, ?, 'rounded-rect', 'mauve', 240, 140, ?, ?, ?)""",
                    (bloc_id, espace_id, x, y, titre[:60], now, now),
                )
                actions.append(f'Bloc créé : "{titre[:60]}"')

            # Stocker l'URL vidéo
            contenu_url_id = str(uuid.uuid4())
            thumbnail_url = f"https://img.youtube.com/vi/{yt['video_id']}/hqdefault.jpg"
            await db.execute(
                """INSERT INTO contenus_bloc (id, bloc_id, type, contenu, metadata, ordre, created_at)
                   VALUES (?, ?, 'video_ref', ?, ?, 0, ?)""",
                (contenu_url_id, bloc_id, url,
                 json.dumps({"video_id": yt["video_id"], "title": yt.get("title"), "thumbnail": thumbnail_url, "source": "youtube"}, ensure_ascii=False), now),
            )
            actions.append("URL vidéo stockée")

            if yt.get("transcript"):
                contenu_text_id = str(uuid.uuid4())
                await db.execute(
                    """INSERT INTO contenus_bloc (id, bloc_id, type, contenu, metadata, ordre, created_at)
                       VALUES (?, ?, 'texte', ?, ?, 1, ?)""",
                    (contenu_text_id, bloc_id, yt["transcript"],
                     json.dumps({"extracted": True, "source": "youtube_transcript", "video_id": yt["video_id"]}, ensure_ascii=False), now),
                )
                resume = yt["transcript"][:200] + "..."
                await db.execute("UPDATE blocs SET resume_ia = ?, updated_at = ? WHERE id = ?", (resume, now, bloc_id))
                actions.append(f"Transcription stockée ({len(yt['transcript'])} car.)")
            else:
                actions.append(f"Transcription non disponible : {yt.get('error', 'inconnue')}")

            await db.commit()
            return f"✓ {' | '.join(actions)}"

        elif tool_name == "stocker_document_web":
            import httpx

            url = arguments.get("url", "")
            mode = arguments.get("mode", "brut")
            bloc_id = arguments.get("bloc_id")
            titre_arg = arguments.get("titre")

            if not url:
                return "✗ URL manquante"

            # Télécharger la page web
            try:
                async with httpx.AsyncClient(timeout=15, follow_redirects=True) as client:
                    resp = await client.get(url, headers={
                        "User-Agent": "Mozilla/5.0 (Atelier Visuel de Pensée)"
                    })
                    resp.raise_for_status()
                    html = resp.text
            except Exception as e:
                return f"✗ Erreur téléchargement : {e}"

            # Extraire le texte avec BeautifulSoup
            try:
                from bs4 import BeautifulSoup
                soup = BeautifulSoup(html, "html.parser")
                # Supprimer scripts et styles
                for tag in soup(["script", "style", "nav", "footer", "header"]):
                    tag.decompose()
                text = soup.get_text(separator="\n", strip=True)
                page_title = soup.title.string if soup.title else url
            except ImportError:
                # Fallback sans BS4 : extraction basique
                import re
                text = re.sub(r'<[^>]+>', ' ', html)
                text = re.sub(r'\s+', ' ', text).strip()
                page_title = url

            # Limiter le texte
            max_chars = 30000
            full_text = text
            if len(text) > max_chars:
                text = text[:max_chars] + f"\n\n[... tronqué à {max_chars} car. sur {len(full_text)} total]"

            titre_final = titre_arg or (page_title[:60] if page_title else url[:60])
            actions = []

            # Mode brut : stocker dans un bloc
            if mode in ("brut", "les_deux"):
                if not bloc_id:
                    # Créer un nouveau bloc
                    bloc_id = str(uuid.uuid4())
                    x, y = await _auto_position(espace_id)
                    await db.execute(
                        """INSERT INTO blocs (id, espace_id, x, y, forme, couleur, largeur, hauteur, titre_ia, created_at, updated_at)
                           VALUES (?, ?, ?, ?, 'rounded-rect', 'green', 240, 140, ?, ?, ?)""",
                        (bloc_id, espace_id, x, y, titre_final, now, now),
                    )
                    actions.append(f'Bloc créé : "{titre_final}"')

                # Stocker l'URL comme contenu
                contenu_url_id = str(uuid.uuid4())
                await db.execute(
                    """INSERT INTO contenus_bloc (id, bloc_id, type, contenu, metadata, ordre, created_at)
                       VALUES (?, ?, 'url', ?, ?, 0, ?)""",
                    (contenu_url_id, bloc_id, url, json.dumps({"source": "web_capture", "titre_page": str(page_title)}), now),
                )

                # Stocker le texte extrait
                contenu_text_id = str(uuid.uuid4())
                await db.execute(
                    """INSERT INTO contenus_bloc (id, bloc_id, type, contenu, metadata, ordre, created_at)
                       VALUES (?, ?, 'texte', ?, ?, 1, ?)""",
                    (contenu_text_id, bloc_id, text, json.dumps({"extracted": True, "source_url": url}), now),
                )

                # Mettre à jour resume_ia
                resume = text[:200] + "..." if len(text) > 200 else text
                await db.execute(
                    "UPDATE blocs SET resume_ia = ?, updated_at = ? WHERE id = ?",
                    (resume, now, bloc_id),
                )
                actions.append(f"Texte stocké ({len(full_text)} car.)")

            await db.commit()

            # Mode analyse : retourner le texte pour que l'IA crée des blocs thématiques
            if mode in ("analyse", "les_deux"):
                # On retourne le texte pour que l'IA le décompose en blocs via creer_bloc
                extrait = text[:8000]  # Limiter pour le contexte IA
                actions.append(f"Mode analyse : texte prêt pour décomposition ({len(extrait)} car.)")
                return (
                    f"✓ {' | '.join(actions)}\n"
                    f"Bloc source ID : {bloc_id}\n"
                    f"\n--- CONTENU DE LA PAGE (pour analyse) ---\n{extrait}\n"
                    f"\n--- FIN ---\n"
                    f"Crée maintenant des blocs thématiques à partir de ce contenu, "
                    f"puis relie-les au bloc source avec des liaisons."
                )

            return f"✓ {' | '.join(actions)}"

        elif tool_name == "recherche_web":
            from services.recherche_externe import recherche_web as do_search

            query = arguments.get("query", "")
            max_results = arguments.get("max_results", 5)

            if not query:
                return "✗ Requête de recherche vide"

            result = await do_search(query, max_results=max_results)

            if result.get("error"):
                return f"✗ Erreur recherche : {result['error']}"

            lines = [f"✓ Recherche : \"{query}\" — {len(result['results'])} résultats"]

            if result.get("answer"):
                lines.append(f"\nSynthèse : {result['answer']}")

            lines.append("")
            for i, r in enumerate(result["results"], 1):
                lines.append(f"{i}. **{r['title']}**")
                lines.append(f"   URL: {r['url']}")
                if r.get("content"):
                    # Limiter le contenu pour ne pas exploser le contexte
                    content = r["content"][:500]
                    lines.append(f"   {content}")
                lines.append("")

            return "\n".join(lines)

        else:
            return f"✗ Outil inconnu : {tool_name}"

    except Exception as e:
        import traceback
        traceback.print_exc()
        return f"✗ Erreur d'exécution : {e}"
