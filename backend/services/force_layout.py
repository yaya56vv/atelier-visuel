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
    """Force de répulsion entre toutes les paires de nœuds.
    
    Prend en compte la taille physique des blocs : la distance effective
    est calculée entre les bords des blocs, pas entre leurs centres.
    Quand les blocs se chevauchent, la répulsion devient très forte.
    """
    n = len(nodes)
    for i in range(n):
        for j in range(i + 1, n):
            a, b = nodes[i], nodes[j]
            dx = b.x - a.x
            dy = b.y - a.y
            
            # Distance centre-à-centre
            center_dist = math.sqrt(dx * dx + dy * dy)
            center_dist = max(center_dist, 1.0)  # Éviter division par zéro
            
            # Distance minimale pour éviter le chevauchement
            # (demi-largeurs + demi-hauteurs moyennes + padding)
            min_sep_x = (a.w + b.w) / 2 + params.overlap_padding
            min_sep_y = (a.h + b.h) / 2 + params.overlap_padding
            # Distance minimale effective (elliptique, selon direction)
            nx = dx / center_dist
            ny = dy / center_dist
            min_sep = math.sqrt((min_sep_x * nx) ** 2 + (min_sep_y * ny) ** 2)
            
            # Distance effective = distance bord-à-bord
            effective_dist = max(center_dist - min_sep, params.repulsion_min_distance)
            
            # Force de base (Coulomb)
            force = params.repulsion_strength / (effective_dist * effective_dist)
            
            # Bonus de répulsion si les blocs se chevauchent
            if center_dist < min_sep:
                overlap_ratio = 1.0 - (center_dist / min_sep)
                force += params.repulsion_strength * overlap_ratio * 2.0
            
            # Direction normalisée
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
        
        # Force proportionnelle à la différence avec la distance idéale
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
        # Les nœuds plus connectés sont plus attirés vers le centre
        weight = 1.0 + node.degree * 0.3
        node.vx += dx * params.gravity_strength * weight
        node.vy += dy * params.gravity_strength * weight


def _apply_velocity(nodes: list[Node], temperature: float, params: ForceParams):
    """Applique les vitesses aux positions avec amortissement et limites."""
    for node in nodes:
        # Amortissement
        node.vx *= params.velocity_damping
        node.vy *= params.velocity_damping
        
        # Limiter la vitesse par la température
        speed = math.sqrt(node.vx * node.vx + node.vy * node.vy)
        if speed > temperature:
            node.vx = (node.vx / speed) * temperature
            node.vy = (node.vy / speed) * temperature
        
        # Appliquer
        node.x += node.vx
        node.y += node.vy
        
        # Garder dans les limites
        node.x = max(params.min_x, min(params.max_x, node.x))
        node.y = max(params.min_y, min(params.max_y, node.y))


def simulate_forces(nodes: list[Node], edges: list[Edge], params: ForceParams | None = None) -> list[Node]:
    """Lance la simulation force-directed.
    
    Retourne les nœuds avec leurs positions finales.
    """
    if params is None:
        params = ForceParams()
    
    if not nodes:
        return nodes
    
    # Calculer le centre adapté au nombre de nœuds
    # Spread basé sur la taille moyenne des blocs + nombre de nœuds
    n = len(nodes)
    avg_w = sum(node.w for node in nodes) / n
    avg_h = sum(node.h for node in nodes) / n
    avg_size = (avg_w + avg_h) / 2
    spread = math.sqrt(n) * (avg_size + params.overlap_padding) * 1.8
    params.center_x = spread / 2 + 100
    params.center_y = spread / 2 + 100
    params.max_x = spread + 400
    params.max_y = spread + 400
    
    # Construire la map
    node_map = {node.id: node for node in nodes}
    
    # Calculer les degrés (nombre de connexions)
    for edge in edges:
        if edge.source_id in node_map:
            node_map[edge.source_id].degree += 1
        if edge.target_id in node_map:
            node_map[edge.target_id].degree += 1
    
    # Position initiale : cercle avec perturbation aléatoire
    # Les nœuds les plus connectés sont placés plus au centre
    sorted_nodes = sorted(nodes, key=lambda n: n.degree, reverse=True)
    for i, node in enumerate(sorted_nodes):
        angle = (2 * math.pi * i) / len(nodes) + random.uniform(-0.3, 0.3)
        # Rayon inversement proportionnel au degré
        radius = spread * 0.3 * (1.0 - node.degree / max(1, max(n.degree for n in nodes)) * 0.5)
        radius += random.uniform(-50, 50)
        node.x = params.center_x + radius * math.cos(angle)
        node.y = params.center_y + radius * math.sin(angle)
    
    # Simulation
    temperature = params.initial_temperature
    
    for iteration in range(params.iterations):
        if temperature < params.min_temperature:
            break
        
        # Reset des vitesses partiellement (garder l'inertie via damping)
        _apply_repulsion(nodes, params)
        _apply_attraction(nodes, edges, node_map, params)
        _apply_gravity(nodes, params)
        _apply_velocity(nodes, temperature, params)
        
        # Refroidissement
        temperature *= params.cooling_factor
    
    return nodes


# ═══════════════════════════════════════════════════════════
#  INTÉGRATION AVEC LA BASE DE DONNÉES
# ═══════════════════════════════════════════════════════════

async def reorganiser_espace(espace_id: str) -> str:
    """Réorganise tous les blocs d'un espace avec l'algorithme force-directed.
    
    Lit les blocs et liaisons, simule les forces, persiste les nouvelles positions.
    Retourne un résumé des modifications.
    """
    db = await get_db()
    
    # Charger les blocs
    blocs = await db.execute_fetchall(
        "SELECT id, x, y, largeur, hauteur, titre_ia FROM blocs WHERE espace_id = ?",
        (espace_id,),
    )
    if not blocs:
        return "Espace vide — rien à réorganiser."
    
    # Charger les liaisons
    liaisons = await db.execute_fetchall(
        "SELECT bloc_source_id, bloc_cible_id FROM liaisons WHERE espace_id = ?",
        (espace_id,),
    )
    
    # Convertir en structures de simulation
    nodes = []
    for b in blocs:
        b = dict(b)
        nodes.append(Node(
            id=b["id"],
            x=b["x"],
            y=b["y"],
            w=b.get("largeur", 200),
            h=b.get("hauteur", 120),
        ))
    
    edges = []
    for l in liaisons:
        l = dict(l)
        edges.append(Edge(
            source_id=l["bloc_source_id"],
            target_id=l["bloc_cible_id"],
        ))
    
    # Lancer la simulation
    result_nodes = simulate_forces(nodes, edges)
    
    # Persister les nouvelles positions
    now = datetime.now(timezone.utc).isoformat()
    for node in result_nodes:
        await db.execute(
            "UPDATE blocs SET x = ?, y = ?, updated_at = ? WHERE id = ?",
            (round(node.x, 1), round(node.y, 1), now, node.id),
        )
    await db.commit()
    
    # Construire le résumé
    node_map = {n.id: n for n in result_nodes}
    # Trouver le nœud le plus central (plus haut degré)
    central = max(result_nodes, key=lambda n: n.degree) if result_nodes else None
    
    summary = f"✓ {len(result_nodes)} blocs réorganisés avec disposition organique force-directed."
    if central and central.degree > 0:
        # Retrouver le titre
        for b in blocs:
            b = dict(b)
            if b["id"] == central.id:
                summary += f"\n  Nœud central : \"{b.get('titre_ia', '?')}\" ({central.degree} connexions)"
                break
    
    summary += f"\n  {len(edges)} liaisons traitées."
    
    return summary
