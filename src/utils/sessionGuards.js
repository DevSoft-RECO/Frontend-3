import motherApi from '../api/axios-mother';
import Swal from 'sweetalert2';

export const startSessionGuards = () => {
  // ----------------------------------------------------
  // REGLA A: EL "HEARTBEAT" CADA 5 MINUTOS (Vigilante)
  // ----------------------------------------------------
  setInterval(() => {
    const token = sessionStorage.getItem('access_token');
    if (token) {
      // Un sub-proceso silencioso a la Madre para verificar si la sesión sigue viva allá.
      // Usamos motherApi que ya tiene los interceptores y el Token
      motherApi.get('/api/me')
        .then(() => {
           // Si llegamos aquí, la sesión está viva.
        })
        .catch(error => {
          if (error.response && error.response.status === 401) {
            console.log('El heartbeat detectó sesión caída en la Madre.');
            sessionStorage.removeItem('access_token');
            sessionStorage.clear();
            window.location.reload(); // Esto disparará el guardián de rutas y el login SSO
          } else {
            console.warn('Error en comunicación con la Madre (Heartbeat)', error);
          }
        });
    }
  }, 5 * 60 * 1000);

  // ----------------------------------------------------
  // REGLA B: AVISO CORTÉS DE CIERRE DE JORNADA (17:50 hrs)
  // ----------------------------------------------------
  const now = new Date();
  const alertTime = new Date();
  alertTime.setHours(17, 50, 0, 0);
  
  if (now < alertTime) {
    const msUntilAlert = alertTime.getTime() - now.getTime();
    setTimeout(() => {
      if (sessionStorage.getItem('access_token')) {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'warning',
          title: 'Jornada por finalizar',
          text: 'Tu sesión se cerrará irremediablemente a las 6:00 PM.',
          timer: 60000,
          showConfirmButton: false
        });
      }
    }, msUntilAlert);
  }
};
