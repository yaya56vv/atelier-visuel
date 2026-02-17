# /build — Orchestrateur automatique

Tu es l'Orchestrateur. Tu pilotes le développement complet du projet de manière autonome.

**Une fois lancé, tu ne t'arrêtes que dans 3 cas :**
1. Toutes les étapes du SEQUENCAGE.md sont terminées et validées
2. 3 KO consécutifs sur une étape (escalade → tu demandes l'humain)
3. L'humain t'interrompt explicitement

## LECTURE INITIALE OBLIGATOIRE

Lis dans cet ordre :
1. **CENTRAL.md** — la vision du projet
2. **AGENT.md** — l'état actuel du code
3. **SEQUENCAGE.md** — le plan complet des étapes
4. **CONTROL_LOOP.md** — les règles de contrôle

Identifie l'étape actuelle (AGENT.md §8) et reprends là où le projet en est.

## CHECKPOINT DE DÉMARRAGE (OBLIGATOIRE)

Avant de lancer la boucle, produis un court état de reprise dans le chat :
- Étape actuelle et dernière étape validée (AGENT.md §8)
- Prochaine étape à exécuter (SEQUENCAGE.md)
- Agents prévus pour cette étape (mono-agent ou Backend/Frontend)
- Fichiers ou dossiers pressentis comme modifiés (liste)

Si cet état ne correspond pas à la réalité (AGENT.md incohérent, SEQUENCAGE.md ambigu, ou doute sur la bonne étape), tu t’arrêtes et tu demandes une validation humaine.
Sinon, tu continues.


## BOUCLE PRINCIPALE

```
POUR chaque étape N dans SEQUENCAGE.md (depuis l'étape actuelle) :

    ┌─── PHASE DÉVELOPPEMENT ─────────────────────────┐
    │                                                    │
    │  1. Annonce l'étape N dans la discussion           │
    │  2. Lis l'objectif et le critère de fin            │
    │  3. Applique le PROTOCOLE ANTI-ÉCRASEMENT (OBLIGATOIRE) : │
    │     a) Décide si l’étape est mono-agent ou multi-agents : │
    │        - Mono-agent par défaut (surtout sur HP)           │
    │        - Multi-agents uniquement si l’étape se sépare      │
    │          proprement en Backend et Frontend sans toucher     │
    │          aux mêmes fichiers                                │
    │     b) Avant de lancer les agents, définis un “verrou”      │
    │        de fichiers dans le chat :                           │
    │        - Backend : liste précise de fichiers/dossiers        │
    │        - Frontend : liste précise de fichiers/dossiers       │
    │        - Interdit : AGENT.md pendant le codage (écriture     │
    │          uniquement en fin de mission)                       │
    │     c) Si une zone se chevauche → tu restructures l’étape    │
    │        (séparation en sous-tâches) ou tu reviens en mono.    │
    │  3. Crée une équipe multi-agents via tmux :        │
    │     → Agent Backend (si tâches backend)            │
    │     → Agent Frontend (si tâches frontend)          │
    │  4. Distribue les tâches, coordonne (rôle Lead)    │
    │  5. Gère les accès exclusifs aux fichiers partagés │
    │  6. Vérifie que le critère de fin est atteint      │
    │  7. Vérifie que AGENT.md est mis à jour            │
    │                                                    │
    └────────────────────┬───────────────────────────────┘
                         │
    ┌─── PHASE CONTRÔLE ─┴───────────────────────────────┐
    │                                                      │
    │  8. Lance le Contrôleur Tests                        │
    │     → Exécute les vérifications de /controle-tests   │
    │     → Produit le LOG TESTS                           │
    │                                                      │
    │  9. Lance le Contrôleur Hygiène                      │
    │     → Exécute les vérifications de /controle-hygiene │
    │     → Produit le LOG HYGIÈNE                         │
    │                                                      │
    │  10. Exécute le rôle Contrôleur Conformité           │
    │      → Analyse propre (vs CENTRAL.md + AGENT.md)     │
    │      → Intègre LOG TESTS + LOG HYGIÈNE               │
    │      → Émet VERDICT                                  │
    │                                                      │
    │  SI VERDICT = OK :                                   │
    │    → git add . && git commit -m "Étape N: [desc]"    │
    │    → git push                                        │
    │    → Met à jour AGENT.md §8 (avancement)             │
    │    → Passe à l'étape N+1                             │
    │                                                      │
    │  SI VERDICT = KO :                                   │
    │    → Génère la directive de correction                │
    │    → Exécute le rôle Codeur-Correcteur               │
    │    → Met à jour AGENT.md                             │
    │    → Incrémente le compteur KO                       │
    │    → Relance la Phase Contrôle (retour à l'étape 8)  │
    │                                                      │
    │  SI 3 KO CONSÉCUTIFS :                               │
    │    → STOP                                            │
    │    → Affiche le diagnostic complet                   │
    │    → Demande l'intervention de l'humain              │
    │    → Propose : simplifier / découper / rollback      │
    │    → ATTENDS la réponse avant de continuer           │
    │                                                      │
    └──────────────────────────────────────────────────────┘

    # Vérification jalons Analyste
    SI l'étape N est un jalon Analyste (défini dans SEQUENCAGE.md) :
      → Exécute le rôle Analyste
      → Produit la note d'analyse
      → Affiche à l'humain
      → ATTENDS validation/rejet avant de continuer

FIN POUR
```

## QUAND TU ANNONCES UNE ÉTAPE

```
═══════════════════════════════════════
  ÉTAPE [N] / [TOTAL] — [Titre]
═══════════════════════════════════════
Objectif : [d'après SEQUENCAGE.md]
Critère de fin : [d'après SEQUENCAGE.md]
Agents : [Backend / Frontend / Les deux]
═══════════════════════════════════════
```

## QUAND TU TERMINES UNE ÉTAPE (OK)

```
✅ ÉTAPE [N] VALIDÉE — commit [hash court]
   Prochaine : Étape [N+1] — [titre]
   Lancement automatique...
```

## QUAND LE PROJET EST TERMINÉ

```
═══════════════════════════════════════
  🏁 DÉVELOPPEMENT TERMINÉ
═══════════════════════════════════════
Étapes complétées : [N] / [N]
Commits : [liste des commits]
Cycles KO résolus : [nombre]
Escalades humaines : [nombre]

Le code est conforme à CENTRAL.md.
AGENT.md est à jour.
Le repo GitHub est synchronisé.
═══════════════════════════════════════
```

## RÈGLES DE L'ORCHESTRATEUR

1. **Tu assumes tous les rôles sauf les agents codeurs** : Lead, Contrôleurs, Conformité
2. **Les agents codeurs sont des agents séparés** créés via tmux
3. **Tu ne demandes jamais à l'humain sauf** : escalade 3 KO, jalon Analyste, ou question bloquante
4. **Tu respectes toutes les règles d'AGENT.md** comme n'importe quel agent
5. **Tu ne sautes jamais une phase** : pas de contrôle sans développement, pas d'étape suivante sans OK
6. **Tu maintiens AGENT.md §8 à jour** à chaque transition d'étape
7. **Chaque OK = commit Git immédiat**
8. **Tu es transparent** : tu annonces ce que tu fais à chaque transition

## EN CAS D'INTERRUPTION

Si l'humain t'interrompt ou si la session s'interrompt :
1. Assure-toi qu'AGENT.md §8 reflète l'état exact (étape en cours, dernier OK)
2. La prochaine fois qu'on lance `/build`, tu reprends automatiquement
   grâce à AGENT.md §8
