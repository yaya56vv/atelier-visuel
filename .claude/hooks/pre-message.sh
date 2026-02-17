#!/bin/bash
# Hook pre-message : vérifie qu'AGENT.md est présent à la racine du projet
# Placé dans .claude/hooks/pre-message.sh

if [ ! -f "AGENT.md" ]; then
  echo "⚠️  ATTENTION : AGENT.md est absent de la racine du projet."
  echo "   Ce fichier est obligatoire pour tout travail."
  echo "   → Utilisez /init-projet pour l'initialiser"
  echo "   → Ou copiez AGENT_template.md en AGENT.md"
fi
