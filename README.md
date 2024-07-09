# Clinica online

Hola! Este es un trabajo práctico de la facultad de la UTN hecho con Angular y Firebase. Consiste en administrar una clínica online, con usuarios de roles: paciente, especialista o administradores.

## Inicio

Para entrar en la aplicación se tiene que registrar el usuario según su rol y el administrador es el único que puede dar de alta a otro administrador. Un especialista debe ser habilitado por un administrador y además los usuarios tienen que validar su correo electrónico después de registrarse para poder loguearse.

![1](https://github.com/fabiolajsm/clinicaangular/assets/81818021/318411d7-337f-4d33-8ee8-43d2bbfadddb)
![regis admin](https://github.com/fabiolajsm/clinicaangular/assets/81818021/533cf6d5-150e-4466-a1f6-57e6c4f6b122)
![regis patient](https://github.com/fabiolajsm/clinicaangular/assets/81818021/8da0ce36-a560-414c-b324-f80bc5258c3f)
![login](https://github.com/fabiolajsm/clinicaangular/assets/81818021/11299162-f491-4c45-9725-0614bed7605b)

## Home

Después de haberse logueado, hay múltiples opciones según el rol del usuario. Algunas son: Crear turno (admin y paciente), ver turnos y sus estados permitiendo cancelar, aceptar, rechazar, dejar comentarios, hacer una reseña, darle un diagnóstico a un paciente e ir creando su historial clínico, entre otras. Una de las funcionalidades es descargar el historial del paciente e informes de la aplicación (cada opción se permite según el rol del usuario).

![reports](https://github.com/fabiolajsm/clinicaangular/assets/81818021/a78f71fc-14f1-4754-ae4f-19772b1881c4)
![patietdownload](https://github.com/fabiolajsm/clinicaangular/assets/81818021/8577468c-82ef-43ae-a197-87127bb29a27)

## Cómo levantar el proyecto

Primero haz un git clone con la url del proyecto, luego parado en el primer nivel de la carpeta realiza `npm i && ng serve` tambien puedes hacerlo en dos pasos, primero `npm i` para instalar las dependencias y luego `ng serve` para levantar el proyecto.

### Nota

Este proyecto usa keys de firestore, y es muy posible que cuando intentes levantar el proyecto las claves hayan vencido y no sirva la aplicación, si quieres usarlo como práctica personal recuerda actualizar en el documento `appConfig` la constante `firebaseConfig` con tus propias claves;)

