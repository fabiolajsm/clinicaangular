export const authErrors = [
  {
    code: 'auth/email-already-exists',
    message:
      'El email proporcionado ya está en uso por un usuario existente. Cada usuario debe tener un email único.',
  },
  {
    code: 'auth/id-token-expired',
    message: 'El token de ID proporcionado ha caducado.',
  },
  {
    code: 'auth/id-token-revoked',
    message: 'El token de ID proporcionado ha sido revocado.',
  },
  {
    code: 'auth/invalid-argument',
    message: 'Un argumento inválido fue proporcionado.',
  },
  {
    code: 'auth/invalid-email',
    message: 'El email proporcionado no tiene un formato válido.',
  },
  {
    code: 'auth/invalid-password',
    message: 'La contraseña proporcionada no es válida.',
  },
  {
    code: 'auth/operation-not-allowed',
    message: 'La operación no está permitida.',
  },
  {
    code: 'auth/too-many-requests',
    message: 'Demasiadas solicitudes. Por favor, inténtelo de nuevo más tarde.',
  },
  {
    code: 'auth/user-not-found',
    message: 'No se encontró ningún usuario correspondiente.',
  },
  {
    code: 'auth/weak-password',
    message: 'La contraseña deberia contener al menos 6 caracteres',
  },
  {
    code: 'auth/email-already-in-use',
    message: 'El email ingresado ya se encuentra registrado',
  },
  {
    code: 'auth/invalid-credential',
    message: 'Usuario y/o contraseña erronea',
  },
  {
    code: 'auth/missing-password',
    message: 'Debe ingresar una contraseña',
  },
  {
    code: 'auth/wrong-password',
    message: 'Usuario y/o contraseña erronea',
  },
];
