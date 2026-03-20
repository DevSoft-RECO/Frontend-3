import Swal from 'sweetalert2';

export const startSessionGuards = () => {
  // ----------------------------------------------------
  // REGLA A: EL "HEARTBEAT" CADA 5 MINUTOS (Vigilante)
  // ----------------------------------------------------
  setInterval(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      // Un sub-proceso silencioso a la Madre para verificar si la sesión sigue viva allá.
      const motherApi = import.meta.env.VITE_MOTHER_API_URL || 'http://localhost:8000';
      // Usamos una petición simple a /api/me de la madre
      fetch(`${motherApi}/api/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      }).then(response => {
        if (response.status === 401) {
          console.log('El heartbeat detectó sesión caída en la Madre.');
          localStorage.removeItem('access_token');
          sessionStorage.clear();
          window.location.reload(); // Esto disparará el guardián de rutas
        }
      }).catch(() => console.log('Error en comunicación con la Madre (Heartbeat)'));
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
      if (localStorage.getItem('access_token')) {
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
