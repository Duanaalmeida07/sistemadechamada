// Service Worker para o Sistema de Chamada
// Este arquivo permite que o aplicativo funcione offline e seja instalável

const CACHE_NAME = 'sistema-chamada-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/config.js',
  '/js/api.js',
  '/js/ui.js',
  '/js/app.js',
  '/js/attendance.js',
  '/js/reports.js',
  '/manifest.json',
  '/img/favicon.ico',
  '/img/icon-192x192.png',
  '/img/icon-512x512.png',
  'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto');
        return cache.addAll(ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Exclui caches antigos
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estratégia de cache: Network First, fallback para Cache
self.addEventListener('fetch', (event) => {
  // Ignora requisições para o Google Apps Script (API)
  if (event.request.url.includes('script.google.com')) {
    return;
  }
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Se a resposta for válida, clona-a e armazena no cache
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseClone);
            });
        }
        return response;
      })
      .catch(() => {
        // Se a rede falhar, tenta buscar do cache
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // Para requisições de navegação, retorna a página offline
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
            
            // Se não encontrar no cache, retorna um erro
            return new Response('Não foi possível carregar o recurso. Verifique sua conexão.', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

// Sincronização em segundo plano (para enviar chamadas quando estiver offline)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-chamadas') {
    event.waitUntil(syncChamadas());
  }
});

// Função para sincronizar chamadas pendentes
async function syncChamadas() {
  try {
    // Busca chamadas pendentes do IndexedDB ou localStorage
    const pendingChamadas = await getPendingChamadas();
    
    if (pendingChamadas && pendingChamadas.length > 0) {
      // Envia as chamadas pendentes para o servidor
      const response = await fetch('SUA_URL_DO_WEB_APP_AQUI', {
        method: 'POST',
        body: JSON.stringify({
          action: 'salvarChamadasEmLote',
          data: pendingChamadas
        })
      });
      
      if (response.ok) {
        // Limpa as chamadas pendentes
        await clearPendingChamadas();
        
        // Notifica o usuário
        self.registration.showNotification('Sistema de Chamada', {
          body: 'Chamadas sincronizadas com sucesso!',
          icon: '/img/icon-192x192.png'
        });
      }
    }
  } catch (error) {
    console.error('Erro ao sincronizar chamadas:', error);
  }
}

// Funções auxiliares para gerenciar chamadas pendentes
// Estas funções seriam implementadas usando IndexedDB ou localStorage
async function getPendingChamadas() {
  // Implementação simplificada usando localStorage
  const pendingData = localStorage.getItem('pendingChamadas');
  return pendingData ? JSON.parse(pendingData) : [];
}

async function clearPendingChamadas() {
  // Implementação simplificada usando localStorage
  localStorage.removeItem('pendingChamadas');
}
