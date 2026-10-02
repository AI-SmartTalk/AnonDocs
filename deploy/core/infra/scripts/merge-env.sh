#!/usr/bin/env bash
# Fusionne .env.incoming (écrit par le workflow depuis le secret PDF_ENV) dans le
# .env en place, puis le remplace.
#
# PDF_ENV faisait un `cat > .env` : toute clé absente du secret disparaissait à
# chaque déploiement, et une variable posée à la main sur le VPS tenait jusqu'au
# merge suivant. Le secret reste la source de vérité pour les clés qu'il porte ;
# les autres sont reportées, pour qu'un déploiement n'exige jamais d'action.
#
# Idempotent : deux exécutions consécutives avec le même .env.incoming donnent un
# .env identique octet pour octet, et l'absence de .env préexistant est le cas
# nominal d'un hôte neuf.
set -euo pipefail

cd "${DEPLOY_PATH:-$(dirname "$0")/..}"
umask 077

[ -f .env.incoming ] || { echo "Aucun .env.incoming : rien à fusionner." >&2; exit 1; }

if [ -f .env ]; then
    trap 'rm -f .env.carried' EXIT
    : > .env.carried

    # Les clés que le secret porte l'emportent ; seules les autres sont reprises.
    incoming_keys="$(grep -oE '^[A-Za-z_][A-Za-z0-9_]*=' .env.incoming | tr -d '=' || true)"

    while IFS= read -r line || [ -n "$line" ]; do
        case "$line" in
            [A-Za-z_]*=*) key="${line%%=*}" ;;
            *) continue ;;
        esac
        if ! printf '%s\n' "$incoming_keys" | grep -qx "$key"; then
            printf '%s\n' "$line" >> .env.carried
        fi
    done < .env

    if [ -s .env.carried ]; then
        {
            printf '\n# Reporté du .env précédent : absent de PDF_ENV.\n'
            cat .env.carried
        } >> .env.incoming
        echo "Clés reportées depuis le .env en place : $(grep -cE '^[A-Za-z_]' .env.carried || true)"
    fi
fi

mv .env.incoming .env
# `mv` conserve les permissions du fichier entrant : sans ce chmod, la protection
# de l'API_KEY dépendrait de l'umask de celui qui a écrit .env.incoming.
chmod 600 .env
echo ".env écrit par fusion, sans perte."
