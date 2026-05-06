# P3
## Practica 3
> Realizado por Pablo Martín Nebreda y Daniel García Marquez
<div align="center">
  <img src="https://img.shields.io/badge/version-v0.1(NotFinished)-red" alt="Version">
  <img src="https://img.shields.io/badge/Vue-v3.5.33-green" alt="Vuetify">
  <img src="https://img.shields.io/badge/Pinia-v3.0.4-yellow" alt="Pinia">
  <img src="https://img.shields.io/badge/Firebase-Database-orange" alt="Firebase">
  <br><br>
  <img src="Movietime.png" alt="Movietime Logo">
</div>

---

Se creeara una aplicación web con arquitectura Serverless que permitirá a los usuarios gestionar y consultar un catálogo compartido de películas en tiempo real. Los elementos del catálogo serán películas, y cada película podrá ser puntuada por cualquier usuario. La aplicación estará orientada a un catálogo colaborativo, donde los usuarios podrán agregar películas y asignarles una puntuación. El hosting de la base de datos será gestionada con Firestore, lo que permitirá la sincronización en tiempo real de los cambios realizados en el catálogo de películas

Para completar esta practica nuestros objetivos fueron estos:

- [x] Registrar películas en el catálogo.
- [x] Consultar las películas del catálogo.
- [x] Buscar películas por género, año o si siguen en cartelera.
- [x] Añadir valoraciones y comentarios sobre una película.
- [x] Consultar las valoraciones de una película.
- [x] Calcular la valoración media de una película.
- [x] Buscar películas cuyos comentarios contengan una palabra determinada.
- [x] Obtener estadísticas generales del catálogo.
- [x] Eliminar peliculas y editar
##### Extras:
- [x] Sistema de cuentas
- [x] Añadir diferentes tipos de entretenimiento audiovisual
- [ ] Wishlist de peliculas

Para implementar este webapp vamos a necesitar gestionar varios tipos de recursos como:

•  Base de datos con peliculas, cada una con su titulo, genero, año, sinopsis e imagen de portada

•  Base de datos con valoraciones, cada una con su valoracion en estrellas del 1 al 5, comentario y nombre de usuario

⚠︎ Para visitar la pagina web este es el link -> https://hosting-peli.web.app/ <-

## Versiones del codigo - Estable v1.0

## IMPORTANTE
⚠︎ Este codigo usa la version 3 de los componentes: Vue y Pinia. `npm install vuetify@3.12.5 & npm install @pinia/nuxt pinia`

⚠︎ Este codigo tiene implementacion con Firebase. Si se quiere hacer hosting propio, mirar la carpeta de stores para saber que catalogos hay que añadir.

## Preparacion
//Cosas instaladas al inicio de la practica, dependencias ect ect
## Inicio de la practica
### Creacion y modificacion del template inicial
//Explicacion un poco de lo que hemos ido añadiendo de lo que hay en el codigo (Sabes lo que es cada cosa y donde esta)
### Implementacion del modulo de peliculas y API
//Aqui explicar un poco que hace y como se añaden peliculas, y como lo hemos hecho. Inventatelo un poco o pideselo al gemini y le añadire cosas
### Implementacion de los distintos filtros
//Literalmente los filtros que estan puestos en la pagina web
### Compatibilidad con pinia y firebase
//Comandos que hemos usado para conectar firebase y pinia, ya pondre yo imagenes de lo que hay en el catalogo y mas.
## Problemas encontrados
//Luego pongo algo
