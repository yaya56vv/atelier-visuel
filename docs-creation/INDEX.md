# INDEX — GUIDE DE NAVIGATION DOCUMENTAIRE

**Projet :** Atelier Visuel de Pensée
**Dernière mise à jour :** 18/02/2026
**Rôle de ce fichier :** Clé d'accès rapide à toute la documentation. Permet de savoir où chercher n'importe quelle information.

---

## Vue d'ensemble : comment tout s'articule

La documentation est organisée en **trois niveaux de lecture** complémentaires. Aucun document ne duplique l'autre — chacun a son public et son rôle.

| Niveau | Document | Public | Rôle | Emplacement |
|--------|----------|--------|------|-------------|
| **Synthèse humaine** | Vision_Architecture.docx | Toi (Yaya) | Vision, sens, direction, arbitrages stratégiques | `docs-creation/` |
| **Synthèse IA** | CENTRAL.md | IA (Claude, agents) | Référence de vérité technique unique — synthèse complète | Racine projet (`atelier-visuel/`) |
| **Détail par domaine** | Documents A à E, G0 | IA d'implémentation | Détail technique exhaustif, un document par domaine | `docs-creation/` |

---

## Document fondateur

### ORIENTATION_FONDATRICE_FLUX_VIVANT.docx
- **Contenu :** La philosophie fondatrice du projet en une page. La métaphore de la rivière : l'information est un flux vivant, pas une collection d'objets fixes. Les invariants philosophiques : souveraineté utilisateur, relations priment sur catégories, contexte préservé, IA propose mais ne décide pas.
- **Rôle :** Le souffle. Donne l'âme du projet avant tout détail technique. C'est la source dont tous les autres documents découlent.
- **Public :** Claude ET Yaya — c'est le seul document qui parle aux deux.
- **Quand le consulter :** En tout premier, avant tout autre document, en début de chaque session.
- **Fichier :** `ORIENTATION_FONDATRICE_FLUX_VIVANT.docx`

---

## Documents de détail (docs-creation/)

### G0 — GLOSSAIRE & INVARIANTS SYSTÈME
- **Contenu :** Définitions de tous les termes du projet (bloc, liaison, espace, grammaire sémantique). Invariants qui ne changent jamais.
- **Rôle :** Le dictionnaire commun. Tous les autres documents utilisent ce vocabulaire.
- **Quand le consulter :** Quand tu as un doute sur la définition d'un terme ou la signification d'une couleur/forme.
- **Fichier :** `DOCUMENT_G0_GLOSSAIRE_INVARIANTS.md`

### A — VISION & PHILOSOPHIE FONDATRICE
- **Contenu :** La nature fondamentale du système, ce qu'il est et ce qu'il n'est pas, pourquoi il existe, le principe de souveraineté de l'utilisateur.
- **Rôle :** Donne le POURQUOI — le sens profond du projet.
- **Quand le consulter :** Pour se rappeler la raison d'être du projet ou trancher un désaccord sur la direction.
- **Fichier :** `DOCUMENT_A_VISION_PHILOSOPHIE.md`

### B — ARCHITECTURE CONCEPTUELLE
- **Contenu :** Le modèle graphe (blocs + liaisons), les types de nœuds, les espaces, le modèle de données abstrait.
- **Rôle :** Donne le QUOI structurel — la forme abstraite du système.
- **Quand le consulter :** Pour comprendre comment les éléments du graphe sont organisés entre eux.
- **Fichier :** `DOCUMENT_B_ARCHITECTURE.md`

### C — UX & INTERACTION DESIGN
- **Contenu :** L'interface, les gestes, les interactions, la console IA translucide, le panneau latéral, l'explorateur documentaire, la navigation.
- **Rôle :** Donne le COMMENT pour l'utilisateur — l'expérience vécue.
- **Quand le consulter :** Pour comprendre ce que l'utilisateur voit et fait quand il utilise l'Atelier.
- **Fichier :** `DOCUMENT_C_UX_INTERACTION.md`

### D — GRAMMAIRE D'INTERPRÉTATION IA & ASSISTANT
- **Contenu :** Les 6 couleurs et leurs significations, les 5 formes et leur statut épistémique, le protocole IA (Observer → Interpréter → Détecter → Proposer → Attendre), l'identité de l'assistant, le vocal.
- **Rôle :** Donne l'INTELLIGENCE — comment l'IA comprend, interprète et interagit.
- **Quand le consulter :** Pour comprendre comment l'IA lit le graphe et propose des actions.
- **Fichier :** `DOCUMENT_D_GRAMMAIRE_IA.md`

### E — STACK TECHNIQUE & ARCHITECTURE D'IMPLÉMENTATION
- **Contenu :** Choix techniques validés (Canvas2D, React, FastAPI, SQLite, Ollama/API), emplacements réservés pour les modules futurs, structure des fichiers.
- **Rôle :** Donne le AVEC QUOI — les outils et technologies choisis.
- **Quand le consulter :** Pour connaître les choix techniques ou vérifier si un emplacement est réservé.
- **Fichier :** `DOCUMENT_E_STACK_TECHNIQUE.md`

### F — VISION ÉLARGIE V2 *(à créer)*
- **Contenu prévu :** Détail technique de l'extension V2 — filesystem dans le graphe, scan différentiel, agents locaux, multi-cerveaux, espaces de recherche, tableau de bord système.
- **Rôle prévu :** Porter le détail d'implémentation de la vision élargie, au même niveau que A-E portent la V1.
- **Quand le créer :** Au moment de passer à l'implémentation des modules V2 (étapes 3-5 de la chronologie).
- **Fichier futur :** `DOCUMENT_F_VISION_ELARGIE.md`

### JOURNAL_COCREATION.md
- **Contenu :** Récit vivant de la co-création du projet. Les virages de pensée, les intuitions, les décisions et pourquoi elles ont été prises, ce qui a été appris sur Yaya, les concepts qui ont émergé.
- **Rôle :** Pont entre la mémoire courte de Claude et le savoir technique de CENTRAL.md. Porte la compréhension vivante, l'énergie du cheminement, pas le data mort.
- **Public :** Claude (toutes sessions futures) — lire APRÈS la mémoire, AVANT CENTRAL.md.
- **Quand le consulter :** En début de chaque session Atelier, pour retrouver le fil vivant du projet.
- **Fichier :** `JOURNAL_COCREATION.md`

### Vision_Architecture.docx
- **Contenu :** Synthèse complète de la vision à destination humaine. Les six piliers, la philosophie de fusion architecturale (haute couture), les sources d'inspiration, la chronologie par boucle vertueuse, le rôle des environnements Claude.
- **Rôle :** Lecture humaine rapide — comprendre le projet en 10 pages sans jargon technique.
- **Quand le consulter :** Pour retrouver le fil directeur, présenter le projet à quelqu'un, ou se rappeler la vision d'ensemble.
- **Fichier :** `Atelier_Vision_Architecture_v2.docx`

---

## Document central (racine du projet)

### CENTRAL.md
- **Emplacement :** `atelier-visuel/CENTRAL.md` (racine du projet, PAS dans docs-creation)
- **Contenu :** Fusion complète des documents A-E et G0, enrichie des sections V2.
- **Structure actuelle (11 sections) :**
  1. Vision et philosophie (issu de A)
  2. Modèle de données (issu de B)
  3. Emplacements et modules réservés (issu de E)
  4. Grammaire sémantique — Couleurs (issu de D)
  5. Grammaire sémantique — Formes (issu de D)
  6. UX et interaction (issu de C)
  7. Règles et invariants (issu de G0 et tous)
  8. **Extension V2** — Système d'exploitation personnel *(ajouté 18/02/2026)*
  9. **Philosophie d'intégration** — Fusion architecturale *(ajouté 18/02/2026)*
  10. **Chronologie de réalisation** — Intégration progressive *(ajouté 18/02/2026)*
  11. Journal des modifications
- **Rôle :** Référence de vérité unique pour les IA. Tout agent ou session de développement commence par lire ce fichier.
- **Quand le consulter :** Toujours, en premier, avant toute implémentation.

---

## Autres documents à la racine

| Fichier | Rôle |
|---------|------|
| `AGENT.md` | Protocole d'exécution pour les agents de développement (Claude Code) |
| `SEQUENCAGE.md` | Ordre de construction des fonctionnalités |
| `PROMPT_REMEDIATION.md` | Prompts de correction et remédiation |
| `lancer.bat` | Script de lancement du projet (frontend + backend) |

---

## Dossier docs-methode/

| Fichier | Rôle |
|---------|------|
| `METHODE_REFERENCE.md` | Méthodologie de développement multi-agentique |
| `AGENT_template.md` | Template pour les agents de développement |
| `CONTROL_LOOP.md` | Boucle de contrôle qualité |
| `SESSION_17-02-2026_SYNTHESE.md` | Synthèse de la session du 17/02 |

---

## Arborescence résumée

```
atelier-visuel/
├── CENTRAL.md                    ← RÉFÉRENCE DE VÉRITÉ (IA)
├── AGENT.md                      ← Protocole agents
├── SEQUENCAGE.md                 ← Ordre de construction
├── lancer.bat                    ← Lancement projet
│
├── docs-creation/                ← DOCUMENTATION PROJET
│   ├── INDEX.md                  ← CE FICHIER (navigation)
│   ├── ORIENTATION_FONDATRICE_*  ← Souffle philosophique (lire en 1er)
│   ├── JOURNAL_COCREATION.md     ← Récit vivant (pour Claude)
│   ├── DOCUMENT_G0_*.md          ← Glossaire & invariants
│   ├── DOCUMENT_A_*.md           ← Vision & philosophie
│   ├── DOCUMENT_B_*.md           ← Architecture conceptuelle
│   ├── DOCUMENT_C_*.md           ← UX & interaction
│   ├── DOCUMENT_D_*.md           ← Grammaire IA
│   ├── DOCUMENT_E_*.md           ← Stack technique
│   ├── DOCUMENT_F_*.md           ← [À CRÉER] Vision élargie V2
│   └── Atelier_Vision_*.docx     ← Synthèse humaine
│
├── docs-methode/                 ← MÉTHODOLOGIE
│   ├── METHODE_REFERENCE.md
│   ├── AGENT_template.md
│   ├── CONTROL_LOOP.md
│   └── SESSION_*.md
│
├── backend/                      ← CODE SERVEUR
├── frontend/                     ← CODE INTERFACE
├── data/                         ← BASE DE DONNÉES
└── refrences-visuelles/          ← CAPTURES D'ÉCRAN DE RÉFÉRENCE
```

---

## Comment retrouver une information

| Tu cherches... | Va dans... |
|----------------|-----------|
| Le sens du projet, pourquoi il existe | Document A ou le .docx |
| La définition d'un terme (bloc, liaison, couleur) | Document G0 |
| Comment le graphe est structuré | Document B |
| Ce que l'utilisateur voit et fait | Document C |
| Comment l'IA interprète et propose | Document D |
| Les choix techniques (React, SQLite, etc.) | Document E |
| La vision élargie (filesystem, scan diff, agents) | CENTRAL.md section 8 |
| La philosophie de fusion architecturale | CENTRAL.md section 9 |
| La chronologie de développement | CENTRAL.md section 10 |
| La vision complète en lecture rapide | Le .docx |
| La philosophie fondatrice, le souffle | ORIENTATION_FONDATRICE.docx |
| Le cheminement de pensée, les virages | JOURNAL_COCREATION.md |
| Tout, pour une IA qui implémente | CENTRAL.md |

---

*Ce fichier doit être mis à jour à chaque ajout ou modification de document dans le projet.*
