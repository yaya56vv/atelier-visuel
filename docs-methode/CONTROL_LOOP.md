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
6. **JAMAIS de tests sur données auto-générées jetables.** Les tests doivent porter sur des données représentatives persistées dans l'application (seed initial ou données créées via l'interface réelle). Un agent qui crée une donnée par POST HTTP, vérifie le status 200, puis supprime la donnée n'a **rien testé du tout**.
7. **Le fichier .env doit exister et contenir les clés nécessaires AVANT le premier test.** Si .env est absent ou incomplet, le Contrôleur Tests doit émettre un KO immédiat et demander à l'humain de le remplir. Aucun test ne peut être validé sans .env fonctionnel.
8. **La dégradation progressive des contrôles est interdite.** Chaque étape reçoit le même niveau de rigueur, que ce soit l'étape 1 ou l'étape 12. Un contrôleur qui raccourcit ses vérifications parce que "les étapes précédentes étaient OK" viole cette règle.

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
- **Mission :** Vérifier que le code fonctionne **visuellement et fonctionnellement**
- **Vérifie :**
  1. **Prérequis environnement** : .env existe et contient les variables nécessaires. Si non → KO immédiat, demande à l'humain.
  2. **Lancement réel** : Backend ET frontend démarrent sans erreur.
  3. **Test visuel obligatoire** : Ouvrir l'application dans un navigateur (ou via accès Chrome si disponible). Vérifier que l'interface affiche les données attendues. **Un test uniquement par requêtes HTTP programmatiques n'est JAMAIS suffisant.**
  4. **Test fonctionnel bout-en-bout** : Effectuer les actions décrites dans le critère de fin de l'étape EN PASSANT PAR L'INTERFACE UTILISATEUR, pas par des appels API directs. Exemple : "créer un bloc" = cliquer/double-cliquer sur le canvas, PAS faire un POST /api/blocs/.
  5. **Non-régression** : Vérifier que les fonctionnalités des étapes précédentes fonctionnent encore (visuellement).
  6. **Seed de données** : Si l'application est censée contenir des données initiales (espaces par défaut, blocs de démo), vérifier qu'elles sont présentes au lancement.
- **Interdit :** Tester uniquement via scripts HTTP. Valider sur la base de status codes. Auto-générer des données de test jetables.
- **Livrable :** LOG TESTS dans le chat — Verdict OK/KO — **avec capture d'écran ou description de ce qui est visible dans le navigateur**

### 2.3 Contrôleur Hygiène
- **Mission :** Vérifier que le code est propre et sécurisé
- **Vérifie :**
  1. Code mort, liens cassés, duplications, fichiers inutiles, conventions
  2. **Sécurité secrets** : Aucune clé API, token, mot de passe, secret dans le code, les tests, les logs, les commentaires, les commits. Vérifier les fichiers un par un. grep/search sur les patterns sensibles (API_KEY, TOKEN, SECRET, password, Bearer, sk-).
  3. **.env** : Le fichier .env existe, est dans .gitignore, et un .env.example existe avec les noms de variables (sans valeurs).
  4. **Cohérence avec CENTRAL.md** : Les données initiales prévues (espaces, configurations par défaut) sont bien implémentées dans le code de seed/init.
- **Classification :** Bloquant / Majeur / Mineur
- **Livrable :** LOG HYGIÈNE dans le chat — Verdict OK/KO

### 2.4 Contrôleur Conformité (Chef d'orchestre)
- **Mission :** Vue holistique, conformité au projet, verdict final
- **Lit :** AGENT.md + LOG TESTS + LOG HYGIÈNE + CENTRAL.md
- **Vérifie en plus des logs reçus :**
  1. **Cohérence vision** : Ce qui est implémenté correspond-il à ce que CENTRAL.md décrit ? Les espaces par défaut, les données initiales, les comportements attendus sont-ils présents ?
  2. **Qualité des logs reçus** : Les contrôleurs Tests et Hygiène ont-ils fait un travail sérieux ? Le LOG TESTS mentionne-t-il un test visuel réel ? Si un log semble bâclé ou incomplet, le Contrôleur Conformité **DOIT renvoyer le contrôle** en demandant un log plus complet.
  3. **Non-dégradation** : Le niveau de rigueur de cette étape est-il comparable aux étapes précédentes ?
- **Livrable :** Compte-rendu de synthèse + verdict CONFORME/NON CONFORME
- **Si KO :** Directive de correction sous forme de prompt prêt à l'emploi pour le Codeur-Correcteur (3 actions max, priorisées, formulées comme des instructions exécutables)

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
8. **Prérequis .env :** Aucune étape impliquant un backend ou une API ne peut être testée sans un fichier .env valide. Si .env n'existe pas ou est incomplet, le Contrôleur Tests émet un KO immédiat et bloque le pipeline jusqu'à ce que l'humain fournisse les valeurs.
9. **Test visuel obligatoire :** Toute étape produisant un résultat visible dans l'interface DOIT être testée visuellement (application lancée, navigateur ouvert, vérification de ce qui s'affiche). Un test exclusivement programmatique (curl, scripts HTTP, tests unitaires) ne valide JAMAIS une étape frontend ou d'intégration.
10. **Rigueur constante :** La qualité des contrôles ne peut pas diminuer au fil des étapes. Le Contrôleur Conformité est responsable de détecter et rejeter les logs bâclés.

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
