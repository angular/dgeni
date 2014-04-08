# Qu'est ce que Dgeni ?

Dgeni est un générateur de documentation construit par l'équipe d'AngularJS. Il est très flexible, car il a
un noyau modulaire et il est extensible grâce à des plugins. Le but de Dgeni est d'avoir un outil pour les développeurs
qui soit très facile pour documenter leur code et l'étendre selon leurs besoins.

Par exemple, le projet AngularJS utilise une annotation spécifique quand il s'agit de documenter le code. Ces
annotations spécifiques ne sont pas officiellement supportés par les générateurs de documentation tel que JSDoc. Par
conséquent, l'équipe d'AngularJS a construit son propre générateur de documentation qui se trouve comme une couche
supplémentaire au dessus de celui de JSDoc et ajoute du sucre syntaxique supplémentaire (NGDoc) pour annoter le code d'AngularJS.

Cependant, il s'est avéré que l'implémentation du générateur NGDoc était difficile à maintenir et à changer,
car les templates ne sont pas séparés de la base du code actuel. De plus, l'ajout de nouvelles fonctionnalités
n'était pas facile pour les nouveaux contributeurs. Enfin, l'ensemble du générateur a été construit dans la base
du code d'AngularJS qui ne fonctionne pas avec le paradigme de *Séparation des problèmes*.

Dgeni peut être utilisé pour la documentation côté client, ainsi que pour celle côté serveur. Donc, il est également approprié
pour les composants Node.js ou pour la documentation de l'API REST.

Il est également possible de construire des packages personnalisés pour étendre les fonctionnalités de Dgeni, cela
permet de créer des documents très spécifiques.
