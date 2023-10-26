# Site web science backend
this is the source code of the backend/server for the website <br>
le code source du backend/serveur du site web


# Installation
Installez [python](https://www.python.org/downloads/) puis ouvrez la ligne de commande en appuyant sur `windows` + `r` et en tapant `cmd` puis naviguez jusqu'au répertoire où vous pouvez trouver le projet. Enfin, exécutez la commande pour installer tous les pré-requis :
```bash
pip install -r requirements.txt
```

# Exécuter localement le serveur
Ensuite, après avoir installé toutes les dépendances, vous pouvez exécuter le serveur localement en utilisant cette commande :
```py
py main.py
```

# obtenir une clé openai
s'inscrire à openai, puis ouvrir [la page de gestion des clés api](https://platform.openai.com/account/api-keys), et enfin créer une clé openai, enfin, changer dans le code de main.py os.environ["openaikey"] en "openaicléici"
