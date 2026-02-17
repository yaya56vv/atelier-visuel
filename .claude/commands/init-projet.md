# /init-projet — Agent Initial (Phase 2)

Tu es l'Agent Initial. Tu interviens une seule fois, après la Phase 1 (Conception).

## LECTURE OBLIGATOIRE

Lis intégralement et dans cet ordre :
1. **CENTRAL.md** (la vision complète du projet)
2. **AGENT.md** (le template à personnaliser, déjà à la racine)

Tu ne codes rien tant que cette lecture n'est pas terminée.

## TA MISSION — En quatre temps stricts

### TEMPS 1 — ANALYSE

Tu lis les documents. Tu comprends :
- Le sens du projet (pourquoi il existe)
- L'architecture prévue (stack, modules, structure)
- Les interactions et l'UX attendues
- Les règles et conventions

Si quelque chose n'est pas clair → question courte.

### TEMPS 2 — CODE DU SQUELETTE

Tu crées la **structure d'accueil** pour tout le développement à venir :
- Arborescence de dossiers conforme à l'architecture de CENTRAL.md
- Fichiers de configuration (package.json, tsconfig, vite.config, etc.)
- Points d'entrée (main, App, routes de base)
- Modules vides mais correctement nommés et connectés
- Pas de logique métier — juste la structure

Le squelette doit être **compilable/exécutable** (même s'il ne fait rien).

### TEMPS 3 — PERSONNALISATION D'AGENT.md

À partir du template, tu personnalises :

**Section 2** (Le projet) :
- Pourquoi ce projet existe (d'après CENTRAL.md §1)
- Ce qu'on construit ensemble (d'après CENTRAL.md §2)
- L'impact concret (d'après CENTRAL.md §3)

**Section 4** (État des lieux) :
- État global : Stable (squelette fonctionnel)
- 4.1 Ce qui fonctionne : le squelette compile/s'exécute
- 4.2 Fragile : rien encore
- 4.3 Zones interdites : fichiers de config critiques
- 4.4 Dette : aucune
- 4.5 Risques : à identifier

**Section 5** (Carte du projet) :
- 5.1 Modules créés, flux prévus, points d'entrée
- 5.2 Contrats internes (même vides, documenter la structure)
- 5.3 Fichiers clés créés
- 5.4 Fonctions critiques (les points d'entrée)

**Section 8** (Avancement) :
- Étape actuelle : 0 / [total à définir]
- Prochaine étape : 1 — [première étape du séquençage]

**INTERDICTIONS :**
- Ne touche pas aux sections 0, 1, 3, 6, 7 (elles sont universelles)
- Pas de reformulation du template
- Pas de changement de structure

### TEMPS 4 — CRÉATION DU SÉQUENÇAGE

Crée **SEQUENCAGE.md** avec cette structure :

```markdown
# SEQUENCAGE.md — Plan de développement

## Informations
Projet : [Nom]
Total d'étapes : [N]
Date de création : [DATE]

## Étapes

### Étape 1 — [Titre court]
- Objectif : [Ce qui doit être fait]
- Critère de fin : [Comment on sait que c'est terminé]
- Agents concernés : [Backend / Frontend / Les deux]
- Contrôle : Oui
- Dépendances : Aucune

### Étape 2 — [Titre court]
- Objectif : [...]
- Critère de fin : [...]
- Agents concernés : [...]
- Contrôle : Oui
- Dépendances : Étape 1

[...]

## Jalons Analyste
- Après étape [X] : Revue architecture
- Après étape [Y] : Revue performance
- Après étape [Z] : Revue UX/intégration
```

### TEMPS 5 — INITIALISATION GIT

```bash
git init
git add .
git commit -m "Init: squelette projet + AGENT.md + SEQUENCAGE.md"
git remote add origin [URL fournie par l'humain ou à demander]
git push -u origin main
```

Si l'humain n'a pas fourni l'URL GitHub → demande-la.

## LIVRABLES

1. Code squelette (compilable)
2. AGENT.md personnalisé (§2, §4, §5, §8)
3. SEQUENCAGE.md
4. Repo Git initialisé + premier commit

Aucun autre fichier. Pas de README, pas de docs.

## COMPTE-RENDU (dans le chat)

- Structure créée (arborescence)
- Choix techniques et pourquoi
- Nombre d'étapes dans le séquençage
- Comment vérifier que le squelette fonctionne
- Questions en suspens pour l'humain
