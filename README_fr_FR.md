# Dgeni - Générateur de documentation [![Build Status](https://travis-ci.org/angular/dgeni.svg?branch=master)](https://travis-ci.org/angular/dgeni)

L'utilitaire de génération de documentation de node.js par angular.js et d'autres projets.

## Mise en route

Essayez l'exemple de projet avec Dgeni https://github.com/petebacondarwin/dgeni-example

## Installation

Vous aurez besoin de node.js et de plusieurs modules npm pour exécuter cet outil. Récupérez node.js à partir d'ici :
http://nodejs.org/. Ensuite, dans le dossier de votre projet exécutez :

```
npm install dgeni --save
```

Cela permet d'installer Dgeni et tous ses modules dépendants.


## Architecture

L'outil est modulaire. C'est tout simplement une collection de **processeurs de document** qui sont exécutés dans
un pipeline sur un ensemble de documents.

### Processeurs de document

Les processeurs fournissent des informations pour savoir comment les exécuter dans le pipeline et une méthode
`process` qui est appelée sur l'ensemble des documents.

```
process(docs) { ... faire des choses avec les docs ... }
```

La méthode `process` des processeurs est appelée via le framework d'injection de dépendance, cela permet
à chaque processeur de disposer d'outils et de données supplémentaires injectés lors de l'exécution.


```
process(docs, examples, config) { ... utilise aussi examples et config ... }
```

Les processeurs peuvent être synchrones ou asynchrones :

* S'ils sont synchrones, ils devront retourner
`undefined` ou un nouveau tableau de documents. S'ils retournent un nouveau tableau de documents alors ce tableau
remplacera le précédent tableau de docs.

* S'ils sont asynchrones, alors ils doivent retourner une promise, qui permettra de résoudre (resolve) undefined ou une nouvelle collection de documents. En retournant une promise, le processeur dit à Dgeni qu'il est asynchrone
et Dgeni attendra la promise pour résoudre avant d'appeler le prochain processeur.

```
process(docs) {
  return qfs.readFile(...).then(function(response) {
    docs.push(response.data);
  });
}
```

Le dépôt [dgeni-packages](https://github.com/angular/dgeni-packages) contient plusieurs processeurs : de première necessité au plus complexe,
en passant par un spécifique pour angular.js. Ces processeurs sont rassemblés dans des dossiers avec leurs configurations,
que nous avons appelés packages.

Le répertoire dgeni-packages/base contient un package qui est la base pour la plupart des configurations Dgeni. Ce
package contient les processeurs qui définissent quatre phases principales pour la génération des documents :

* Lecture de fichier - lecture des fichiers docs.
* Traitement de document - analyse les docs et évalue les méta-données
* Rendu HTML - convertit les docs analysés en HTML
* Ecriture de fichier - écrit les docs rendus dans les fichiers


#### Processeurs pseudo marqueurs

Il ya un certain nombre de processeurs qui ne font rien mais qui agissent comme des marqueurs pour les différentes étapes
du traitement. Vous pouvez utiliser ces marqueurs dans les propriétés `runBefore` et `runAfter` pour s'assurer que votre
processeur soit lancé au bon moment. Voici la liste de ces processeurs marqueurs dans l'ordre :

* reading-files (lecture des fichiers)
* files-read (fichiers lus)
* parsing-tags (analyse des balises)
* tags-parsed (balises analysées)
* extracting-tags (extraction des balises)
* tags-extracted (balises extraites)
* processing-docs (traitement des documents)
* docs-processed (documents traités)
* adding-extra-docs (ajout des documents supplémentaires)
* extra-docs-added (documents supplémentaires ajoutés)
* rendering-docs (rendu des documents)
* docs-rendered (documents rendus)
* writing-files (écriture des fichiers)
* files-written (fichiers écrits)


## Packages

Les processeurs de documents, les templates et les autres configurations peuvent être regroupés dans `package`. Les packages
peuvent charger et étendre d'autres packages. De cette façon, vous pouvez construire votre configuration personnalisée
au dessus d'une configuration existante.


