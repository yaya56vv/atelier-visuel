# CONTROL_LOOP.MD — Boucle de Contrôle Qualité

**Version :** V2
**Dernière mise à jour :** [DATE]
**Statut :** ACTIF

---

## OBJECTIF

Ce document définit la boucle de contrôle qualité qui s'applique à chaque fin d'étape pour garantir que le code reste propre, fonctionnel, et conforme au projet.

**Principe fondamental :** On n'avance pas tant que ce n'est pas propre et validé.

---

## RÈGLES ANTI-CHAOS (priorité maximale)

1. **Les logs sont du texte dans le chat.** Aucun fichier log_*.md, report.md, audit.md n'est autorisé dans le dépôt.
2. **AGENT.md est la seule documentation vivante.** Pas de README, pas de docs séparées.
3. **Les contrôleurs ne codent jamais.** Ils observent, documentent, émettent un verdict.
4. **Les codeurs ne produisent pas de logs techniques.** Uniquement AGENT.md + compte-rendu chat.
5. **Les corrections doivent repasser par la validation.** Pas d'auto-validation.

---

## 1. DÉFINITION D'UNE ÉTAPE

Une étape se termine dans l'un de ces deux cas :

**Étape fonctionnelle** — Une unité de travail cohérente est livrée (fonction, module, feature complète).

**Étape temporelle** — La session s'arrête (fin de journée, pause, arrêt volontaire).

**Dans les deux cas :** Clôture obligatoire par la boucle de contrôle.

**Critères mesurables :** Avant de démarrer une étape, l'humain définit dans le prompt mission :
- Quel livrable précis marque la fin
- Quels critères de validation

Si l'humain n'a pas défini ces critères, l'agent DOIT demander.

---

## 2. LES RÔLES

### 2.1 Les Codeurs
- **Mission :** Produire du code pour accomplir les missions définies
- **Livrables :** AGENT.md mis à jour (§4, §5, §7) + compte-rendu chat en français
- **Interdit :** Produire des logs techniques ou toute autre documentation

### 2.2 Contrôleur Tests
- **Mission :** Vérifier que le code fonctionne (non-régression)
- **Vérifie :** Exécution sans erreur, tests auto, fonctionnalités clés, absence de régression
- **Livrable :** LOG TESTS dans le chat — Verdict OK/KO

### 2.3 Contrôleur Hygiène
- **Mission :** Vérifier que le code est propre
- **Vérifie :** Code mort, liens cassés, duplications, fichiers inutiles, conventions
- **Classification :** Bloquant / Majeur / Mineur
- **Livrable :** LOG HYGIÈNE dans le chat — Verdict OK/KO

### 2.4 Contrôleur Conformité (Chef d'orchestre)
- **Mission :** Vue holistique, conformité au projet, verdict final
- **Lit :** AGENT.md + LOG TESTS + LOG HYGIÈNE
- **Livrable :** Compte-rendu de synthèse + verdict CONFORME/NON CONFORME
- **Si KO :** Directive de correction (3 actions max, priorisées)

### 2.5 Codeur-Correcteur
- **Déclenchement :** Uniquement après verdict KO
- **Mission :** Corriger uniquement ce qui est dans la directive
- **Interdit :** Nouvelles features, modifications d'architecture non demandées
- **Après correction :** Retour obligatoire en Phase 1 (cycle complet)

---

## 3. LE FLUX

```
 ÉTAPE TERMINÉE
      │
      ▼
┌─────────────────────────────────────┐
│  PHASE 1 — Contrôles parallèles     │
│  Contrôleur Tests → LOG TESTS       │
│  Contrôleur Hygiène → LOG HYGIÈNE   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  PHASE 2 — Analyse holistique       │
│  Contrôleur Conformité              │
│  → Lit les logs                     │
│  → Vérifie conformité projet        │
│  → Émet VERDICT                     │
└──────┬───────────────┬──────────────┘
       │               │
    OK ▼            KO ▼
┌──────────┐   ┌──────────────────────┐
│ PHASE 4  │   │  PHASE 3 — Correction │
│ Commit   │   │  Codeur-Correcteur    │
│ Git      │   │  corrige → retour     │
│ Étape    │   │  Phase 1              │
│ validée  │   └──────────────────────┘
└──────────┘
```

---

## 4. RÈGLES DE GOUVERNANCE

1. **On n'avance pas tant que ce n'est pas validé.** Aucune nouvelle mission sans Verdict OK.
2. **Les contrôleurs ne corrigent pas.** Ils détectent, mesurent, prouvent, décrivent.
3. **La correction repasse par validation.** Cycle complet obligatoire.
4. **Clôture minimale obligatoire :** Tests OK + Hygiène OK + Conformité OK + Commit Git.
5. **Deux langages, deux publics :** Logs techniques pour agents / Comptes-rendus pour humain.
6. **Escalade après 3 cycles KO :** Arrêt automatique, intervention humaine, analyse du problème racine.
7. **Timeout d'étape :** Si >4h de travail actif → pause obligatoire, évaluation humaine.

---

## 5. LIVRABLES ET DESTINATAIRES

| Livrable | Producteur | Destinataire | Format |
|----------|-----------|-------------|--------|
| LOG TESTS | Contrôleur Tests | Conformité + Humain | Chat, technique |
| LOG HYGIÈNE | Contrôleur Hygiène | Conformité + Humain | Chat, technique |
| Compte-rendu synthèse | Contrôleur Conformité | Humain | Chat, français clair |
| Directive correction | Contrôleur Conformité | Codeur-Correcteur | Chat, actions priorisées |
| AGENT.md | Codeurs + Correcteur | Tous les agents | Fichier structuré |
| Compte-rendu codeur | Codeurs + Correcteur | Humain | Chat, français clair |

**L'humain lit en priorité** le compte-rendu du Contrôleur Conformité. Les logs ne sont lus qu'en cas de KO ou de doute.

---

## 6. ÉVOLUTION

Ce document évolue avec l'expérience terrain.
Prochaine révision : après 5 étapes validées en conditions réelles.
