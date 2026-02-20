"""Service Force-Directed Layout — Disposition organique des blocs.

Simule un système de forces physiques pour positionner les blocs naturellement :
- Répulsion entre tous les nœuds (force de Coulomb)
- Attraction entre nœuds liés (force de ressort / Hooke)
- Gravité douce vers le centre (évite la dispersion)
- Amortissement progressif pour convergence

Inspiré des algorithmes de Fruchterman-Reingold et d3-force.
Le résultat est une disposition organique où :
- Les nœuds très connectés se retrouvent au centre
- Les clusters émergent naturellement par affinité
- Les nœuds isolés flottent en périphérie
- Aucune intersection forcée
"""

import math
import random
from dataclasses import dataclass, field
from datetime import datetime, timezone

from db.database import get_db


@dataclass
class Node:
    id: str
    x: float
    y: float
    w: float
    h: float
    vx: float = 0.0
    vy: float = 0.0
    # Nombre de liaisons (pour pondérer la gravité)
    degree: int = 0


@dataclass
class Edge:
    source_id: str
    target_id: str


# ═══════════════════════════════════════════════════════════
#  PARAMÈTRES DE SIMULATION
# ═══════════════════════════════════════════════════════════

@dataclass
class ForceParams:
    # Répulsion entre nœuds (force de Coulomb)
    repulsion_strength: float = 25000.0
    repulsion_min_distance: float = 80.0

    # Attraction des liaisons (ressort de Hooke)
    attraction_strength: float = 0.005
    ideal_link_distance: float = 450.0

    # Marge minimale entre blocs (en plus de leur taille)
    overlap_padding: float = 40.0

    # Gravité vers le centre
    gravity_strength: float = 0.012
    center_x: float = 600.0
    center_y: float = 400.0

    # Simulation
    iterations: int = 350
    initial_temperature: float = 250.0  # Amplitude max des mouvements
    cooling_factor: float = 0.97        # Refroidissement par itération
    min_temperature: float = 0.5        # Seuil d'arrêt
    velocity_damping: float = 0.85      # Amortissement de vitesse

    # Limites spatiales
    min_x: float = 50.0
    min_y: float = 50.0
    max_x: float = 3000.0
    max_y: float = 2400.0


# ═══════════════════════════════════════════════════════════
#  SIMULATION
# ═══════════════════════════════════════════════════════════

def _apply_repulsion(nodes: list[Node], params: ForceParams):
    """Force de répulsion entre toutes les paires de nœuds."""
    n = len(nodes)
    for i in range(n):
        for j in range(i + 1, n):
            a, b = nodes[i], nodes[j]
            dx = b.x - a.x
            dy = b.y - a.y

            center_dist = math.sqrt(dx * dx + dy * dy)
            center_dist = max(center_dist, 1.0)

            min_sep_x = (a.w + b.w) / 2 + params.overlap_padding
            min_sep_y = (a.h + b.h) / 2 + params.overlap_padding
            nx = dx / center_dist
            ny = dy / center_dist
            min_sep = math.sqrt((min_sep_x * nx) ** 2 + (min_sep_y * ny) ** 2)

            effective_dist = max(center_dist - min_sep, params.repulsion_min_distance)

            force = params.repulsion_strength / (effective_dist * effective_dist)

            if center_dist < min_sep:
                overlap_ratio = 1.0 - (center_dist / min_sep)
                force += params.repulsion_strength * overlap_ratio * 2.0

            fx = (dx / center_dist) * force
            fy = (dy / center_dist) * force

            a.vx -= fx
            a.vy -= fy
            b.vx += fx
            b.vy += fy


def _apply_attraction(nodes: list[Node], edges: list[Edge], node_map: dict[str, Node], params: ForceParams):
    """Force d'attraction entre nœuds liés (ressort de Hooke)."""
    for edge in edges:
        a = node_map.get(edge.source_id)
        b = node_map.get(edge.target_id)
        if not a or not b:
            continue

        dx = b.x - a.x
        dy = b.y - a.y
        dist = math.sqrt(dx * dx + dy * dy)
        dist = max(dist, 1.0)

        displacement = dist - params.ideal_link_distance
        force = params.attraction_strength * displacement

        fx = (dx / dist) * force
        fy = (dy / dist) * force

        a.vx += fx
        a.vy += fy
        b.vx -= fx
        b.vy -= fy


def _apply_gravity(nodes: list[Node], params: ForceParams):
    """Gravité douce vers le centre — plus forte pour les nœuds très connectés."""
    for node in nodes:
        dx = params.center_x - node.x
        dy = params.center_y - node.y
        weight = 1.0 + node.degree * 0.3
        node.vx += dx * params.gravity_strength * weight
        node.vy += dy * params.gravity_strength * weight


def _apply_velocity(nodes: list[Node], temperature: float, params: ForceParams):
    """Applique les vitesses aux positions avec amortissement et limites."""
    for node in nodes:
        node.vx *= params.velocity_damping
        node.vy *= params.velocity_damping

        speed = math.sqrt(node.vx * node.vx + node.vy * node.vy)
        if speed > temperature:
            node.vx = (node.vx / speed) * temperature
            node.vy = (node.vy / speed) * temperature

        node.x += node.vx
        node.y += node.vy

        node.x = max(params.min_x, min(params.max_x, node.x))
        node.y = max(params.min_y, min(params.max_y, node.y))


def simulate_forces(nodes: list[Node], edges: list[Edge], params: ForceParams | None = None) -> list[Node]:
    """Lance la simulation force-directed. Retourne les nœuds avec positions finales."""
    if params is None:
        params = ForceParams()

    if not nodes:
        return nodes

    n = len(nodes)
    avg_w = sum(node.w for node in nodes) / n
    avg_h = sum(node.h for node in nodes) / n
    avg_size = (avg_w + avg_h) / 2
    spread = math.sqrt(n) * (avg_size + params.overlap_padding) * 1.8
    params.center_x = spread / 2 + 100
    params.center_y = spread / 2 + 100
    params.max_x = spread + 400
    params.max_y = spread + 400

    node_map = {node.id: node for node in nodes}

    for edge in edges:
        if edge.source_id in node_map:
            node_map[edge.source_id].degree += 1
        if edge.target_id in node_map:
            node_map[edge.target_id].degree += 1

    sorted_nodes = sorted(nodes, key=lambda n: n.degree, reverse=True)
    for i, node in enumerate(sorted_nodes):
        angle = (2 * math.pi * i) / len(nodes) + random.uniform(-0.3, 0.3)
        radius = spread * 0.3 * (1.0 - node.degree / max(1, max(n.degree for n in nodes)) * 0.5)
        radius += random.uniform(-50, 50)
        node.x = params.center_x + radius * math.cos(angle)
        node.y = params.center_y + radius * math.sin(angle)

    temperature = params.initial_temperature

    for iteration in range(params.iterations):
        if temperature < params.min_temperature:
            break

        _apply_repulsion(nodes, params)
        _apply_attraction(nodes, edges, node_map, params)
        _apply_gravity(nodes, params)
        _apply_velocity(nodes, temperature, params)

        temperature *= params.cooling_factor

    return nodes


# ═══════════════════════════════════════════════════════════
#  INTÉGRATION BASE DE DONNÉES — MODE ESPACE
# ═══════════════════════════════════════════════════════════

async def reorganiser_espace(espace_id: str) -> str:
    """Réorganise les blocs d'un espace avec l'algorithme force-directed.

    Persiste dans x / y (coordonnées locales de l'espace).
    """
    db = await get_db()

    blocs = await db.execute_fetchall(
        "SELECT id, x, y, largeur, hauteur, titre_ia FROM blocs WHERE espace_id = ?",
        (espace_id,),
    )
    if not blocs:
        return "Espace vide — rien à réorganiser."

    # V2 : modèle unifié, pas de espace_id dans liaisons
    bloc_ids = [dict(b)["id"] for b in blocs]
    if bloc_ids:
        placeholders = ",".join("?" * len(bloc_ids))
        liaisons = await db.execute_fetchall(
            f"""SELECT bloc_source_id, bloc_cible_id FROM liaisons
                WHERE bloc_source_id IN ({placeholders}) OR bloc_cible_id IN ({placeholders})""",
            bloc_ids + bloc_ids,
        )
    else:
        liaisons = []

    nodes = [
        Node(id=dict(b)["id"], x=dict(b)["x"], y=dict(b)["y"],
             w=dict(b).get("largeur", 200), h=dict(b).get("hauteur", 120))
        for b in blocs
    ]
    edges = [
        Edge(source_id=dict(l)["bloc_source_id"], target_id=dict(l)["bloc_cible_id"])
        for l in liaisons
    ]

    result_nodes = simulate_forces(nodes, edges)

    now = datetime.now(timezone.utc).isoformat()
    for node in result_nodes:
        await db.execute(
            "UPDATE blocs SET x = ?, y = ?, updated_at = ? WHERE id = ?",
            (round(node.x, 1), round(node.y, 1), now, node.id),
        )
    await db.commit()

    central = max(result_nodes, key=lambda n: n.degree) if result_nodes else None
    summary = f"✓ {len(result_nodes)} blocs réorganisés (force-directed)."
    if central and central.degree > 0:
        for b in blocs:
            b = dict(b)
            if b["id"] == central.id:
                summary += f'\n  Nœud central : "{b.get("titre_ia", "?")}" ({central.degree} connexions)'
                break
    summary += f"\n  {len(edges)} liaisons traitées."
    return summary


# ═══════════════════════════════════════════════════════════
#  INTÉGRATION BASE DE DONNÉES — MODE GRAPHE GLOBAL
# ═══════════════════════════════════════════════════════════

async def reorganiser_global() -> str:
    """Positionne tous les blocs de tous les espaces dans le graphe global.

    Utilise l'algorithme force-directed sur l'ensemble des blocs et liaisons.
    Les blocs d'un même espace sont groupés en clusters naturellement
    grâce aux liaisons intra-espace, tandis que les liaisons inter-espaces
    créent des ponts entre clusters.

    Les positions sont persistées dans x_global / y_global
    (indépendantes de x/y locaux).
    """
    db = await get_db()

    blocs = await db.execute_fetchall(
        "SELECT id, x, y, x_global, y_global, largeur, hauteur, espace_id, titre_ia FROM blocs"
    )
    if not blocs:
        return "Aucun bloc — rien à positionner."

    liaisons = await db.execute_fetchall(
        "SELECT bloc_source_id, bloc_cible_id, poids FROM liaisons WHERE validation != 'rejete'"
    )

    nodes = [
        Node(
            id=dict(b)["id"],
            x=dict(b).get("x_global") or dict(b)["x"],
            y=dict(b).get("y_global") or dict(b)["y"],
            w=dict(b).get("largeur", 200),
            h=dict(b).get("hauteur", 120),
        )
        for b in blocs
    ]
    edges = [
        Edge(source_id=dict(l)["bloc_source_id"], target_id=dict(l)["bloc_cible_id"])
        for l in liaisons
    ]

    # Paramètres adaptés au mode global (plus d'espace, gravité plus douce)
    params = ForceParams(
        repulsion_strength=35000.0,
        ideal_link_distance=550.0,
        gravity_strength=0.008,
        iterations=400,
        initial_temperature=300.0,
        overlap_padding=50.0,
    )

    result_nodes = simulate_forces(nodes, edges, params)

    now = datetime.now(timezone.utc).isoformat()
    for node in result_nodes:
        await db.execute(
            "UPDATE blocs SET x_global = ?, y_global = ?, updated_at = ? WHERE id = ?",
            (round(node.x, 1), round(node.y, 1), now, node.id),
        )
    await db.commit()

    espace_ids = set(dict(b)["espace_id"] for b in blocs)
    central = max(result_nodes, key=lambda n: n.degree) if result_nodes else None
    summary = f"✓ {len(result_nodes)} blocs positionnés dans le graphe global ({len(espace_ids)} espaces)."
    if central and central.degree > 0:
        for b in blocs:
            b = dict(b)
            if b["id"] == central.id:
                summary += f'\n  Nœud central : "{b.get("titre_ia", "?")}" ({central.degree} connexions)'
                break
    summary += f"\n  {len(edges)} liaisons traitées."
    return summary
