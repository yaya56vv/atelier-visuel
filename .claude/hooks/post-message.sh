#!/bin/bash
# Hook post-message : rappelle de mettre à jour AGENT.md après modification du projet
# Placé dans .claude/hooks/post-message.sh

# Si AGENT.md est absent, le pre-message s'en charge déjà. Ici on rappelle seulement après action.

if [ -f "AGENT.md" ]; then
  # Si le projet est un dépôt git et qu'il y a des changements, rappeler la mise à jour d'AGENT.md.
  if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
      echo "RAPPEL : des fichiers ont été modifiés. Pensez a mettre a jour AGENT.md (sections 4, 5, 7, 8) avant de poursuivre."
    fi
  else
    echo "RAPPEL : si des fichiers ont ete modifies, pensez a mettre a jour AGENT.md (sections 4, 5, 7, 8) avant de poursuivre."
  fi
fi
